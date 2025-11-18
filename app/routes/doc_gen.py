from flask import Flask, Blueprint, render_template, request, session, redirect, url_for, send_file, flash
import requests
import os
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

from app.utils import login_required, acesso


docgen_bp= Blueprint('doc_gen', __name__)

# Caminho base para os documentos
pasta_raiz = os.path.join(os.getcwd(), 'static', 'docx_edit', 'dox_template')
pasta_saida = os.path.join(os.getcwd(), 'static', 'docx_edit', 'saida')
caminho_pdf= os.path.join(os.getcwd(), 'static', 'docx_edit', 'saida_pdf', 'documento_final.pdf')

# Garantir que a pasta de saída exista
os.makedirs(pasta_saida, exist_ok=True)

def limpar_pasta_saida(pasta_saida):
    """Remove todos os arquivos da pasta de saída."""
    for arquivo in os.listdir(pasta_saida):
        caminho_arquivo = os.path.join(pasta_saida, arquivo)
        try:
            if os.path.isfile(caminho_arquivo) or os.path.islink(caminho_arquivo):
                os.unlink(caminho_arquivo)  # Remove o arquivo ou link simbólico
                print(f"Arquivo removido: {caminho_arquivo}")
            elif os.path.isdir(caminho_arquivo):
                os.rmdir(caminho_arquivo)  # Remove diretórios vazios
        except Exception as e:
            print(f"Erro ao remover {caminho_arquivo}: {e}")



def encerrar_processos_word():
    """Encerra processos do Microsoft Word que possam estar abertos."""
    for proc in psutil.process_iter(['name']):
        if proc.info['name'] == 'WINWORD.EXE':
            proc.terminate()
            print("Processo do Word encerrado.")

def substituir_placeholders(doc, placeholders):
    for placeholder, valor in placeholders.items():
        for par in doc.paragraphs:
            for run in par.runs:
                if placeholder in run.text:
                    # Substituir o texto mantendo a formatação original
                    run.text = run.text.replace(placeholder, valor)
        
        # Substituir em tabelas
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for par in cell.paragraphs:
                        for run in par.runs:
                            if placeholder in run.text:
                                run.text = run.text.replace(placeholder, valor)
    return doc

def processar_documentos(lista_documentos,plano_nome):

    print(plano_nome)
    pasta_saida_pdf = os.path.join(os.getcwd(), 'static', 'docx_edit', 'saida_pdf')
    pasta_upload= os.path.join(os.getcwd(), 'static', 'uploads')
    caminhos_grupo1 = []  # Para contrato e modelo de reembolso
    caminhos_grupo2 = []  # Para os demais documentos
    limpar_pasta_saida(pasta_saida)
    limpar_pasta_saida(pasta_saida_pdf)
    encerrar_processos_word()
    limpar_pasta_saida(pasta_upload)

     # Adicionar arquivos padrão ao Grupo 2
    manual_orientacao = os.path.join(pasta_raiz, 'manual_orientacao.pdf')
    if os.path.exists(manual_orientacao):
        caminhos_grupo2.append(manual_orientacao)

    

    for doc_info in lista_documentos:
        caminho_modelo = doc_info['caminho']
        nome_saida = doc_info['saida']
        placeholders = doc_info['placeholders']
        
        # Verificar se o arquivo modelo existe
        if not os.path.exists(caminho_modelo):
            print(f"Arquivo modelo não encontrado: {caminho_modelo}")
            continue
        
        # Abrir o documento modelo
        doc = Document(caminho_modelo)
        
        # Substituir os placeholders
        doc = substituir_placeholders(doc, placeholders)
        

        
        # Salvar o documento alterado
        caminho_saida = os.path.join(pasta_saida, nome_saida)
        doc.save(caminho_saida)
        print(f"Documento salvo em: {caminho_saida}")

        caminho_saida_pdf = os.path.join(os.getcwd(), 'static', 'docx_edit', 'saida_pdf', os.path.basename(caminho_saida).replace('.docx', '.pdf'))
        docx_para_pdf(caminho_saida, caminho_saida_pdf)

        # Adicionar o PDF ao grupo correspondente
        if nome_saida in ['contrato.docx', 'modelo_reembolso.docx']:
            caminhos_grupo1.append(caminho_saida_pdf)
        else:
            caminhos_grupo2.append(caminho_saida_pdf)

    # Adicionar o guia de leitura com base no plano
    guia_leitura = os.path.join(pasta_raiz, f'guia_leitura_{plano_nome}.pdf')
    print (plano_nome)
    if os.path.exists(guia_leitura):
        caminhos_grupo2.append(guia_leitura)
    
    # Juntar os PDFs do Grupo 1
    caminho_saida_grupo1 = os.path.join(pasta_saida_pdf, 'grupo1.pdf')
    juntar_pdf(caminhos_grupo1, caminho_saida_grupo1)

    # Juntar os PDFs do Grupo 2
    caminho_saida_grupo2 = os.path.join(pasta_saida_pdf, 'grupo2.pdf')
    juntar_pdf(caminhos_grupo2, caminho_saida_grupo2)

import os
import subprocess

def docx_para_pdf(caminho_docx, caminho_pdf):
    from ..paths import path_soffice
    try:
        soffice_path = path_soffice()
        print ("localização do soffice",soffice_path)
        comando = [
            soffice_path, '--headless', '--convert-to', 'pdf', '--outdir',
            os.path.dirname(caminho_pdf), caminho_docx
        ]
        subprocess.run(comando, check=True)

        # Verifica se o PDF foi realmente criado
        if os.path.exists(caminho_pdf):
            print(f"✅ Documento convertido para PDF: {caminho_pdf}")
        else:
            print(f"❌ Erro: PDF não foi gerado em {caminho_pdf}")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao converter para PDF (CalledProcessError): {e}")
    except FileNotFoundError:
        print("Erro: LibreOffice não encontrado. Verifique o caminho do 'soffice.exe'")

def juntar_pdf(lista_caminhos, caminho_saida):
    merger= PdfMerger()
    try:
        for caminho in lista_caminhos:
            merger.append(caminho)
        merger.write(caminho_saida)
        print(f"PDFs unidos em: {caminho_saida}")
    except Exception as e:
        print(f"Erro ao unir PDFs: {e}")
    finally:
        merger.close()
        

@docgen_bp.route('render_gerar_kit', methods=['GET','POST'])
def render_gerar_kit():
    numero_contrato= request.args.get('numero_contrato','')
    if numero_contrato:
        return redirect(url_for('doc_gen.gerar_documentos', numero_contrato=numero_contrato))
    if request.method == 'POST':
        numero_contrato= request.form.get('numero_contrato','').strip()
        
        return redirect(url_for('doc_gen.gerar_documentos', numero_contrato=numero_contrato))

    return render_template('geradores/render_gerar_kit.html')

