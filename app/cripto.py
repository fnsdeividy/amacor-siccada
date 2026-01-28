import hashlib
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import binascii
import redis

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
    """Descriptografa dados AES-CBC com PKCS7 padding"""
    import binascii
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.primitives import padding
    from cryptography.hazmat.backends import default_backend
    
    # DEBUG
    print(f"DEBUG: Tipo da chave: {type(key)}")
    print(f"DEBUG: Tipo do hex: {type(encrypted_hex)}")
    
    # 1. Converter chave para bytes se for string
    if isinstance(key, str):
        # Se for hexadecimal (apenas caracteres 0-9, a-f)
        if all(c in '0123456789abcdefABCDEF' for c in key):
            key = bytes.fromhex(key)
        else:
            key = key.encode('utf-8')
    
    # 2. Garantir que a chave tem tamanho AES válido
    if len(key) not in [16, 24, 32]:
        import hashlib
        key = hashlib.sha256(key).digest()
    
    # 3. Converter hex para bytes (SEM .encode())
    try:
        encrypted_bytes = binascii.unhexlify(encrypted_hex)
    except binascii.Error:
        # Limpar caracteres não hexadecimais
        import re
        cleaned = re.sub(r'[^0-9a-fA-F]', '', encrypted_hex)
        if len(cleaned) % 2 != 0:
            cleaned = cleaned[:-1]
        encrypted_bytes = binascii.unhexlify(cleaned)
    
    # 4. Configurar AES-CBC
    iv = key[:16]  # IV de 16 bytes
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    
    # 5. Descriptografar
    padded_data = decryptor.update(encrypted_bytes) + decryptor.finalize()
    
    # 6. Remover padding PKCS7
    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(padded_data) + unpadder.finalize()
    
    # 7. Converter para string
    return data.decode('utf-8')

def hash_senha(senha):
    # Usando SHA-256 para criar o hash
    sha256_hash = hashlib.sha256()
    sha256_hash.update(senha.encode('utf-8'))
    return sha256_hash.hexdigest()
