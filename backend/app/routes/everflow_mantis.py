from flask import Blueprint, render_template, request, redirect, current_app, flash, url_for, session, jsonify
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import base64
import mimetypes
import re
import uuid
from datetime import datetime, timedelta
from ..models.database import get_carteirinha, post_app_id
import binascii
from ..cripto import generate_shared_key, encrypt_data, decrypt_data
from ..verifix import verificar_injection
import json

mantis_bp = Blueprint('mantis', __name__)


REDIS_EXPIRE_TIME = 3600  # 1 hora


def save_base64_image(base64_str, filename=None, subdir=None):
    if not base64_str:
        raise ValueError("Base64 vazio")

    mime_type = None
    if base64_str.startswith("data:"):
        header, base64_payload = base64_str.split(",", 1)
        mime_match = re.match(r"data:([^;]+);base64", header)
        mime_type = mime_match.group(1) if mime_match else None
    else:
        base64_payload = base64_str

    base64_payload = base64_payload.strip()
    padding_needed = (-len(base64_payload)) % 4
    if padding_needed:
        base64_payload += "=" * padding_needed

    image_bytes = base64.b64decode(base64_payload, validate=False)

    extension = None
    if mime_type:
        extension = mimetypes.guess_extension(mime_type)
    if not extension:
        extension = ".png"

    if filename:
        filename = os.path.basename(filename)
        name, ext = os.path.splitext(filename)
        filename = f"{name}{ext or extension}"
    else:
        filename = f"img_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{extension}"

    base_static_dir = os.path.abspath(os.path.join(current_app.root_path, '..',  'static', 'documentos_autorizacao'))
    target_dir = base_static_dir
    if subdir:
        target_dir = os.path.join(base_static_dir, subdir)

    os.makedirs(target_dir, exist_ok=True)

    file_path = os.path.join(target_dir, filename)
    with open(file_path, "wb") as image_file:
        image_file.write(image_bytes)

    relative_path = os.path.relpath(file_path, base_static_dir)
    return file_path, relative_path




@mantis_bp.route('/get_card', endpoint='get_card', methods=['POST'])
def card_to_app():
    from ..models.database import get_carteirinha_to_app
    from ..models.database import get_data_status_plano_to_app
    
    data = request.get_json(silent=True) or {}
    token = request.headers.get('Authorization')
    print(f"dados recebidos: {data} e token {token}")
    app_id= data.get('app_id')

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

    if verificar_injection([cpf, app_id]):
        return jsonify({'error': 'Entrada inválida detectada'}), 400

    dados_carteirinha = get_carteirinha_to_app(cpf)
    if not dados_carteirinha:
        return jsonify({'error': 'Beneficiário não encontrado'}), 404

    data_entrada= dados_carteirinha.get('dMatricula')
    numero_contrato= dados_carteirinha.get('sNumeroCNT')
    print("data entrada",data_entrada)
    #introduzir informação do id do app no banco de beneficiarios

    post_app_id(app_id, cpf)
    
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
    
    data = request.get_json(silent=True) or {}
    session_id = request.headers.get('Authorization')
    
    numero_contrato= data.get('contrato')

    if verificar_injection(numero_contrato):
        return jsonify({'error': 'Entrada inválida detectada'}), 400

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
    data= request.get_json(silent=True) or {}
    session_id= request.headers.get('Authorization')
    especialidade= data.get('especialidade')

    if verificar_injection(especialidade):
        return jsonify({'error': 'Entrada inválida detectada'}), 400

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
    data= request.get_json(silent=True) or {}
    session_id= request.headers.get('Authorization')
    contrato= data.get('contrato')
    session['session_id'] = session_id
    motivo= 'assinatura pendente'

    if verificar_injection([contrato, motivo]):
        return jsonify({'error': 'Entrada inválida detectada'}), 400

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
    data= request.get_json(silent=True) or {}
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

    if verificar_injection(payload):
        return jsonify({'error': 'Entrada inválida detectada'}), 400

    post_amatiss_aut(payload)

    return jsonify({'message': 'Token registrado com sucesso'})