@docgen_bp.route('/gerar_documentos', methods=['GET', 'POST'])
@login_required
@acesso('cadastro','administrativo')
def gerar_documentos():
    from ..models.database import get_info_cnt
    numero_contrato = request.args.get('numero_contrato', '').strip()
    print('numero_contrato:', numero_contrato)
    dados= get_info_cnt(numero_contrato)
    print('dados:', dados)
    if request.method == 'POST':
        plano_nome = request.form.get('plano_nome', '').strip()
        nome_responsavel = request.form.get('nome_responsavel', '').strip()
        data_hoje = datetime.now().strftime('%Y-%m-%d')
        data_contrato = request.form.get('data_venda', '').strip()
        numero_contrato = request.form.get('numero_contrato', '').strip()

        if plano_nome == 'AMACOR EXCLUSIVO I':
            plano_nome = 'Amacor Exclusivo I'
        elif plano_nome == 'Amacor Exclusivo II':
            plano_nome = 'Amacor Exclusivo II'
        elif plano_nome == 'AMACOR EXC II EMP':
            plano_nome = 'Amacor Exclusivo II Empresarial'
        elif plano_nome == 'Amacor Excluiso 1':
            plano_nome = 'Amacor Exclusivo I'
        elif plano_nome == 'Amacor Exclusivo 2':
            plano_nome = 'Amacor Exclusivo II'

        print('request.form:', request.form)
        print('data_contrato:', data_contrato)

        session['nome_responsavel_temp'] = nome_responsavel

        print (request.form)
        # Verificar se todos os campos obrigatórios foram preenchidos
        if not all([plano_nome, nome_responsavel, data_contrato, numero_contrato]):
            return "Erro: Todos os campos são obrigatórios.", 400

        # Só converta as datas depois de validar
        dataformatada = datetime.strptime(data_hoje, '%Y-%m-%d').strftime('%d/%m/%Y')
        data_hoje = dataformatada

        datacnt_formatada = datetime.strptime(data_contrato, '%Y-%m-%d').strftime('%d/%m/%Y')
        data_contrato = datacnt_formatada
        

        # Verificar se todos os campos obrigatórios foram preenchidos
        if not all([plano_nome, nome_responsavel, data_contrato, numero_contrato]):
            return "Erro: Todos os campos são obrigatórios.", 400

        # Lista de documentos a serem processados
        lista_documentos = [
            {
                'caminho': os.path.join(pasta_raiz, f'{plano_nome}.docx'),
                'saida': 'contrato.docx',
                'placeholders': {
                    '{{nome_responsavel}}': nome_responsavel,
                    '{{data_hoje}}': data_hoje,
                    '{{data_contrato}}': data_contrato,
                    '{{numero_contrato}}': numero_contrato,
                }
            },
            {
                'caminho': os.path.join(pasta_raiz, 'modelo_reembolso.docx'),
                'saida': 'modelo_reembolso.docx',
                'placeholders': {
                    '{{nome_responsavel}}': nome_responsavel,
                    '{{data_hoje}}': data_hoje,
                    '{{data_contrato}}': data_contrato,
                    '{{numero_contrato}}': numero_contrato,
                }
            },
            {
                'caminho': os.path.join(pasta_raiz, 'protocolo_entrega.docx'),
                'saida': 'protocolo_entrega.docx',
                'placeholders': {
                    '{{nome_responsavel}}': nome_responsavel,
                    '{{data_hoje}}': data_hoje,
                    '{{data_contrato}}': data_contrato,
                    '{{numero_contrato}}': numero_contrato,
                }
            }
        ]

        # Processar os documentos
        processar_documentos(lista_documentos,plano_nome)

        return redirect(url_for('doc_gen.upload_documento'))

    # Caso o método seja GET, renderizar a página normalmente
    return render_template('geradores/gerar_kit.html', dados=dados)

@docgen_bp.route('/upload_documento', methods=['GET', 'POST'])
@login_required
def upload_documento():
    if request.method == 'POST':
        # Verificar se os arquivos foram enviados
        if 'arquivos' not in request.files:
            return "Erro: Nenhum arquivo enviado.", 400

        arquivos = request.files.getlist('arquivos')  # Obter todos os arquivos enviados

        # Caminhos dos PDFs do Grupo 1 e Grupo 2
        caminho_saida_pdf = os.path.join(os.getcwd(), 'static', 'docx_edit', 'saida_pdf')
        caminho_saida_grupo1 = os.path.join(caminho_saida_pdf, 'grupo1.pdf')
        caminho_saida_grupo2 = os.path.join(caminho_saida_pdf, 'grupo2.pdf')

        # Lista para armazenar os caminhos dos PDFs enviados
        caminhos_upload = []

        for arquivo in arquivos:
            # Verificar se o arquivo tem um nome válido
            if arquivo.filename == '':
                return "Erro: Um dos arquivos não foi selecionado.", 400

            # Salvar o arquivo na pasta 'uploads'
            pasta_uploads = os.path.join(os.getcwd(), 'static', 'uploads')
            os.makedirs(pasta_uploads, exist_ok=True)  # Garantir que a pasta exista
            caminho_arquivo = os.path.join(pasta_uploads, arquivo.filename)
            arquivo.save(caminho_arquivo)
            print(f"Arquivo salvo em: {caminho_arquivo}")

            # Converter o arquivo enviado para PDF (se necessário)
            caminho_arquivo_pdf = os.path.join(
                os.getcwd(), 'static', 'docx_edit', 'saida_pdf', arquivo.filename.replace('.docx', '.pdf')
            )
            if arquivo.filename.endswith('.docx'):
                docx_para_pdf(caminho_arquivo, caminho_arquivo_pdf)
            else:
                caminho_arquivo_pdf = caminho_arquivo  # Se já for PDF, usar diretamente

            # Adicionar o caminho do PDF à lista
            caminhos_upload.append(caminho_arquivo_pdf)
        nome_responsavel = session.get('nome_responsavel_temp', 'responsavel')
        # Criar o PDF final unindo Grupo 1, os uploads e Grupo 2
        caminho_pdf_final = os.path.join(caminho_saida_pdf, f'{nome_responsavel}-kit.pdf')
        juntar_pdf([caminho_saida_grupo1] + caminhos_upload + [caminho_saida_grupo2], caminho_pdf_final)

        print(f"Documento final gerado em: {caminho_pdf_final}")

        # Redirecionar para a página de conclusão
        return render_template('geradores/concluido.html')

    # Caso o método seja GET, renderizar a página de upload
    return render_template('geradores/upload_documento.html')

def converter_doc_para_docx(caminho_doc, pasta_saida):
    from ..paths import path_soffice
    soffice_path = path_soffice()
    
    subprocess.run([
        soffice_path, "--headless", "--convert-to", "docx",
        "--outdir", pasta_saida,  # destino final
        caminho_doc
    ], check=True)

    # Monta caminho final do arquivo convertido
    nome_arquivo = os.path.splitext(os.path.basename(caminho_doc))[0] + ".docx"
    caminho_final = os.path.join(pasta_saida, nome_arquivo)
    print("Arquivo convertido para:", caminho_final)    
    return caminho_final




@docgen_bp.route('/download_documento_final', methods=['GET'])
@login_required
def download_documento_final():
    # Recuperar o nome do responsável da sessão
    nome_responsavel = session.get('nome_responsavel_temp', 'responsavel')

    # Caminho do documento final
    caminho_pdf_final = os.path.join(os.getcwd(), 'static', 'docx_edit', 'saida_pdf', f'{nome_responsavel}-kit.pdf')

    # Verificar se o arquivo existe
    if not os.path.exists(caminho_pdf_final):
        return "Erro: Documento final não encontrado.", 404

    # Enviar o arquivo para download
    return send_file(caminho_pdf_final, as_attachment=True)



def converter_xls_para_csv(caminho_arquivo_excel, pasta_destino):
    """
    Converte um arquivo Excel (.xls ou .xlsx) para CSV.
    """
    try:
        # Ler o arquivo Excel
        df = pd.read_excel(caminho_arquivo_excel)

        # Gerar o caminho do arquivo CSV
        nome_arquivo_csv = os.path.splitext(os.path.basename(caminho_arquivo_excel))[0] + '.csv'
        caminho_arquivo_csv = os.path.join(pasta_destino, nome_arquivo_csv)

        # Salvar como CSV
        df.to_csv(caminho_arquivo_csv, index=False, sep=';', encoding='ISO-8859-1')
        print(f"Arquivo convertido para CSV: {caminho_arquivo_csv}")
        return caminho_arquivo_csv
    except Exception as e:
        print(f"Erro ao converter o arquivo Excel para CSV: {e}")
        return None


