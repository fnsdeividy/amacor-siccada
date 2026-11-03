-- Funções do SQLite usadas nas consultas do sistema, recriadas no Postgres.
-- Mantêm o mesmo comportamento: recebem e devolvem texto, devolvem NULL
-- quando a data é inválida e tratam 'now' como horário UTC.
-- date() se chama sqlite_date() aqui para não colidir com a conversão nativa
-- date(...) do Postgres; app/db.py reescreve as chamadas.
-- Aplicado pelo script migrate_sqlite_to_pg.py (pode ser rodado de novo sem problema).

CREATE OR REPLACE FUNCTION _sqlite_ts(val text, mods text[] DEFAULT '{}')
RETURNS timestamp LANGUAGE plpgsql STABLE AS $$
DECLARE
    ts timestamp;
    m text;
BEGIN
    IF val IS NULL THEN
        RETURN NULL;
    END IF;
    BEGIN
        IF lower(trim(val)) = 'now' THEN
            ts := now() AT TIME ZONE 'UTC';
        ELSIF trim(val) ~ '^[0-9]+(\.[0-9]+)?$' AND length(trim(val)) < 9 THEN
            -- dia juliano (comportamento do SQLite para números)
            ts := timestamp '4714-11-24 12:00:00 BC' + (trim(val)::numeric * interval '1 day');
        ELSE
            ts := replace(trim(val), 'T', ' ')::timestamp;
        END IF;
    EXCEPTION WHEN others THEN
        RETURN NULL;
    END;

    FOREACH m IN ARRAY mods LOOP
        m := lower(trim(m));
        IF m = 'start of month' THEN
            ts := date_trunc('month', ts);
        ELSIF m = 'start of year' THEN
            ts := date_trunc('year', ts);
        ELSIF m = 'start of day' THEN
            ts := date_trunc('day', ts);
        ELSIF m = 'localtime' THEN
            ts := (ts AT TIME ZONE 'UTC') AT TIME ZONE current_setting('TimeZone');
        ELSIF m = 'utc' THEN
            ts := (ts AT TIME ZONE current_setting('TimeZone')) AT TIME ZONE 'UTC';
        ELSE
            BEGIN
                ts := ts + m::interval;
            EXCEPTION WHEN others THEN
                RETURN NULL;
            END;
        END IF;
    END LOOP;
    RETURN ts;
END;
$$;

CREATE OR REPLACE FUNCTION sqlite_date(val text, VARIADIC mods text[] DEFAULT '{}')
RETURNS text LANGUAGE sql STABLE AS $$
    SELECT to_char(_sqlite_ts(val, mods), 'YYYY-MM-DD')
$$;

CREATE OR REPLACE FUNCTION datetime(val text, VARIADIC mods text[] DEFAULT '{}')
RETURNS text LANGUAGE sql STABLE AS $$
    SELECT to_char(_sqlite_ts(val, mods), 'YYYY-MM-DD HH24:MI:SS')
$$;

CREATE OR REPLACE FUNCTION strftime(fmt text, val text, VARIADIC mods text[] DEFAULT '{}')
RETURNS text LANGUAGE plpgsql STABLE AS $$
DECLARE
    ts timestamp := _sqlite_ts(val, mods);
    out text := '';
    i int := 1;
    c text;
BEGIN
    IF ts IS NULL OR fmt IS NULL THEN
        RETURN NULL;
    END IF;
    WHILE i <= length(fmt) LOOP
        c := substr(fmt, i, 1);
        IF c = '%' AND i < length(fmt) THEN
            i := i + 1;
            c := substr(fmt, i, 1);
            out := out || CASE c
                WHEN 'Y' THEN to_char(ts, 'YYYY')
                WHEN 'm' THEN to_char(ts, 'MM')
                WHEN 'd' THEN to_char(ts, 'DD')
                WHEN 'H' THEN to_char(ts, 'HH24')
                WHEN 'M' THEN to_char(ts, 'MI')
                WHEN 'S' THEN to_char(ts, 'SS')
                WHEN 'f' THEN to_char(ts, 'SS.MS')
                WHEN 'j' THEN to_char(ts, 'DDD')
                WHEN 'w' THEN (extract(dow FROM ts))::int::text
                WHEN 'W' THEN lpad(((extract(doy FROM ts)::int + 6 - ((extract(dow FROM ts)::int + 6) % 7)) / 7)::text, 2, '0')
                WHEN 's' THEN (extract(epoch FROM ts))::bigint::text
                WHEN '%' THEN '%'
                ELSE '%' || c
            END;
        ELSE
            out := out || c;
        END IF;
        i := i + 1;
    END LOOP;
    RETURN out;
