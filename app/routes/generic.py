from flask import Blueprint, render_template, session, redirect, url_for, request, flash,jsonify, send_file
from ..models.database import data_dashboard_corretor
from ..utils import get_relative_path_img
import re
import sqlite3
import csv
import io
from flask import Response, request
import os

generic_bp = Blueprint('generic', __name__, template_folder='../templates/generic')

@generic_bp.route('/')
def home():
    id= session.get('user_id')
    path= get_relative_path_img()
    print ('enderelo'+path)
    foto_perfil= path
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
    return render_template('base1.html', usuario=session,usuario_nome=session.get('user_nome'), foto_perfil=foto_perfil)

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
    nome_usuario= session.get('user_nome')    
    return render_template('generic/render_definir_perfil.html', nome_usuario=nome_usuario)


@generic_bp.route('/definir_perfil', methods= ['GET','POST'])
def definir_perfil():
    from .doc_gen import limpar_pasta_saida
    id= session.get('user_id')
    print (id)
    # Extensões permitidas
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

    # Caminho da pasta onde os arquivos serão salvos
    pasta_raiz = os.path.join(get_relative_path_img())
    os.makedirs(pasta_raiz, exist_ok=True)
    limpar_pasta_saida(pasta_raiz)

    # Função para checar a extensão do arquivo
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    # Verifica se arquivos foram enviados
    if 'arquivos' not in request.files:
        flash('Nenhum arquivo enviado.', "error")
        return redirect(url_for('finan.tab'))

    perfil_foto = request.files.getlist('arquivos')
    if not perfil_foto:
        flash('Nenhum arquivo enviado.', "error")
        return redirect(url_for('finan.tab'))

    for arquivo in perfil_foto:
        if arquivo.filename == '':
            flash('Arquivo com nome vazio.', "error")
            return redirect(url_for('finan.tab'))

        if arquivo and allowed_file(arquivo.filename):
            ext = arquivo.filename.rsplit('.', 1)[1].lower()
            filename = f"foto_perfil{id}.{ext}"
            caminho_arquivo = os.path.join(pasta_raiz, filename)

            try:
                arquivo.save(caminho_arquivo)
                print(f"Arquivo salvo em: {caminho_arquivo}")
            except Exception as e:
                print(f"Erro ao salvar o arquivo: {e}")
                flash('Erro ao salvar o comprovante.', "error")
                return redirect(url_for('finan.tab'))
            flash('Foto atualizada com sucesso.', "success")
    return redirect(url_for('auth.fechar'))

@generic_bp.route('/profile-photo/<int:user_id>')
def serve_profile_photo(user_id):
    """Rota customizada para servir fotos de perfil"""
    foto_path = os.path.join(get_relative_path_img(user_id), f'fotos_perfil_{user_id}',f'foto_perfil{user_id}')
    extensions = ['.jpg', '.jpeg', '.png', '.gif']
    
    for ext in extensions:
        caminho_completo = foto_path + ext
        print(caminho_completo)
        if os.path.exists(caminho_completo):
            return send_file(caminho_completo)
    print(f"🔍 DEBUG SERVE - Tentando servir: {caminho_completo}")
    print(f"✅ DEBUG SERVE - Existe: {os.path.exists(caminho_completo)}")
    
    # Retorna uma imagem padrão se não encontrar
    return send_file(os.path.join(os.getcwd(), 'static', 'image', 'default-avatar.png'))

@generic_bp.route('/api/user/profile-photo')
def get_profile_photo():
    user_id = session.get('user_id')
    print(f"DEBUG - user_id: {user_id}")
    
    if not user_id:
        return jsonify({'foto_url': None})
    
    # Verifica se a foto existe
    foto_path = os.path.join(get_relative_path_img(user_id), f'foto_perfil{user_id}')
    extensions = ['.jpg', '.jpeg', '.png', '.gif']
    
    for ext in extensions:
        caminho_completo = foto_path + ext
        print(f"DEBUG - Tentando: {caminho_completo}")
        print(f"DEBUG - Existe: {os.path.exists(caminho_completo)}")
        
        if os.path.exists(caminho_completo):
            # Retorna a URL relativa para o frontend
            print(f"🎯 DEBUG SERVE - Servindo arquivo: {caminho_completo}")
            foto_url = url_for('static', filename=f'uploads/profile_photos/fotos_perfil_{user_id}/foto_perfil{user_id}{ext}')
            print(f"DEBUG - URL gerada: {foto_url}")
            return jsonify({'foto_url': foto_url})
    
    print("DEBUG - Nenhuma foto encontrada")
    return jsonify({'foto_url': None})
