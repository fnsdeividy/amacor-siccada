from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from ..models.database import data_dashboard_corretor

generic_bp = Blueprint('generic', __name__, template_folder='../templates/generic')

@generic_bp.route('/')
def home():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    return render_template('base1.html', usuario=session,usuario_nome=session.get('user_nome'))

@generic_bp.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    return render_template('profile.html', usuario_nome=session.get('user_nome'),tipo_usuario=session.get('tipo_usuario'), classe_usuario = session.get('classe_usuario'))

@generic_bp.route('/settings')
def settings():
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    return render_template('settings.html', usuario=session)

@generic_bp.route('home_corretor')
def home_corretor():
    from datetime import datetime, timedelta
    
    corretor_resp= session.get('user_nome')
    
    periodo = request.args.get('periodo', '')
    data_inicial = request.args.get('data_inicial')
    if not periodo and not data_inicial:
        periodo = '30'  # Padrão para 30 dias


    # Definir data de referência
    if data_inicial:
        try:
            data_ref = datetime.strptime(data_inicial, '%Y-%m-%d').date()
        except ValueError:
            flash('Data inválida. Use o formato AAAA-MM-DD.', 'error')
            return redirect(url_for('gerencial.dashboard_administrativo'))
    else:
        try:
            dias = int(periodo)
            data_ref = (datetime.now() - timedelta(days=dias)).date()
        except:
            data_ref = (datetime.now() - timedelta(days=30)).date()
    
    # Processar dados
    dados_dashboard = data_dashboard_corretor(
        data_ref.strftime('%Y-%m-%d'),
        corretor_resp
    )
    print("dados do dash:",dados_dashboard)
    
    
    return render_template(
        'generic/home_vendas.html',
        dados=dados_dashboard,
        corretor_resp=corretor_resp
    )

@generic_bp.route('/upload_foto_perfil')
def render_definir_perfil():
    
    return render_template('generic/render_definir_perfil.html')


@generic_bp.route('/definir_perfil')
def definir_perfil():

    flash('Foto de Perfil atualizada!', 'success')
    return redirect(url_for('auth.fechar'))
    