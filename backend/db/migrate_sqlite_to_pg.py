"""
Copia o banco SQLite (MHV_DB.db) para o Postgres.

Uso (a partir de backend/):
    python db/migrate_sqlite_to_pg.py caminho/para/MHV_DB.db [--recriar]

A URL do Postgres vem de DATABASE_URL (padrão: o do docker-compose).

O que o script faz:
  - cria cada tabela com tipos equivalentes à afinidade do SQLite;
    se algum valor não couber no tipo (o SQLite aceita texto numa coluna
    INTEGER), a coluna vira text e o script avisa;
  - INTEGER PRIMARY KEY vira identity, com a sequência ajustada para o maior id;
  - mantém UNIQUE, chaves primárias compostas e índices;
  - grava a grafia original das colunas em _sqlite_colnames (usada por app/db.py);
  - aplica db/compat.sql (strftime, date, datetime do SQLite).

Chaves estrangeiras não são recriadas nesta fase: o SQLite não as aplicava
por padrão e os dados atuais podem violá-las.
"""
import argparse
import os
import re
import sqlite3
import sys

import psycopg
from psycopg import sql

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DATABASE_URL = 'postgresql://amacor:amacor@localhost:5432/amacor'


def affinity(declared):
    """Regras de afinidade de tipo do SQLite (seção 3.1 da documentação)."""
    t = (declared or '').upper()
    if 'INT' in t:
        return 'integer'
    if any(k in t for k in ('CHAR', 'CLOB', 'TEXT')):
        return 'text'
    if t == '' or 'BLOB' in t:
        return 'blob'
    if any(k in t for k in ('REAL', 'FLOA', 'DOUB')):
        return 'real'
    return 'numeric'


def pg_type_for(aff, values):
    """Escolhe o tipo Postgres olhando os valores reais da coluna."""
    kinds = {type(v) for v in values if v is not None}
    if not kinds:
        return {'integer': 'bigint', 'real': 'double precision'}.get(aff, 'text')
    if kinds == {bytes}:
        return 'bytea'
    if bytes in kinds:
        return None  # mistura de binário com outros tipos: não dá para migrar sem perda
    if aff == 'integer' and kinds == {int}:
        return 'bigint'
    if aff in ('real', 'numeric', 'integer', 'blob') and kinds <= {int, float}:
        return 'bigint' if kinds == {int} and aff != 'real' else 'double precision'
    return 'text'


# Correções de dados aplicadas na cópia (o SQLite original não é alterado).
# Cada uma devolve a linha corrigida, ou None para descartá-la.
def _sem_linha_de_cabecalho(cols):
    """Descarta a linha que é o cabeçalho do CSV importado como dado
    (todas as colunas preenchidas com o próprio nome)."""
    def corrigir(row):
        preenchidas = [(c, v) for c, v in zip(cols, row) if v is not None]
        if preenchidas and all(v == c for c, v in preenchidas):
            return None
        return row
    return corrigir


def _idade_max_1000(cols):
    """'1000♣' na faixa "59 anos ou mais": no SQLite qualquer número é menor
    que texto, então a faixa funcionava; no Postgres precisa ser número."""
    i = cols.index('idade_max_ref')

    def corrigir(row):
        if row[i] == '1000♣':
            row = list(row)
            row[i] = 1000
        return row
    return corrigir


CORRECOES = {
    'beneficiarios': [_sem_linha_de_cabecalho],
    'beneficiarios_old': [_sem_linha_de_cabecalho],
    'faixas_etarias': [_idade_max_1000],
}


def aplicar_correcoes(table, cols, rows):
    names = [c[1] for c in cols]
    corrigidas = []
    alteradas = descartadas = 0
    funcoes = [f(names) for f in CORRECOES.get(table, [])]
    for row in rows:
        original = row
        for f in funcoes:
            row = f(row)
            if row is None:
                break
        if row is None:
            descartadas += 1
            continue
        if tuple(row) != tuple(original):
            alteradas += 1
        corrigidas.append(row)
    return corrigidas, alteradas, descartadas


def text_value(v):
    if isinstance(v, float) and v.is_integer():
        return str(int(v)) if abs(v) < 1e15 else repr(v)
    return v if isinstance(v, str) else (None if v is None else str(v))


