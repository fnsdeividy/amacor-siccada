from flask import Flask, Blueprint, request, render_template, redirect, send_file, url_for,session, current_app, flash, send_from_directory
import io
import os
import zipfile
import mimetypes
from datetime import datetime
from werkzeug.utils import secure_filename
from PyPDF2 import PdfMerger
#from pdf2image import convert_from_path
from app.utils import (
    acesso,
    hierarquia,
    allowed_document_file,
    get_proposta_zip_path,
    append_file_to_proposta_zip,
    merge_zip_bytes_into_proposta_zip,
    migrate_folder_files_to_proposta_zip,
    list_proposta_zip_members,
    read_proposta_zip_member,
    is_nota_fiscal_filename,
    zip_bytes_contains_nota_fiscal,
    get_proposta_nota_fiscal_attachment,
)
from ..models.database import (
    query_db,
    update_db,
    get_email,
    get_nome,
    get_status,
    atualizar_status_documentos_proposta,
)
import sqlite3
import re
import glob
from ..api_conex.conections import email_gmail, msg_email

cad_bp = Blueprint('cad', __name__)



@cad_bp.route('/')
def home():
    return render_template('cadastro/home.html')

@cad_bp.route('/doc')
@acesso('cadastro')
def doc_home():
    return render_template('cadastro/doc_home.html')

    

@cad_bp.route('/exibir_credenciadas')
def exibir_credenciadas():
    from ..models.database import get_credenciadas
    buscar = request.args.get('buscar')

    credenciadas= get_credenciadas(buscar)
    print(credenciadas)
    return render_template('cadastro/exibir_credenciadas.html', resultado=credenciadas)


@cad_bp.route('cnt-acompanhamento')
@acesso('vendas', 'cadastro', 'administrativo','financeiro')
@hierarquia('supervisor','agente','vendedor')

def acompanhar_cnt():
    from ..models.database import atualiza_atrasos, get_acompanhar_cnt
    buscar = request.args.get('buscar')

    atualiza_atrasos()
    
    conn= sqlite3.connect(current_app.config['DATABASE'])
    cur= conn.cursor()
    resp = request.args.get('resp')
    tipo_usuario = session.get('tipo_usuario')
    area= tipo_usuario
    filtrar= request.args.get('filtrar')
    print (area)
    lista= request.args.get('lista')
    filtro = request.args.get('filtro')
    print(filtro)
    classe_usuario = session.get('classe_usuario')
    venda_inicial = request.args.get('venda_inicial')
    venda_final = request.args.get('venda_final')
    
    

    print(classe_usuario)
    


    print(resp)
    if resp:
        tipo_consulta= 'corretor'
        result= get_acompanhar_cnt(tipo_consulta, resp)        
        return render_template('cadastro/acompanhar_cnt.html', result=result, resp=resp)
        
    elif filtrar:
        cur.execute("SELECT * FROM venda WHERE status = ? ORDER BY data_venda DESC", (filtrar,))
        result = cur.fetchall()
        print(f"result: {result}")
        return render_template('cadastro/acompanhar_cnt.html', result=result, resp=resp, area=tipo_usuario, classe_usuario=classe_usuario)

    elif lista == 'todos':
            print(f'exibiindo para: {lista}')
            if filtro =='sim':
                return render_template('cadastro/definir.html')
            
    elif venda_final and venda_inicial:      
        
        print(f"Venda inicial: {venda_inicial}, Venda final: {venda_final}")
        cur.execute("SELECT * FROM venda WHERE data_venda BETWEEN ? AND ? ORDER BY data_venda DESC", (venda_inicial, venda_final))
        result = cur.fetchall()
        print(f"result: {result}")
        return render_template('cadastro/acompanhar_cnt.html', result=result, resp=resp)
           
    elif buscar: 
        try:
            buscar = int(buscar)
        except ValueError:
            buscar = buscar  # permite buscar strings também
        print(f"buscando por: {buscar}")
        query = f"SELECT * FROM venda WHERE numero_proposta = ? OR numero_contrato = ? OR nome_responsavel LIKE '%{buscar}%' ORDER BY data_venda DESC" 
        result = query_db(query, (buscar,buscar))
        # Converte cada Row em dict para evitar erro de serialização
        if result:
            return render_template('cadastro/acompanhar_cnt.html', result=result, area= tipo_usuario, classe_usuario=classe_usuario)           

    

    elif resp is None:

        if classe_usuario == 'vendedor':
            resp = session.get('user_nome')
            print(f"Responsável: {resp}")
            query = "SELECT * FROM venda WHERE corretor_resp = ? ORDER BY data_venda DESC"
            result = query_db(query, (resp,))
            print(area, tipo_usuario)
            return render_template('cadastro/acompanhar_cnt.html', result=result, resp=resp, area=tipo_usuario, classe_usuario=classe_usuario)
        if tipo_usuario == 'vendas':
            print(f"Tipo de usuário: {tipo_usuario}")
            query = "SELECT * FROM venda WHERE status <>'contrato finalizado' ORDER BY data_venda DESC"
            result = query_db(query)
            print(area, tipo_usuario)
            return render_template('cadastro/acompanhar_cnt.html', result=result, resp=resp, area=tipo_usuario,classe_usuario=classe_usuario)
        elif tipo_usuario == 'cadastro' or tipo_usuario == 'dev':
            print(f"Tipo de usuário: {tipo_usuario}")
            query = "SELECT * FROM venda WHERE status = 'Enviado ao cadastro' OR status = 'Aguardando entrevista' OR status = 'entrevista online enviada' ORDER BY data_venda DESC"
            result = query_db(query)
            if result is None:
               return render_template('cadastro/sem_registro.html ', result=result, resp=resp, area=tipo_usuario,classe_usuario=classe_usuario)
            print(f"area: {area}, tipo_usuario{tipo_usuario}")
            return render_template('cadastro/acompanhar_cnt.html', result=result, resp=resp, area=tipo_usuario,classe_usuario=classe_usuario)
        elif tipo_usuario == 'financeiro':
            print(f"Tipo de usuário: {tipo_usuario}")
            query = "SELECT * FROM venda WHERE status ='enviado para financeiro' OR status = 'Enviado ao cadastro' OR status = 'nota emitida' ORDER BY data_venda DESC"
            result = query_db(query)
            return render_template('cadastro/acompanhar_cnt.html', result=result, resp=resp, area=tipo_usuario,classe_usuario=classe_usuario)
        elif tipo_usuario == 'administrativo':
            print(f"Tipo de usuário: {tipo_usuario}")
            query = "SELECT * FROM venda WHERE status ='entrevista agendada' OR status = 'Aguardando entrevista' OR status = 'analise de declaração'OR status= 'geração de kit' OR status = 'Enviado ao cadastro' OR status ='kit enviado' OR status = 'em pendencia' ORDER BY data_venda DESC"
            result = query_db(query)

            return render_template('cadastro/acompanhar_cnt.html', result=result, area=tipo_usuario,classe_usuario=classe_usuario)
        


    return render_template('cadastro/acompanhar_cnt.html', result=result, resp=resp)

    
        
