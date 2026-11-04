"""
Camada de acesso ao banco com a mesma interface do módulo sqlite3,
mas falando com o Postgres (psycopg 3).

Objetivo da fase 1: trocar o banco sem reescrever as ~400 consultas.
O código continua usando db.connect(), db.Row, db.Error, cursor.execute()
com placeholders '?', row['coluna'], cursor.lastrowid etc.

O que é traduzido automaticamente em cada consulta:
  - placeholders '?' -> '%s'
  - LIKE -> ILIKE (no SQLite o LIKE ignora maiúsculas/minúsculas)
  - INSERT OR IGNORE -> INSERT ... ON CONFLICT DO NOTHING
  - GLOB 'padrão' -> ~ 'expressão regular'
  - SUM/AVG -> sqlite_sum/sqlite_avg (mesmo arredondamento e tipos do SQLite)
  - colunas calculadas sem alias recebem o nome que o SQLite daria
    (o texto da expressão, ex.: "SUM(valor_venda)")
  - INSERT OR REPLACE -> erro explícito (precisa ser reescrito à mão)
  - PRAGMA foreign_keys -> ignorado (o Postgres sempre aplica FKs)
  - PRAGMA table_info(x) -> consulta equivalente no information_schema
  - sqlite_master -> consulta equivalente no information_schema

Funções do SQLite usadas nas consultas (strftime, date, datetime) são
criadas no Postgres por backend/db/compat.sql; date() vira sqlite_date().

Os parâmetros são enviados como literais sem tipo, para o Postgres
inferir o tipo pela coluna, como o SQLite faz (ex.: comparar uma coluna
texto com o número 123 continua funcionando).
"""
import datetime
import decimal
import os
import re

import psycopg
from psycopg import ClientCursor

Error = psycopg.Error
IntegrityError = psycopg.IntegrityError
OperationalError = psycopg.OperationalError

DEFAULT_DATABASE_URL = 'postgresql://amacor:amacor@localhost:5432/amacor'


def database_url():
    return os.environ.get('DATABASE_URL', DEFAULT_DATABASE_URL)


# ---------------------------------------------------------------------------
# Nomes de colunas: o Postgres guarda identificadores sem aspas em minúsculas,
# mas o código e os templates acessam row['sCpfUSR']. O script de migração
# grava os nomes originais em _sqlite_colnames para restaurarmos a grafia.
# ---------------------------------------------------------------------------
_colnames_cache = None


def _original_colnames(conn):
    global _colnames_cache
    if _colnames_cache is None:
        mapping = {}
        try:
            # savepoint: se a tabela não existir, não derruba a transação em curso
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("SELECT lower_name, original FROM _sqlite_colnames")
                    mapping = dict(cur.fetchall())
        except psycopg.Error:
            pass
        # banco ainda vazio (antes da migração): não guarda, tenta de novo depois
        if not mapping:
            return mapping
        _colnames_cache = mapping
    return _colnames_cache


_ALIAS_RE = re.compile(r'\bAS\s+"?([A-Za-z_][A-Za-z0-9_]*)"?', re.IGNORECASE)
_SIMPLE_COLUMN_RE = re.compile(r'^"?[A-Za-z_][A-Za-z0-9_]*"?(\."?[A-Za-z_][A-Za-z0-9_]*"?)?$')
_ITEM_ALIAS_RE = re.compile(r'^(.*?)\s+(?:AS\s+)?"?([A-Za-z_][A-Za-z0-9_]*)"?$', re.IGNORECASE | re.DOTALL)
_SELECT_END_KEYWORDS = ('FROM', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'UNION', 'HAVING')
_NOT_ALIASES = {'end', 'null', 'true', 'false', 'distinct', 'desc', 'asc'}


