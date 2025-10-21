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

def verifica_log_att(arquivo_log='log_atualizacoa_banco.txt', limite_dias= 7):
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
