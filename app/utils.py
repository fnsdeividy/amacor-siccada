import os
from functools import wraps
from flask import session, redirect, url_for, flash
from functools import wraps
from datetime import datetime
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
    