def _select_items(sql):
    """Itens do SELECT de nível mais alto, como escritos na consulta."""
    m = re.match(r'\s*SELECT\s+(DISTINCT\s+|ALL\s+)?', sql, re.IGNORECASE)
    if not m:
        return None
    items, depth, start, i, n = [], 0, m.end(), m.end(), len(sql)
    while i < n:
        ch = sql[i]
        if ch in ("'", '"'):
            j = sql.find(ch, i + 1)
            while j != -1 and j + 1 < n and sql[j + 1] == ch:
                j = sql.find(ch, j + 2)
            i = n if j == -1 else j + 1
            continue
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        elif depth == 0 and ch == ',':
            items.append(sql[start:i].strip())
            start = i + 1
        elif depth == 0 and ch.isalpha() and (i == 0 or not (sql[i - 1].isalnum() or sql[i - 1] == '_')):
            word = re.match(r'[A-Za-z_]+', sql[i:]).group(0)
            if word.upper() in _SELECT_END_KEYWORDS:
                break
            i += len(word)
            continue
        i += 1
    items.append(sql[start:i].strip())
    return items


def _sqlite_expression_names(sql, count):
    """O SQLite chama uma coluna calculada sem alias pelo texto da expressão
    (ex.: "SUM(valor_venda)"); o Postgres a chamaria de "sum". Devolve, por
    posição, o nome que o SQLite daria, ou None quando o nome não muda."""
    items = _select_items(sql)
    if not items or len(items) != count or any(it == '*' or it.endswith('.*') for it in items):
        return None
    names = []
    for item in items:
        alias = _ITEM_ALIAS_RE.match(item)
        if _SIMPLE_COLUMN_RE.match(item):
            names.append(None)
        elif alias and alias.group(2).lower() not in _NOT_ALIASES and (
                alias.group(1).rstrip().endswith((')', "'")) or _SIMPLE_COLUMN_RE.match(alias.group(1).strip())
                or re.search(r'\bAS\s+"?[A-Za-z_][A-Za-z0-9_]*"?$', item, re.IGNORECASE)):
            names.append(alias.group(2))
        else:
            names.append(item)
    return names


class Row(tuple):
    """Equivalente ao sqlite3.Row: acesso por índice ou por nome
    (sem diferenciar maiúsculas), keys() e dict(row)."""

    def __new__(cls, values, names, index):
        row = super().__new__(cls, values)
        row._names = names
        row._index = index
        return row

    def __getitem__(self, key):
        if isinstance(key, str):
            try:
                return tuple.__getitem__(self, self._index[key.lower()])
            except KeyError:
                raise IndexError('No item with that key') from None
        return tuple.__getitem__(self, key)

    def keys(self):
        return list(self._names)

    def __eq__(self, other):
        if isinstance(other, Row):
            return self._names == other._names and tuple.__eq__(self, other)
        return NotImplemented

    def __hash__(self):
        return hash((tuple(self._names), tuple(self)))


# ---------------------------------------------------------------------------
# Tradução de SQL
# ---------------------------------------------------------------------------
_TOKEN_RE = re.compile(r"""('(?:[^']|'')*'|"(?:[^"]|"")*"|--[^\n]*|/\*.*?\*/)""", re.DOTALL)


def _map_outside_literals(sql, fn):
    """Aplica fn apenas aos trechos fora de strings, identificadores
    entre aspas e comentários."""
    parts = _TOKEN_RE.split(sql)
    for i in range(0, len(parts), 2):
        parts[i] = fn(parts[i])
    return ''.join(parts)


