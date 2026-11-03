"""
Valida no Postgres todas as consultas SQL escritas no código do back.

Uso (a partir de backend/, com o banco migrado):
    python db/check_sql.py

Percorre os arquivos .py, encontra as chamadas execute()/executemany() (e os
helpers query_db, alter_db, ...) cujo
SQL é um texto fixo (ou uma variável com texto fixo na mesma função), passa
cada consulta pela camada app/db.py e pede ao Postgres um EXPLAIN dela.
O EXPLAIN analisa a consulta (sintaxe, tabelas, colunas, tipos, GROUP BY)
sem executá-la, então nada é alterado no banco.

Consultas montadas com f-string ou concatenação são listadas à parte:
precisam de revisão manual.
"""
import ast
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)

from app import db  # noqa: E402

SKIP_DIRS = {'poppler-24.08.0', '__pycache__', 'db'}
EXECUTE_NAMES = {'execute', 'executemany'}
# funções do próprio código que recebem o SQL como primeiro argumento
HELPER_NAMES = {'query_db', 'query_db_doc', 'alter_db', 'update_db'}


def iter_py_files():
    for base in ('app',):
        for root, dirs, files in os.walk(os.path.join(ROOT, base)):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in files:
                if f.endswith('.py') and f != 'db.py':
                    yield os.path.join(root, f)


def string_assignments(func):
    """nome -> texto, para atribuições simples de string dentro da função."""
    found = {}
    for node in ast.walk(func):
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            if isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
                found[node.targets[0].id] = node.value.value
    return found


def collect():
    queries, dynamic = [], []
    for path in iter_py_files():
        tree = ast.parse(open(path, encoding='utf-8').read())
        funcs = [n for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))] + [tree]
        seen = set()
        for func in funcs:
            local = string_assignments(func)
            for node in ast.walk(func):
                if not (isinstance(node, ast.Call) and node.args):
                    continue
                name = (node.func.attr if isinstance(node.func, ast.Attribute)
                        else node.func.id if isinstance(node.func, ast.Name) else None)
                if name not in EXECUTE_NAMES | HELPER_NAMES:
                    continue
                if name in HELPER_NAMES and func is not tree and func.name == name:
                    continue  # a própria definição do helper
                key = (path, node.lineno)
                if key in seen:
                    continue
                seen.add(key)
                arg = node.args[0]
                where = f'{os.path.relpath(path, ROOT)}:{node.lineno}'
                if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                    queries.append((where, arg.value, len(node.args) > 1))
                elif isinstance(arg, ast.Name) and arg.id in local:
                    queries.append((where, local[arg.id], len(node.args) > 1))
                else:
                    dynamic.append(where)
    return queries, dynamic


def check(queries):
    conn = db.connect()
    rowids = db._rowid_columns(conn._conn)
    erros = []
    for where, sql, has_params in queries:
        stripped = sql.strip()
        if not re.match(r'(SELECT|INSERT|UPDATE|DELETE|WITH)\b', stripped, re.IGNORECASE):
            continue  # CREATE TABLE, PRAGMA etc. já são tratados pela camada
        n_params = stripped.count('?')
        try:
            translated, special = db._translate(stripped, n_params > 0)
            if translated is None:
                continue
            translated = db._sqlite_ordering(translated, rowids)
            with conn._conn.transaction():
                with conn._conn.cursor() as cur:
                    if n_params:
                        # parâmetros sem tipo, como a camada envia
                        cur.execute('EXPLAIN ' + translated.replace('%%', '\0').replace('%s', 'NULL').replace('\0', '%'))
                    else:
                        cur.execute('EXPLAIN ' + translated)
        except Exception as e:  # noqa: BLE001
            erros.append((where, type(e).__name__, str(e).splitlines()[0], stripped))
    conn.close()
    return erros


def main():
    queries, dynamic = collect()
    erros = check(queries)
    print(f'{len(queries)} consultas com texto fixo; {len(erros)} com erro no Postgres')
    for where, kind, msg, sql in erros:
        print(f'\n{where}  [{kind}] {msg}\n    ' + ' '.join(sql.split())[:300])
    print(f'\n{len(dynamic)} chamadas com SQL montado em tempo de execução (revisar à mão):')
    for where in dynamic:
        print('  ', where)


if __name__ == '__main__':
    main()
