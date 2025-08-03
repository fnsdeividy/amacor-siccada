from flask import Blueprint, render_template, request, session,redirect,url_for, jsonify, current_app, flash
from ..models.database import query_db
from datetime import datetime
import re
import sqlite3
import csv
import io
from flask import Response, request
import pandas as pd
import os

from app.utils import login_required, acesso

gerencial_bp = Blueprint('gerencial', __name__)


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



@gerencial_bp.route('/dashboard')
def dashboard():
    periodo = request.args.get('periodo', '')
    data_inicial = request.args.get('data_inicial')
    data_final = datetime.now().strftime('%Y-%m-%d')

    # Lógica para definir data_inicial baseada no período ou data personalizada
    if periodo:
        try:
            dias = int(periodo)
            data_inicial = (datetime.now() - pd.Timedelta(days=dias)).strftime('%Y-%m-%d')
        except Exception:
            data_inicial = (datetime.now() - pd.Timedelta(days=30)).strftime('%Y-%m-%d')
    elif data_inicial:
        try:
            datetime.strptime(data_inicial, '%Y-%m-%d')
        except ValueError:
            flash('Data inválida. Use o formato AAAA-MM-DD.', 'error')
            return redirect(url_for('gerencial.dashboard'))
    else:
        data_inicial = (datetime.now() - pd.Timedelta(days=30)).strftime('%Y-%m-%d')

    # Filtros aplicados nas queries para considerar o período
    dados_tipo_plano = query_db("""
        SELECT tipo_produto, COUNT(*) FROM venda
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY tipo_produto
    """, [data_inicial, data_final])
    labels_tipo_plano = [row[0] for row in dados_tipo_plano]
    valores_tipo_plano = [row[1] for row in dados_tipo_plano]

    dados_corretor = query_db("""
        SELECT corretor_resp, COUNT(*) FROM venda
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY corretor_resp
    """, [data_inicial, data_final])
    labels_corretor = [row[0] for row in dados_corretor]
    valores_corretor = [row[1] for row in dados_corretor]

    dados_evolucao = query_db("""
        SELECT strftime('%Y-%m', data_venda), SUM(valor_venda) FROM venda
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY 1 ORDER BY 1
    """, [data_inicial, data_final])
    labels_evolucao = [row[0] for row in dados_evolucao]
    valores_evolucao = [row[1] for row in dados_evolucao]

    ultimas_vendas = query_db("""
        SELECT * FROM venda
        WHERE data_venda BETWEEN ? AND ?
        ORDER BY data_venda DESC LIMIT 10
    """, [data_inicial, data_final])

    return render_template(
        'generic/gerenciais/vendas/dashboard.html',
        labels_tipo_plano=labels_tipo_plano,
        valores_tipo_plano=valores_tipo_plano,
        labels_corretor=labels_corretor,
        valores_corretor=valores_corretor,
        labels_evolucao=labels_evolucao,
        valores_evolucao=valores_evolucao,
        ultimas_vendas=ultimas_vendas,
        data_inicial=data_inicial,
        data_final=data_final,
        periodo=periodo
    )


@gerencial_bp.route('/upload_csv', methods=['GET', 'POST'])
def upload_csv():
    pasta_upload_csv = os.path.join(os.getcwd(), 'static', 'uploads_geren_docgen', 'arquivos_originais')
    limpar_pasta_saida(pasta_upload_csv)
    os.makedirs(pasta_upload_csv, exist_ok=True)  

    arquivo = request.files.get('arquivo_csv')

    if not arquivo or arquivo.filename == '':
        return "Erro: Nenhum arquivo enviado.", 400

    nome_arquivo_fixo = 'arquivo.csv'
    caminho_arquivo_original = os.path.join(pasta_upload_csv, nome_arquivo_fixo)

    try:
        arquivo.save(caminho_arquivo_original)
        pd.read_csv(caminho_arquivo_original)  # Teste de leitura
    except Exception as e:
        return f"Erro ao processar o arquivo: {e}", 500

    return redirect(url_for('gerencial.confirmar_processamento'))

@gerencial_bp.route('/upload_form', methods=['GET'])
@login_required
@acesso('cobranca','cadastro')
def processar_csv_form():
    return render_template('geradores/upload_gerencial.html')