_PRAGMA_TABLE_INFO_RE = re.compile(r'^\s*PRAGMA\s+table_info\s*\(\s*["\']?(\w+)["\']?\s*\)\s*;?\s*$', re.IGNORECASE)
_PRAGMA_RE = re.compile(r'^\s*PRAGMA\b', re.IGNORECASE)
_SQLITE_MASTER_RE = re.compile(
    r"""SELECT\s+name\s+FROM\s+sqlite_master\s+WHERE\s+type\s*=\s*'table'\s+AND\s+name\s*=\s*('(?:[^']|'')*'|\?)""",
    re.IGNORECASE,
)
_INSERT_OR_IGNORE_RE = re.compile(r'^\s*INSERT\s+OR\s+IGNORE\s+INTO\b', re.IGNORECASE)
_INSERT_OR_REPLACE_RE = re.compile(r'^\s*(INSERT\s+OR\s+REPLACE|REPLACE)\s+INTO\b', re.IGNORECASE)
_INSERT_RE = re.compile(r'^\s*INSERT\b', re.IGNORECASE)
_CREATE_TABLE_RE = re.compile(r'^\s*CREATE\s+TABLE\b', re.IGNORECASE)
_COLUMN_DEF_RE = re.compile(r'^\s*"?([A-Za-z_][A-Za-z0-9_]*)"?\s+[A-Za-z]', re.MULTILINE)
_CREATE_TABLE_TYPES = [
    (re.compile(r'\bINTEGER\s+PRIMARY\s+KEY(\s+AUTOINCREMENT)?\b', re.IGNORECASE),
     'BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY'),
    (re.compile(r'\bINTEGER\b', re.IGNORECASE), 'BIGINT'),
    (re.compile(r'\bREAL\b', re.IGNORECASE), 'DOUBLE PRECISION'),
    (re.compile(r'\bBOOLEAN\b', re.IGNORECASE), 'BIGINT'),
    # o SQLite guarda datas como texto 'AAAA-MM-DD HH:MM:SS' (UTC)
    (re.compile(r'\b(DATETIME|TIMESTAMP|DATE)\b(?!\s*\()', re.IGNORECASE), 'TEXT'),
    (re.compile(r'\bDEFAULT\s+CURRENT_TIMESTAMP\b', re.IGNORECASE),
     "DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')"),
    (re.compile(r'\bBLOB\b', re.IGNORECASE), 'BYTEA'),
]
_SQL_KEYWORDS = {'primary', 'foreign', 'unique', 'check', 'constraint'}


def _translate_create_table(chunk):
    for pattern, replacement in _CREATE_TABLE_TYPES:
        chunk = pattern.sub(replacement, chunk)
    return chunk


def _register_colnames(conn, create_sql):
    """Guarda a grafia original das colunas criadas em tempo de execução."""
    body = create_sql[create_sql.find('(') + 1:]
    names = [n for n in _COLUMN_DEF_RE.findall(body)
             if n.lower() not in _SQL_KEYWORDS and n != n.lower()]
    if not names:
        return
    mapping = _original_colnames(conn)
    try:
        with conn.transaction():
            with conn.cursor() as cur:
                cur.execute("""CREATE TABLE IF NOT EXISTS _sqlite_colnames (
                                   lower_name text PRIMARY KEY, original text NOT NULL)""")
                for n in names:
                    cur.execute("INSERT INTO _sqlite_colnames VALUES (%s, %s) ON CONFLICT DO NOTHING",
                                (n.lower(), n))
                    mapping.setdefault(n.lower(), n)
    except psycopg.Error:
        pass


_LIKE_RE = re.compile(r'(?<![A-Za-z_])LIKE(?![A-Za-z_])', re.IGNORECASE)
_GLOB_RE = re.compile(r"\bGLOB\s+'((?:[^']|'')*)'", re.IGNORECASE)


def _glob_to_regex(pattern):
    """Converte um padrão GLOB do SQLite (sensível a maiúsculas, casa o texto
    inteiro) em expressão regular do Postgres."""
    out, i = ['^'], 0
    while i < len(pattern):
        ch = pattern[i]
        if ch == '*':
            out.append('.*')
        elif ch == '?':
            out.append('.')
        elif ch == '[':
            j = pattern.find(']', i + 2)
            if j == -1:
                out.append('\\[')
            else:
                body = pattern[i + 1:j]
                if body.startswith('^'):
                    body = '^' + body[1:]
                out.append('[' + body.replace('\\', '\\\\') + ']')
                i = j
        else:
            out.append(re.escape(ch))
        i += 1
    out.append('$')
    return ''.join(out)


