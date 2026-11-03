from flask import Flask, session, Blueprint, render_template, request, jsonify, current_app
from ..utils import acesso
amatiss_bp = Blueprint('amatiss', __name__)

@amatiss_bp.route('/')
@acesso('autorizacao', 'cadastro', 'administrativo')
def home():
    return render_template('amatiss/index.html')


@amatiss_bp.route('/registrar_autorizacao_app')
def registrar_autorizacao_app():
    from ..models.database import registrar_autorizacao_amatiss
    data= request.get_json(silent=True)
    
    
@amatiss_bp.route('/render_aut_cpx')
@acesso('autorizacao', 'administrativo')
def render_aut_cpx():
    from ..models.database import get_autorizacoes_pendentes_cpx
    
    # Obter filtro de status (se houver)
    filtrar = request.args.get('filtrar')
    buscar = request.args.get('buscar')
    
    # Obter informações do usuário logado
    user_id = session.get('user_id')
    tipo_usuario = session.get('tipo_usuario')
    
    if filtrar:
        autorizacoes = get_autorizacoes_pendentes_cpx(
            status_filtro=filtrar, 
            user_id=user_id, 
            tipo_usuario=tipo_usuario
        )
    elif buscar:
        # Buscar por ID, nome ou carteirinha
        autorizacoes = get_autorizacoes_pendentes_cpx(
            user_id=user_id, 
            tipo_usuario=tipo_usuario
        )
        buscar_lower = buscar.lower()
        autorizacoes = [
            aut for aut in autorizacoes 
            if buscar_lower in str(aut.get('id', '')).lower() or
               buscar_lower in aut.get('nome_beneficiario', '').lower() or
               buscar_lower in aut.get('card_beneficiario', '').lower() or
               buscar_lower in aut.get('nome_exame', '').lower()
        ]
    else:
        # Buscar todas as autorizações (filtradas por agente se aplicável)
        autorizacoes = get_autorizacoes_pendentes_cpx(
            user_id=user_id, 
            tipo_usuario=tipo_usuario
        )
    
    return render_template(
        'amatiss/registrar_aut_cpx.html',
        autorizacoes=autorizacoes,
        total_pendentes=len(autorizacoes),
        filtrar=filtrar,
        user_nome=session.get('user_nome'),
        tipo_usuario=tipo_usuario
    )


@amatiss_bp.route('/detalhes_autorizacao/<int:autorizacao_id>')
@acesso('autorizacao', 'administrativo')
def detalhes_autorizacao(autorizacao_id):
    """Retorna os detalhes de uma autorização específica em formato JSON"""
    from ..models.database import get_autorizacao_cpx_by_id
    
    autorizacao = get_autorizacao_cpx_by_id(autorizacao_id)
    
    if autorizacao:
        return jsonify(autorizacao)
    else:
        return jsonify({'error': 'Autorização não encontrada'}), 404


@amatiss_bp.route('/processar_autorizacao', methods=['POST'])
@acesso('autorizacao', 'administrativo')
def processar_autorizacao():
    """Processa aprovação ou recusa de uma autorização"""
    from ..models.database import atualizar_status_autorizacao_cpx
    
    try:
        data = request.get_json()
        autorizacao_id = data.get('id')
        novo_status = data.get('status')
        observacao = data.get('observacao')
        
        # Pegar ID do usuário da sessão, se disponível
        usuario_id = session.get('user_id')
        
        # Validar dados
        if not autorizacao_id or not novo_status:
            return jsonify({
                'success': False,
                'error': 'ID da autorização e status são obrigatórios'
            }), 400
        
        if novo_status not in ['aprovado', 'rejeitado', 'em analise', 'cancelado']:
            return jsonify({
                'success': False,
                'error': 'Status inválido. Use "aprovado", "rejeitado", "em analise" ou "cancelado"'
            }), 400
        
        # Atualizar status
        resultado = atualizar_status_autorizacao_cpx(
            autorizacao_id, 
            novo_status, 
            observacao,
            usuario_id
        )
        
        if resultado['success']:
            return jsonify(resultado)
        else:
            return jsonify(resultado), 400
            
    except Exception as e:
        print(f"Erro ao processar autorização: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro ao processar autorização: {str(e)}'
        }), 500


@amatiss_bp.route('/atribuir_responsavel', methods=['POST'])
@acesso('autorizacao', 'administrativo')
def atribuir_responsavel():
    """Atribui o usuário logado como responsável pela autorização"""
    from ..models.database import atribuir_auditor_responsavel
    
    try:
        data = request.get_json()
        autorizacao_id = data.get('id')
        
        # Pegar nome do usuário da sessão
        usuario_nome = session.get('user_nome')
        
        # Validar dados
        if not autorizacao_id:
            return jsonify({
                'success': False,
                'error': 'ID da autorização é obrigatório'
            }), 400
        
        if not usuario_nome:
            return jsonify({
                'success': False,
                'error': 'Usuário não autenticado'
            }), 401
        
        # Atribuir responsável
        resultado = atribuir_auditor_responsavel(autorizacao_id, usuario_nome)
        
        if resultado['success']:
            return jsonify(resultado)
        else:
            return jsonify(resultado), 400
            
    except Exception as e:
        print(f"Erro ao atribuir responsável: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Erro ao atribuir responsável: {str(e)}'
        }), 500


@amatiss_bp.route('/documento/<path:filename>')
def servir_documento(filename):
    """Serve os documentos de autorização"""
    import os
    from flask import send_from_directory
    
    # Caminho absoluto para a pasta de documentos
    documentos_dir = os.path.join(current_app.root_path, '..', 'static', 'documentos_autorizacao')
    documentos_dir = os.path.abspath(documentos_dir)
    
    print(f"[servir_documento] Servindo arquivo: {filename}")
    print(f"[servir_documento] Diretório: {documentos_dir}")
    print(f"[servir_documento] Caminho completo: {os.path.join(documentos_dir, filename)}")
    print(f"[servir_documento] Arquivo existe? {os.path.exists(os.path.join(documentos_dir, filename))}")
    
    try:
        return send_from_directory(documentos_dir, filename)
    except Exception as e:
        print(f"[servir_documento] Erro ao servir arquivo: {e}")
        return f"Arquivo não encontrado: {filename}", 404


@amatiss_bp.route('/analisar_autorizacao/<int:autorizacao_id>')
@acesso('autorizacao', 'administrativo')
def analisar_autorizacao(autorizacao_id):
    """Tela completa para análise detalhada da autorização"""
    from ..models.database import get_autorizacao_cpx_by_id
    
    autorizacao = get_autorizacao_cpx_by_id(autorizacao_id)
    
    if not autorizacao:
        return "Autorização não encontrada", 404
    
    # Verificar se o usuário é o responsável
    user_nome = session.get('user_nome')
    tipo_usuario = session.get('tipo_usuario')
    
    # Administrativo pode ver tudo, outros só se forem responsáveis
    if tipo_usuario != 'administrativo':
        if autorizacao.get('audit_resp') != user_nome:
            return "Você não tem permissão para analisar esta autorização", 403
    
    return render_template(
        'amatiss/analisar_autorizacao.html',
        autorizacao=autorizacao,
        user_nome=user_nome
    )