@cad_bp.route('/detalhes_cnt', methods=['POST', 'GET'])
@acesso('vendas', 'cadastro', 'administrativo','financeiro')
@hierarquia('supervisor', 'agente', 'vendedor')
def detalhes_cnt():
    id = request.args.get('proposta')
    print(f"ID recebido: {id}")
    tipo_usuario= session.get('tipo_usuario')
    print(tipo_usuario)
    
    conn = sqlite3.connect(current_app.config['DATABASE'])
    cur = conn.cursor()

    # Buscar os detalhes da venda
    cur.execute("SELECT * FROM venda WHERE numero_proposta = ?", (id,))
    venda = cur.fetchone()
    
    complemento = venda[20]
    variavel_comp= None
    data_str= venda[2]
    print(complemento)
    try:
        # Converte a string para um objeto datetime
        data_obj = datetime.strptime(data_str, "%Y-%m-%d")

        # Formata o objeto datetime no formato desejado dd/mm/aa
        
    except ValueError:
        print("Data inválida, formato esperado: yyyy-mm-dd")
    

    if complemento is not None:
        if len(complemento) > 8 and len(complemento) < 15:
            complemento = f'{complemento}'
            variavel_comp = "agendado para: "  
        elif len(complemento) > 40:
            complemento = 'Aguardando assinatura'
            variavel_comp = "complemento de fase:"  
        elif len(complemento) > 20 and len(complemento)<40:
            complemento = f'{complemento}'
            variavel_comp = "complemento de fase: "  
    else:
        complemento = 'Sem complemento para esta fase'
        variavel_comp = ''  

    # Buscar os responsáveis relacionados à venda
    cur.execute("SELECT * FROM responsavel WHERE proposta_id = ?", (id,))
    responsaveis = cur.fetchall()

    # Buscar os titulares relacionados à venda
    cur.execute("SELECT * FROM titulares WHERE proposta_id = ?", (id,))
    titulares = cur.fetchall()

    # Buscar os dependentes relacionados à venda
    cur.execute("SELECT * FROM dependentes WHERE proposta_id = ?", (id,))
    dependentes = cur.fetchall()

    cur.close()
    conn.close()

    # Renderizar o template com os dados
    return render_template(
        'cadastro/detalhes_cnt.html',
        venda=venda,
        responsaveis=responsaveis,
        titulares=titulares,
        dependentes=dependentes,
        complemento= complemento,
        variavel_comp=variavel_comp,
        tipo_usuario= tipo_usuario,
        last_resp=tipo_usuario
    )

@cad_bp.route('/alterar_proposta', methods=['POST', 'GET'])
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor','agente','vendedor')
def alterar_proposta():
    proposta= request.args.get('proposta')
    
    
    return render_template('cadastro/alterar_proposta.html', proposta=proposta)
    
@cad_bp.route('/alterar_registro', methods=['POST', 'GET'])

@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor','agente')
def atualizar_cnt():
    contrato = request.args.get('contrato')  # Para GET
    proposta = request.args.get('proposta')
    id = request.args.get('id')
    tipo_usuario = session.get('tipo_usuario')
    last_resp= request.args.get('last_resp')
    status = request.args.get('status')
    classe_usuario=session.get('classe_usuario')

    if status == 'contrato finalizado':
        flash('Contrato já finalizado. Não é possível alterar.', 'error')
        return redirect(url_for('cad.detalhes_cnt', id=id, proposta=proposta, contrato=contrato,tipo_usuario=tipo_usuario))

    print(id, proposta,tipo_usuario)
    
    
    print(f"Contrato: {contrato}, Proposta: {proposta}, ID: {id}")
  
    print(tipo_usuario)
    
    return render_template('cadastro/alterar_cnt.html',id=id,contrato=contrato, proposta=proposta, area=tipo_usuario,last_resp=last_resp, classe_usuario=classe_usuario)
    


@cad_bp.route('/adicionar_cnt', methods=['GET','POST'])
@acesso('cadastro','administrativo')
@hierarquia('supervisor','agente')
def adicionar_cnt():
    proposta = request.args.get('proposta')
    print(proposta)
    
    if request.method == 'POST':
        contrato=request.form.get('contrato')
        email=get_email(proposta)
        print (email)

        conn = sqlite3.connect(current_app.config['DATABASE'])
        cur = conn.cursor()
        cur.execute("UPDATE venda SET status = ? WHERE numero_proposta = ?", (contrato, proposta))
        cur.execute("UPDATE venda SET status = 'enviado para Declaração de Saúde WHERE numero_proposta = ?" ,(proposta))
        conn.commit()
        cur.close()
        conn.close()

    return render_template('cadastro/adicionar_cnt.html',id=id, proposta=proposta)


@cad_bp.route('render_doc_get', methods=['POST', 'GET'])
@acesso('financeiro','vendas', 'cadastro', 'administrativo')
@hierarquia('supervisor','agente','vendedor')

def render_page_doc():
    proposta = request.args.get('proposta')
    print(f"Proposta recebida: {proposta}")
    return render_template('cadastro/adicionar_documento.html', proposta=proposta)