@docgen_bp.route("/processar_csv", methods=['POST'])
@login_required
def processar_csv():

    """Processa o arquivo CSV enviado pelo usuário e realiza as transformações necessárias nos números de telefone."""
    # Caminho para upload
    pasta_upload_csv = os.path.join(os.getcwd(), 'static', 'uploads_gen_arch', 'arquivos_originais')
    os.makedirs(pasta_upload_csv, exist_ok=True)  # Garantir que a pasta exista
    limpar_pasta_saida(pasta_upload_csv)

    # Verificar se o arquivo foi enviado
    if 'arquivo_csv' not in request.files or request.files['arquivo_csv'].filename == '':
        print("Erro: Nenhum arquivo enviado.")
        return "Erro: Nenhum arquivo enviado.", 400

    arquivo = request.files['arquivo_csv']
    caminho_arquivo_original = os.path.join(pasta_upload_csv, arquivo.filename)

    try:
        # Salvar o arquivo enviado
        arquivo.save(caminho_arquivo_original)
        print(f"Arquivo salvo em: {caminho_arquivo_original}")

        # Processar o arquivo CSV
        print("Lendo o arquivo CSV...")
        # Forçar a leitura da coluna 'telefone' como string para evitar a conversão em decimal
        df = pd.read_csv(caminho_arquivo_original, sep=';', encoding='ISO-8859-1', dtype={'telefone': str})
        print(f"DataFrame inicial (primeiras 5 linhas):\n{df.head()}")

        # Verificar se a coluna 'telefone' existe
        if 'telefone' not in df.columns:
            print("Erro: A coluna 'telefone' não foi encontrada no arquivo CSV.")
            return "Erro: A coluna 'telefone' não foi encontrada no arquivo CSV.", 400

        # Garantir que a coluna 'telefone' seja tratada como string
        df['telefone'] = df['telefone'].astype(str)

        # Remover todos os caracteres que não sejam números
        df['telefone'] = df['telefone'].str.replace(r'\D', '', regex=True)

        # Função para filtrar números com 8 a 11 dígitos e aplicar as alterações necessárias
        def filtrar_numeros_e_aplicar_prefixo(valor):
            if isinstance(valor, str):
                # Verifica se a string não está vazia ou não contém números
                if not valor.isdigit() or len(valor) == 0:
                    return None
                
                # Se o número tem 8 dígitos, retorna None (para apagar números de 8 dígitos)
                if len(valor) == 8:
                    return None
                
                # Se o número tem 9 dígitos e não começa com '5521', adicionar '5521'
                elif len(valor) == 9 and not valor.startswith('5521'):
                    return '5521' + valor
                
                # Se o número tem 11 dígitos, adicionar '+55'
                elif len(valor) == 11 and not valor.startswith('55'):
                    return '+55' + valor
                
                elif len(valor) > 10 and not valor.startswith('55'):
                    return None
            return None

        # Aplicar a função de filtragem à coluna 'telefone'
        df['telefone'] = df['telefone'].apply(filtrar_numeros_e_aplicar_prefixo)
        
        # Remover as linhas com valores 'None' (números de 8 dígitos ou inválidos)
        df = df.dropna(subset=['telefone'])
        print(f"DataFrame após a filtragem (primeiras 5 linhas):\n{df.head()}")

        # **Novo filtro**: Remover números que começam com '5521' e não têm '9' logo após o prefixo
      

        # Aplicar o filtro adicional à coluna 'telefone'
        
        
        # Remover as linhas com valores 'None' (números que não passam no filtro adicional)
        df = df.dropna(subset=['telefone'])
        print(f"DataFrame após a remoção de números com prefixo '5521' e sem '9' (primeiras 5 linhas):\n{df.head()}")

        # **Adicionar o prefixo 5521 novamente aos números com 9 dígitos**
        

        # Aplicar o filtro para adicionar o prefixo '5521' de volta aos números de 9 dígitos
        
        
        # Verificar se o DataFrame não está vazio antes de salvar
        if not df.empty:
            caminho_filtrado = os.path.join(pasta_upload_csv, 'arquivo_filtrado.csv')
            print(f"Salvando o DataFrame filtrado em: {caminho_filtrado}")
            df.to_csv(caminho_filtrado, index=False)
            print(f"Arquivo filtrado salvo com sucesso em: {caminho_filtrado}")
            return redirect(url_for('doc_gen.confirmar_processamento'))
        else:
            print("Nenhum número de telefone válido encontrado. O DataFrame está vazio.")
            return "Nenhum número de telefone válido encontrado. O DataFrame está vazio.", 400
    except Exception as e:
        print(f"Erro ao processar o arquivo: {e}")
        return f"Erro ao processar o arquivo: {e}", 500

@docgen_bp.route('/dividir_csv', methods=['POST'])  
@login_required
def dividir_csv():
    
    
    import pandas as pd

    
    pasta_upload_csv = os.path.join(os.getcwd(), 'static', 'uploads_gen_arch','arquivos_originais')
    caminho_arquivo_filtrado = os.path.join(pasta_upload_csv, 'arquivo_filtrado.csv')
    pasta_antes = os.path.join(os.getcwd(), 'static', 'uploads_gen_arch')
    pasta_divididos = os.path.join(pasta_antes, 'arquivos_divididos')
    limpar_pasta_saida(pasta_divididos)

    # Verificar se o arquivo filtrado existe
    if not os.path.exists(caminho_arquivo_filtrado):
        return "Erro: Arquivo filtrado não encontrado.", 404

    try:
        # Criar a pasta para os arquivos divididos
        
        
        os.makedirs(pasta_divididos, exist_ok=True)
        limpar_pasta_saida(pasta_divididos)

        # Ler o arquivo filtrado
        df = pd.read_csv(caminho_arquivo_filtrado, encoding='ISO-8859-1', delimiter=',')

        # Número de linhas por arquivo
        linhas_por_arquivo = 80

        # Dividir o DataFrame em partes de 40 linhas
        for i in range(0, len(df), linhas_por_arquivo):
            novo_arquivo = os.path.join(pasta_divididos, f'parte_{i // linhas_por_arquivo + 1}.csv')
            parte_df = df.iloc[i:i + linhas_por_arquivo]
            parte_df.to_csv(novo_arquivo, index=False)
            print(f"Arquivo {novo_arquivo} salvo com {len(parte_df)} linhas.")
    
        # Verificar se os arquivos foram criados
        if not os.listdir(pasta_divididos):
            return "Erro: Nenhum arquivo foi criado na pasta de arquivos divididos.", 500

        return redirect(url_for('doc_gen.baixar_arquivos_divididos'))
    except Exception as e:
        return f"Erro ao dividir o arquivo: {e}"


@docgen_bp.route('/confirmar_processamento', methods=['GET'])
@login_required
def confirmar_processamento():
    return render_template('geradores/confirmar_processamento.html')


@docgen_bp.route('/baixar_arquivos_divididos', methods=['GET'])
@login_required
def baixar_arquivos_divididos():
    # Caminho da pasta onde os arquivos divididos estão
    pasta_upload_csv = os.path.join(os.getcwd(), 'static','uploads_gen_arch')
    pasta_divididos = os.path.join(pasta_upload_csv, 'arquivos_divididos')

    # Verificar se a pasta existe
    if not os.path.exists(pasta_divididos):
        return "Erro: Nenhum arquivo dividido encontrado.", 404

    # Caminho para o arquivo ZIP
    caminho_zip = os.path.join(pasta_upload_csv, 'arquivos_operation','arquivos_divididos.zip')

    # Compactar a pasta em um arquivo ZIP
    try:
        shutil.make_archive(caminho_zip.replace('.zip', ''), 'zip', pasta_divididos)
        print(f"Arquivos compactados em: {caminho_zip}")
    except Exception as e:
        return f"Erro ao compactar os arquivos: {e}"

    # Enviar o arquivo ZIP para download
    return send_file(caminho_zip, as_attachment=True, download_name='faixas_prevencimento.zip')
    
