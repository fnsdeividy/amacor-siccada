"""
Modo API: as mesmas rotas do sistema, respondendo JSON para o front React.

Qualquer URL do back pode ser chamada com o prefixo /api (ex.: /api/cad/home).
A requisição roda exatamente a mesma função de rota, com a mesma sessão,
permissões e regras. A diferença está só na resposta:

  - render_template(...)  -> {"type": "page", "template": ..., "context": {...}}
    (o context é o que a rota passou para o template; a rota roda e renderiza
    normalmente, só o corpo da resposta é trocado);
  - redirect(...)          -> {"type": "redirect", "location": "/cad/home"};
  - erro 4xx/5xx em HTML   -> {"type": "error", "status": 500};
  - texto/HTML sem template -> {"type": "html", "html": "..."};
  - jsonify, send_file etc. passam como estão.

Toda resposta JSON de página/redirect/erro leva também "flashes" e "session"
(dados do usuário logado que os layouts usam). Como no HTML, a mensagem de
flash de um redirect só aparece na página seguinte.
"""
import base64
import datetime
import decimal
import json
import math

from flask import Flask, Response, g, get_flashed_messages, request, session
from flask.signals import before_render_template
from jinja2 import Undefined

API_PREFIX = '/api'
ENVIRON_FLAG = 'siccada.api'

# chaves da sessão que os templates usam (navbar, menus por perfil etc.)
SESSION_KEYS = ('user_id', 'user_nome', 'tipo_usuario', 'classe_usuario', 'preferencia_wpp')


class ApiPrefixMiddleware:
    """Remove o prefixo /api e marca a requisição como modo API."""

    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        if path == API_PREFIX or path.startswith(API_PREFIX + '/'):
            environ['PATH_INFO'] = path[len(API_PREFIX):] or '/'
            environ[ENVIRON_FLAG] = True
        return self.wsgi_app(environ, start_response)


def is_api_request():
    try:
        return bool(request.environ.get(ENVIRON_FLAG))
    except RuntimeError:  # fora de uma requisição
        return False


def to_jsonable(value, _depth=0):
    """Converte o contexto dos templates em JSON (linhas do banco, datas...)."""
    if _depth > 50:
        return None
    if value is None or isinstance(value, (bool, int, str)):
        return value
    if isinstance(value, float):
        return None if math.isnan(value) or math.isinf(value) else value
    if isinstance(value, decimal.Decimal):
        return float(value)
    if isinstance(value, (datetime.datetime, datetime.date, datetime.time)):
        return value.isoformat()
    if isinstance(value, datetime.timedelta):
        return value.total_seconds()
    if isinstance(value, (bytes, bytearray, memoryview)):
        return {'__bytes__': base64.b64encode(bytes(value)).decode()}
    if isinstance(value, Undefined):
        return None
    if hasattr(value, 'keys') and callable(value.keys) and hasattr(value, '__getitem__'):
        # dict, db.Row, sqlite3.Row: vira objeto com os nomes das colunas
        try:
            return {str(k): to_jsonable(value[k], _depth + 1) for k in value.keys()}
        except Exception:  # noqa: BLE001
            pass
    if hasattr(value, 'to_dict') and callable(value.to_dict):  # pandas
        try:
            return to_jsonable(value.to_dict(orient='records'), _depth + 1)
        except TypeError:
            return to_jsonable(value.to_dict(), _depth + 1)
    if isinstance(value, (list, tuple, set, frozenset)) or hasattr(value, '__iter__') and not callable(value):
        try:
            return [to_jsonable(v, _depth + 1) for v in value]
        except TypeError:
            pass
    if callable(value):
        return None  # funções/macros passadas ao template não vão para o front
    return str(value)


def _envelope(kind, flashes, **extra):
    body = {
        'type': kind,
        'flashes': [{'category': c, 'message': m} for c, m in flashes],
        'session': {k: to_jsonable(session.get(k)) for k in SESSION_KEYS if k in session},
    }
    body.update(extra)
    return body


def _json_response(body, status=200):
    # json do Python, não o do Flask: o do Flask ordena as chaves e as linhas
    # do banco perderiam a ordem das colunas (row[0] nos templates)
    return Response(json.dumps(body, ensure_ascii=False), status=status, mimetype='application/json')


def init_app(app: Flask):
    app.wsgi_app = ApiPrefixMiddleware(app.wsgi_app)

    def on_before_render(sender, template, context, **extra):
        # a rota roda e o template é renderizado normalmente (mesmo
        # comportamento do modo HTML); só guardamos o que ela passou
        if is_api_request():
            # o template vai consumir as mensagens de flash ao renderizar
            if 'api_flashes' not in g:
                g.api_flashes = list(session.get('_flashes', []))
            passed = {k: v for k, v in context.items()
                      if k not in ('g', 'request', 'session', 'config', 'url_for',
                                   'get_flashed_messages', 'self')}
            g.api_page = (template.name, passed)

    before_render_template.connect(on_before_render, app, weak=False)

    @app.after_request
    def api_after_request(response):
        if not is_api_request():
            return response
        if 300 <= response.status_code < 400 and response.location:
            # como no HTML, as mensagens ficam na sessão para a próxima página
            return _json_response(_envelope('redirect', [], location=response.location))
        if response.status_code >= 400 and response.mimetype == 'text/html':
            return _json_response(_envelope('error', get_flashed_messages(with_categories=True),
                                            status=response.status_code), response.status_code)
        page = g.pop('api_page', None)
        if page and response.mimetype == 'text/html':
            template, context = page
            return _json_response(_envelope('page', g.pop('api_flashes', []),
                                            template=template, context=to_jsonable(context)),
                                  response.status_code)
        if response.mimetype == 'text/html' and not response.direct_passthrough:
            # rotas que devolvem um texto/HTML solto, sem template
            return _json_response(_envelope('html', get_flashed_messages(with_categories=True),
                                            html=response.get_data(as_text=True)), response.status_code)
        return response