@cad_bp.route('adicionar_doc', methods=['POST', 'GET'])
@acesso('financeiro','vendas', 'cadastro','administrativo')
@hierarquia('supervisor','agente','vendedor')
def adicionar_doc():
    classe_usuario = session.get('classe_usuario')
    tipo_usuario = session.get('tipo_usuario')
    print(f"Tipo de usuário: {classe_usuario}")
    if classe_usuario == 'vendedor':
        resp = session.get('user_nome')

    proposta = request.args.get('proposta')
    print(f"Proposta recebida: {proposta}")

    if request.method == 'POST':
        if 'arquivos' not in request.files:
            flash('Nenhum arquivo selecionado.')
            return redirect(request.url)

        arquivos = request.files.getlist('arquivos')
        base_folder = os.path.join(os.getcwd(), 'static', 'Documento_propostas')
        base_folder = os.path.abspath(base_folder)

        if not proposta:
            flash('Proposta não informada.')
            return redirect(request.url)

        proposta_folder = os.path.join(base_folder, str(proposta))
        os.makedirs(proposta_folder, exist_ok=True)
        zip_path = get_proposta_zip_path(proposta_folder)
        prefixo_documento = 'nf' if tipo_usuario == 'financeiro' else None

        total_salvos = 0
        total_extraidos = 0
        nota_inclusa_detectada = False

        for arquivo in arquivos:
            if not arquivo or not allowed_document_file(arquivo.filename):
                flash('Tipo de arquivo não permitido.')
                return redirect(request.url)

            nome_original = secure_filename(arquivo.filename)
            if not nome_original:
                flash('Nome de arquivo inválido.')
                return redirect(request.url)

            ext = nome_original.rsplit('.', 1)[1].lower()
            conteudo_arquivo = arquivo.read()
            if not conteudo_arquivo:
                flash('Arquivo vazio ou inválido.')
                return redirect(request.url)

            if ext == 'zip':
                try:
                    if prefixo_documento or zip_bytes_contains_nota_fiscal(conteudo_arquivo):
                        nota_inclusa_detectada = True
                    total_extraidos += merge_zip_bytes_into_proposta_zip(
                        conteudo_arquivo,
                        zip_path,
                        prefix=prefixo_documento,
                    )
                except zipfile.BadZipFile:
                    flash(f'Arquivo ZIP inválido: {nome_original}', 'error')
                    return redirect(request.url)
            else:
                if prefixo_documento or is_nota_fiscal_filename(nome_original):
                    nota_inclusa_detectada = True
                nome_gravado = append_file_to_proposta_zip(
                    zip_path,
                    nome_original,
                    conteudo_arquivo,
                    prefix=prefixo_documento,
                )
                if not nome_gravado:
                    flash('Não foi possível processar o nome do arquivo.')
                    return redirect(request.url)
                total_salvos += 1

        if total_salvos == 0 and total_extraidos == 0:
            flash('Nenhum arquivo válido foi processado.', 'warning')
            return redirect(request.url)

        atualizar_status_documentos_proposta(
            proposta,
            nota_inclusa=nota_inclusa_detectada,
        )

        if total_extraidos:
            flash(
                f'Upload concluído! {total_salvos} arquivo(s) salvo(s) e {total_extraidos} arquivo(s) incorporado(s) do ZIP.',
                'success'
            )
        else:
            flash(f'Upload concluído! {total_salvos} arquivo(s) salvo(s).', 'success')

        return redirect(url_for('cad.listar_documentos_contrato', proposta=proposta))

    return redirect(url_for('auth.redir_atent'))


@cad_bp.route('/documentos_contrato/<proposta>/listar')
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente', 'vendedor')
def listar_documentos_contrato(proposta):
    base_folder = os.path.join(os.getcwd(), 'static', 'Documento_propostas')
    base_folder = os.path.abspath(base_folder)
    proposta_folder = os.path.join(base_folder, str(proposta))
    zip_path = get_proposta_zip_path(proposta_folder)

    if not os.path.exists(proposta_folder):
        flash('Nenhum documento encontrado para esta proposta.', 'warning')
        return redirect(url_for('cad.render_page_doc', proposta=proposta))

    if not os.path.exists(zip_path):
        migrate_folder_files_to_proposta_zip(proposta_folder, zip_path)

    arquivos = list_proposta_zip_members(zip_path)

    return render_template('cadastro/listar_documentos.html', proposta=proposta, arquivos=arquivos)


@cad_bp.route('/documentos_contrato/<proposta>/arquivo/<path:nome_arquivo>')
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente', 'vendedor')
def baixar_documento_contrato(proposta, nome_arquivo):
    from flask import abort

    base_folder = os.path.join(os.getcwd(), 'static', 'Documento_propostas')
    base_folder = os.path.abspath(base_folder)
    proposta_folder = os.path.join(base_folder, str(proposta))
    zip_path = get_proposta_zip_path(proposta_folder)

    conteudo = read_proposta_zip_member(zip_path, nome_arquivo)
    if conteudo is None:
        return abort(404, description='Arquivo não encontrado.')

    buffer_arquivo = io.BytesIO(conteudo)
    buffer_arquivo.seek(0)
    return send_file(buffer_arquivo, as_attachment=True, download_name=nome_arquivo)


@cad_bp.route('/documentos_contrato/<proposta>/preview/<path:nome_arquivo>')
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente', 'vendedor')
def preview_documento_contrato(proposta, nome_arquivo):
    from flask import abort

    base_folder = os.path.join(os.getcwd(), 'static', 'Documento_propostas')
    base_folder = os.path.abspath(base_folder)
    proposta_folder = os.path.join(base_folder, str(proposta))
    zip_path = get_proposta_zip_path(proposta_folder)

    conteudo = read_proposta_zip_member(zip_path, nome_arquivo)
    if conteudo is None:
        return abort(404, description='Arquivo não encontrado.')

    mimetype, _ = mimetypes.guess_type(nome_arquivo)
    buffer_arquivo = io.BytesIO(conteudo)
    buffer_arquivo.seek(0)
    return send_file(buffer_arquivo, mimetype=mimetype or 'application/octet-stream', as_attachment=False)


@cad_bp.route('/documentos_contrato/<proposta>/baixar_todos')
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente', 'vendedor')
def baixar_todos_documentos_contrato(proposta):
    from flask import abort

    base_folder = os.path.join(os.getcwd(), 'static', 'Documento_propostas')
    base_folder = os.path.abspath(base_folder)
    proposta_folder = os.path.join(base_folder, str(proposta))
    zip_path = get_proposta_zip_path(proposta_folder)

    if not os.path.exists(proposta_folder):
        return abort(404, description='Pasta da proposta não encontrada.')

    if not os.path.exists(zip_path):
        migrate_folder_files_to_proposta_zip(proposta_folder, zip_path)

    if not os.path.exists(zip_path):
        return abort(404, description='Nenhum arquivo encontrado para esta proposta.')

    return send_file(
        zip_path,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f'documentos_proposta_{proposta}.zip'
    )

@cad_bp.route('gravar_alteracao', methods=['POST'])
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor','agente','vendedor')

