import os
import io
import shutil
import unicodedata
import zipfile
from functools import wraps
from flask import session, redirect, url_for, flash
from functools import wraps
from datetime import datetime
from werkzeug.utils import secure_filename
def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            flash('Sua sessão expirou.')
            return redirect(url_for('auth.login'))
        return func(*args, **kwargs)
    return wrapper


def acesso(*tipos_requeridos):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            tipo_usuario = session.get('tipo_usuario')  # Obtém o tipo de usuário da sessão
            if tipo_usuario == 'dev':
                return func(*args, **kwargs)
            print(tipo_usuario)
            print(tipos_requeridos)
            if tipo_usuario not in tipos_requeridos:
                # Redireciona para a rota apropriada se o tipo não for permitido
                return redirect(url_for('auth.redirecionar_usuario', tipo_usuario=tipo_usuario))
            return func(*args, **kwargs)
        return wrapper
    return decorator

def hierarquia(*classes_requeridas):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            classe_usuario= session.get('classe_usuario')
            if classe_usuario == 'dev':
                return func(*args, **kwargs)
            print (classe_usuario)
            print(classes_requeridas)
            if classe_usuario not in classes_requeridas:
                return redirect(url_for('auth.redirecionar_usuario',classe_usuario=classe_usuario))
            return func(*args, **kwargs)
        return wrapper
    return decorator

def atualiza_db_atrasos():
    from models.database import atualiza_atrasos
    print(f'iniciando atualização de atrasos em {datetime.now()}')

    atualiza_atrasos()
    print(f'finalizando atualização de atrasos em {datetime.now()}')


def log_atualiza_banco(mensagem):
    print('logando atualização do banco')
    nome_usuario= session.get('user_nome')
    agora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    print('atualizado em:'+agora)
    linha= f"[{agora}]{mensagem}-{nome_usuario}\n"
    with open('log_atualizacoa_banco.txt','a')as f:
        f.write(linha)

def verifica_log_att(arquivo_log, limite_dias= 7):
    try:
       with open(arquivo_log,'r')as f:
           linhas=f.readlines()
           if not linhas:
               return False
           ultima_linha= linhas[-1].strip()
           data_str= ultima_linha.split(']')[0].replace('[','').strip()
           data_log = datetime.strptime(data_str, '%Y-%m-%d %H:%M:%S').date()


           hoje= datetime.now().date()
           difereca= hoje-data_log
           if difereca.days<=limite_dias:
               return data_log
           
           else:
               return False
    except FileNotFoundError:
        print("⚠️ Arquivo de log não encontrado.")
        return False
    except Exception as e:
        print(f"⚠️ Erro ao verificar log: {e}")
        return False

def log_atualiza_status(numero_contrato, status, last_resp):
    agora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    nome_usuario= session.get('user_nome')
    mensagem= f"Contrato {numero_contrato} mudado para {status} em {agora}, alterado por {nome_usuario} setor: {last_resp}\n"
    linha= f'[{agora}]-{mensagem}'
    with open('log_atualiza_status.txt','a')as f:
        f.write(linha)

def log_atualiza_pagamentos(pagamento_id, status):
    agora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    nome_usuario= session.get('user_nome')
    mensagem= f"Pagamento ID {pagamento_id} mudado para {status} em {agora}, alterado por {nome_usuario}\n"
    linha= f'[{agora}] - {mensagem}'
    with open('log_atualiza_pagamentos.txt','a')as f:
        f.write(linha)
    
def get_relative_path_img(user_id=None):
    """Retorna o caminho da pasta de fotos para um usuário específico"""
    if user_id is None:
        user_id = session.get('user_id')
    
    pasta_raiz = os.path.join(os.getcwd(), 'app', 'static', 'uploads', 'profile_photos', f'fotos_perfil_{user_id}')
    print(f"DEBUG - Caminho para user {user_id}: {pasta_raiz}")
    return pasta_raiz

def get_relative_path_backgrounds(user_id,nome_wallpaper):
    print(nome_wallpaper)

    
    pasta_raiz = os.path.join(os.getcwd(), 'app', 'static', 'image', 'system_wallpaper', f'{nome_wallpaper}')
    print(f"DEBUG - Caminho para user {user_id}: {pasta_raiz}")
    return pasta_raiz

