from flask import Blueprint, render_template, request, redirect, current_app, flash, url_for, session, jsonify
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
from datetime import datetime, timedelta
from ..models.database import get_carteirinha
import binascii
import redis


mantis_bp = Blueprint('mantis', __name__)


REDIS_EXPIRE_TIME = 3600  # 1 hora

def generate_shared_key(session_id):
    # Salt FIXO (usar o mesmo em ambos os sistemas)
    salt = b'fixedsalt12345678'  # ⚠️ Use exatamente os mesmos 16 bytes!
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(session_id.encode())
    return key.hex()


def encrypt_data(key, data):
    # Se a chave vier como string hex, converte para bytes
    if isinstance(key, str):
        key = binascii.unhexlify(key)

    # Padding
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data.encode()) + padder.finalize()

    # Criptografia AES
    cipher = Cipher(algorithms.AES(key), modes.CBC(key[:16]), backend=default_backend())
    encryptor = cipher.encryptor()
    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
    data= binascii.hexlify(encrypted_data).decode('utf-8')
    print ("dado retornado apos cripto: ",data)

    return data

def decrypt_data(key, encrypted_hex):
    # Converte de hexadecimal para bytes
    encrypted_data = binascii.unhexlify(encrypted_hex.encode('utf-8'))

    # Configura o AES CBC com a mesma chave/IV usados na criptografia
    cipher = Cipher(algorithms.AES(key), modes.CBC(key[:16]), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()

    # Remove o padding PKCS7
    unpadder = padding.PKCS7(128).unpadder()
    decrypted_data = unpadder.update(decrypted_padded) + unpadder.finalize()

    return decrypted_data.decode('utf-8')

@mantis_bp.route('/EverFlow', endpoint='EverFlow')
def mantis():
    session_id = request.args.get('data', '')
    session['session_id'] = session_id
    
    if not session_id:
        return jsonify({'error': 'No session_id provided'}), 400

    # Gerar a chave criptografada
    crypto_key = generate_shared_key(session_id)
    
    # Armazenar no Redis
    
    
    # Retorna a resposta similar ao inigate
    return jsonify({
        'message': 'Chave obtida com sucesso',
        'session_id': session_id
    })

@mantis_bp.route('/get_card', endpoint='get_card', methods=['POST'])
def card_to_app():
    from ..models.database import get_carteirinha_to_app
    from ..models.database import get_data_status_plano_to_app
    
    data = request.get_json(silent=True)
    token = request.headers.get('Authorization')
    print(f"dados recebidos: {data} e token {token}")
    

    session_id= token    
    session['session_id'] = session_id
    
   
    internal_sesson_id = session.get('session_id', '')
    hashed_cpf = data.get('cpf')
    print("id da sessao",session_id)
    print(internal_sesson_id)


    if not session_id:
        return jsonify({'error': 'No session_id provided'}), 400

    # Buscar a chave no Redis
    crypto_key = generate_shared_key(session_id)
    if not crypto_key:
        return jsonify({'error': 'Invalid or expired session'}), 400
    print("crypto_key", crypto_key)

    key = bytes.fromhex(crypto_key)
    cpf = decrypt_data(key, hashed_cpf)

    dados_carteirinha = get_carteirinha_to_app(cpf)
    data_entrada= dados_carteirinha.get('dMatricula')
    numero_contrato= dados_carteirinha.get('sNumeroCNT')
    print("data entrada",data_entrada)
    
    data_hoje= datetime.now()
    print(data_hoje)
    data_entrada_formatada = datetime.strptime(data_entrada, '%d/%m/%Y')
    if data_hoje - data_entrada_formatada < timedelta(days=20):
        try:
            info_status= get_data_status_plano_to_app(numero_contrato)
            print("info status",info_status)
            if info_status:
            # Conversão direta para dicionário
                dados_carteirinha['status_plano'] = dict(info_status)
                print("dados carteirinha atualizados", dados_carteirinha)
                
        except Exception as e:
            print(f"Erro ao atualizar data de entrada: {e}")
    else:
        pass        

    dados_carteirinha_hashed= encrypt_data(key,str(dados_carteirinha))
    return jsonify(dados_carteirinha_hashed)

@mantis_bp.route('/get_payment_app', methods= ['POST'])
def get_payment_app():
    numero_contrato= request.args.get('contrato')
    from ..models.database import get_payment_to_app
    
    data = request.get_json(silent=True)
    session_id = request.headers.get('Authorization')
    
    numero_contrato= data.get('contrato')

    session['session_id'] = session_id
    print("id de sessao",session_id)

    print(f"dados recebidos: {data} e token {session_id}")
    
    if not session_id:
        return jsonify({'error': 'No session_id provided'}), 400
    crypto_key = generate_shared_key(session_id)
    if not crypto_key:
        return jsonify({'error': 'Invalid or expired session'}), 400
    print("crypto_key", crypto_key)

    dados_pagamento= get_payment_to_app(numero_contrato)
    print("dados pagamento", dados_pagamento)
    key = bytes.fromhex(crypto_key)
    dados_pagamento_hashed= encrypt_data(key,str(dados_pagamento))
    return jsonify(dados_pagamento_hashed)

@mantis_bp.route('get_especialidades_app', endpoint='get_especialidades_app', methods= ['POST'])
def get_especialidades_app():
    from ..models.database import get_especialidade_to_app
    data= request.get_json(silent=True)
    session_id= request.headers.get('Authorization')
    especialidade= data.get('especialidade')

    session['session_id'] = session_id  
    
    if not session_id:
        return jsonify({'error': 'No session_id provided'}), 400
    crypto_key = generate_shared_key(session_id)
    if not crypto_key:
        return jsonify({'error': 'Invalid or expired session'}), 400
    
    dados_especialidade= get_especialidade_to_app(especialidade)

    key= bytes.fromhex(crypto_key)
    dados_especialidade_hashed= encrypt_data(key,str(dados_especialidade))
    return jsonify(dados_especialidade_hashed)


@mantis_bp.route('/post_suspender_contrato', endpoint='post_suspender_contrato', methods=['POST'])
def post_suspender_contrato():
    from ..models.database import post_suspender_cnt_to_app
    data= request.get_json(silent=True)
    session_id= request.headers.get('Authorization')
    contrato= data.get('contrato')
    session['session_id'] = session_id
    motivo= 'assinatura pendente'

    if not session_id:
        return jsonify({'error': 'No session started'}), 400
    crypto_key = generate_shared_key(session_id)
    if not crypto_key:
        return jsonify({'error': 'Invalid or expired session'}), 400
    
    post_suspender_cnt_to_app(contrato,motivo)

    return jsonify({'message': 'Contrato suspenso com sucesso'})

    
