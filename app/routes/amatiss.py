from flask import Flask, session, Blueprint, render_template, request
from ..utils import acesso
amatiss_bp = Blueprint('amatiss', __name__)

@amatiss_bp.route('/')
@acesso('autorizacao')
def home():
    return render_template('amatiss/index.html')


@amatiss_bp.route('/registrar_autorizacao_app')
def registrar_autorizacao_app():
    from ..models.database import registrar_autorizacao_amatiss
    data= request.get_json(silent=True)
    
    
