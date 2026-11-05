"""
Captura snapshots para o teste de equivalência do front
(frontend/tests/equivalence.test.jsx).

Para cada rota GET sem parâmetros e cada usuário informado, salva o HTML que
o Flask gera e o JSON do modo API para a mesma rota. Os arquivos contêm dados
reais: a pasta de saída não pode ir para o git.

Uso (a partir de backend/, com o banco migrado):
    python tools/front_snapshots.py <pasta_saida> <user_id> [<user_id> ...]
"""
import json
import os
import re
import shutil
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
os.chdir(ROOT)

from app import create_app, db  # noqa: E402

PULAR = {'auth.logoff'}
# telas criadas direto no front React (sem tela equivalente no sistema antigo)
PULAR_PREFIXOS = ('sac.',)


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    out, user_ids = sys.argv[1], [int(u) for u in sys.argv[2:]]

    # algumas telas gravam arquivos em static/: roda sobre uma cópia
    work = tempfile.mkdtemp(prefix='siccada-snap-')
    shutil.copytree(os.path.join(ROOT, 'static'), os.path.join(work, 'static'))
    os.chdir(work)
    for name in ('app', 'create.py'):
        os.symlink(os.path.join(ROOT, name), os.path.join(work, name))

    app = create_app()
    app.config['PROPAGATE_EXCEPTIONS'] = False
    total = 0
    try:
        for user_id in user_ids:
            u = db.connect().execute(
                'SELECT id, tipo_usuario, nome, classe_usuario, preferencias_wpp FROM usuarios WHERE id = ?',
                (user_id,)).fetchone()
            if not u:
                print(f'usuário {user_id} não existe; pulando')
                continue

            def client():
                c = app.test_client()
                with c.session_transaction() as s:
                    s['user_id'], s['tipo_usuario'], s['user_nome'], s['classe_usuario'], s['preferencia_wpp'] = u
                return c

            for rule in sorted(app.url_map.iter_rules(), key=lambda r: r.rule):
                if 'GET' not in rule.methods or rule.arguments or rule.endpoint == 'static' or rule.endpoint in PULAR \
                        or rule.endpoint.startswith(PULAR_PREFIXOS):
                    continue
                html = client().get(rule.rule)
                api = client().get('/api' + rule.rule)
                if api.mimetype != 'application/json':
                    continue
                body = api.get_json()
                if not isinstance(body, dict) or body.get('type') != 'page':
                    continue
                name = re.sub(r'[^A-Za-z0-9]+', '_', rule.rule).strip('_') or 'root'
                folder = os.path.join(out, re.sub(r'\.html$', '', body['template'].strip(), flags=re.I))
                os.makedirs(folder, exist_ok=True)
                with open(os.path.join(folder, f'{user_id}__{name}.json'), 'w', encoding='utf-8') as f:
                    json.dump({'route': rule.rule, 'user': user_id, 'api': body,
                               'html': html.get_data(as_text=True)}, f, ensure_ascii=False)
                total += 1
    finally:
        shutil.rmtree(work, ignore_errors=True)
    print(total, 'snapshots em', out)


if __name__ == '__main__':
    main()