def gravar_alteracao():
    from ..verifix import verificar_cnt
    from datetime import datetime
    from ..utils import log_atualiza_status
    info = request.form.get('info') #nome da coluna a ser atualizada       
    print(info)
    hoje= datetime.now().date()
    tipo_usuario = session.get('tipo_usuario')
    proposta = request.args.get('proposta') or request.form.get('numero_proposta')
    complemento = request.form.get('complemento')
    print('proposta:', proposta)
    print(f'compemento:', {complemento})

    email= get_email(proposta)
    print ('email recebido:', email)
    
    status= request.form.get('status') #valor a ser atualizado
    
    if request.method == 'POST':
        
        if info == 'numero_contrato':
            verifica_cnt= verificar_cnt(status)
            print(verifica_cnt)
            if verifica_cnt == status:
                print(f"Situação recebida: {status}")

                conn = sqlite3.connect(current_app.config['DATABASE'])
                cur = conn.cursor()
                cur.execute(f"UPDATE venda SET {info} = ? WHERE numero_proposta = ?", (status, proposta))
                print(proposta)
                cur.execute("UPDATE venda SET last_resp = ? WHERE numero_proposta = ?", (tipo_usuario, proposta))
                cur.execute("UPDATE venda SET complemento_fase = ? WHERE numero_proposta = ?", (complemento, proposta))
                cur.execute("UPDATE venda SET em_atraso = 0 WHERE numero_proposta = ?", ( proposta,))

                conn.commit()
                cur.close()
                conn.close()
                flash('Alteração realizada com sucesso!', 'success')

                print (status, proposta)

                if status not in ('entrevista agendada', 'contrato finalizado'):
                    print('agora em redirecionamento direto sem email')
                    return redirect(url_for('cad.acompanhar_cnt'))
                else:
                    print(status)
                    if email:
                        anexos_email = None
                        nota_fiscal_anexada = False
                        if len(status)<10:
                            status=get_status(proposta)
                            print (status)

                        if status == 'contrato finalizado':
                            base_folder = os.path.abspath(os.path.join(os.getcwd(), 'static', 'Documento_propostas'))
                            proposta_folder = os.path.join(base_folder, str(proposta))
                            nota_fiscal = get_proposta_nota_fiscal_attachment(proposta_folder)
                            if nota_fiscal:
                                anexos_email = [nota_fiscal]
                                nota_fiscal_anexada = True
                            else:
                                flash('Contrato finalizado, mas nenhuma nota fiscal foi encontrada para anexar ao e-mail.', 'warning')

                        print('agora em envio de email')
                        assunto,mensagem,complemento = msg_email(
                            status=status,
                            proposta=proposta,
                            complemento=complemento,
                            nota_fiscal_anexada=nota_fiscal_anexada,
                        )
                        print(f"Enviando e-mail para {email} com assunto '{assunto}'")

                        email_gmail(
                            destinatario=email,
                            assunto=assunto,
                            mensagem=mensagem,
                            complemento=complemento,
                            anexos=anexos_email,
                        )

                        return redirect(url_for('cad.acompanhar_cnt'))
            else:
                flash('Alteração não realizada, verifique o numero do contrato', 'error')
                return redirect(url_for('cad.acompanhar_cnt'))
        else:
            print(f"Situação recebida: {status}")

            conn = sqlite3.connect(current_app.config['DATABASE'])
            cur = conn.cursor()
            cur.execute(f"UPDATE venda SET {info} = ? WHERE numero_proposta = ?", (status, proposta))
            cur.execute("UPDATE venda SET last_resp = ? WHERE numero_proposta = ?", (tipo_usuario, proposta))
            cur.execute("UPDATE venda SET complemento_fase = ? WHERE numero_proposta = ?", (complemento, proposta))
            cur.execute("UPDATE venda SET data_att_fase = ? WHERE numero_proposta= ?",(hoje, proposta))
            cur.execute("UPDATE venda SET em_atraso = 0 WHERE numero_proposta = ?", ( proposta,))
            if status == 'contrato finalizado':
                print("atualizando info de encerramento do contrato para: ", hoje)
                cur.execute("UPDATE venda SET complemento_fase = ? WHERE numero_proposta = ?", (complemento, proposta))
                cur.execute('UPDATE venda SET finalizado_em = ? WHERE numero_proposta= ?',(hoje, proposta))
                cur.execute("UPDATE venda SET em_atraso = 0 WHERE numero_proposta = ?", ( proposta,))
            conn.commit()
            cur.close()
            conn.close()
            flash('Alteração realizada com sucesso!', 'success')
            log_atualiza_status(proposta, status, tipo_usuario)

            print (status, proposta)

            if status not in ('entrevista agendada', 'contrato finalizado'):
                print('agora em redirecionamento direto sem email')
                return redirect(url_for('cad.acompanhar_cnt'))
            else:
                print(status)
                if email:
                    anexos_email = None
                    nota_fiscal_anexada = False
                    if len(status)<10:
                        status=get_status(proposta)
                        print (status)

                    if status == 'contrato finalizado':
                        base_folder = os.path.abspath(os.path.join(os.getcwd(), 'static', 'Documento_propostas'))
                        proposta_folder = os.path.join(base_folder, str(proposta))
                        nota_fiscal = get_proposta_nota_fiscal_attachment(proposta_folder)
                        if nota_fiscal:
                            anexos_email = [nota_fiscal]
                            nota_fiscal_anexada = True
                        else:
                            flash('Contrato finalizado, mas nenhuma nota fiscal foi encontrada para anexar ao e-mail.', 'warning')

                    print('agora em envio de email')
                    assunto,mensagem,complemento = msg_email(
                        status=status,
                        proposta=proposta,
                        complemento=complemento,
                        nota_fiscal_anexada=nota_fiscal_anexada,
                    )
                    print(f"Enviando e-mail para {email} com assunto '{assunto}'")

                    email_gmail(
                        destinatario=email,
                        assunto=assunto,
                        mensagem=mensagem,
                        complemento=complemento,
                        anexos=anexos_email,
                    )

                    return redirect(url_for('cad.acompanhar_cnt'))

    return redirect(url_for('cad.acompanhar_cnt'))