@docgen_bp.route('/processar_csv_form', methods=['GET'])
@login_required
@acesso('cobranca','cadastro')
def processar_csv_form():
    return render_template('geradores/processar_csv.html')

@docgen_bp.route('/confirmar_envio', methods=['GET'])
@login_required
def confirmar_envio():
    return render_template('geradores/confirmar_envio.html')


import os
import csv
import pandas as pd

def gerar_csv(dados):
    relatorio_dir = os.path.join(os.getcwd(), 'static', 'uploads_geren_docgen', 'relatorios', 'vendas')
    os.makedirs(relatorio_dir, exist_ok=True)
    arquivo_csv = os.path.join(relatorio_dir, 'relatorio_vendas.csv')
    
    if dados:
        print("Dados recebidos")
        limpar_pasta_saida(relatorio_dir)

    try:
        total_contratos = len(dados)
        total_vidas = sum(int(item.get('vidas', 0)) for item in dados)
        total_faturado= sum(float(item.get('valor_venda', 0)) for item in dados)

        with open(arquivo_csv, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file, delimiter=';')
            # Primeira linha: Contratos e Vidas
            writer.writerow(['Contratos', 'Vidas', 'Total Faturado'])
            # Segunda linha: totais
            writer.writerow([
                total_contratos,
                total_vidas,
                f"R$ {total_faturado:,.2f}".replace('.', ',')
            ])
            # Linha em branco
            writer.writerow([])
            # Cabeçalho dos dados
            writer.writerow([
                'ID', 'Proposta', 'Número de Contrato', 'Responsável','Corretor', 'Data da venda','Valor da Venda',
                'Taxa de Inscrição', 'ISS','Produto', 'Vidas Cadastradas', 'Valor de Mensalidade','Forma de pagamento', 'Status'
            ])
            # Dados das vendas
            for item in dados:
                valor_venda = item.get('valor_venda', '')
                valor_venda_fmt = f"R$ {float(valor_venda):,.2f}".replace('.', ',') if valor_venda not in ('', None) else ''
                taxa_inscricao = item.get('taxa_inscricao', '')
                taxa_inscricao_fmt = f"R$ {float(taxa_inscricao):,.2f}".replace('.', ',') if taxa_inscricao not in ('', None) else ''
                iss = item.get('iss', '')
                iss_fmt = f"R$ {float(iss):,.2f}".replace('.', ',') if iss not in ('', None) else ''
                valor_tabela = item.get('valor_tabela', '')
                valor_tabela_fmt = f"R$ {float(valor_tabela):,.2f}".replace('.', ',') if valor_tabela not in ('', None) else ''
                writer.writerow([
                    item.get('id', ''),
                    item.get('numero_proposta', ''),
                    item.get('numero_contrato', ''),
                    item.get('nome_responsavel', ''),
                    item.get('corretor_resp',''),
                    item.get('data_venda',''),
                    valor_venda_fmt,
                    taxa_inscricao_fmt,
                    iss_fmt,
                    item.get('tipo_produto',''),
                    item.get('vidas', ''),
                    valor_tabela_fmt,
                    item.get('tipo_pagamento',''),
                    item.get('status')
                ])
        print("Arquivo CSV gerado com sucesso!")
    except PermissionError as e:
        print(f"Erro ao criar arquivo CSV: {e}")
    except Exception as e:
        print(f"Erro inesperado: {e}")

import zipfile
import shutil
from xml.etree import ElementTree as ET


def substituir_placeholders_docx(caminho_template, caminho_saida, placeholders):
    doc = Document(caminho_template)
    
    # Substitui em parágrafos
    for paragraph in doc.paragraphs:
        for run in paragraph.runs:
            for placeholder, valor in placeholders:  # lista de tuplas
                valor_str = "" if valor is None else str(valor)
                if placeholder in run.text:
                    run.text = run.text.replace(placeholder, valor_str)
    
    # Substitui em tabelas
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        for placeholder, valor in placeholders:
                            valor_str = "" if valor is None else str(valor)
                            if placeholder in run.text:
                                run.text = run.text.replace(placeholder, valor_str)

    doc.save(caminho_saida)
    print(f"Documento salvo em: {caminho_saida}")

