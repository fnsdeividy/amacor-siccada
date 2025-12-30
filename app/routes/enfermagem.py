from flask import Flask, Blueprint, render_template, request, session, redirect, url_for, send_file, flash, jsonify, current_app
import sqlite3
import requests
import json
import os
from ..models.database import criar_tabelas_patologias
from docx import Document
from datetime import datetime
"""import comtypes.client
import pypandoc
import  pythoncom"""
import psutil
from docx import Document
from reportlab.pdfgen import canvas
import subprocess
from PyPDF2 import PdfMerger
#print(os.environ['PATH'])
import pandas as pd
import re
import shutil

enfermagem_bp= Blueprint('enfermagem', __name__)

@enfermagem_bp.route('declaracao', methods= ["GET","POST"])
def declaracao():
    from ..models.database import get_titular_dependente
    cpf= request.args.get('cpf','')


    dados= get_titular_dependente(cpf=cpf)
    print (dados)
    return render_template('enfermagem/entrevista.html', dados=dados)

@enfermagem_bp.route('/gerar_qrcode')
def gerar_qrcode():
    import qrcode
    import os
    import io
    import base64
    import socket
    import re
    from flask import render_template, abort, jsonify, request
    from datetime import datetime
    
    # Obter CPF do parâmetro
    cpf = request.args.get('cpf', '')
    formato = request.args.get('formato', 'html')  # 'html', 'json', ou 'raw'
    
    if not cpf:
        abort(400, description="CPF não fornecido")
    
    # Função para obter IP do servidor dinamicamente
    def get_server_ip_and_port():
        """
        Obtém o IP e porta do servidor de forma inteligente
        """
        try:
            # Tenta obter IP local
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            server_ip = s.getsockname()[0]
            s.close()
            
            # Obtém a porta do request
            server_port = request.environ.get('SERVER_PORT', '8001')
            
            return server_ip, server_port
        except:
            # Fallback para valores padrão
            return "192.168.0.157", "8001"
    
    # Obter IP e porta do servidor
    server_ip, server_port = get_server_ip_and_port()
    
    # Criar diretório se não existir
    qr_code_dir = os.path.join(os.getcwd(), 'static', 'qrcode', 'entrevista')
    
    try:
        # Criar diretório recursivamente
        os.makedirs(qr_code_dir, exist_ok=True)
        
        # URL dinâmica para o QR Code apontar
        url = f"http://{server_ip}:{server_port}/enfermagem/declaracao?cpf={cpf}"
        
        # Criar QR Code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        # Criar imagem com cores personalizadas
        img = qr.make_image(fill_color="#347abb", back_color="white")
        
        # Converter para base64 para exibir na página
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Sanitizar CPF para nome de arquivo (remover caracteres inválidos)
        cpf_sanitizado = re.sub(r'[^\w\-_.]', '_', cpf)
        
        # Criar nome do arquivo único com timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        qr_code_filename = f'qrcode_{cpf_sanitizado}_{timestamp}.png'
        qr_code_path = os.path.join(qr_code_dir, qr_code_filename)
        
        # Salvar imagem
        img.save(qr_code_path)
        
        # Retornar conforme o formato solicitado
        if formato == 'json':
            return jsonify({
                'success': True,
                'cpf': cpf,
                'url': url,
                'qrcode_base64': img_str,
                'data_geracao': datetime.now().isoformat(),
                'servidor': f"{server_ip}:{server_port}",
                'instrucoes': 'Escaneie este QR Code com a câmera do seu celular para acessar a declaração'
            })
        elif formato == 'raw':
            # Retorna apenas a imagem
            return f'data:image/png;base64,{img_str}'
        else:
            # Retornar página HTML completa
            return render_template(
                'enfermagem/exibir_qrcode.html',
                cpf=cpf,
                url=url,
                qrcode_base64=img_str,
                timestamp=datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
                ip_servidor=f"{server_ip}:{server_port}"
            )
            
    except PermissionError:
        abort(500, description="Permissão negada para criar diretório ou arquivo")
    except Exception as e:
        abort(500, description=f"Erro ao gerar QR Code: {str(e)}")