def migrate(sqlite_path, url, recreate):
    src = sqlite3.connect(sqlite_path)
    dst = psycopg.connect(url)

    tables = [r[0] for r in src.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )]

    with dst.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS _sqlite_colnames (
                lower_name text PRIMARY KEY,
                original   text NOT NULL
            )""")

    warnings = []
    for table in tables:
        cols = src.execute(f'PRAGMA table_info("{table}")').fetchall()
        # cid, name, type, notnull, dflt_value, pk
        pk_cols = [c[1] for c in sorted(cols, key=lambda c: c[5]) if c[5]]
        # no SQLite, só "INTEGER PRIMARY KEY" vira alias do rowid (id automático)
        identity_pk = (
            len(pk_cols) == 1
            and next(c[2] for c in cols if c[1] == pk_cols[0]).upper().strip() == 'INTEGER'
        )

        rows = src.execute(f'SELECT * FROM "{table}"').fetchall()
        rows, alteradas, descartadas = aplicar_correcoes(table, cols, rows)
        if alteradas or descartadas:
            warnings.append(f'{table}: correção de dados — {alteradas} linha(s) corrigida(s), '
                            f'{descartadas} descartada(s) (veja CORRECOES).')

        col_defs = []
        col_types = []
        for idx, (_, name, declared, notnull, _dflt, pk) in enumerate(cols):
            values = [r[idx] for r in rows]
            if identity_pk and name == pk_cols[0]:
                pg_type = 'bigint'
            else:
                pg_type = pg_type_for(affinity(declared), values)
                if pg_type is None:
                    pg_type = 'text'
                    warnings.append(f'{table}.{name}: mistura binário com texto; convertido para text (hex).')
                elif pg_type == 'text' and affinity(declared) in ('integer', 'real', 'numeric') and values:
                    warnings.append(f'{table}.{name}: declarada {declared!r} mas tem texto; ficou como text.')
            col_types.append(pg_type)

            parts = [sql.Identifier(name.lower()), sql.SQL(pg_type)]
            if identity_pk and name == pk_cols[0]:
                parts.append(sql.SQL('GENERATED BY DEFAULT AS IDENTITY'))
            if notnull and not pk:
                parts.append(sql.SQL('NOT NULL'))
            col_defs.append(sql.SQL(' ').join(parts))

        if pk_cols:
            col_defs.append(sql.SQL('PRIMARY KEY ({})').format(
                sql.SQL(', ').join(sql.Identifier(c.lower()) for c in pk_cols)))

        with dst.cursor() as cur:
            if recreate:
                cur.execute(sql.SQL('DROP TABLE IF EXISTS {} CASCADE').format(sql.Identifier(table.lower())))
            cur.execute(sql.SQL('CREATE TABLE {} ({})').format(
                sql.Identifier(table.lower()), sql.SQL(', ').join(col_defs)))

            for (_, name, *_rest) in cols:
                cur.execute(
                    'INSERT INTO _sqlite_colnames (lower_name, original) VALUES (%s, %s) '
                    'ON CONFLICT (lower_name) DO NOTHING', (name.lower(), name))
            cur.execute(
                'INSERT INTO _sqlite_colnames (lower_name, original) VALUES (%s, %s) '
                'ON CONFLICT (lower_name) DO NOTHING', (table.lower(), table))

            if rows:
                converted = []
                for r in rows:
                    out = []
                    for v, t in zip(r, col_types):
                        if t == 'text':
                            out.append(v.hex() if isinstance(v, bytes) else text_value(v))
                        elif t == 'bigint' and isinstance(v, float):
                            out.append(int(v))
                        else:
                            out.append(v)
                    converted.append(out)
                insert = sql.SQL('INSERT INTO {} ({}) VALUES ({})').format(
                    sql.Identifier(table.lower()),
                    sql.SQL(', ').join(sql.Identifier(c[1].lower()) for c in cols),
                    sql.SQL(', ').join(sql.Placeholder() * len(cols)))
                cur.executemany(insert, converted)

            if identity_pk:
                cur.execute(sql.SQL(
                    "SELECT setval(pg_get_serial_sequence(%s, %s), COALESCE((SELECT max({}) FROM {}), 0) + 1, false)"
                ).format(sql.Identifier(pk_cols[0].lower()), sql.Identifier(table.lower())),
                    (table.lower(), pk_cols[0].lower()))

            # UNIQUE e índices (os criados automaticamente pelo SQLite também, exceto a PK)
            for _seq, idx_name, unique, origin, _partial in src.execute(f'PRAGMA index_list("{table}")').fetchall():
                if origin == 'pk':
                    continue
                idx_cols = [c[2] for c in src.execute(f'PRAGMA index_info("{idx_name}")').fetchall()]
                if not idx_cols or any(c is None for c in idx_cols):
                    warnings.append(f'{table}: índice {idx_name} usa expressão; recrie à mão.')
                    continue
                pg_idx = re.sub(r'\W', '_', f'{table}_{idx_name}').lower()[:63]
                cur.execute(sql.SQL('CREATE {} INDEX IF NOT EXISTS {} ON {} ({})').format(
                    sql.SQL('UNIQUE' if unique else ''),
                    sql.Identifier(pg_idx),
                    sql.Identifier(table.lower()),
                    sql.SQL(', ').join(sql.Identifier(c.lower()) for c in idx_cols)))

        print(f'{table}: {len(rows)} linhas')

    with open(os.path.join(HERE, 'compat.sql'), encoding='utf-8') as f:
        with dst.cursor() as cur:
            cur.execute(f.read())

    dst.commit()
    dst.close()
    src.close()

    if warnings:
        print('\nAvisos:')
        for w in warnings:
            print(' -', w)


def main():
    parser = argparse.ArgumentParser(description='Migra o MHV_DB.db (SQLite) para o Postgres.')
    parser.add_argument('sqlite_path')
    parser.add_argument('--recriar', action='store_true',
                        help='apaga as tabelas no Postgres antes de copiar')
    args = parser.parse_args()
    if not os.path.exists(args.sqlite_path):
        sys.exit(f'Arquivo não encontrado: {args.sqlite_path}')
    migrate(args.sqlite_path, os.environ.get('DATABASE_URL', DEFAULT_DATABASE_URL), args.recriar)


if __name__ == '__main__':
    main()