@cad_bp.route('/alterar_infos_prpopsta', methods=['GET'])
@acesso('vendas', 'cadastro', 'administrativo')
@hierarquia('supervisor','agente','vendedor')
def alterar_infos_proposta():
    proposta = request.args.get('proposta')
    print(f"Proposta recebida: {proposta}")
    tp_alt = request.args.get('tp_alt')
    print(tp_alt)
    if not proposta:
        flash('Proposta não informada.','error')
        return redirect(url_for('cad.detalhes_cnt', proposta=proposta))

    if tp_alt =='venda':
        try:
            dados = query_db("SELECT * FROM venda WHERE numero_proposta = ?", (proposta,), one=True)
            return render_template('cadastro/alterar_infos/vendas.html', dados=dados, proposta=proposta)
        except sqlite3.Error as e:
            flash(f'Erro ao consultar a proposta: {e}', 'error')
            return redirect(url_for('cad.detalhes_cnt', proposta=proposta))

    if tp_alt =='respp':
        try:
            dados = query_db("SELECT * FROM responsavel WHERE proposta_id = ?", (proposta,), one=True)
            return render_template('cadastro/alterar_infos/responsavel.html', dados=dados, proposta=proposta)
        except sqlite3.Error as e:
            flash(f'Erro ao consultar a proposta: {e}', 'error')
            return redirect(url_for('cad.detalhes_cnt', proposta=proposta))

    if tp_alt =='titular':
        try:
            dados = query_db("SELECT * FROM titulares WHERE proposta_id = ?", (proposta,), one=True)
            return render_template('cadastro/alterar_infos/titulares.html', dados=dados, proposta=proposta)
        except sqlite3.Error as e:
            flash(f'Erro ao consultar a proposta: {e}', 'error')
            return redirect(url_for('cad.detalhes_cnt', proposta=proposta))

    if tp_alt =='depenn':
        try:
            dados = query_db("SELECT * FROM dependentes WHERE proposta_id = ?", (proposta,), one=True)
            return render_template('cadastro/alterar_infos/dependentes.html', dados=dados, proposta=proposta)
        except sqlite3.Error as e:
            flash(f'Erro ao consultar a proposta: {e}', 'error')
            return redirect(url_for('cad.detalhes_cnt', proposta=proposta))

    if tp_alt =='excluir':
        return render_template('cadastro/alterar_infos/excluir_proposta.html', proposta_id=proposta, tipo_exc= 'excluir')
    if tp_alt == 'cancelar':
        return render_template('cadastro/alterar_infos/excluir_proposta.html', proposta_id=proposta, tipo_exc= 'cancelar')


@cad_bp.route('/excluir_proposta', methods=['GET','POST'])
@acesso('vendas','administrativo')
@hierarquia('supervisor')
def excluir_proposta():
    from ..models.database import get_senha, cancelar_proposta, excluir_proposta
    proposta = request.args.get('proposta')
    from ..cripto import hash_senha
    last_resp= session.get('tipo_usuario')
    tp_alt= request.args.get('tp_alt')
    print(f"Tipo de exclusão: {tp_alt}")
    print(request.args)

    if request.method == 'POST':
        print(request.args)

        print(f"Proposta recebida para exclusão: {proposta}")
        proposta= request.form.get('proposta')
        if not proposta:
            flash('Proposta não informada.','error')
            return redirect(url_for('cad.acompanhar_cnt'))

        motivo= request.form.get('motivo')
        print(f"Proposta recebida: {proposta}")
        senha = request.form.get('senha')
        senha= hash_senha(senha)
        print(f"Senha digitada: {repr(senha)}")

        senha_cancelamento = get_senha()
        print(f"Senha no banco: {repr(senha_cancelamento)}")

        if senha.strip() in [s.strip() for s in senha_cancelamento]:

            print(f"senha correta: {senha_cancelamento}")
            print(f"Tipo de exclusão: {tp_alt}")
            if tp_alt == 'cancelar':
                cancelar_proposta(proposta, last_resp)
                flash('Proposta cancelada com sucesso!', 'success')
                return redirect(url_for('cad.acompanhar_cnt'))
            elif tp_alt == 'excluir':
                excluir_proposta(proposta, motivo)
                flash('Proposta excluída com sucesso!', 'success')

                return redirect(url_for('cad.acompanhar_cnt'))
        else:
            print(f"Senha incorreta: {senha}")
            flash('Senha incorreta. A proposta não foi excluída.', 'error')
            return redirect(url_for('cad.acompanhar_cnt'))

    return render_template('cadastro/alterar_infos/excluir_proposta.html', proposta_id=proposta, tp_alt=tp_alt)

@cad_bp.route('/alterar_infos', methods=['POST'])
@acesso('vendas', 'cadastro', 'administrativo')
@hierarquia('supervisor','agente','vendedor')
def alterar_infos():
    tipo=request.form.get('tipo')
    proposta= request.form.get('numero_proposta')
    print(f"Tipo de alteração: {tipo}, Proposta: {proposta}")
    
    if tipo == 'venda':
        nome_responsavel = request.form.get('nome_responsavel')
        data_venda = request.form.get('data_venda')
        numero_contrato= request.form.get('numero_contrato')
        tipo_contrato = request.form.get('tipo_contrato')
        print(f"Tipo de contrato: {tipo_contrato}")
        tipo_produto = request.form.get('tipo_produto')
        valor_total = request.form.get('valor_venda')
        print(valor_total)
        valor_tabela = request.form.get('valor_tabela')
        print(valor_tabela)
        valor_tabela=valor_tabela.replace(',','.')
        valor_total= valor_total.replace(',','.')
        
        update_db("""
            UPDATE venda SET 
                nome_responsavel = ?,data_venda = ?, tipo_contrato = ?, tipo_produto = ?, 
                valor_venda = ?, valor_tabela = ?, numero_contrato=?
            WHERE numero_proposta = ?
        """, (nome_responsavel, data_venda, tipo_contrato, tipo_produto, valor_total, valor_tabela,numero_contrato, proposta))
        flash('Informações da venda atualizadas com sucesso!', 'success')
        return redirect(url_for('cad.detalhes_cnt', proposta=proposta))
    
    elif tipo == 'respp':
        print(f"Alterando informações do responsável para a proposta: {proposta}")
        nome = request.form.get('nome')
        cpf = request.form.get('cpf')
        print(f"CPF do responsável: {cpf}")
        
        data_nascimento = request.form.get('data_nascimento')
        celular = request.form.get('celular')
        print (celular)
        estado_civil = request.form.get('estado_civil')        
        email = request.form.get('email')
       
        update_db("""
            UPDATE responsavel SET 
                nome = ?, cpf = ?, data_nascimento = ?, 
                celular = ?, email = ?, estado_civil = ? WHERE proposta_id = ?
        """, (nome, cpf, data_nascimento, celular, email,estado_civil, proposta ))
        update_db(""" 
            UPDATE venda SET nome_responsavel = ? WHERE numero_proposta = ?
    """, (nome, proposta))
        flash('Informações da venda atualizadas com sucesso!', 'success')
        return redirect(url_for('cad.detalhes_cnt', proposta=proposta))
    
    elif tipo == 'titular':
        print(f"Alterando informações do responsável para a proposta: {proposta}")
        nome = request.form.get('nome')
        cpf = request.form.get('cpf')
        print(f"CPF do responsável: {cpf}")
        
        data_nascimento = request.form.get('data_nascimento')
        celular = request.form.get('celular')
        print (celular)
        estado_civil = request.form.get('estado_civil')        
        email = request.form.get('email')
        nome_mae= request.form.get('nome_mae')
        idade = request.form.get('idade')
        nome_pai= request.form.get('nome_pai')
        sexo = request.form.get('sexo')
        numero_rg = request.form.get('numero_rg')
        profissao = request.form.get('profissao')
       
        update_db("""
            UPDATE titulares SET 
                nome = ?, cpf = ?, data_nascimento = ?, idade =?, celular = ?, email = ?,
                   estado_civil = ?, nome_mae= ?, nome_pai= ?, sexo=? ,numero_rg=?,
                   profissao=? WHERE proposta_id = ?
        """, (nome, cpf, data_nascimento, idade, celular, email, estado_civil, nome_mae, nome_pai, sexo, numero_rg, profissao,proposta ))
        flash('Informações da venda atualizadas com sucesso!', 'success')
        return redirect(url_for('cad.detalhes_cnt', proposta=proposta))
    elif tipo == 'depenn':
        nome = request.form.get('nome')
        cpf = request.form.get('cpf')
        data_nascimento = request.form.get('data_nascimento')
        grau_parentesco = request.form.get('grau_parentesco')
        cpf_titular = request.form.get('cpf_titular')
        nome_mae = request.form.get('nome_mae')

        update_db("""
            UPDATE dependentes SET 
                nome = ?, cpf = ?, data_nascimento = ?, 
                grau_parentesco = ?, cpf_titular = ?, nome_mae = ?
            WHERE proposta_id = ?
        """, (nome, cpf, data_nascimento, grau_parentesco, cpf_titular, nome_mae, proposta))
        flash('Informações da venda atualizadas com sucesso!', 'success')
        return redirect(url_for('cad.detalhes_cnt', proposta=proposta))
    