_SUM_AVG_RE = re.compile(r'(?<![A-Za-z0-9_.])(SUM|AVG)\s*\(', re.IGNORECASE)
_DATE_FN_RE = re.compile(r'(?<![A-Za-z0-9_.])date\s*\(', re.IGNORECASE)

_TABLE_INFO_SQL = """
    SELECT c.ordinal_position - 1 AS cid,
           COALESCE(n.original, c.column_name) AS name,
           upper(c.data_type) AS type,
           CASE WHEN c.is_nullable = 'NO' THEN 1 ELSE 0 END AS notnull,
           c.column_default AS dflt_value,
           CASE WHEN k.column_name IS NOT NULL THEN 1 ELSE 0 END AS pk
      FROM information_schema.columns c
      LEFT JOIN _sqlite_colnames n ON n.lower_name = c.column_name
      LEFT JOIN (
            SELECT kcu.table_name, kcu.column_name
              FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu
                ON kcu.constraint_name = tc.constraint_name
               AND kcu.table_schema = tc.table_schema
             WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = current_schema()
           ) k ON k.table_name = c.table_name AND k.column_name = c.column_name
     WHERE c.table_schema = current_schema() AND c.table_name = %s
     ORDER BY c.ordinal_position
"""


def _translate(sql, has_params):
    """Devolve (sql_traduzido, consulta_especial) para o Postgres."""
    m = _PRAGMA_TABLE_INFO_RE.match(sql)
    if m:
        return _TABLE_INFO_SQL, (m.group(1).lower(),)
    if _PRAGMA_RE.match(sql):
        return None, None  # PRAGMA foreign_keys etc.: sem efeito no Postgres

    if _INSERT_OR_REPLACE_RE.match(sql):
        raise NotImplementedError(
            'INSERT OR REPLACE não tem equivalente direto no Postgres; '
            'reescreva com INSERT ... ON CONFLICT (...) DO UPDATE.'
        )

    on_conflict = bool(_INSERT_OR_IGNORE_RE.match(sql))
    if on_conflict:
        sql = _INSERT_OR_IGNORE_RE.sub('INSERT INTO', sql, count=1)
    create_table = bool(_CREATE_TABLE_RE.match(sql))
    sql = _GLOB_RE.sub(lambda mm: "~ '" + _glob_to_regex(mm.group(1).replace("''", "'")).replace("'", "''") + "'", sql)
    sql = _SQLITE_MASTER_RE.sub(
        lambda mm: "SELECT table_name AS name FROM information_schema.tables "
                   "WHERE table_schema = current_schema() AND table_name = " + mm.group(1),
        sql,
    )

    def outside(chunk):
        if create_table:
            chunk = _translate_create_table(chunk)
        chunk = _LIKE_RE.sub('ILIKE', chunk)
        if not create_table:
            chunk = _DATE_FN_RE.sub('sqlite_date(', chunk)
        chunk = _SUM_AVG_RE.sub(lambda mm: 'sqlite_' + mm.group(1).lower() + '(', chunk)
        if has_params:
            chunk = chunk.replace('%', '%%').replace('?', '%s')
        return chunk

    if has_params:
        # '%' dentro de literais também precisa ser escapado quando há parâmetros
        parts = _TOKEN_RE.split(sql)
        for i in range(len(parts)):
            parts[i] = outside(parts[i]) if i % 2 == 0 else parts[i].replace('%', '%%')
        sql = ''.join(parts)
    else:
        sql = _map_outside_literals(sql, outside)

    if on_conflict:
        sql = sql.rstrip().rstrip(';') + ' ON CONFLICT DO NOTHING'
    return sql, None


