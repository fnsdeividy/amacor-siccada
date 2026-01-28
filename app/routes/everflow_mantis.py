from flask import Blueprint, render_template, request, redirect, current_app, flash, url_for, session, jsonify
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
from datetime import datetime, timedelta
from ..models.database import get_carteirinha
import binascii
from ..cripto import generate_shared_key, encrypt_data, decrypt_data
import json

mantis_bp = Blueprint('mantis', __name__)


REDIS_EXPIRE_TIME = 3600  # 1 hora



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
            print("verificando status do plano")
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

    
@mantis_bp.route('/autorizar_token', endpoint= 'autorizar_token', methods= ['POST'])
def autorizar_token():
    from ..models.database import post_amatiss_aut
    data= request.get_json(silent=True)
    token= request.headers.get('Authorization')
    token_autorizacao= data.get('token_autorizacao')
    time_stamp= data.get('time_stamp')
    geoloc= data.get('geoloc')
    id_app = data.get('id_app')
    nome_usuario = data.get('nome_usuario')
    card_usuario= data.get('card_usuario')

    print(f"dados recebidos: token {token}, token autorizacao {token_autorizacao}, timestamp {time_stamp}, geoloc {geoloc}, id_app {id_app}, nome {nome_usuario}, card {card_usuario}")

    session['session_id'] = token
    if not token:
        return jsonify({'error': 'No session started'}), 400
    crypto_key = generate_shared_key(token)
    key = bytes.fromhex(crypto_key)


    normalized_data={
        "geoloc": decrypt_data(key, geoloc),
        "nome_usuario" : decrypt_data(key, nome_usuario),
        "card_usuario": decrypt_data(key, card_usuario)
           }
    
    # Extrair apenas os valores numéricos de latitude/longitude
    try:
        import json
        geo = normalized_data.get("geoloc")
        if isinstance(geo, str):
            geo_obj = json.loads(geo)
        else:
            geo_obj = geo
        latitude = str(geo_obj.get("latitude")) if geo_obj is not None else ""
        longitude = str(geo_obj.get("longitude")) if geo_obj is not None else ""
    except Exception:
        # Fallback: extrai os dois primeiros números (inclui negativos e decimais)
        import re
        nums = re.findall(r'-?\d+\.\d+|-?\d+', normalized_data.get("geoloc", ""))
        latitude = nums[0] if len(nums) > 0 else ""
        longitude = nums[1] if len(nums) > 1 else ""

    # Limpeza para `nome` e `card`
    def _clean_text(v):
        if v is None:
            return ""
        if not isinstance(v, str):
            v = str(v)
        v = v.strip()
        if v.startswith('"') and v.endswith('"'):
            v = v[1:-1]
        return v

    nome = _clean_text(normalized_data.get("nome_usuario"))
    card = _clean_text(normalized_data.get("card_usuario"))

    print("dados normalizados: ", normalized_data)
    print(f"latitude: {latitude}, \nlongitude: {longitude}")
    print(f"nome: {nome}, card: {card}")

    # Monta payload como dicionário com os nomes esperados por `post_amatiss_aut`
    payload = {
        "app_user_id": id_app,
        "token_auth": token_autorizacao,
        "time_stamp_auth": time_stamp,
        "nome_beneficiario": nome,
        "card_beneficiario": card,
        "latitude_usuario": latitude,
        "longitude_usuario": longitude
    }

    post_amatiss_aut(payload)

    return jsonify({'message': 'Token registrado com sucesso'})

@mantis_bp.route('/autorizar_tiss', endpoint='autorizar_tiss', methods=['POST'])
def autorizar_tiss():
    from ..models.database import post_autorizar_tiss

    data= request.get_json(silent=True)
    session_id= request.headers.get('Authorization')
    print(data)
    print("id de sessao", session_id)
    data= data.get('aut_data')

    print("dados a serem descript: ",data)

    key=generate_shared_key(session_id)
    # CONVERTE O DICIONÁRIO PARA STRING JSON
    
    decrypted_data= decrypt_data(key, data)

    print(decrypted_data)

    success = post_autorizar_tiss(decrypted_data)
        
    if success:
        return jsonify({
            'success': True,
            'message': 'Autorização registrada com sucesso',
            'status': 'PROCESSADO',
            'timestamp': datetime.now().isoformat()
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Falha ao processar autorização',
            'status': 'ERRO'
        }), 400