@docgen_bp.route('/gerar_proposta', methods=['GET', 'POST'])
def gerar_proposta():
    from ..models.database import get_dados_proposta
    pasta_raiz = os.path.join(os.getcwd(), 'static', 'docx_edit', 'dox_template', 'propostas')
    pasta_template = os.path.join(pasta_raiz, 'templates')

    
    tipo_contrato = request.args.get('tipo_contrato')
    print(f"Tipo de contrato: {tipo_contrato}")
    if tipo_contrato == 'inclusao empresarial' or tipo_contrato == 'inclusao individual':
        tipo_contrato = 'inclusao'
    proposta = request.args.get('proposta')
    print(f"Número da proposta: {proposta}")
    dados = get_dados_proposta(proposta)
    vidas= dados.get('venda', {}).get('vidas')
    print(f"Vidas na proposta: {vidas}")

    if vidas <=3:
        caminho_template = os.path.join(pasta_template, f'template_proposta_{tipo_contrato}_pequeno.docx')
        max_vidas= 3
    if vidas >3 and vidas <=6:
        caminho_template = os.path.join(pasta_template, f'template_proposta_{tipo_contrato}_medio.docx')
        max_vidas=5
    if vidas >6:
        caminho_template = os.path.join(pasta_template, f'template_proposta_{tipo_contrato}_grande.docx')
    if vidas>10:
        max_vidas=10
        caminho_template = os.path.join(pasta_template, f'template_proposta_{tipo_contrato}_extra.docx')
        
    pasta_saida = os.path.join(pasta_raiz, 'saida')
    caminho_saida = os.path.join(pasta_saida, f'proposta_{tipo_contrato}_{proposta}.docx')  

    
    limpar_pasta_saida(pasta_saida)
    
    if not tipo_contrato or not proposta:
        flash('Parâmetros inválidos para gerar a proposta.', 'error')    
        return redirect(url_for('vendas.venda_form'))
    
    
    print(f"Dados da proposta: {dados}")
    
    if not dados:
        flash('Nenhum dado encontrado para a proposta informada.', 'error')
        return redirect(url_for('vendas.venda_form'))
    
    def formatar_data(data):
        if data:
            try:
                return datetime.strptime(data, '%Y-%m-%d').strftime('%d/%m/%Y')
            except ValueError:
                return data
        return ''
    
    def formatar_data_flex(data):
        if not data:
            return ''
        for formato in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                return datetime.strptime(data, formato).strftime("%d/%m/%Y")
            except ValueError:
                continue
        return data

    def calcular_idade(data_nascimento):
        from datetime import date
        if not data_nascimento:
            return ''
        for formato in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                nascimento = datetime.strptime(data_nascimento, formato).date()
                hoje = date.today()
                return hoje.year - nascimento.year - ((hoje.month, hoje.day) < (nascimento.month, nascimento.day))
            except ValueError:
                continue
        return ''

    def dia_vencimento(data_venda):
        if data_venda:
            try:
                data = datetime.strptime(data_venda, "%Y-%m-%d")
                if data.day <= 10:
                    return 10
                elif data.day <= 20:
                    return 20
                else:
                    return 30
            except ValueError:
                return ''
        return ''

    
    def extrair_endereco(endereco_completo):
        if not endereco_completo:
            return '', '', ''
        
        partes = [parte.strip() for parte in endereco_completo.split(',')]
        bairro = partes[1] if len(partes) > 1 else ''
        cidade_estado = partes[2].split('-') if len(partes) > 2 else ['', '']
        cidade = cidade_estado[0].strip() if len(cidade_estado) > 0 else ''
        estado = cidade_estado[1].strip() if len(cidade_estado) > 1 else ''
        return bairro, cidade, estado

    endereco_completo_responsavel = dados.get('responsavel', {}).get('complemento_cep', '')
    bairro_responsavel, cidade_responsavel, estado_responsavel = extrair_endereco(endereco_completo_responsavel)
    endereco_completo_titular = dados.get('titular', {}).get('cep', '')
    bairro_titular, cidade_titular, estado_titular = extrair_endereco(endereco_completo_titular)
    iss_value = float(dados.get('venda', {}).get('iss', 0))
    iss_value = float(dados.get('venda', {}).get('iss', 0))
    valor_tabela = float(dados.get('venda', {}).get('valor_tabela', 0))

    valor_mensalidade = valor_tabela + iss_value
    valor_mensalidade_formatado = f"{valor_mensalidade:,.2f}"
    

    placeholders = [
        ('numero_proposta', str(dados.get('venda', {}).get('numero_proposta', ''))),
        ('data_venda', formatar_data(dados.get('venda', {}).get('data_venda', ''))),
        ('vencimento', str(dia_vencimento(dados.get('venda', {}).get('data_venda', '')))),
        ('tipo_contrato', dados.get('venda', {}).get('tipo_contrato', '')),
        ('tipo_produto', dados.get('venda', {}).get('tipo_produto', '')),
        ('corretor_resp', dados.get('venda', {}).get('corretor_resp', '')),
        ('digitador', dados.get('venda', {}).get('digitador', '')),
        ('dt_cadastro', dados.get('venda', {}).get('dt_cadastro', '')),
        ('valor_venda', f"R$ {float(dados.get('venda', {}).get('valor_venda', 0)):,.2f}".replace('.', ',')),
        ('valor_tabela', f"R$ {float(dados.get('venda', {}).get('valor_tabela', 0)):,.2f}".replace('.', ',')),
        ('taxa_inscricao', f"R$ {float(dados.get('venda', {}).get('taxa_inscricao', 0)):,.2f}".replace('.', ',')),
        ('iss_value', f"R$ {float(dados.get('venda', {}).get('iss', 0)):,.2f}".replace('.', ',')),
        ('valor_mensalidade', f"R$ {valor_mensalidade_formatado}"),

        ('titular_name', dados.get('titular', {}).get('nome', '')),
        ('titular_dt_nascimento', formatar_data(dados.get('titular', {}).get('data_nascimento', ''))),
        ('titular_idade', str(dados.get('titular', {}).get('idade', ''))),
        ('titular_parentesco', dados.get('titular', {}).get('gra_parentesco', '')),
        ('titular_sexo', dados.get('titular', {}).get('sexo', '')),
        ('titular_cpf', dados.get('titular', {}).get('cpf', '')),
        ('titular_nome_mae', dados.get('titular', {}).get('nome_mae', '')),
        ('titular_nome_pai', dados.get('titular', {}).get('nome_pai', '')),
        ('@@estado_civil@@', dados.get('titular', {}).get('estado_civil', '')),
        ('titular_endereco', endereco_completo_titular),
        ('titular_bairro', bairro_titular),
        ('titular_cidade', cidade_titular),
        ('titular_estado', estado_titular),
        ('titular_celular', dados.get('titular', {}).get('celular', '')),
        ('titular_email', dados.get('titular', {}).get('email', '')),
        ('titular_grau_parentesco', dados.get('titular',{}).get('grau_parentesco','')),
        ('titular_rg', dados.get('titular',{}).get('numero_rg')),

        ('responsavel_name', dados.get('responsavel', {}).get('nome', '')),
        ('responsavel_cpf', dados.get('responsavel', {}).get('cpf', '')),
        ('responsavel_estado_civil', dados.get('responsavel', {}).get('estado_civil', '')),
        ('responsavel_data_nascimento', formatar_data(dados.get('responsavel', {}).get('data_nascimento', ''))),
        ('responsavel_endereco', endereco_completo_responsavel),
        ('responsavel_bairro', bairro_responsavel),
        ('responsavel_cidade', cidade_responsavel),
        ('responsavel_estado', estado_responsavel),
        ('responsavel_cep', dados.get('responsavel', {}).get('cep', '')),
        ('responsavel_celular', dados.get('responsavel', {}).get('celular', '')),
        ('responsavel_email', dados.get('responsavel', {}).get('email', '')),
        ('responsavel_cnpj', dados.get('responsavel', {}).get('cnpj')),
        ('socio_nome', dados.get('responsavel', {}).get('socio')),
        ('responsavel_rg', dados.get('responsavel', {}).get('rg')),

        ('nome_responsavel', dados.get('venda', {}).get('nome_responsavel', '')),
        ('forma_pagamento', dados.get('venda', {}).get('tipo_pagamento', '')),

    ]
    dependentes = dados.get('dependentes', [])

    for idx in range(1, max_vidas + 1):
        if idx <= len(dependentes):
            dep = dependentes[idx - 1]
            placeholders.extend([
                (f'dependente{idx}_name', dep.get('nome', '')),
                (f'dependente{idx}_nome_mae', dep.get('nome_mae', '')),
                (f'dependente{idx}_cpf', dep.get('cpf', '')),
                (f'dependente{idx}_dt_nascimento', formatar_data(dep.get('data_nascimento', ''))),
                (f'dependente{idx}_idade', str(calcular_idade(dep.get('data_nascimento', '')))),
                (f'dependente{idx}_sexo', dep.get('sexo', '')),
                (f'dependente{idx}_parentesco', dep.get('grau_parentesco', ''))
            ])
        else:
            # Preenche com vazio se não existir
            placeholders.extend([
                (f'dependente{idx}_name', ''),
                (f'dependente{idx}_nome_mae', ''),
                (f'dependente{idx}_cpf', ''),
                (f'dependente{idx}_dt_nascimento', ''),
                (f'dependente{idx}_idade', ''),
                (f'dependente{idx}_sexo', ''),
                (f'dependente{idx}_parentesco', '')
            ])

        print(placeholders)

    

    # Substituir os placeholders no modelo e salvar o novo documento
    try:
        substituir_placeholders_docx(caminho_template, caminho_saida, placeholders)

        doc = Document(caminho_saida)
        
        doc.save(caminho_saida)

        caminho_pdf = caminho_saida.replace('.docx', '.pdf')
        docx_para_pdf(caminho_saida, caminho_pdf)

        filename = os.path.basename(caminho_pdf)
        return redirect(url_for('doc_gen.concluido_proposta', filename=filename))
    except Exception as e:
        print(f"Erro ao gerar proposta: {str(e)}")
        flash('Erro ao gerar a proposta. Verifique os dados e tente novamente.', 'error')
        return redirect(url_for('vendas.venda_form'))


@docgen_bp.route('/download_proposta/<filename>', methods=['GET'])
def download_proposta(filename):
    pasta_saida = os.path.join(os.getcwd(), 'static', 'docx_edit', 'dox_template', 'propostas', 'saida')
    caminho_arquivo = os.path.join(pasta_saida, filename)
    
    # Verifica se o arquivo existe
    if not os.path.exists(caminho_arquivo):
        flash('Arquivo não encontrado.', 'error')
        return redirect(url_for('vendas.venda_form'))

    try:
        # Envia o arquivo PDF para download
        return send_file(
            caminho_arquivo,
            as_attachment=True,
            download_name=f"{filename}"  # Nome personalizado para o usuário
        )
    except Exception as e:
        flash(f'Erro ao enviar arquivo: {str(e)}', 'error')
        return redirect(url_for('vendas.venda_form'))
    
