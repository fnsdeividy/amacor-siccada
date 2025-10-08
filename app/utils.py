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

if __name__ == "__main__":
    atualiza_db_atrasos()