def log_exclusao_proposta(proposta_id, motivo, valor_mensalidade, vidas, corretor_resp):
    agora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    nome_usuario= session.get('user_nome')
    mensagem= f"Proposta {proposta_id} excluída em {agora}, por {nome_usuario} motivo: {motivo}\nvalor mensalidade: {valor_mensalidade}, vidas: {vidas}, corretor_responsavel: {corretor_resp}"
    linha= f'[{agora}] - {mensagem}\n'
    with open('log_exclusao_propostas.txt','a')as f:
        f.write(linha)


def allowed_document_file(filename, allowed_extensions=None):
    if allowed_extensions is None:
        allowed_extensions = {'rar', 'zip', 'pdf'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


NOTA_FISCAL_KEYWORDS = {
    'nf',
    'nfe',
    'nota',
    'nota_fiscal',
    'nota fiscal',
    'notafiscal',
    'nota-fiscal',
    'danfe',
}

NOTA_FISCAL_PREFIXES = (
    'nf',
    'nota_fiscal',
    'nota-fiscal',
    'nota fiscal',
)


def _normalize_document_name(filename):
    nome = os.path.splitext(os.path.basename(filename or ''))[0]
    nome = unicodedata.normalize('NFKD', nome)
    nome = ''.join(char for char in nome if not unicodedata.combining(char))
    return nome.lower()


def is_nota_fiscal_filename(filename, keywords=None):
    keywords = keywords or NOTA_FISCAL_KEYWORDS
    nome_normalizado = _normalize_document_name(filename)
    nome_variantes = {
        nome_normalizado,
        nome_normalizado.replace('_', ' '),
        nome_normalizado.replace('-', ' '),
        nome_normalizado.replace('_', ''),
        nome_normalizado.replace('-', ''),
    }

    for keyword in keywords:
        keyword_normalizada = _normalize_document_name(keyword)
        for variante in nome_variantes:
            if keyword_normalizada and keyword_normalizada in variante:
                return True

    return False


def is_prefixed_nota_fiscal_filename(filename, prefixes=None):
    prefixes = prefixes or NOTA_FISCAL_PREFIXES
    nome_normalizado = _normalize_document_name(filename)
    for prefix in prefixes:
        prefixo_normalizado = _normalize_document_name(prefix)
        if prefixo_normalizado and nome_normalizado.startswith(prefixo_normalizado):
            return True
    return False


def zip_bytes_contains_nota_fiscal(zip_bytes, keywords=None):
    with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zip_src:
        for info in zip_src.infolist():
            if info.is_dir():
                continue
            if is_nota_fiscal_filename(info.filename, keywords=keywords):
                return True
    return False


def get_unique_filename(dest_folder, original_name):
    safe_name = secure_filename(original_name)
    if not safe_name:
        return None

    nome_base, ext = os.path.splitext(safe_name)
    candidato = safe_name
    indice = 1

    while os.path.exists(os.path.join(dest_folder, candidato)):
        candidato = f"{nome_base}_{indice}{ext}"
        indice += 1

    return candidato


def extract_zip_merge(zip_path, dest_folder):
    extraidos = 0
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for membro in zip_ref.infolist():
            if membro.is_dir():
                continue

            nome_interno = os.path.basename(membro.filename.replace('\\', '/'))
            if not nome_interno:
                continue

            nome_seguro = secure_filename(nome_interno)
            if not nome_seguro:
                continue

            destino_nome = get_unique_filename(dest_folder, nome_seguro)
            if not destino_nome:
                continue

            destino_arquivo = os.path.join(dest_folder, destino_nome)
            with zip_ref.open(membro, 'r') as origem, open(destino_arquivo, 'wb') as destino:
                shutil.copyfileobj(origem, destino)
            extraidos += 1

    return extraidos


def get_proposta_zip_path(proposta_folder, zip_name='documentos_proposta.zip'):
    return os.path.join(proposta_folder, zip_name)


def _safe_member_name(original_name):
    nome = os.path.basename((original_name or '').replace('\\', '/'))
    return secure_filename(nome)


def _prefix_document_name(original_name, prefix=None):
    safe_name = _safe_member_name(original_name)
    if not safe_name:
        return None

    safe_prefix = secure_filename((prefix or '').strip())
    if not safe_prefix:
        return safe_name

    nome_base, ext = os.path.splitext(safe_name)
    nome_base_normalizado = _normalize_document_name(nome_base)
    prefixo_normalizado = _normalize_document_name(safe_prefix)

    if nome_base_normalizado.startswith(prefixo_normalizado):
        return safe_name

    return f"{safe_prefix}_{nome_base}{ext}"


def _get_unique_zip_member_name(zip_path, original_name, prefix=None):
    safe_name = _prefix_document_name(original_name, prefix=prefix)
    if not safe_name:
        return None

    existentes = set()
    if os.path.exists(zip_path):
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            existentes = {info.filename for info in zip_ref.infolist() if not info.is_dir()}

    nome_base, ext = os.path.splitext(safe_name)
    candidato = safe_name
    indice = 1
    while candidato in existentes:
        candidato = f"{nome_base}_{indice}{ext}"
        indice += 1

    return candidato


def append_file_to_proposta_zip(zip_path, original_name, file_bytes, prefix=None):
    member_name = _get_unique_zip_member_name(zip_path, original_name, prefix=prefix)
    if not member_name:
        return None

    with zipfile.ZipFile(zip_path, 'a', zipfile.ZIP_DEFLATED) as zip_ref:
        zip_ref.writestr(member_name, file_bytes)

    return member_name


def merge_zip_bytes_into_proposta_zip(zip_bytes, zip_path, prefix=None):
    extraidos = 0
    with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zip_src:
        for info in zip_src.infolist():
            if info.is_dir():
                continue

            nome_interno = _safe_member_name(info.filename)
            if not nome_interno:
                continue

            conteudo = zip_src.read(info.filename)
            if append_file_to_proposta_zip(zip_path, nome_interno, conteudo, prefix=prefix):
                extraidos += 1

    return extraidos


def migrate_folder_files_to_proposta_zip(proposta_folder, zip_path):
    migrados = 0
    nome_zip = os.path.basename(zip_path)

    for nome in os.listdir(proposta_folder):
        caminho = os.path.join(proposta_folder, nome)
        if not os.path.isfile(caminho):
            continue
        if nome == nome_zip:
            continue

        with open(caminho, 'rb') as f:
            conteudo = f.read()
        if append_file_to_proposta_zip(zip_path, nome, conteudo):
            migrados += 1

    return migrados


def list_proposta_zip_members(zip_path):
    if not os.path.exists(zip_path):
        return []

    image_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    arquivos = []

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for info in zip_ref.infolist():
            if info.is_dir():
                continue

            dt_obj = datetime(*info.date_time)
            ext = os.path.splitext(info.filename)[1].lower()
            arquivos.append({
                'nome': info.filename,
                'tamanho_kb': round(info.file_size / 1024, 2),
                'modificado_em': dt_obj.strftime('%d/%m/%Y %H:%M'),
                'modificado_ts': dt_obj.timestamp(),
                'is_image': ext in image_exts
            })

    arquivos.sort(key=lambda item: item['modificado_ts'], reverse=True)
    return arquivos


def read_proposta_zip_member(zip_path, member_name):
    member_name = (member_name or '').replace('\\', '/')
    if not member_name or member_name.startswith('/') or '..' in member_name:
        return None

    if not os.path.exists(zip_path):
        return None

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        if member_name not in zip_ref.namelist():
            return None
        return zip_ref.read(member_name)


def get_proposta_nota_fiscal_attachment(proposta_folder):
    zip_path = get_proposta_zip_path(proposta_folder)

    if os.path.exists(zip_path):
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            candidatos_preferenciais = []
            candidatos_gerais = []
            for indice, info in enumerate(zip_ref.infolist()):
                if info.is_dir():
                    continue
                if not is_nota_fiscal_filename(info.filename):
                    continue

                candidato = (indice, info)
                if is_prefixed_nota_fiscal_filename(info.filename):
                    candidatos_preferenciais.append(candidato)
                else:
                    candidatos_gerais.append(candidato)

            candidatos = candidatos_preferenciais or candidatos_gerais
            if candidatos:
                _, info = candidatos[-1]
                return {
                    'filename': os.path.basename(info.filename),
                    'content': zip_ref.read(info.filename),
                }

    if not os.path.isdir(proposta_folder):
        return None

    arquivos = []
    for nome in os.listdir(proposta_folder):
        caminho = os.path.join(proposta_folder, nome)
        if not os.path.isfile(caminho):
            continue
        if nome == os.path.basename(zip_path):
            continue
        if not is_nota_fiscal_filename(nome):
            continue
        arquivos.append((
            1 if is_prefixed_nota_fiscal_filename(nome) else 0,
            os.path.getmtime(caminho),
            nome,
            caminho,
        ))

    if not arquivos:
        return None

    _, _, nome_arquivo, caminho_arquivo = max(arquivos, key=lambda item: (item[0], item[1]))
    with open(caminho_arquivo, 'rb') as arquivo:
        return {
            'filename': nome_arquivo,
            'content': arquivo.read(),
        }
    