def _adapt_param(value):
    """Converte parâmetros como o sqlite3 faria, enviando-os sem tipo."""
    if value is None or isinstance(value, (bytes, bytearray, memoryview)):
        return value
    if isinstance(value, bool):
        return '1' if value else '0'
    if isinstance(value, datetime.datetime):
        return value.isoformat(' ')
    if isinstance(value, (datetime.date, datetime.time)):
        return value.isoformat()
    if isinstance(value, float) and value != value:
        return None  # o sqlite3 grava NaN como NULL
    if isinstance(value, float) and value.is_integer() and abs(value) < 2 ** 63:
        # o SQLite guarda 3.0 como 3 em coluna INTEGER; o Postgres recusaria '3.0'
        return str(int(value))
    if isinstance(value, (int, float, decimal.Decimal)):
        return repr(value) if isinstance(value, float) else str(value)
    return str(value)


def _adapt_params(params):
    if params is None:
        return None
    if isinstance(params, dict):
        raise NotImplementedError('Parâmetros nomeados não são suportados pela camada de compatibilidade.')
    return tuple(_adapt_param(p) for p in params)


# ---------------------------------------------------------------------------
# Ordem das linhas. Três diferenças entre SQLite e Postgres que mudariam a
# ordem do que aparece na tela:
#  - sem ORDER BY, ou com empate nele, o SQLite devolve as linhas na ordem do
#    rowid (o "id INTEGER PRIMARY KEY"); o Postgres não garante ordem. Em
#    consultas simples de uma tabela só, acrescentamos o id como desempate;
#  - GROUP BY sem ORDER BY: o SQLite devolve os grupos ordenados pela chave;
#  - NULL vem primeiro em ordem crescente no SQLite e por último no Postgres.
# ---------------------------------------------------------------------------
_rowid_cache = None
_AGGREGATE_RE = re.compile(r'\b(?:sqlite_)?(count|sum|avg|min|max|total|group_concat|string_agg)\s*\(', re.IGNORECASE)
_SINGLE_TABLE_RE = re.compile(
    r'^\s*"?([A-Za-z_][A-Za-z0-9_]*)"?(?:\s+(?:AS\s+)?"?([A-Za-z_][A-Za-z0-9_]*)"?)?\s*$', re.IGNORECASE)


def _rowid_columns(conn):
    """Tabela -> coluna identity (equivalente ao rowid do SQLite)."""
    global _rowid_cache
    if _rowid_cache is None:
        cache = {}
        try:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("""SELECT table_name, column_name FROM information_schema.columns
                                    WHERE table_schema = current_schema() AND is_identity = 'YES'""")
                    cache = dict(cur.fetchall())
        except psycopg.Error:
            pass
        if not cache:
            return cache  # banco ainda vazio: tenta de novo depois
        _rowid_cache = cache
    return _rowid_cache


def _top_level_words(sql):
    """(PALAVRA, posição) das palavras fora de parênteses e literais."""
    words, depth, i, n = [], 0, 0, len(sql)
    while i < n:
        ch = sql[i]
        if ch in ("'", '"'):
            j = sql.find(ch, i + 1)
            while j != -1 and j + 1 < n and sql[j + 1] == ch:
                j = sql.find(ch, j + 2)
            i = n if j == -1 else j + 1
            continue
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        elif depth == 0 and (ch.isalpha() or ch == '_') and (i == 0 or not (sql[i - 1].isalnum() or sql[i - 1] == '_')):
            word = re.match(r'[A-Za-z_][A-Za-z0-9_]*', sql[i:]).group(0)
            words.append((word.upper(), i))
            i += len(word)
            continue
        i += 1
    return words


def _split_top_level(text):
    """Separa por vírgulas fora de parênteses e literais."""
    items, depth, start, i, n = [], 0, 0, 0, len(text)
    while i < n:
        ch = text[i]
        if ch in ("'", '"'):
            j = text.find(ch, i + 1)
            while j != -1 and j + 1 < n and text[j + 1] == ch:
                j = text.find(ch, j + 2)
            i = n if j == -1 else j + 1
            continue
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        elif ch == ',' and depth == 0:
            items.append(text[start:i])
            start = i + 1
        i += 1
    items.append(text[start:])
    return [t.strip() for t in items if t.strip()]