@docgen_bp.route('concluido_proposta')
def concluido_proposta():
    filename = request.args.get('filename', '')
    
    return render_template('geradores/download_proposta.html', filename=filename)




import os
from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn
import re
def limpar_texto(texto):
    """Limpa texto de caracteres estranhos, múltiplos espaços e linhas com 'Acesso:'"""
    # Remove linhas que contenham 'Acesso:'
    texto = re.sub(r'^.*Acesso:.*$', '', texto, flags=re.MULTILINE)
    texto = re.sub(r'<w:tabs>.*?<w:tab.*?/.*?</w:tabs>', ' ', texto)

    # Remove non-breaking spaces e outros espaços Unicode comuns do Word
    texto = texto.replace('\xa0', ' ')  # non-breaking space
    texto = texto.replace('\u2002', ' ')  # en space
    texto = texto.replace('\u2003', ' ')  # em space
    texto = texto.replace('\u2009', ' ')  # thin space
    texto = texto.replace('\u2009', ' ')  # thin space
    texto = texto.replace(r'\t', ' ')  # thin space
    texto = texto.replace(r'\x0b', '')  # thin space
    texto = texto.replace('\f', '')
    # Substitui tabs múltiplas por uma tab
    texto = re.sub(r'\t+', '', texto)

    invisiveis = [
        '\xa0',  # non-breaking space
        '\u2002', '\u2003', '\u2009', '\u202F',  # variações de espaços
        '\u200B', '\u200C', '\u200D',  # zero-width
        '\u00AD',  # soft hyphen
        '\u2028', '\u2029',  # separadores Unicode
        '\x0b', '\f',  # vertical tab e form feed
        '\r', '\n',  # quebra de linha/carriage return
    ]

    # Substitui invisíveis por espaço
    for ch in invisiveis:
        texto = texto.replace(ch, ' ')

    # Substitui múltiplos espaços por um único espaço
    texto = re.sub(r' +', ' ', texto)

    # Remove quebras de linha extras
    texto = re.sub(r'\r?\n\s*\n', '\n', texto)
    texto = re.sub(r'\f', '', texto)


    # Remove espaços no começo e no fim
    return texto.strip()

def extrair_blocos_docx(caminho_docx):
    """Extrai todos os blocos do arquivo .docx no formato !blocoX! ... !/blocoX!"""
    doc = Document(caminho_docx)
    texto_completo = "\n".join([par.text for par in doc.paragraphs])
    padrao = r"!([^!]+)!(.*?)!/\1!"
    blocos = dict(re.findall(padrao, texto_completo, re.DOTALL))
    return {k.strip(): limpar_texto(v) for k, v in blocos.items()}

def limpar_formato_run(run):
    """Força fonte Times New Roman e remove highlight"""
    run.font.name = 'Times New Roman'
    if run._element.rPr is not None:
        rFonts = run._element.rPr.rFonts
        if rFonts is not None:
            rFonts.set(qn('w:ascii'), 'Times New Roman')
            rFonts.set(qn('w:hAnsi'), 'Times New Roman')
        highlight = run._element.rPr.highlight
        if highlight is not None:
            run._element.rPr.remove(highlight)

def substituir_placeholders_paragraph(par, blocos):
    """Substitui placeholders @blocoX@ e {{variavel}} mantendo formatação"""
    i = 0
    while i < len(par.runs):
        run = par.runs[i]
        texto = run.text

        # Substitui blocos
        for nome, conteudo in blocos.items():
            placeholder = f"@{nome}@"
            if placeholder in texto:
                partes = texto.split(placeholder)
                run.text = partes[0]
                limpar_formato_run(run)
                for linha in conteudo.split('\n'):
                    new_run = par.add_run(linha)
                    limpar_formato_run(new_run)
                    par.add_run('\n')
                if len(partes) > 1 and partes[1]:
                    new_run = par.add_run(partes[1])
                    limpar_formato_run(new_run)

        # Substitui placeholders {{variavel}} se existir no dicionário
        for key in blocos.keys():
            ph = f"{{{{{key}}}}}"
            if ph in run.text:
                run.text = run.text.replace(ph, blocos[key])
                limpar_formato_run(run)

        i += 1

def substituir_placeholders_docx2(caminho_template, blocos, caminho_saida):
    """Substitui todos os placeholders do template pelos blocos"""
    doc = Document(caminho_template)
    for par in doc.paragraphs:
        substituir_placeholders_paragraph(par, blocos)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for par in cell.paragraphs:
                    substituir_placeholders_paragraph(par, blocos)
    doc.save(caminho_saida)
    print(caminho_saida)

# --- Rota Flask ---
@docgen_bp.route('/aditivo_CPT', methods=['POST', 'GET'])
def render_cpt():
    if request.method == 'POST':
        if 'arquivo' not in request.files:
            flash('Não encontrado', 'erro')
            return redirect(url_for('auth.fechar'))

        arquivo_upload = request.files.get('arquivo')  # FileStorage
        pasta_raiz = os.path.join(os.getcwd(), 'static', 'kit_format')
        caminho_saida_docx = os.path.join(pasta_raiz, 'resultado_docx')
        pasta_upload = os.path.join(pasta_raiz, 'upload_kit')

        os.makedirs(caminho_saida_docx, exist_ok=True)
        os.makedirs(pasta_upload, exist_ok=True)

        caminho_arquivo = os.path.join(pasta_upload, arquivo_upload.filename)
        print(caminho_arquivo)
        if arquivo_upload.filename == '':
            flash('Sem arquivos', 'error')
            return redirect(url_for('docgen.render_cpt'))

        arquivo_upload.save(caminho_arquivo)

        # Ajusta caminho caso seja .doc antigo
        if arquivo_upload.filename.endswith('.doc'):
            print("tentando converter para docx")
            caminho_arquivo = converter_doc_para_docx(caminho_arquivo, caminho_saida_docx)

        if caminho_arquivo.endswith('.docx'):
            # Extrair blocos do arquivo enviado
            blocos = extrair_blocos_docx(caminho_arquivo)
            print(blocos)

            # Template que vai receber os blocos
            caminho_template = os.path.join(pasta_raiz, 'template_papel_timbrado.docx')

            # Substituir blocos no template e salvar novo arquivo
            caminho_saida = os.path.join(caminho_saida_docx, 'resultado.docx')
            substituir_placeholders_docx2(caminho_template, blocos, caminho_saida)
            
        saida_pdf = os.path.join(
                os.path.join(pasta_raiz, 'resultado_pdf', arquivo_upload.filename.replace('docx','.pdf'))
            )
        docx_para_pdf(caminho_saida, saida_pdf)

        return redirect(url_for('doc_gen.post_download'))
    return render_template('geradores/render_cpt.html')


@docgen_bp.route('download_liberado')
def post_download():
    
    return render_template('geradores/download_liberado.html')

@docgen_bp.route('download_cpt')
def download_cpt():
    tipo_documento= request.args.get('tipo_documento')
    pasta_raiz = os.path.join(os.getcwd(), 'static', 'kit_format')
    if tipo_documento == 'docx':
        pasta_download= os.path.join(pasta_raiz, 'resultado_docx')
    elif tipo_documento == 'pdf':
        pasta_download= os.path.join(pasta_raiz, 'resultado_pdf')
    
    caminho_final= os.path.join(pasta_download,f'resultado.{tipo_documento}')
   
   # Caminho do documento final
    caminho_download = os.path.join(pasta_download)

    # Verificar se o arquivo existe
    if not os.path.exists(pasta_download):
        return "Erro: Documento final não encontrado.", 404

    # Enviar o arquivo para download
    return send_file(caminho_final, as_attachment=True)