@gerencial_bp.route('/gerar_relatorio', methods=['GET', 'POST'])
def relatorio():
    arquivo_original = os.path.join(os.getcwd(), 'static', 'uploads_geren_docgen', 'arquivos_originais', 'arquivo.csv')
    relatorio_dir = os.path.join(os.getcwd(), 'static', 'uploads_geren_docgen', 'relatorios')
    os.makedirs(relatorio_dir, exist_ok=True)

    try:
        limpar_pasta_saida(relatorio_dir)
        caminho_leads, caminho_corretor = gerar_relatorio_custom(arquivo_original, relatorio_dir)

        nome_arquivo_leads = os.path.basename(caminho_leads)
        nome_arquivo_corretor = os.path.basename(caminho_corretor)

        return render_template(
            'geradores/relatorio_gerado.html',
            arquivo_leads=nome_arquivo_leads,
            arquivo_corretor=nome_arquivo_corretor
        )
    except Exception as e:
        return f"Erro: {e}", 500

def gerar_relatorio_custom(caminho_csv, pasta_saida):
    df = pd.read_csv(caminho_csv)

    def extrair_gi(tags):
        if pd.isna(tags): return None
        match = re.search(r'GI:(\d+)', tags)
        return int(match.group(1)) if match else None

    def contem_nr(tags):
        if pd.isna(tags): return False
        return 'NR' in tags.upper()

    df['GI'] = df['Tags'].apply(extrair_gi)
    df['NR'] = df['Tags'].apply(contem_nr)

    def classificar_lead(row):
        if row['NR']:
            return 'NR'
        elif pd.notna(row['GI']) and row['GI'] >= 7:
            return 'Lead Quente'
        else:
            return 'Lead Frio'

    df['Classificação'] = df.apply(classificar_lead, axis=1)
    df['Venda Realizada'] = pd.to_numeric(df['Lead venda R$'], errors='coerce').fillna(0) > 0

    classificacao_ciclo = df['Classificação'].value_counts().reindex(['Lead Quente', 'Lead Frio', 'NR'], fill_value=0)

    corretor = df.groupby('Usuário responsável').agg(
        Leads=('ID', 'count'),
        Vendas=('Venda Realizada', 'sum')
    ).reset_index()

    corretor['Taxa de Conversão (%)'] = ((corretor['Vendas'] / corretor['Leads']) * 100).round(1)

    data_hoje = datetime.now().strftime('%d-%m-%Y')
    caminho_saida_leads = os.path.join(pasta_saida, f'leads_qualificados_{data_hoje}.csv')
    caminho_saida_corretor = os.path.join(pasta_saida, f'resumo_corretor_{data_hoje}.csv')

    classificacao_ciclo.to_csv(caminho_saida_leads, header=['Quantidade'])
    corretor.to_csv(caminho_saida_corretor, index=False)

    return caminho_saida_leads, caminho_saida_corretor

@gerencial_bp.route('/confirmar_processamento_gerencial.html', methods=['GET'])
def confirmar_processamento():
    return render_template('geradores/confirmar_processamento_geren.html')



@gerencial_bp.route('relatorio_vendas')
def relatorio_vendas():
    from ..models.database import get_data_relatorio
    from ..routes.doc_gen import gerar_csv
    data_inicial= request.args.get('venda_inicial')
    data_final= request.args.get('venda_final')

    print(data_inicial, data_final)

    dados= get_data_relatorio(data_inicial, data_final)
        
    dados=list(dados)
    print (dados)

    documento_csv= gerar_csv(dados)



    return render_template('gerencial/relatorio.html', dados=dados)

@gerencial_bp.route('/download')
def download_relatorio():
    from flask import send_file
    # Caminho para o arquivo CSV gerado
    relatorio_dir = os.path.join(os.getcwd(), 'static', 'uploads_geren_docgen', 'relatorios', 'vendas')
    arquivo_csv = os.path.join(relatorio_dir, 'relatorio_vendas.csv')
    
    # Verificar se o arquivo existe
    if os.path.exists(arquivo_csv):
        return send_file(arquivo_csv, as_attachment=True, download_name="relatorio_vendas.csv", mimetype='text/csv')
    else:
        return "Arquivo não encontrado", 404