def _nulls_like_sqlite(item):
    if re.search(r'\bNULLS\s+(FIRST|LAST)\s*$', item, re.IGNORECASE):
        return item
    if re.search(r'\bDESC\s*$', item, re.IGNORECASE):
        return item + ' NULLS LAST'
    return item + ' NULLS FIRST'


def _rowid_key(sql, words, keys, rowids):
    """Coluna de desempate (alias.id) para SELECT simples de uma tabela só."""
    if not rowids or any(k in keys for k in ('GROUP', 'DISTINCT', 'HAVING', 'JOIN')):
        return None
    from_pos = next((p for w, p in words if w == 'FROM'), None)
    if from_pos is None or _AGGREGATE_RE.search(sql[:from_pos]):
        return None
    end_from = min([p for w, p in words if w in ('WHERE', 'ORDER', 'LIMIT', 'OFFSET', 'FOR') and p > from_pos]
                   or [len(sql)])
    m = _SINGLE_TABLE_RE.match(sql[from_pos + 4:end_from])
    if not m:
        return None
    rowid = rowids.get(m.group(1).lower())
    return f'{m.group(2) or m.group(1)}.{rowid}' if rowid else None


def _sqlite_ordering(sql, rowids):
    body_end = len(sql.rstrip().rstrip(';').rstrip())
    body, suffix = sql[:body_end], sql[body_end:]
    words = _top_level_words(body)
    keys = [w for w, _ in words]
    if not keys or keys[0] != 'SELECT':
        return sql

    order_pos = None
    for w, p in words:
        if w == 'ORDER' and re.match(r'ORDER\s+BY\b', body[p:], re.IGNORECASE):
            order_pos = p
    tail_pos = min([p for w, p in words if w in ('LIMIT', 'OFFSET', 'FOR') and (order_pos is None or p > order_pos)]
                   or [body_end])
    items = []
    if order_pos is not None:
        items = _split_top_level(re.sub(r'^ORDER\s+BY\s+', '', body[order_pos:tail_pos].strip(), flags=re.IGNORECASE))

    compound = any(k in keys for k in ('UNION', 'INTERSECT', 'EXCEPT'))
    if not compound:
        if 'GROUP' in keys:
            group_pos = next(p for w, p in words if w == 'GROUP')
            group_end = min([p for w, p in words if w in ('HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'FOR') and p > group_pos]
                            or [body_end])
            group_items = _split_top_level(
                re.sub(r'^GROUP\s+BY\s+', '', body[group_pos:group_end].strip(), flags=re.IGNORECASE))
            # empates: o SQLite segue a chave do GROUP BY em ordem crescente,
            # ou decrescente quando todos os critérios do ORDER BY são DESC
            all_desc = items and all(re.search(r'\bDESC\s*$', i, re.IGNORECASE) for i in items)
            items += [g + (' DESC' if all_desc else '') for g in group_items]
        else:
            key = _rowid_key(body, words, keys, rowids)
            if key:
                items.append(key)
    if not items:
        return sql

    clause = 'ORDER BY ' + ', '.join(_nulls_like_sqlite(i) for i in items)
    start = order_pos if order_pos is not None else tail_pos
    rest = body[tail_pos:].strip()
    return body[:start].rstrip() + ' ' + clause + (' ' + rest if rest else '') + suffix


# ---------------------------------------------------------------------------
# Cursor e conexão
# ---------------------------------------------------------------------------
class Cursor:
    arraysize = 1

    def __init__(self, connection):
        self.connection = connection
        self._cur = ClientCursor(connection._conn)
        self._names = None
        self._index = None
        self._empty = False
        self._last_was_insert = False
        self._lastrowid = None
        self.rowcount = -1

    # --- execução ---
    def execute(self, sql, params=()):
        has_params = params is not None and len(params) > 0
        translated, special_params = _translate(sql, has_params)
        self._last_was_insert = bool(_INSERT_RE.match(sql))
        self._lastrowid = None
        if translated is None:
            self._empty = True
            self._names = None
            self.rowcount = -1
            return self
        self._empty = False
        if special_params is None:
            translated = _sqlite_ordering(translated, _rowid_columns(self.connection._conn))
        if special_params is not None:
            self._cur.execute(translated, special_params)
        elif has_params:
            self._cur.execute(translated, _adapt_params(params))
        else:
            self._cur.execute(translated)
        self.rowcount = self._cur.rowcount
        if _CREATE_TABLE_RE.match(sql):
            global _rowid_cache
            _rowid_cache = None  # a tabela nova pode ter id próprio
            _register_colnames(self.connection._conn, sql)
        self._prepare_names(sql)
        return self

    def executemany(self, sql, seq_of_params):
        translated, _ = _translate(sql, True)
        self._last_was_insert = bool(_INSERT_RE.match(sql))
        self._lastrowid = None
        if translated is None:
            return self
        self._empty = False
        self._cur.executemany(translated, [_adapt_params(p) for p in seq_of_params])
        self.rowcount = self._cur.rowcount
        self._names = None
        return self

    def executescript(self, script):
        self._cur.execute(script)
        return self

    def _prepare_names(self, sql):
        if not self._cur.description:
            self._names = None
            return
        original = dict(_original_colnames(self.connection._conn))
        for alias in _ALIAS_RE.findall(sql):
            original[alias.lower()] = alias
        names = [original.get(c.name, c.name) for c in self._cur.description]
        expression_names = _sqlite_expression_names(sql, len(names))
        if expression_names:
            names = [e or n for e, n in zip(expression_names, names)]
        self._names = names
        self._index = {}
        for i, n in enumerate(names):
            self._index.setdefault(n.lower(), i)

    # --- leitura ---
    def _wrap(self, values):
        if values is None:
            return None
        if self.connection.row_factory is Row:
            return Row(values, self._names, self._index)
        if callable(self.connection.row_factory):
            return self.connection.row_factory(self, tuple(values))
        return tuple(values)

    def fetchone(self):
        if self._empty or self._names is None:
            return None
        return self._wrap(self._cur.fetchone())

    def fetchall(self):
        if self._empty or self._names is None:
            return []
        return [self._wrap(r) for r in self._cur.fetchall()]

    def fetchmany(self, size=None):
        if self._empty or self._names is None:
            return []
        return [self._wrap(r) for r in self._cur.fetchmany(size or self.arraysize)]

    def __iter__(self):
        while True:
            row = self.fetchone()
            if row is None:
                return
            yield row

    @property
    def description(self):
        if self._empty or self._names is None:
            return None
        return tuple((n, None, None, None, None, None, None) for n in self._names)

    @property
    def lastrowid(self):
        """Equivalente ao lastrowid do sqlite3: último id gerado no INSERT."""
        if not self._last_was_insert:
            return self._lastrowid
        if self._lastrowid is None:
            conn = self.connection._conn
            try:
                with conn.transaction():
                    with conn.cursor() as cur:
                        cur.execute('SELECT lastval()')
                        self._lastrowid = cur.fetchone()[0]
            except psycopg.Error:
                self._lastrowid = None
        return self._lastrowid

    def close(self):
        self._cur.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()


class Connection:
    def __init__(self, url):
        self._conn = psycopg.connect(url)
        self.row_factory = None

    def cursor(self):
        return Cursor(self)

    def execute(self, sql, params=()):
        return self.cursor().execute(sql, params)

    def executemany(self, sql, seq_of_params):
        return self.cursor().executemany(sql, seq_of_params)

    def executescript(self, script):
        return self.cursor().executescript(script)

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()

    @property
    def total_changes(self):
        raise NotImplementedError('total_changes não é suportado no Postgres.')

    # Como no sqlite3: o "with conn:" faz commit/rollback, mas não fecha.
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            self._conn.commit()
        else:
            self._conn.rollback()
        return False


def connect(database=None, *args, **kwargs):
    """Substitui sqlite3.connect. O caminho do arquivo .db é ignorado:
    a conexão usa a variável de ambiente DATABASE_URL."""
    return Connection(database_url())