@docgen_bp.route('/exportar_dependente', methods= ['GET', 'POST'])
def exportar_dependente_to_sig():
    
    import pandas as pd
    from ..models.database import get_propostas, get_export, get_db_connection

    propostas = get_propostas()
    print("Propostas:", propostas)

    if not propostas:
        flash('Sem propostas disponíveis', 'error')
        return redirect(url_for('auth.fechar'))

    todas_linhas = []

    for proposta in propostas:
        numero_proposta = proposta.get('numero_proposta')
        print("Processando:", numero_proposta)

        # se não tem número de proposta válido, pula
        if not numero_proposta:
            continue

        dados = get_export(numero_proposta)
        if not dados or isinstance(dados, str):  # erro retornado em string
            print(f"Erro na proposta {numero_proposta}: {dados}")
            continue

        venda = dados.get("venda", [{}])
        titulares = dados.get("titulares", [{}])
        dependentes = dados.get("dependentes", [])

        venda = venda[0] if venda else {}
        titular = titulares[0] if titulares else {}

        # se não houver dependentes, gera linha com vazio
        if not dependentes:
            continue

        for dep in dependentes:
            linha = {
                "MatriculaTitular": dep.get("proposta_id"),
                "DataMatricula": venda.get("data_venda"),
                "NomeDependente": dep.get("nome"),
                "DataNasc": dep.get("data_nascimento"),
                "Sexo": dep.get("sexo"),
                "CPF": dep.get("cpf"),
                "PIS": dep.get("pis"),
                "CNS": dep.get("cns"),
                "Identidade": dep.get("identidade"),
                "NomeMae": dep.get("nome_mae"),
                "EstadoCivil": titular.get("estado_civil"),
                "NomeProduto": venda.get("nome_produto"),
                "Obstetricia": "NÃO",
                "RegraVenda": "1",
                "Parentesco": dep.get("grau_parentesco"),
                "DeclaracaoNascVivo": dep.get("declaracao_nasc_vivo"),
                "TipoUsuario": "ADICIONAL",
                "NomeSocial": titular.get("nome_social"),
                "Esfera": titular.get("esfera"),
                "Orgao": titular.get("orgao"),
                "Funcao": titular.get("funcao"),
                "CensoPrevidenciario": titular.get("censo_previdenciario"),
                "DataInicialUniversidade": dep.get("data_inicial_universidade"),
                "DataFinalUniversidade": dep.get("data_final_universidade"),
                "DataValidacaoUniversidade": dep.get("data_validacao_universidade"),
            }
            todas_linhas.append(linha)

    # gera CSV único
    if todas_linhas:
        pasta_raiz = os.path.join(os.getcwd(), 'static','exports')
        os.makedirs(pasta_raiz, exist_ok= True)
        df = pd.DataFrame(todas_linhas)
        caminho_csv = os.path.join(pasta_raiz, "export-dependentes.csv")
        df.to_csv(caminho_csv, index=False, sep=";", encoding="utf-8-sig")
        flash(f"Exportação concluída com {len(df)} registros. Arquivo: {caminho_csv}", "success")
    else:
        flash("Nenhuma linha gerada para exportação.", "warning")

    return redirect(url_for('auth.fechar'))

