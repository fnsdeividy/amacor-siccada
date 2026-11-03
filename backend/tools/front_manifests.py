"""
Gera, a partir do Flask, os arquivos que o front usa para ficar igual ao back:

  frontend/src/lib/routes-manifest.json   endpoint -> regras de URL (urlFor)
  frontend/templates-manifest.json        template renderizado -> arquivo e rotas
  frontend/tests/filters-fixtures.json    saída real dos filtros Jinja
  frontend/tests/urlfor-fixtures.json     saída real do url_for

Uso (a partir de backend/):
    python tools/front_manifests.py ../frontend
Rode de novo sempre que rotas, templates ou filtros mudarem no back.
"""
import ast
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
os.chdir(ROOT)

from flask import url_for  # noqa: E402

from app import create_app  # noqa: E402


def write(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('gerado', path)


def routes(app):
    out = {}
    # ordem de registro dentro de cada endpoint: é a que o url_for usa
    for r in sorted(app.url_map.iter_rules(), key=lambda r: r.endpoint):
        out.setdefault(r.endpoint, []).append({
            'rule': r.rule,
            'methods': sorted(m for m in r.methods if m not in ('HEAD', 'OPTIONS')),
            'args': sorted(r.arguments),
        })
    return out


def templates(app):
    names = {}
    for root, _, files in os.walk('app/routes'):
        for f in files:
            if not f.endswith('.py'):
                continue
            tree = ast.parse(open(os.path.join(root, f), encoding='utf-8').read())
            for node in ast.walk(tree):
                if (isinstance(node, ast.Call) and getattr(node.func, 'id', None) == 'render_template'
                        and node.args and isinstance(node.args[0], ast.Constant)):
                    names.setdefault(node.args[0].value, set()).add(f)
    out = {}
    with app.app_context():
        for n in sorted(names):
            try:
                t = app.jinja_env.get_template(n)
                out[n] = {'arquivo': os.path.relpath(t.filename, ROOT), 'rotas': sorted(names[n])}
            except Exception as e:  # noqa: BLE001 - template referenciado mas inexistente
                out[n] = {'arquivo': None, 'erro': str(e), 'rotas': sorted(names[n])}
    return out


def filter_fixtures(app):
    f = app.jinja_env.filters

    def run(name, v):
        try:
            return f[name](v)
        except Exception as e:  # noqa: BLE001 - o próprio filtro quebra (a página daria 500)
            return 'ERRO:' + type(e).__name__

    moedas = [0, 1, 1.5, 1234.5, 1234567.891, -1234.5, -0.001, 0.005, 0.015, 2.675, 999.995,
              '12,5', '', None, 'abc', '1234.56', True, 1e15]
    datas = ['2024-03-15', '2024-3-5', '15/03/2024', '2024-03-15 10:00:00', '', None, 'abc', '2024-02-30']
    isos = ['2024-03-15', '2024-03-15 10:00:00', '15/03/2024', '', None, 'abc', '2024-03-15T10:00:00',
            '  15/03/2024  ']
    return {
        'currency': [[v, run('format_currency_br', v)] for v in moedas],
        'date_br': [[v, run('format_date_br', v)] for v in datas],
        'date_iso': [[v, run('format_date_iso', v)] for v in isos],
    }


def urlfor_fixtures(app):
    casos = []
    with app.test_request_context():
        for r in app.url_map.iter_rules():
            if r.endpoint == 'static':
                continue
            params = {a: ('42' if 'id' in a else 'valor x/ç') for a in r.arguments}
            for p in (params, dict(params, filtro='sim', lista='todos')):
                try:
                    casos.append([r.endpoint, p, url_for(r.endpoint, **p)])
                except Exception:  # noqa: BLE001 - conversor que não aceita o valor de teste
                    pass
        casos.append(['static', {'filename': 'css/estilos.css'}, url_for('static', filename='css/estilos.css')])
    return casos


def main():
    front = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'frontend')
    app = create_app()
    write(os.path.join(front, 'src/lib/routes-manifest.json'), routes(app))
    write(os.path.join(front, 'templates-manifest.json'), templates(app))
    write(os.path.join(front, 'tests/filters-fixtures.json'), filter_fixtures(app))
    write(os.path.join(front, 'tests/urlfor-fixtures.json'), urlfor_fixtures(app))


if __name__ == '__main__':
    main()