@mantis_bp.route('/autorizar_tiss', endpoint='autorizar_tiss', methods=['POST'])
def autorizar_tiss():
    from ..models.database import post_autorizar_tiss
    from ..verifix import verificar_long_lat_comp
    import json

    # 1. Obter dados da requisição
    request_data = request.get_json(silent=True)
    session_id = request.headers.get('Authorization')
    
    print("📦 Dados recebidos:", request_data)
    print("🔑 ID de sessão:", session_id)
    
    if not request_data:
        return jsonify({'error': 'Nenhum dado recebido'}), 400
    
    # 2. Extrair dados criptografados (PRIMEIRA camada 'aut_data')
    encrypted_data = request_data.get('aut_data')
    
    if not encrypted_data:
        return jsonify({'error': 'Campo aut_data não encontrado'}), 400
    
    print("🔐 Dados criptografados:", encrypted_data[:50], "...")
    
    # 3. Gerar chave e descriptografar
    key = generate_shared_key(session_id)
    
    try:
        # Descriptografar
        decrypted_string = decrypt_data(key, encrypted_data)
        
        print("📄 Dados descriptografados (string):", decrypted_string[:100], "..." if len(decrypted_string) > 100 else "")
        print("📊 Tipo:", type(decrypted_string))
        
        # 4. Converter string JSON para dicionário Python
        if isinstance(decrypted_string, str):
            outer_dict = json.loads(decrypted_string)  # Primeiro dicionário
        else:
            outer_dict = decrypted_string
        
        print("📊 Dados convertidos para dict:", outer_dict)
        
        # 5. Acessar a SEGUNDA camada 'aut_data' dentro do JSON descriptografado
        if 'aut_data' not in outer_dict:
            return jsonify({'error': 'Estrutura inválida: aut_data não encontrado após descriptografia'}), 400
        
        # Este é o dicionário real com os dados da autorização
        autorizacao_data = outer_dict['aut_data']

        if verificar_injection(autorizacao_data):
            return jsonify({'error': 'Entrada inválida detectada'}), 400
        
        print("🎯 Dados da autorização:", autorizacao_data)
        
        # 6. Extrair campos do dicionário de autorização
        user_token = autorizacao_data.get('user_token')
        id_amatiss = autorizacao_data.get('id_clinica')
        id_autorizacao = autorizacao_data.get('id_autorizacao')
        nome_clinica = autorizacao_data.get('nome_clinica')
        servicos = autorizacao_data.get('servicos', [])
        
        print("🎫 User token:", user_token)
        print("🏥 ID Clínica:", id_amatiss)
        print("📋 ID Autorização:", id_autorizacao)
        print("🏢 Nome Clínica:", nome_clinica)
        print("🩺 Serviços:", servicos)
        
        if not user_token or not id_amatiss:
            return jsonify({
                'error': 'Campos obrigatórios não encontrados',
                'campos_faltando': [
                    'user_token' if not user_token else None,
                    'id_clinica' if not id_amatiss else None
                ]
            }), 400
        
        # 7. Verificar localização
        print("📍 Verificando localização para clínica:", id_amatiss)
        loc_permitida = verificar_long_lat_comp(id_amatiss, user_token)
        print("📍 Resultado verificação localização:", loc_permitida)
        
        # 8. Processar autorização
        if loc_permitida and loc_permitida.get('autorizado', False):
            # Salvar no banco
            resultado = post_autorizar_tiss(autorizacao_data)
            
            print("💾 Resultado do banco:", resultado)
            
            return jsonify({
                'success': True,
                'autorizado': True,
                'codigo_autorizacao': id_autorizacao,
                'nome_clinica': nome_clinica,
                'servicos': servicos,
                'localizacao': loc_permitida,
                'mensagem': '✅ Autorização TISS concedida com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'autorizado': False,
                'codigo_autorizacao': id_autorizacao,
                'mensagem': loc_permitida.get('mensagem', '❌ Localização não autorizada, usuario fora do alcance da clinica'),
                'distancia': loc_permitida.get('distancia_metros'),
                'raio_maximo': loc_permitida.get('raio_maximo')
            }), 403
            
    except json.JSONDecodeError as e:
        print(f"❌ ERRO JSON: {e}")
        print(f"String problemática: {decrypted_string[:200]}")
        return jsonify({'error': 'Dados descriptografados não são JSON válido'}), 400
    except KeyError as e:
        print(f"❌ ERRO CHAVE: Campo {e} não encontrado")
        return jsonify({'error': f'Campo {e} não encontrado na estrutura de dados'}), 400
    except Exception as e:
        print(f"❌ ERRO GERAL: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500
    
@mantis_bp.route('/get_autorizacoes', endpoint='get_autorizacoes', methods=['POST'])
def get_autorizacoes():
    from ..models.database import get_autorizacoes_by_card
    
    token = request.headers.get('Authorization')
    data = request.get_json(silent=True) or {}
    
    print("[get_autorizacoes] token:", token)
    print("[get_autorizacoes] payload bruto:", data)
    
    # Gerar chave de criptografia
    key = generate_shared_key(token)
    if not key:
        return jsonify({'error': 'Invalid or expired session'}), 400
    
    try:
        # Extrair e descriptografar o card
        card_encrypted = data.get('card')
        if not card_encrypted:
            return jsonify({'error': 'Card do beneficiário não enviado'}), 400
        
        # Descriptografar o card
        card_beneficiario = decrypt_data(key, card_encrypted)
        if verificar_injection(card_beneficiario):
            return jsonify({'error': 'Entrada inválida detectada'}), 400

        print(f"[get_autorizacoes] Card descriptografado: {card_beneficiario}")
        
        # Buscar autorizações no banco de dados
        autorizacoes = get_autorizacoes_by_card(card_beneficiario)
        
        if not autorizacoes:
            # Retornar lista vazia criptografada
            resultado_criptografado = encrypt_data(key, str([]))
            return jsonify(resultado_criptografado), 200
        
        print(f"[get_autorizacoes] Encontradas {len(autorizacoes)} autorizações")
        
        # Criptografar resultado
        resultado_criptografado = encrypt_data(key, str(autorizacoes))
        
        return jsonify(resultado_criptografado), 200
        
    except Exception as e:
        print(f"[get_autorizacoes] Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Erro ao buscar autorizações: {str(e)}'}), 500

@mantis_bp.route('/registrar_cpx', endpoint= 'registrar_cpx', methods= ['POST'])
def registrar_cpx():
    from ..models.database import post_registrar_cpx
    token= request.headers.get('Authorization')
    data = request.get_json(silent=True) or {}
    print("[registrar_cpx] token:", token)
    
    # Criar cópia dos dados para log sem documento completo
    data_log = data.copy()
    if isinstance(data_log.get('aut_data'), dict) and 'documento' in data_log['aut_data']:
        doc_len = len(str(data_log['aut_data']['documento']))
        data_log['aut_data'] = {**data_log['aut_data'], 'documento': f'<{doc_len} chars>'}
    print("[registrar_cpx] payload bruto:", data_log)
    
    key = generate_shared_key(token)
    print("[registrar_cpx] key gerada (hex):", key)
    if not key:
        return jsonify({'error': 'Invalid or expired session'}), 400
    
    try:
        # Verificar se há payload criptografado como um todo
        encrypted_payload = (
            data.get('payload')
            or data.get('data')
            or data.get('encrypted_data')
            or data.get('encrypted')
            or data.get('push_data')
        )

        if encrypted_payload:
            print("[registrar_cpx] Descriptografando payload completo...")
            decrypted_data_str = decrypt_data(key, encrypted_payload)
            if isinstance(decrypted_data_str, str):
                decrypted_data = json.loads(decrypted_data_str)
            else:
                decrypted_data = decrypted_data_str

            if isinstance(decrypted_data, dict):
                data = decrypted_data
                if isinstance(data.get('data'), dict):
                    data = data.get('data')
        
        # Descriptografar campos individuais dentro de aut_data
        if isinstance(data.get('aut_data'), dict):
            aut_data = data['aut_data']
            print("[registrar_cpx] Descriptografando campos individuais...")
            
            # Campos que precisam ser descriptografados
            encrypted_fields = ['id_app', 'card', 'nome', 'documento']
            
            for field in encrypted_fields:
                if field in aut_data and aut_data[field]:
                    try:
                        decrypted_value = decrypt_data(key, aut_data[field])
                        aut_data[field] = decrypted_value
                        
                        # Log do campo descriptografado (sem mostrar documento completo)
                        if field == 'documento':
                            print(f"[registrar_cpx] {field} descriptografado: <{len(decrypted_value)} chars>")
                        else:
                            print(f"[registrar_cpx] {field} descriptografado: {decrypted_value}")
                    except Exception as e:
                        print(f"[registrar_cpx] Erro ao descriptografar {field}: {str(e)}")
                        # Continua com o próximo campo
            
            # Atualizar data com aut_data descriptografado
            data['aut_data'] = aut_data
        
    except json.JSONDecodeError as e:
        print("[registrar_cpx] erro json decode:", str(e))
        return jsonify({'error': f'Dados descriptografados não são JSON válido: {str(e)}'}), 400
    except Exception as e:
        print("[registrar_cpx] erro ao descriptografar:", str(e))
        return jsonify({'error': f'Erro ao descriptografar payload: {str(e)}'}), 400

    # Extrair dados para salvar imagem
    aut_data = data.get('aut_data', {})

    if verificar_injection([
        aut_data.get('id_app'),
        aut_data.get('card'),
        aut_data.get('nome'),
        aut_data.get('nomeExame'),
        aut_data.get('timestamp'),
        data.get('pasta'),
        data.get('subdir')
    ]):
        return jsonify({'error': 'Entrada inválida detectada'}), 400
    
    image_base64 = (
        aut_data.get('documento') or
        data.get('imagem_base64') or
        data.get('image_base64') or
        data.get('base64') or
        data.get('imagem')
    )
    
    # Construir nome do arquivo personalizado: {id_app[:10]}_{nome_exame}_{data_hora}
    id_app = aut_data.get('id_app', '')
    nome_exame = aut_data.get('nomeExame', 'exame')
    data_hora = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Limpar nome do exame (remover caracteres especiais)
    nome_exame_limpo = re.sub(r'[^a-zA-Z0-9_-]', '_', nome_exame)
    
    # Nome do arquivo: primeiros 10 dígitos do id_app + nome exame + data/hora
    filename = f"{id_app[:10]}_{nome_exame_limpo}_{data_hora}"
    
    subdir = (
        aut_data.get('pasta') or
        data.get('pasta') or
        data.get('subdir')
    )

    print("[registrar_cpx] image_base64 encontrado:", bool(image_base64))
    print("[registrar_cpx] filename:", filename)
    print("[registrar_cpx] subdir:", subdir)

    if not image_base64:
        return jsonify({'error': 'Imagem base64 não enviada'}), 400

    try:
        file_path, relative_path = save_base64_image(
            image_base64,
            filename=filename,
            subdir=subdir,
        )
        
        print(f"[registrar_cpx] Imagem salva: {relative_path}")
        
        # Preparar dados para salvar no banco
        dados_registro = {
            'id_app': aut_data.get('id_app'),
            'card': aut_data.get('card'),
            'nome': aut_data.get('nome'),
            'nomeExame': aut_data.get('nomeExame'),
            'documento_path': relative_path,
            'timestamp': aut_data.get('timestamp'),
            'session_token': token
        }
        
        # Registrar no banco de dados
        ip_origem = request.remote_addr
        resultado_db = post_registrar_cpx(dados_registro, ip_origem)
        
        if not resultado_db.get('success'):
            print(f"[registrar_cpx] ⚠️ Aviso: Falha ao registrar no banco: {resultado_db.get('error')}")
        else:
            print(f"[registrar_cpx] ✅ Registrado no banco com ID: {resultado_db.get('id')}")
        
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f"[registrar_cpx] Erro ao salvar imagem: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Erro ao salvar imagem: {str(e)}'}), 500

@mantis_bp.route('/registrar_push', endpoint='registrar_push', methods=['POST'])
def post_push_notification():
    from ..models.database import post_registrar_push
    token = request.headers.get('Authorization')
    data = request.get_json(silent=True) or {}

    print("[registrar_push] token:", token)
    print("[registrar_push] payload bruto:", data)

    if not token:
        return jsonify({'error': 'No session started'}), 400

    crypto_key = generate_shared_key(token)
    if not crypto_key:
        return jsonify({'error': 'Invalid or expired session'}), 400

    key = bytes.fromhex(crypto_key)

    try:
        encrypted_payload = (
            data.get('payload')
            or data.get('data')
            or data.get('encrypted_data')
            or data.get('encrypted')
            or data.get('push_data')
        )

        print("[registrar_push] encrypted_payload type:", type(encrypted_payload))
        print("[registrar_push] encrypted_payload raw:", encrypted_payload)

        payload_decrypted = False

        if encrypted_payload:
            print("[registrar_push] Descriptografando payload completo...")
            decrypted_data_str = decrypt_data(key, encrypted_payload)
            if isinstance(decrypted_data_str, str):
                decrypted_data = json.loads(decrypted_data_str)
            else:
                decrypted_data = decrypted_data_str

            if isinstance(decrypted_data, dict):
                data = decrypted_data
                if isinstance(data.get('data'), dict):
                    data = data.get('data')
                payload_decrypted = True
                print("[registrar_push] payload_decrypted keys:", list(data.keys()))

        # Descriptografar campos individuais somente se não houve payload completo
        encrypted_fields = [
            'pushToken', 'push_token', 'platform', 'deviceModel', 'device_model',
            'deviceBrand', 'device_brand', 'appVersion', 'app_version',
            'buildNumber', 'build_number', 'userAppId', 'user_app_id',
            'androidId', 'uniqueId', 'deviceId', 'phoneId', 'installationId',
            'flow', 'idSource', 'osVersion'
        ]
        if not payload_decrypted:
            for field in encrypted_fields:
                if field in data and data[field]:
                    try:
                        data[field] = decrypt_data(key, data[field])
                    except Exception as e:
                        print(f"[registrar_push] Erro ao descriptografar {field}: {str(e)}")
    except json.JSONDecodeError as e:
        print("[registrar_push] erro json decode:", str(e))
        return jsonify({'error': f'Dados descriptografados não são JSON válido: {str(e)}'}), 400
    except Exception as e:
        print("[registrar_push] erro ao descriptografar:", str(e))
        return jsonify({'error': f'Erro ao descriptografar payload: {str(e)}'}), 400

    print("[registrar_push] payload final (post-decrypt):", data)
    print("[registrar_push] user_app_id raw:", data.get('userAppId'), "|", data.get('user_app_id'))

    if verificar_injection(data):
        return jsonify({'error': 'Entrada inválida detectada'}), 400

    push_token = data.get('pushToken') or data.get('push_token')
    platform = data.get('platform')
    device_model = data.get('deviceModel') or data.get('device_model')
    device_brand = data.get('deviceBrand') or data.get('device_brand')
    app_version = data.get('appVersion') or data.get('app_version')
    build_number = data.get('buildNumber') or data.get('build_number')
    user_app_id = data.get('userAppId') or data.get('user_app_id')
    android_id = data.get('androidId') or data.get('android_id')
    unique_id = data.get('uniqueId') or data.get('unique_id')
    device_id = data.get('deviceId') or data.get('device_id')
    phone_id = data.get('phoneId') or data.get('phone_id')
    installation_id = data.get('installationId') or data.get('installation_id')
    flow = data.get('flow')
    id_source = data.get('idSource') or data.get('id_source')
    os_version = data.get('osVersion') or data.get('os_version')

    # Usa o melhor identificador disponível para amarrar 1 usuário -> 1 dispositivo.
    device_identifier = (
        android_id
        or unique_id
        or installation_id
        or device_id
        or phone_id
    )

    print("[registrar_push] user_app_id normalized:", user_app_id)

    if not user_app_id:
        return jsonify({'error': 'user_app_id não enviado'}), 400

    if not device_identifier:
        return jsonify({'error': 'Nenhum identificador de dispositivo enviado'}), 400

    dados_registro = {
        'push_token': push_token,
        'user_app_id': user_app_id,
        'platform': platform,
        'device_model': device_model,
        'device_brand': device_brand,
        'device_identifier': device_identifier,
        'android_id': android_id,
        'unique_id': unique_id,
        'device_id': device_id,
        'phone_id': phone_id,
        'installation_id': installation_id,
        'flow': flow,
        'id_source': id_source,
        'os_version': os_version,
        'app_version': app_version,
        'build_number': build_number,
        'session_token': token
    }

    print("[registrar_push] dados_registro:", dados_registro)

    ip_origem = request.remote_addr
    resultado_db = post_registrar_push(dados_registro, ip_origem)

    if not resultado_db.get('success'):
        print(f"[registrar_push] ⚠️ Falha ao registrar no banco: {resultado_db.get('error')}")
        return jsonify({'success': False, 'error': resultado_db.get('error')}), 500

    if resultado_db.get('action') == 'device_conflict':
        return jsonify({
            'success': False,
            'can_login': False,
            'already_registered_other_device': True,
            'action': 'device_conflict',
            'user_app_id': user_app_id,
            'current_device_id': device_identifier,
            'registered_device_id': resultado_db.get('registered_device_id'),
            'registered_device_model': resultado_db.get('registered_device_model'),
            'registered_platform': resultado_db.get('registered_platform'),
            'message': 'Acesso negado: usuario ja possui cadastro em outro dispositivo'
        }), 403

    return jsonify({'success': True, 'id': resultado_db.get('id'), 'action': resultado_db.get('action')}), 200
    