@cad_bp.route('/documentos_contrato/<proposta>')
def documento_contrato(proposta):
    return redirect(url_for('cad.listar_documentos_contrato', proposta=proposta))


@cad_bp.route('/form_atualizar_data')
@acesso('vendas', 'cadastro', 'administrativo')
@hierarquia('supervisor','agente')
def form_atualizar_data():
    ultima_atualizacao = None
    log_path = os.path.join(os.getcwd(), 'log_atualizacoa_banco.txt')

    try:
        with open(log_path, 'r', encoding='utf-8') as arquivo_log:
            linhas = [linha.strip() for linha in arquivo_log if linha.strip()]
            if linhas:
                ultima_linha = linhas[-1]
                match_data = re.search(r'\[(\d{4}-\d{2}-\d{2})\s', ultima_linha)
                if match_data:
                    ultima_atualizacao = match_data.group(1)
                else:
                    ultima_atualizacao = 'Data da atualização não identificada.'
    except FileNotFoundError:
        ultima_atualizacao = 'Nenhuma atualização registrada ainda.'
    except Exception:
        ultima_atualizacao = 'Não foi possível ler o histórico de atualização.'

    return render_template('cadastro/atualizar_data.html', ultima_atualizacao=ultima_atualizacao)


@cad_bp.route('/atualizar_data', methods=['GET','POST'])
@acesso('vendas', 'cadastro', 'administrativo')
@hierarquia('supervisor','agente')
def atualizar_data():
    import pandas as pd
    from create import criar_tabela_beneficiarios
    from ..utils import log_atualiza_banco
    if request.method == 'POST':
        csv_banco= request.files['csv_banco']
        if not csv_banco:
            flash('Nenhum arquivo selecionado.')
            return redirect(request.url)
        filename = secure_filename(csv_banco.filename)
        if filename == '':
            flash('Nenhum arquivo selecionado.')
            return redirect(request.url)
        if not filename.lower().endswith('.csv'):
            flash('Tipo de arquivo não permitido. Por favor, envie um arquivo .csv')
            return redirect(request.url)
        
        base_folder = os.path.join(os.getcwd(), 'static','uploads')
        base_folder = os.path.abspath(base_folder)
        data_folder = os.path.join(base_folder, 'data_files')
        os.makedirs(data_folder, exist_ok=True)
        file_path = os.path.join(data_folder, filename)
        csv_banco.save(file_path)
        print(f"Arquivo salvo em: {file_path}")

        if os.path.exists(file_path):
            try:
                criar_tabela_beneficiarios(file_path)
                log_atualiza_banco('Tabela beneficiarios atualizada com sucesso!')
                flash('Tabela beneficiarios atualizada com sucesso!', 'success')
                return redirect(url_for('auth.fechar'))
            except Exception as e:
                print(f"Erro ao atualizar a tabela: {e}")
                flash(f'Erro ao atualizar a tabela: {e}', 'error')
                return redirect(url_for('cad.form_atualizar_data'))
                                
@cad_bp.route('/respostas_entrevista')
@acesso('cadastro','administrativo', 'enfermagem', 'financeiro')
@hierarquia('supervisor', 'agente')
def respostas_entrevista():
    from ..models.database import get_titular_dependente, get_entrevista_info
    import json

    cpf = request.args.get('cpf', '').strip()
    
    if not cpf:
        flash("CPF não informado", 'error')
        # Em vez de redirect(url_for(request.url)), use:
        return redirect(url_for('cadastro.buscar_entrevista'))  # ou a rota apropriada
    
    try:
        # Buscar dados da pessoa
        dados = get_titular_dependente(cpf)
        
        if not dados:
            flash(f"Nenhuma pessoa encontrada com CPF: {cpf}", 'error')
            return redirect(url_for('cadastro.buscar_entrevista'))
        
        # Extrair informações
        pessoa_id = dados.get('id')
        pessoa_cpf = dados.get('cpf')
        tipo_pessoa = dados.get('tipo_pessoa')
        
        if not pessoa_id:
            flash("ID da pessoa não encontrado", 'error')
            return redirect(url_for('cadastro.buscar_entrevista'))
        
        # Buscar informações da entrevista
        entrevista_info = get_entrevista_info(pessoa_id, tipo_pessoa)
        
        if not entrevista_info:
            flash(f"Nenhuma entrevista encontrada para CPF: {cpf}", 'warning')
            return render_template('enfermagem/respostas_entrevista.html', 
                                 dados=dados, 
                                 entrevista_info=None,
                                 patologias_data=None)
        
        # Parsear o JSON de patologias
        patologias_data = None
        if entrevista_info.get('patologias_json'):
            try:
                patologias_data = json.loads(entrevista_info['patologias_json'])
            except json.JSONDecodeError as e:
                flash(f"Erro ao decodificar JSON de patologias: {e}", 'warning')
                patologias_data = {}
            except Exception as e:
                flash(f"Erro ao processar dados: {e}", 'warning')
                patologias_data = {}
        
        # Renderizar template com todos os dados
        return render_template('enfermagem/respostas_entrevista.html', 
                             dados=dados,
                             entrevista_info=entrevista_info,
                             patologias_data=patologias_data)
        
    except Exception as e:
        import traceback
        print(f"❌ ERRO CRÍTICO em respostas_entrevista: {str(e)}")
        print(traceback.format_exc())
        flash(f"Erro ao buscar entrevista: {str(e)}", 'error')
        return redirect(url_for('auth.fechar'))  # Redireciona para dashboard ou página inicial

