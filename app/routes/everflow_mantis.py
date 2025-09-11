from flask import Blueprint, render_template, request, redirect, current_app, flash, url_for, session, jsonify
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
from ..models.database import get_carteirinha
import binascii
import redis


mantis_bp = Blueprint('mantis', __name__)

redis_client = redis.Redis(host='localhost', port=6379, db=0)
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
    redis_client.setex(f"session:{session_id}", REDIS_EXPIRE_TIME, crypto_key)
    
    # Retorna a resposta similar ao inigate
    return jsonify({
        'message': 'Chave obtida com sucesso',
        'session_id': session_id
    })

@mantis_bp.route('/get_card', endpoint='get_card')
def card_to_app():
    from ..models.database import get_carteirinha_to_app
    session_id = request.args.get('token', '')
    internal_sesson_id = session.get('session_id', '')
    hashed_cpf = request.args.get('cpf', '')
    print("id da sessao",session_id)
    print(internal_sesson_id)

    if not session_id:
        return jsonify({'error': 'No session_id provided'}), 400

    # Buscar a chave no Redis
    crypto_key = redis_client.get(f"session:{session_id}")
    if not crypto_key:
        return jsonify({'error': 'Invalid or expired session'}), 400
    print("crypto_key", crypto_key)

    key = bytes.fromhex(crypto_key.decode())
    cpf = decrypt_data(key, hashed_cpf)

    dados_carteirinha = get_carteirinha_to_app(cpf)
    dados_carteirinha_hashed= encrypt_data(key,str(dados_carteirinha))
    return jsonify(dados_carteirinha_hashed)