@enfermagem_bp.route('/enviar_entrevista', methods=['POST'])
def receber_entrevista():
    from ..models.database import alterar_cnt
    try:
        print("🔍 === INICIANDO PROCESSAMENTO DE ENTREVISTA ===")
        
        # Obter dados da requisição
        if request.is_json:
            data = request.get_json()
            print("📦 Dados recebidos como JSON", data)
        else:
            data = request.form.to_dict()
            print("📦 Dados recebidos como FormData")
        
        if not data:
            print("❌ Nenhum dado recebido")
            return jsonify({
                'success': False,
                'message': 'Nenhum dado recebido'
            }), 400
        
        print(f"🔍 Dados brutos recebidos: {data}")
        
        # ============================================
        # PROCESSAMENTO DOS DADOS RECEBIDOS
        # ============================================
        
        # Extrair dados básicos
        cpf = data.get('cpf', '').strip()
        proposta_id = data.get('proposta_id', '').strip()
        tipo_pessoa = data.get('tipo_pessoa', '').strip().upper()
        
        print(f"🔍 Dados extraídos - CPF: '{cpf}', Proposta: '{proposta_id}', Tipo: '{tipo_pessoa}'")
        
        # Verificar campos obrigatórios
        if not cpf or not proposta_id or not tipo_pessoa:
            print("❌ Campos obrigatórios faltando")
            return jsonify({
                'success': False,
                'message': 'CPF, proposta_id e tipo_pessoa são obrigatórios'
            }), 400
        
        # ============================================
        # COLETAR PATOLOGIAS DO ARRAY RECEBIDO
        # ============================================
        
        patologias_detectadas = []
        cids_detectados = []
        patologias_com_cid = []
        
        # FORMATO 1: Array 'patologias' (formato novo)
        if 'patologias' in data and isinstance(data['patologias'], list):
            print(f"📋 Processando array de patologias: {len(data['patologias'])} itens")
            for pat in data['patologias']:
                if isinstance(pat, dict):
                    nome = pat.get('nome', '').strip()
                    cid = pat.get('cid', '').strip()
                    categoria = pat.get('categoria', '').strip()
                    
                    if nome:
                        print(f"✅ Do array: {nome} (CID: {cid})")
                        patologias_detectadas.append(nome)
                        
                        if cid:
                            cids_detectados.append(cid)
                        
                        patologias_com_cid.append({
                            'nome': nome,
                            'cid': cid,
                            'categoria': categoria
                        })
        else:
            # FORMATO 2: Campos individuais (para compatibilidade)
            print("⚠️ Array 'patologias' não encontrado, usando processamento de campos individuais...")
            
            # Mapeamento completo de doenças com seus CIDs
            mapeamento_doencas = {
                # Cardiovascular
                'hipertensao_arterial': {'nome': 'Hipertensão Arterial', 'cid': 'I10', 'categoria': 'cardiovascular'},
                'doenca_coronariana': {'nome': 'Doença Coronariana', 'cid': 'I20-I25', 'categoria': 'cardiovascular'},
                'varizes': {'nome': 'Varizes', 'cid': 'I83', 'categoria': 'cardiovascular'},
                'problemas_arteriais': {'nome': 'Problemas Arteriais', 'cid': 'I70-I79', 'categoria': 'cardiovascular'},
                'trombose': {'nome': 'Trombose', 'cid': 'I80-I82', 'categoria': 'cardiovascular'},
                'valvulopatias': {'nome': 'Valvulopatias', 'cid': 'I05-I08', 'categoria': 'cardiovascular'},
                'insuficiencia_cardiaca': {'nome': 'Insuficiência Cardíaca', 'cid': 'I50', 'categoria': 'cardiovascular'},
                'arritmias': {'nome': 'Arritmias', 'cid': 'I47-I49', 'categoria': 'cardiovascular'},
                'infarto': {'nome': 'Infarto', 'cid': 'I21-I22', 'categoria': 'cardiovascular'},
                'cicatrizes_toracica': {'nome': 'Cicatrizes Torácica', 'cid': '', 'categoria': 'cardiovascular'},
                
                # Endócrina/Metabólica
                'diabetes': {'nome': 'Diabetes', 'cid': 'E10-E14', 'categoria': 'endocrina'},
                'hipertireoidismo': {'nome': 'Hipertireoidismo', 'cid': 'E05', 'categoria': 'endocrina'},
                'hipotireoidismo': {'nome': 'Hipotireoidismo', 'cid': 'E03', 'categoria': 'endocrina'},
                'colesterol_alto': {'nome': 'Colesterol Alto', 'cid': 'E78', 'categoria': 'endocrina'},
                'triglicerides_alto': {'nome': 'Triglicérides Alto', 'cid': '', 'categoria': 'endocrina'},
                'desnutricao': {'nome': 'Desnutrição', 'cid': 'E40-E46', 'categoria': 'endocrina'},
                'obesidade': {'nome': 'Obesidade', 'cid': 'E66', 'categoria': 'endocrina'},
                
                # Digestivo
                'gastrite': {'nome': 'Gastrite', 'cid': 'K29', 'categoria': 'digestivo'},
                'ulcera': {'nome': 'Úlcera', 'cid': 'K25-K28', 'categoria': 'digestivo'},
                'colite': {'nome': 'Colite', 'cid': 'K50-K52', 'categoria': 'digestivo'},
                'cirrose_hepatica': {'nome': 'Cirrose Hepática', 'cid': 'K74', 'categoria': 'digestivo'},
                'hepatite': {'nome': 'Hepatite', 'cid': 'B15-B19', 'categoria': 'digestivo'},
                'cicatrizes_abdominais': {'nome': 'Cicatrizes Abdominais', 'cid': '', 'categoria': 'digestivo'},
                'hernia_abdominal': {'nome': 'Hérnia Abdominal', 'cid': 'K40-K46', 'categoria': 'digestivo'},
                'pancreatite': {'nome': 'Pancreatite', 'cid': 'K85', 'categoria': 'digestivo'},
                'doenca_vesicula': {'nome': 'Doença da Vesícula Biliar', 'cid': 'K80-K81', 'categoria': 'digestivo'},
                'hemorroidas': {'nome': 'Hemorroidas', 'cid': 'K64', 'categoria': 'digestivo'},
                'diverticulite': {'nome': 'Diverticulite', 'cid': 'K57', 'categoria': 'digestivo'},
                
                # Sangue
                'anemia': {'nome': 'Anemia', 'cid': 'D50-D64', 'categoria': 'sangue'},
                'leucemia': {'nome': 'Leucemia', 'cid': 'C91-C95', 'categoria': 'sangue'},
                'hemofilia': {'nome': 'Hemofilia', 'cid': 'D66-D68', 'categoria': 'sangue'},
                
                # Osteomuscular
                'hernia_disco': {'nome': 'Hérnia de Disco', 'cid': 'M51', 'categoria': 'osteomuscular'},
                'osteoporose': {'nome': 'Osteoporose', 'cid': 'M80-M81', 'categoria': 'osteomuscular'},
                'lesao_menisco': {'nome': 'Lesão de Menisco', 'cid': 'S83', 'categoria': 'osteomuscular'},
                'bursite': {'nome': 'Bursite', 'cid': 'M71', 'categoria': 'osteomuscular'},
                'artrites': {'nome': 'Artrite', 'cid': 'M05-M06', 'categoria': 'osteomuscular'},
                'artroses': {'nome': 'Artrose', 'cid': 'M15-M19', 'categoria': 'osteomuscular'},
                'gota': {'nome': 'Gota', 'cid': 'M10', 'categoria': 'osteomuscular'},
                'lupus': {'nome': 'Lúpus', 'cid': 'M32', 'categoria': 'osteomuscular'},
                'tenossinovites': {'nome': 'Tenossinovite', 'cid': 'M65', 'categoria': 'osteomuscular'},
                'escoliose': {'nome': 'Escoliose', 'cid': 'M41', 'categoria': 'osteomuscular'},
                'lordose': {'nome': 'Lordose', 'cid': 'M40', 'categoria': 'osteomuscular'},
                
                # Psiquiátrica
                'ansiedade': {'nome': 'Ansiedade', 'cid': 'F41', 'categoria': 'psiquiatrica'},
                'depressao': {'nome': 'Depressão', 'cid': 'F32-F33', 'categoria': 'psiquiatrica'},
                
                # Ocular
                'miopia': {'nome': 'Miopia', 'cid': 'H52', 'categoria': 'ocular'},
                'catarata': {'nome': 'Catarata', 'cid': 'H25-H26', 'categoria': 'ocular'},
            }
            
            print(f"🔍 Verificando {len(mapeamento_doencas)} doenças no mapeamento...")
            
            for campo_id, info in mapeamento_doencas.items():
                valor = data.get(campo_id)
                if valor in [True, 'true', 'on', '1', 'yes', 'True']:
                    print(f"✅ Campo marcado: {info['nome']} (CID: {info['cid']})")
                    patologias_detectadas.append(info['nome'])
                    if info['cid']:
                        cids_detectados.append(info['cid'])
                    
                    patologias_com_cid.append({
                        'nome': info['nome'],
                        'cid': info['cid'],
                        'categoria': info['categoria']
                    })
            
            # Coletar doenças "outras"
            print("🔍 Verificando campos 'outras'...")
            for chave, valor in data.items():
                if chave.endswith('_text') and valor and str(valor).strip():
                    print(f"✅ Campo 'outras' encontrado: {chave} = '{valor}'")
                    patologias_detectadas.append(str(valor).strip())
            
            # Coletar câncer
            if 'cancer_text' in data and data['cancer_text'] and str(data['cancer_text']).strip():
                cancer_valor = str(data['cancer_text']).strip()
                print(f"✅ Câncer informado: {cancer_valor}")
                patologias_detectadas.append(cancer_valor)
                cids_detectados.append('C00-C97')
                patologias_com_cid.append({
                    'nome': cancer_valor,
                    'cid': 'C00-C97',
                    'categoria': 'neoplasia'
                })
        
        print(f"🔍 Total de patologias detectadas: {len(patologias_detectadas)}")
        print(f"🔍 Patologias: {patologias_detectadas}")
        print(f"🔍 CIDs: {cids_detectados}")
        
        # ============================================
        # VALIDAR E BUSCAR PESSOA NO BANCO
        # ============================================
        
        # Conectar ao banco
        conn = sqlite3.connect(current_app.config['DATABASE'])
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Verificar se tabela patologias existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='patologias'")
        if not cursor.fetchone():
            print("⚠️ Tabela 'patologias' não existe, criando...")
            from ..models.database import criar_tabelas_patologias
            criar_tabelas_patologias(current_app.config['DATABASE'])
            print("✅ Tabelas criadas")
        
        # Buscar pessoa no banco
        pessoa_id = None
        if tipo_pessoa == 'TITULAR':
            print(f"buscando por cpf: {cpf} na proposta {proposta_id}")
            cursor.execute('SELECT id FROM titulares WHERE cpf = ?', 
                         (cpf,))
            titular = cursor.fetchone()
            if titular:
                pessoa_id = titular['id']
        else:  # DEPENDENTE
            cursor.execute('SELECT id FROM dependentes WHERE cpf = ?', 
                         (cpf,))
            dependente = cursor.fetchone()
            if dependente:
                pessoa_id = dependente['id']
        
        if not pessoa_id:
            conn.close()
            print(f"❌ Pessoa não encontrada: CPF={cpf}, Proposta={proposta_id}")
            return jsonify({
                'success': False,
                'message': f'{tipo_pessoa} não encontrado com CPF {cpf} na proposta {proposta_id}'
            }), 404
        
        # ============================================
        # PREPARAR DADOS PARA INSERÇÃO
        # ============================================
        
        # Criar objeto JSON com todas as patologias
        patologias_json = {
            'total_patologias': len(patologias_detectadas),
            'patologias': patologias_detectadas,
            'cids': cids_detectados,
            'patologias_com_cid': patologias_com_cid,
            'data_coleta': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Determinar CID principal (primeiro CID ou mais grave)
        cid_principal = cids_detectados[0] if cids_detectados else ''
        
        # Calcular risco
        risco = calcular_risco_por_patologias(patologias_detectadas, cids_detectados)
        
        # Determinar IDs
        if tipo_pessoa == 'TITULAR':
            titular_id = pessoa_id
            dependente_id = None
        else:
            titular_id = None
            dependente_id = pessoa_id
        
        # Verificar se já existe registro para esta pessoa
        cursor.execute('''
            SELECT id FROM patologias 
            WHERE (titular_id = ? OR dependente_id = ?) AND tipo_pessoa = ?
        ''', (pessoa_id, pessoa_id, tipo_pessoa))
        
        registro_existente = cursor.fetchone()
        
        if registro_existente:
            # Atualizar registro existente
            print(f"🔄 Atualizando registro existente ID: {registro_existente['id']}")
            cursor.execute('''
                UPDATE patologias 
                SET patologias_json = ?, 
                    cid_principal = ?,
                    grau_risco = ?,
                    pontuacao_risco = ?,
                    data_atualizacao = ?
                WHERE id = ?
            ''', (
                json.dumps(patologias_json, ensure_ascii=False),
                cid_principal,
                risco['grau_risco'],
                risco['pontuacao'],
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                registro_existente['id']
            ))
            registro_id = registro_existente['id']
        else:
            # Inserir novo registro
            print(f"🆕 Inserindo novo registro")
            cursor.execute('''
                INSERT INTO patologias 
                (titular_id, dependente_id, tipo_pessoa, patologias_json, cid_principal, grau_risco, pontuacao_risco)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                titular_id,
                dependente_id,
                tipo_pessoa,
                json.dumps(patologias_json, ensure_ascii=False),
                cid_principal,
                risco['grau_risco'],
                risco['pontuacao']
            ))
            registro_id = cursor.lastrowid
        
        # ============================================
        # INSERIR NA TABELA risco_cliente (HISTÓRICO)
        # ============================================
        
        print(f"📊 Inserindo na tabela risco_cliente...")
        
        # Verificar se tabela risco_cliente existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='risco_cliente'")
        if not cursor.fetchone():
            print("⚠️ Tabela 'risco_cliente' não existe, criando...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS risco_cliente (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pessoa_id INTEGER NOT NULL,
                    tipo_pessoa TEXT NOT NULL,
                    grau_risco TEXT NOT NULL,
                    pontuacao INTEGER NOT NULL,
                    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            print("✅ Tabela risco_cliente criada")
        
        cursor.execute('''
            INSERT INTO risco_cliente 
            (pessoa_id, tipo_pessoa, grau_risco, pontuacao, data_avaliacao)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            pessoa_id,
            tipo_pessoa,
            risco['grau_risco'],
            risco['pontuacao'],
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ))
        
        risco_id = cursor.lastrowid
        print(f"✅ Risco inserido na tabela risco_cliente (ID: {risco_id})")
        
        # Commit
        conn.commit()
        
        # Verificar inserção
        cursor.execute('SELECT * FROM patologias WHERE id = ?', (registro_id,))
        registro_verificado = cursor.fetchone()
        
        if registro_verificado:
            print(f"✅ Registro salvo com sucesso! ID: {registro_id}")
            print(f"📋 Conteúdo do registro:")
            print(f"   - Tipo: {registro_verificado['tipo_pessoa']}")
            print(f"   - Risco: {registro_verificado['grau_risco']}")
            print(f"   - Pontuação: {registro_verificado['pontuacao_risco']}")
            
            # Decodificar JSON para mostrar
            try:
                pat_json = json.loads(registro_verificado['patologias_json'])
                print(f"   - Total de patologias: {pat_json.get('total_patologias', 0)}")
                print(f"   - Patologias: {', '.join(pat_json.get('patologias', []))}")
            except Exception as e:
                print(f"   - Erro ao ler JSON: {e}")
        else:
            print("⚠️ Registro não encontrado após inserção")
        
        # Verificar inserção na tabela risco_cliente
        cursor.execute('SELECT * FROM risco_cliente WHERE id = ?', (risco_id,))
        risco_verificado = cursor.fetchone()
        if risco_verificado:
            print(f"✅ Risco salvo na tabela risco_cliente")
        
        conn.close()
        alterar_cnt(proposta_id)
        
        return jsonify({
    'success': True,
    'message': 'Entrevista registrada com sucesso',
    'registro_id': registro_id,
    'risco_id': risco_id,
    'total_patologias': len(patologias_detectadas),
    'patologias_detectadas': patologias_detectadas,
    'risco_calculado': risco,
    'redirect': url_for('enfermagem.entrevista_concluida') + \
        f'?nome={data.get("nome", "Não informado")}' + \
        f'&cpf={cpf}' + \
        f'&proposta_id={proposta_id}' + \
        f'&tipo_pessoa={tipo_pessoa}' + \
        f'&registro_id={registro_id}' + \
        f'&risco={risco["grau_risco"]}' + \
        f'&total_patologias={len(patologias_detectadas)}' + \
        f'&timestamp={datetime.now().isoformat()}'
})
        
    except Exception as e:
        import traceback
        print(f"❌ ERRO CRÍTICO: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Erro ao processar entrevista: {str(e)}'
        }), 500