@cad_bp.route('/alterar_credenciada', methods=['GET', 'POST'])
@acesso('cadastro', 'administrativo')
@hierarquia('supervisor', 'agente')
def alterar_credenciada():
    from ..models.database import (
        get_clinica_info, get_clinica_especialidades, 
        get_todas_especialidades, atualizar_clinica,
        adicionar_especialidade_clinica, remover_especialidade_clinica,
        listar_clinicas
    )
    
    if request.method == 'GET':
        clinica_id = request.args.get('clinica_id')
        
        if not clinica_id:
            clinicas = listar_clinicas()
            return render_template('cadastro/selecionar_clinica.html', clinicas=clinicas)
        
        try:
            clinica = get_clinica_info(clinica_id)
            if not clinica:
                flash('Clínica não encontrada.', 'error')
                return redirect(url_for('cad.alterar_credenciada'))
            
            especialidades_clinica = get_clinica_especialidades(clinica_id)
            especialidades_disponiveis = get_todas_especialidades()
            
            return render_template(
                'cadastro/alterar_credenciada.html',
                clinica=clinica,
                especialidades_clinica=especialidades_clinica,
                especialidades_disponiveis=especialidades_disponiveis
            )
        except Exception as e:
            flash(f'Erro ao buscar clínica: {e}', 'error')
            return redirect(url_for('cad.alterar_credenciada'))
    
    elif request.method == 'POST':
        clinica_id = request.form.get('clinica_id')
        acao = request.form.get('acao')
        
        try:
            if acao == 'atualizar_info':
                dados = {
                    'nome': request.form.get('nome'),
                    'endereco': request.form.get('endereco'),
                    'telefone': request.form.get('telefone'),
                    'horario_funcionamento': request.form.get('horario_funcionamento'),
                    'bloco_id': request.form.get('bloco_id'),
                    'latitude': request.form.get('latitude'),
                    'logitude': request.form.get('logitude'),
                    'status': request.form.get('status'),
                }
                
                atualizar_clinica(clinica_id, dados)
                flash('Informações da clínica atualizadas com sucesso!', 'success')
            
            elif acao == 'adicionar_especialidade':
                especialidades_ids = request.form.getlist('especialidades')
                if not especialidades_ids:
                    flash('Selecione pelo menos uma especialidade.', 'warning')
                else:
                    adicionadas = 0
                    for especialidade_id in especialidades_ids:
                        if adicionar_especialidade_clinica(clinica_id, especialidade_id):
                            adicionadas += 1
                    if adicionadas:
                        flash('Especialidades adicionadas com sucesso!', 'success')
                    else:
                        flash('As especialidades selecionadas já estavam associadas.', 'warning')
            
            elif acao == 'remover_especialidade':
                especialidade_id = request.form.get('especialidade_id')
                remover_especialidade_clinica(clinica_id, especialidade_id)
                flash('Especialidade removida com sucesso!', 'success')
            
            return redirect(url_for('cad.alterar_credenciada', clinica_id=clinica_id))
        
        except Exception as e:
            flash(f'Erro ao processar solicitação: {e}', 'error')
            return redirect(url_for('cad.alterar_credenciada', clinica_id=clinica_id)) 


@cad_bp.route('/adicionar_credenciada', methods=['GET', 'POST'])
@acesso('cadastro', 'administrativo')
@hierarquia('supervisor', 'agente')
def adicionar_credenciada():
    from ..models.database import get_todas_especialidades, adicionar_clinica, get_proximo_bloco_id

    if request.method == 'GET':
        especialidades_disponiveis = get_todas_especialidades()
        proximo_bloco_id = get_proximo_bloco_id()
        return render_template(
            'cadastro/adicionar_credenciada.html',
            especialidades_disponiveis=especialidades_disponiveis,
            proximo_bloco_id=proximo_bloco_id
        )

    def limpar(valor):
        valor = (valor or '').strip()
        return valor if valor else None

    dados = {
        'nome': (request.form.get('nome') or '').strip(),
        'endereco': limpar(request.form.get('endereco')),
        'telefone': limpar(request.form.get('telefone')),
        'horario_funcionamento': limpar(request.form.get('horario_funcionamento')),
        'bloco_id': limpar(request.form.get('bloco_id')),
        'latitude': limpar(request.form.get('latitude')),
        'logitude': limpar(request.form.get('logitude')),
        'status': (request.form.get('status') or 'credenciada').strip(),
    }

    if not dados['nome']:
        flash('Nome da clínica é obrigatório.', 'error')
        return redirect(url_for('cad.adicionar_credenciada'))

    especialidades_ids = request.form.getlist('especialidades')
    novas_especialidades_raw = request.form.get('novas_especialidades', '')
    novas_especialidades = [
        item.strip()
        for item in novas_especialidades_raw.split(',')
        if item.strip()
    ]

    proximo_bloco_id = get_proximo_bloco_id()
    try:
        max_bloco_id = int(proximo_bloco_id) - 1
    except (ValueError, TypeError):
        max_bloco_id = 0

    bloco_id_informado = dados.get('bloco_id')
    if not bloco_id_informado or not bloco_id_informado.isdigit():
        dados['bloco_id'] = proximo_bloco_id
    else:
        if int(bloco_id_informado) <= max_bloco_id:
            dados['bloco_id'] = proximo_bloco_id
            flash(f'Bloco ID ajustado para {proximo_bloco_id}.', 'warning')

    try:
        clinica_id = adicionar_clinica(
            dados,
            especialidades_ids=especialidades_ids,
            especialidades_novas=novas_especialidades
        )
        flash('Clínica cadastrada com sucesso!', 'success')
        return redirect(url_for('cad.alterar_credenciada', clinica_id=clinica_id))
    except Exception as e:
        flash(f'Erro ao cadastrar clínica: {e}', 'error')
        return redirect(url_for('cad.adicionar_credenciada'))