END;
$$;

-- SUM e AVG com o mesmo resultado do SQLite:
--  * valores com casas decimais são somados com compensação de erro
--    (Kahan-Babuska-Neumaier, como o SQLite faz desde a 3.43), então o total
--    bate até a última casa;
--  * soma de inteiros devolve inteiro (o sum() do Postgres devolveria numeric);
--  * média sempre devolve número de ponto flutuante.
-- app/db.py troca SUM( e AVG( por sqlite_sum( e sqlite_avg( nas consultas.

CREATE OR REPLACE FUNCTION _sqlite_sum_step(state double precision[], val double precision)
RETURNS double precision[] LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    s double precision;
    t double precision;
    err double precision;
BEGIN
    IF val IS NULL THEN
        RETURN state;
    END IF;
    IF state IS NULL THEN
        RETURN ARRAY[val, 0, 1];
    END IF;
    s := state[1];
    t := s + val;
    err := state[2];
    IF abs(s) > abs(val) THEN
        err := err + ((s - t) + val);
    ELSE
        err := err + ((val - t) + s);
    END IF;
    RETURN ARRAY[t, err, state[3] + 1];
END;
$$;

CREATE OR REPLACE FUNCTION _sqlite_sum_final(state double precision[])
RETURNS double precision LANGUAGE sql IMMUTABLE AS $$
    SELECT state[1] + state[2]
$$;

CREATE OR REPLACE FUNCTION _sqlite_avg_final(state double precision[])
RETURNS double precision LANGUAGE sql IMMUTABLE AS $$
    SELECT (state[1] + state[2]) / state[3]
$$;

CREATE OR REPLACE FUNCTION _sqlite_isum_step(state bigint[], val bigint)
RETURNS bigint[] LANGUAGE sql IMMUTABLE AS $$
    SELECT CASE WHEN val IS NULL THEN state
                WHEN state IS NULL THEN ARRAY[val, 1]
                ELSE ARRAY[state[1] + val, state[2] + 1] END
$$;

CREATE OR REPLACE FUNCTION _sqlite_isum_final(state bigint[])
RETURNS bigint LANGUAGE sql IMMUTABLE AS $$
    SELECT state[1]
$$;

CREATE OR REPLACE FUNCTION _sqlite_iavg_final(state bigint[])
RETURNS double precision LANGUAGE sql IMMUTABLE AS $$
    SELECT state[1]::double precision / state[2]
$$;

DROP AGGREGATE IF EXISTS sqlite_sum(double precision);
DROP AGGREGATE IF EXISTS sqlite_avg(double precision);
DROP AGGREGATE IF EXISTS sqlite_sum(bigint);
DROP AGGREGATE IF EXISTS sqlite_avg(bigint);

CREATE AGGREGATE sqlite_sum(double precision) (
    SFUNC = _sqlite_sum_step, STYPE = double precision[], FINALFUNC = _sqlite_sum_final
);
CREATE AGGREGATE sqlite_avg(double precision) (
    SFUNC = _sqlite_sum_step, STYPE = double precision[], FINALFUNC = _sqlite_avg_final
);
CREATE AGGREGATE sqlite_sum(bigint) (
    SFUNC = _sqlite_isum_step, STYPE = bigint[], FINALFUNC = _sqlite_isum_final
);
CREATE AGGREGATE sqlite_avg(bigint) (
    SFUNC = _sqlite_isum_step, STYPE = bigint[], FINALFUNC = _sqlite_iavg_final
);