def calcular_risco_por_patologias(patologias, cids):
    """Calcula o risco baseado na lista de patologias"""
    
    pontuacao = 0
    
    for patologia in patologias:
        pat_lower = patologia.lower()
        
        # Sistema de pontuação
        if any(termo in pat_lower for termo in ['câncer', 'leucemia', 'hiv', 'esclerose','aids', 'neoplásica', 'neoplasia','insuficiência renal']):
            pontuacao += 30
        elif any(termo in pat_lower for termo in ['infarto', 'derrame', 'cirrose']):
            pontuacao += 20
        elif any(termo in pat_lower for termo in ['diabetes', 'hipertensão', 'hepatite', 'asma', 'epilepsia']):
            pontuacao += 6
        elif any(termo in pat_lower for termo in ['gastrite', 'rinite', 'sinusite', 'miopia', 'artrite']):
            pontuacao += 3
        else:
            pontuacao += 1
    
    # Ajustar por quantidade
    if len(patologias) > 10:
        pontuacao += 10
    elif len(patologias) > 5:
        pontuacao += 5
    
    # Determinar grau
    if pontuacao >= 30:
        grau = 'Muito Alto'
    elif pontuacao >= 20:
        grau = 'Alto'
    elif pontuacao >= 10:
        grau = 'Médio'
    elif pontuacao > 0:
        grau = 'Baixo'
    else:
        grau = 'Não Avaliado'
    
    return {
        'grau_risco': grau,
        'pontuacao': pontuacao,
        'total_patologias': len(patologias)
    }

@enfermagem_bp.route('/entrevista_concluida')
def entrevista_concluida():
    from datetime import datetime
    
    
    # Pegar dados da URL
    dados = {
        'nome': request.args.get('nome', 'Não informado'),
        'cpf': request.args.get('cpf', ''),
        'proposta_id': request.args.get('proposta_id', ''),
        'tipo_pessoa': request.args.get('tipo_pessoa', 'Beneficiário'),
        'registro_id': request.args.get('registro_id', ''),
        'risco': request.args.get('risco', 'Não calculado'),
        'total_patologias': request.args.get('total_patologias', '0')
    }


    
    # Usar timestamp da URL ou criar novo
    timestamp_str = request.args.get('timestamp')
    if timestamp_str:
        try:
            dt = datetime.fromisoformat(timestamp_str)
            timestamp = dt.strftime('%d/%m/%Y às %H:%M')
        except:
            timestamp = datetime.now().strftime('%d/%m/%Y às %H:%M')
    else:
        timestamp = datetime.now().strftime('%d/%m/%Y às %H:%M')
    
    return render_template(
        'enfermagem/entrevista_concluida.html',
        dados=dados,
        timestamp=timestamp
    )