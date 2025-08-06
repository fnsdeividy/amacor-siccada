import hashlib

def hash_senha(senha):
    # Usando SHA-256 para criar o hash
    sha256_hash = hashlib.sha256()
    sha256_hash.update(senha.encode('utf-8'))
    return sha256_hash.hexdigest()
