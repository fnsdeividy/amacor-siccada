from flask import Flask, session, redirect, url_for, flash, request
from .routes.auth import auth_bp
from .routes.vendas import vendas_bp
from .routes.pdf import pdf_bp
from .routes.home import home_bp
from .routes.generic import generic_bp
from .routes.financeiro import finan_bp
from .routes.cadastro import cad_bp
from .routes.doc_gen import docgen_bp
from .routes.gerencial import gerencial_bp
from .routes.everflow_mantis import mantis_bp
from datetime import datetime
from .routes.enfermagem import enfermagem_bp
from .routes.amatiss import amatiss_bp
from .routes.sac import sac_bp

from datetime import timedelta
import os

def _secret_key():
    """Chave que assina o cookie de sessão. Quem a conhece consegue se passar
    por qualquer usuário, então vem do ambiente e nunca do código."""
    key = os.environ.get('SECRET_KEY')
    if key:
        return key
    if os.environ.get('FLASK_DEBUG') == '1':
        print('AVISO: SECRET_KEY não definida; usando chave aleatória de desenvolvimento '
              '(as sessões caem a cada reinício).')
        return os.urandom(32)
    raise RuntimeError('Defina a variável de ambiente SECRET_KEY (veja .env.example).')


def create_app():
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['ALLOWED_EXTENSIONS'] = {'pdf'}
    app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024
    app.config['DATABASE'] = 'MHV_DB.db'
    app.secret_key = _secret_key()
    # cookie de sessão não vai em requisições de outros sites (proteção CSRF)
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    # em produção (HTTPS) o cookie de sessão só trafega criptografado
    app.config['SESSION_COOKIE_SECURE'] = os.environ.get('SESSION_COOKIE_SECURE') == '1'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=50)
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['ALLOWED_EXTENSIONS'] = {'pdf'}
    app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024  # Limite de 10MB para upload

    # Registro dos Blueprints
    app.register_blueprint(auth_bp,url_prefix='/auth')
    app.register_blueprint(vendas_bp,url_prefix='/vendas')
    app.register_blueprint(pdf_bp,url_prefix='/pdfgen')
    app.register_blueprint(home_bp,url_prefix='/home')
    app.register_blueprint(generic_bp, url_prefix='/generic')
    app.register_blueprint(finan_bp,url_prefix= '/finan')
    app.register_blueprint(cad_bp,url_prefix='/cad')
    app.register_blueprint(docgen_bp, url_prefix='/docgen')
    app.register_blueprint(gerencial_bp, url_prefix='/gerencial')
    app.register_blueprint(mantis_bp, url_prefix='/mantis')
    app.register_blueprint(enfermagem_bp, url_prefix= '/enfermagem')
    app.register_blueprint(amatiss_bp, url_prefix='/amatiss')
    app.register_blueprint(sac_bp, url_prefix='/sac')

    # as mesmas rotas em JSON sob /api, para o front React
    from . import api
    api.init_app(app)

    # atrás do nginx do front: usa o protocolo/host/IP originais (X-Forwarded-*)
    if os.environ.get('TRUST_PROXY') == '1':
        from werkzeug.middleware.proxy_fix import ProxyFix
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    # Verifique se a pasta de upload existe
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    @app.before_request
    def before_request():
        # Define a duração da sessão como permanente
        rotas_publicas = [
            'auth.login', 'auth.cadastrar', 'static', 'api.teste_suri', 
            'api.get_boleto', 'auth.esqueci_senha', 'mantis.EverFlow', 'mantis.get_card', 'mantis.get_payment_app', 'mantis.get_especialidades_app', 'mantis.post_suspender_contrato',
            'enfermagem.declaracao', 'enfermagem.receber_entrevista', 'enfermagem.entrevista_concluida',
            'mantis.autorizar_token', 'mantis.autorizar_tiss', 'mantis.registrar_cpx','mantis.get_autorizacoes', 'mantis.registrar_push'  # Mantendo a rota pública
        ]
            
        if 'user_id' not in session and request.endpoint not in rotas_publicas:
            flash('Sua sessão expirou. Faça login novamente.')
            return redirect(url_for('auth.login'))
    
    @app.template_filter('format_currency_br')
    def format_currency_br(value):
        try:
            value = float(value or 0)
            valor_formatado = f"{value:,.2f}"
            return valor_formatado.replace(",", "X").replace(".", ",").replace("X", ".")
        except (ValueError, TypeError):
            return "0,00"

    @app.template_filter('format_date_br')
    def format_date_br(value):
        try:
            # Tenta converter de string "aaaa-mm-dd" para datetime
            if isinstance(value, str):
                data = datetime.strptime(value, "%Y-%m-%d")
            else:
                data = value  # já é datetime
            
            # Retorna formatado como "dd/mm/aaaa"
            return data.strftime("%d/%m/%Y")
        
        except (ValueError, TypeError):
            return ""  # ou "Data inválida"
    @app.template_filter('format_date_iso')
    def format_date_iso(value):
        from datetime import datetime, date

        if not value:
            return ""
        
        try:
            # Se for datetime ou date
            if isinstance(value, (datetime, date)):
                return value.strftime("%Y-%m-%d")

            # Converte para string e limpa espaços
            value_str = str(value).strip()

            # Já no formato ISO? (aaaa-mm-dd ou aaaa-mm-dd hh:mm:ss)
            if "-" in value_str and len(value_str.split("-")[0]) == 4:
                return value_str.split(" ")[0]

            # Formato BR (dd/mm/aaaa)
            if "/" in value_str:
                data = datetime.strptime(value_str, "%d/%m/%Y")
                return data.strftime("%Y-%m-%d")

        except Exception as e:
            print(f"Erro ao formatar data: {value} -> {e}")

        return ""   


    return app