@cad_bp.route('/manutencao_beneficiarios', methods=['GET', 'POST'])
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente')
def render_menu_manutencao_beneficiarios():
    from ..models.database import buscar_beneficiarios

    buscar = (request.form.get('buscar') or request.args.get('buscar') or '').strip()
    resultados = None

    if buscar:
        resultados = buscar_beneficiarios(buscar)
        if not resultados:
            flash('Nenhum beneficiário encontrado.', 'warning')

    return render_template(
        'cadastro/manutencao_beneficiarios.html',
        resultados=resultados,
        buscar=buscar
    )


@cad_bp.route('/beneficiario', methods=['GET'])
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente')
def detalhes_beneficiario():
    from ..models.database import get_beneficiario

    codigo_usr = request.args.get('codigo_usr')
    cpf = request.args.get('cpf')
    contrato = request.args.get('contrato')

    identificador = codigo_usr or cpf or contrato
    if not identificador:
        flash('Informe um beneficiário para visualizar.', 'error')
        return redirect(url_for('cad.render_menu_manutencao_beneficiarios'))

    beneficiario = get_beneficiario(identificador)
    if not beneficiario:
        flash('Beneficiário não encontrado.', 'error')
        return redirect(url_for('cad.render_menu_manutencao_beneficiarios'))

    return render_template('cadastro/beneficiario_detalhes.html', beneficiario=beneficiario)


@cad_bp.route('/beneficiario/atualizar', methods=['POST'])
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente')
def atualizar_beneficiario():
    from ..models.database import update_beneficiario

    codigo_usr = request.form.get('codigo_usr')
    if not codigo_usr:
        flash('Carteirinha não informada.', 'error')
        return redirect(url_for('cad.render_menu_manutencao_beneficiarios'))

    dados = {
        'sNomeUSR': request.form.get('sNomeUSR'),
        'sCpfUSR': request.form.get('sCpfUSR'),
        'sNomeResp': request.form.get('sNomeResp'),
        'sCpfCgcResp': request.form.get('sCpfCgcResp'),
        'Fone_CNT': request.form.get('Fone_CNT'),
        'sTipoUsuario': request.form.get('sTipoUsuario'),
        'dNascimento': request.form.get('dNascimento'),
        'sNumeroCNT': request.form.get('sNumeroCNT')
    }

    atualizado = update_beneficiario(codigo_usr, dados)
    if atualizado:
        flash('Dados do beneficiário atualizados com sucesso.', 'success')
    else:
        flash('Nenhuma alteração realizada.', 'warning')

    return redirect(url_for('cad.detalhes_beneficiario', codigo_usr=codigo_usr))


@cad_bp.route('/beneficiario/suspender', methods=['POST'])
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente')
def suspender_beneficiario():
    from ..models.database import suspender_beneficiario

    codigo_usr = request.form.get('codigo_usr')
    motivo = request.form.get('motivo_suspensao')
    if not codigo_usr:
        flash('Carteirinha não informada.', 'error')
        return redirect(url_for('cad.render_menu_manutencao_beneficiarios'))

    suspender_beneficiario(codigo_usr, motivo)
    flash('Beneficiário suspenso com sucesso.', 'success')
    return redirect(url_for('cad.detalhes_beneficiario', codigo_usr=codigo_usr))


@cad_bp.route('/beneficiario/reativar', methods=['POST'])
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente')
def reativar_beneficiario():
    from ..models.database import reativar_beneficiario

    codigo_usr = request.form.get('codigo_usr')
    if not codigo_usr:
        flash('Carteirinha não informada.', 'error')
        return redirect(url_for('cad.render_menu_manutencao_beneficiarios'))

    reativar_beneficiario(codigo_usr)
    flash('Beneficiário reativado com sucesso.', 'success')
    return redirect(url_for('cad.detalhes_beneficiario', codigo_usr=codigo_usr))


@cad_bp.route('/beneficiario/cancelar', methods=['POST'])
@acesso('vendas', 'cadastro', 'administrativo', 'financeiro')
@hierarquia('supervisor', 'agente')
def cancelar_beneficiario():
    from ..models.database import cancelar_beneficiario

    codigo_usr = request.form.get('codigo_usr')
    motivo = request.form.get('motivo_cancelamento')
    descricao = request.form.get('descricao_cancelamento')
    data_exclusao = request.form.get('data_exclusao') or datetime.now().strftime('%Y-%m-%d')

    if not codigo_usr:
        flash('Carteirinha não informada.', 'error')
        return redirect(url_for('cad.render_menu_manutencao_beneficiarios'))

    cancelar_beneficiario(codigo_usr, motivo, descricao, data_exclusao)
    flash('Beneficiário cancelado com sucesso.', 'success')
    return redirect(url_for('cad.detalhes_beneficiario', codigo_usr=codigo_usr))

@cad_bp.route('d3-beneficiarios', methods= ['GET','POST'])
@acesso ('cadastro', 'cobranca')
def d3_beneficiarios():
    

    if request.method == 'POST':
        data_inicio_str = request.form.get('data_inicio')
        data_final_str = request.form.get('data_final')
        valor_pago_str = request.form.get('valor_pago')
        valor_gasto_str = request.form.get('valor_gasto')

        try:
            data_inicio = datetime.strptime(data_inicio_str, "%Y-%m-%d").date()
            data_final = datetime.strptime(data_final_str, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            flash('Datas inválidas. Use o formato correto.', 'error')
            return redirect(url_for('cad.d3_beneficiarios'))

        try:
            valor_pago = float(valor_pago_str.replace(',', '.'))
            valor_gasto = float(valor_gasto_str.replace(',', '.'))
        except (AttributeError, ValueError):
            flash('Valores inválidos. Informe números válidos.', 'error')
            return redirect(url_for('cad.d3_beneficiarios'))

        if data_final < data_inicio:
            data_inicio, data_final = data_final, data_inicio

        tempo_meses = (data_final.year - data_inicio.year) * 12 + (data_final.month - data_inicio.month)
        if data_final.day < data_inicio.day:
            tempo_meses -= 1
        tempo_meses = max(tempo_meses, 1)

        sinistralidade = valor_gasto / valor_pago if valor_pago else 0
        ticket_medio = valor_pago / tempo_meses if tempo_meses else 0

        print("dados recebidos: ", data_inicio, data_final)

        return render_template('cadastro/resultado_d3.html',
                               sinistralidade=sinistralidade,
                               ticket_medio=ticket_medio,
                               valor_gasto=valor_gasto,
                               valor_pago=valor_pago,
                               tempo=tempo_meses,
                               data_inicio=data_inicio,
                               data_final=data_final)

    return render_template('cadastro/render_d3.html')