@docgen_bp.route('/gerar_relatorio_concessionarias')      
def gerar_relatorio_concessionarias(dados, corretora, extend_corretoras):
    import pandas as pd 
    from datetime import datetime, timedelta
    import json
    from ..models.database import query_db_doc


    pasta_raiz = os.path.join(os.getcwd(), 'static','geren_docgen','relatorios', 'concessionarias')
    os.makedirs(pasta_raiz, exist_ok=True)
    arquivo_csv = os.path.join(pasta_raiz, 'relatorio_concessionarias.csv')
    print("iniciando docgen")

    # Normaliza 'dados' para uma lista de registros
    if isinstance(dados, dict):
        if 'resultados_dic' in dados and isinstance(dados['resultados_dic'], list):
            dados_list = dados['resultados_dic']
        elif 'resultados_dict' in dados and isinstance(dados['resultados_dict'], list):
            dados_list = dados['resultados_dict']
        else:
            # pega primeira lista encontrada ou coloca vazio
            dados_list = next((v for v in dados.values() if isinstance(v, list)), [])
        # se corretora não foi passada separadamente, tenta pegar do dict
        if not corretora:
            corretora = dados.get('corretora')
    elif isinstance(dados, list):
        dados_list = dados
    elif isinstance(dados, str):
        try:
            parsed = json.loads(dados)
            if isinstance(parsed, list):
                dados_list = parsed
            elif isinstance(parsed, dict) and 'resultados_dic' in parsed:
                dados_list = parsed['resultados_dic']
            else:
                dados_list = [parsed]
        except Exception:
            dados_list = []
    else:
        dados_list = []

    # Normaliza corretora (pode vir como lista)
    if isinstance(corretora, list):
        corretora_name = corretora[0] if corretora else ''
    else:
        corretora_name = corretora or ''

    print("dados recebidos", {'resultados_dic': dados_list, 'corretora': corretora_name})
    limpar_pasta_saida(pasta_raiz)

    try:
        total_registros = len(dados_list)

        def parse_num(v):
            if v in (None, ''):
                return 0.0
            if isinstance(v, (int, float)):
                return float(v)
            s = str(v).strip()
            # Trata formatos BR (1.234,56) => 1234.56 ou '463,29' => 463.29
            if ',' in s and '.' in s:
                s = s.replace('.', '').replace(',', '.')
            else:
                s = s.replace(',', '.')
            try:
                return float(s)
            except Exception:
                return 0.0

        valor_corretora = sum(parse_num(item.get('valor_venda', 0)) if isinstance(item, dict) else 0.0 for item in dados_list)

        def vencimentos_pagamentos(data_venda: str, parcelas=99):
            from calendar import monthrange
            """
            Gera as próximas datas de vencimento com base na data da venda,
            mas retorna apenas o vencimento do mês vigente (mês atual).

            - Vencimentos ocorrem nos dias 10, 20 ou 30.
            - O primeiro vencimento depende do dia da venda:
                • até dia 10  → dia 10
                • até dia 20  → dia 20
                • até dia 30  → dia 30
                • após dia 30 → dia 10 do mês seguinte
            Retorna uma string com a data de vencimento do mês vigente (formato DD/MM/YYYY),
            ou "" caso não haja vencimento neste mês.
            """
            # Converter a data da venda
            data_base = None
            for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y'):
                try:
                    data_base = datetime.strptime(data_venda, fmt)
                    break
                except ValueError:
                    continue
            if not data_base:
                return ""

            dia_venda = data_base.day
            mes = data_base.month
            ano = data_base.year

            # Determinar o primeiro vencimento
            if dia_venda <= 10:
                dia_venc = 10
            elif dia_venda <= 20:
                dia_venc = 20
            elif dia_venda <= 30:
                dia_venc = 30
            else:
                dia_venc = 10
                mes += 1
                if mes > 12:
                    mes = 1
                    ano += 1

            vencimentos = []

            # Gerar as próximas parcelas
            for i in range(parcelas):
                m = mes + i
                a = ano + (m - 1) // 12
                m = (m - 1) % 12 + 1

                try:
                    venc = datetime(a, m, dia_venc)
                except ValueError:
                    # Caso o mês não tenha o dia (ex: fevereiro 30)
                    ultimo_dia = monthrange(a, m)[1]
                    venc = datetime(a, m, ultimo_dia)

                vencimentos.append(venc)

            # Mês vigente
            hoje = datetime.now()
            mes_atual = hoje.month
            ano_atual = hoje.year

            # Filtrar apenas o vencimento do mês vigente
            for venc in vencimentos:
                if venc.month == mes_atual and venc.year == ano_atual:
                    return venc.strftime('%d/%m/%Y')

            # Caso não exista vencimento neste mês, retorna vazio
            return ""

        def calcular_datas_pagamento(data_venda):
            """
            Retorna um inteiro com a parcela atual (1,2,3,4) calculado pela
            diferença em dias entre hoje e a data_venda.
            """
            if not data_venda:
                return 0
            data_base = None
            for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y'):
                try:
                    data_base = datetime.strptime(data_venda, fmt)
                    break
                except Exception:
                    data_base = None
            if not data_base:
                return 0
            hoje = datetime.now()
            diff_meses = (hoje.year - data_base.year) * 12 + (hoje.month - data_base.month)
            if diff_meses <=1:
                return 1
            elif diff_meses == 2:
                return 2
            elif diff_meses == 3:
                return 3
            elif diff_meses >= 4:
                return diff_meses
        def get_percentual(parcela, corretora_name):
            """
            Retorna o percentual (float) para a parcela da corretora.
            Aceita retorno de query_db_doc como sqlite3.Row, dict, tuple, list ou scalar.
            Normaliza ',' para '.' e divide por 100.
            """
            try:
                if not corretora_name:
                    return 0.0
                if parcela<=3:
                    nome_escaped = corretora_name.replace("'", "''")
                    query = f"SELECT parcela{parcela} FROM corretora_ext WHERE nome_corretora = '{nome_escaped}'"
                    print("SQL get_percentual:", query)
                    percentual_raw = query_db_doc(query, one=True)
                if parcela>3:
                    nome_escaped = corretora_name.replace("'", "''")
                    query = f"SELECT vitalicia FROM corretora_ext WHERE nome_corretora = '{nome_escaped}'"
                    print("SQL get_percentual:", query)
                    percentual_raw = query_db_doc(query, one=True)

                if percentual_raw is None:
                    return 0.0

                # Extrair valor de diferentes tipos de retorno
                if isinstance(percentual_raw, dict):
                    val = next(iter(percentual_raw.values()), None)
                elif hasattr(percentual_raw, 'keys'):  # sqlite3.Row
                    # tenta acessar pela coluna específica, senão pega o primeiro valor
                    try:
                        val = percentual_raw[f"parcela{parcela}"]
                    except Exception:
                        vals = list(percentual_raw)
                        val = vals[0] if vals else None
                elif isinstance(percentual_raw, (list, tuple)):
                    val = percentual_raw[0] if percentual_raw else None
                else:
                    val = percentual_raw

                if val in (None, ''):
                    return 0.0

                # normaliza string para float (trata vírgula decimal)
                return float(str(val).replace(',', '.')) / 100.0

            except Exception as e:
                print("Erro get_percentual:", e)
                return 0.0

        # Preparar dados para o DataFrame
        dados_relatorio = []
        for item in dados_list:
            if not isinstance(item, dict):
                continue
            data_venda = item.get('data_venda') or item.get('dt_cadastro') or ''
            

            valor_venda = parse_num(item.get('valor_venda', 0))
            parcela= calcular_datas_pagamento(data_venda)
            percentual= get_percentual(parcela, corretora_name )
            percentual_bnt = percentual*100
            valor_a_pagar= round(valor_venda*percentual,2)
            

            linha = {
                'nome do responsavel pelo contrato': item.get('sNomeResp') or item.get('nome_responsavel',''),
                'numero da proposta': item.get('numero_proposta',''),
                'nome da corretora': item.get('corretor_resp','') or corretora_name,
                'data de adesão ao plano': data_venda,
                'parcela': parcela,
                'percentual': percentual_bnt,
                'valor à pagar': valor_a_pagar,
                'vencimento da parcela': vencimentos_pagamentos(data_venda),
                'numero contrato': item.get('numero_contrato', ''),
                'valor total venda': f"R$ {valor_venda:.2f}",
                'produto': item.get('tipo_produto', ''),
                'cpf responsavel': item.get('sCpfCgcResp', '') or item.get('sCpfUSR',''),
                'status': item.get('status', '')
            }
            dados_relatorio.append(linha)

        df = pd.DataFrame(dados_relatorio)
        colunas = [
            'nome do responsavel pelo contrato',
            'numero da proposta',
            'nome da corretora', 
            'data de adesão ao plano',
            'parcela',
            'percentual',
            'valor à pagar',
            'vencimento da parcela',
            'numero contrato',
            'valor total venda',
            'produto',
            'cpf responsavel',
            'status'
        ]
        df = df.reindex(columns=colunas)
        df.to_csv(arquivo_csv, index=False, encoding='utf-8-sig')

        print(f"Relatório gerado com sucesso!")
        print(f"Total de registros: {total_registros}")
        print(f"Valor total das vendas: R$ {valor_corretora:.2f}")
        print(f"Arquivo salvo em: {arquivo_csv}")

        return {
            'success': True,
            'arquivo': arquivo_csv,
            'total_registros': total_registros,
            'valor_total': valor_corretora
        }

    except Exception as e:
        print(f"Erro ao gerar relatório: {str(e)}")
        return {'success': False, 'error': str(e)}

@docgen_bp.route('/download_relatorio')
def download_relatorio():
    pasta_raiz = os.path.join(os.getcwd(), 'static', 'geren_docgen','relatorios','concessionarias')
    
    caminho_final= os.path.join(pasta_raiz,'relatorio_concessionarias.csv')
   
   # Caminho do documento final
    

    # Verificar se o arquivo existe
    if not os.path.exists(caminho_final):
        return "Erro: Documento final não encontrado.", 404

    # Enviar o arquivo para download
    return send_file(caminho_final, as_attachment=True)

def gerar_relatorio_pdr_siccada(dados,
    nome_relatorio,
    nome_usuario,
    logo_path,
    output_path):
    
    from openpyxl import Workbook
    from openpyxl.drawing.image import Image
    from openpyxl.styles import Font, Alignment, Border, Side
    from datetime import datetime

    

    wb = Workbook()
    ws = wb.active
    ws.title = "Relatório"

    # ---------- Estilos ----------
    bold = Font(bold=True)
    italic = Font(italic=True)
    underline = Font(bold=True, italic=False)
    align_center = Alignment(horizontal="center", vertical="center")
    thin_border = Border(
        left=Side(style='thin'), right=Side(style='thin'),
        top=Side(style='thin'), bottom=Side(style='thin')
    )

    # ---------- Inserir Logo ----------
    img = Image(logo_path)
    img.height = 40
    img.width = 120
    ws.add_image(img, "A1")

    # ---------- Cabeçalho ----------
    ws["D1"] = "Siccada - DocGen"
    ws["D2"] = "Sistema Continuado de Cadastro"
    ws["V1"] = f"Emitido em: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
    ws["V2"] = f"Emitido por: {nome_usuario}"

    # ---------- Título ----------
    ws.merge_cells("A4:Y4")
    ws["A4"] = nome_relatorio
    ws["A4"].font = Font(bold=True, size=12)
    ws["A4"].alignment = align_center
    ws["A5"] = ""  # linha de espaçamento

    # ---------- Tabela ----------
    linha_inicial = 6
    for i, linha in enumerate(dados, start=linha_inicial):
        for j, valor in enumerate(linha, start=1):
            cel = ws.cell(row=i, column=j, value=valor)
            cel.border = thin_border
            cel.alignment = Alignment(horizontal="center", vertical="center")

    # ---------- Rodapé ----------
    ultima_linha = linha_inicial + len(dados) + 1
    ws.merge_cells(f"A{ultima_linha}:Y{ultima_linha}")
    ws[f"A{ultima_linha}"] = "Documento emitido pelo motor de geração de documentos - DocGen"
    ws[f"A{ultima_linha}"].font = italic
    ws[f"A{ultima_linha}"].alignment = align_center

    # ---------- Ajustes de layout ----------
    for col in range(1, 10):
        ws.column_dimensions[chr(64 + col)].width = 15

    wb.save(output_path)
    print(f"✅ Relatório gerado: {output_path}")