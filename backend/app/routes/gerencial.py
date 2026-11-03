from flask import Blueprint, render_template, request, session,redirect,url_for, jsonify, current_app, flash
from ..models.database import query_db
from datetime import datetime
import re
from app import db
import csv
import io
from flask import Response, request
import pandas as pd
import os

from app.utils import login_required, acesso, hierarquia

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

@gerencial_bp.route('dashboard_financad')
@login_required
@acesso('financeiro')
@hierarquia('supervisor')
def dashboard_financeiro_cnt():
    from datetime import datetime, timedelta
    from ..models.database import data_dashboard_adm, data_dashboard_cobranca
    nome_user= session.get('user_nome')
    periodo = request.args.get('periodo', '')
    data_inicial = request.args.get('data_inicial')
    if not periodo and not data_inicial:
        periodo = '30'  # Padrão para 30 dias


    # Definir data de referência
    if data_inicial:
        try:
            data_ref = datetime.strptime(data_inicial, '%Y-%m-%d').date()
        except ValueError:
            flash('Data inválida. Use o formato AAAA-MM-DD.', 'error')
            return redirect(url_for('gerencial.dashboard_administrativo'))
    else:
        try:
            dias = int(periodo)
            data_ref = (datetime.now() - timedelta(days=dias)).date()
        except:
            data_ref = (datetime.now() - timedelta(days=30)).date()
    
    # Processar dados
    dados_dashboard = data_dashboard_adm(
        data_ref.strftime('%Y-%m-%d')
    )
    print("dados do dash:",dados_dashboard)
    
    
    return render_template(
        'generic/gerenciais/financeiro/dashboard_financad.html',
        dados=dados_dashboard,
        nome_user=nome_user
    )

@gerencial_bp.route('dashboard_financeiro')
@login_required
@acesso('financeiro')
@hierarquia('supervisor')
def dashboard_financeiro():
    
    nome_user = session.get('user_nome')
    from datetime import datetime, timedelta
    from ..models.database import data_dashboard_adm, data_dashboard_cobranca
    periodo = request.args.get('periodo', '')
    data_inicial = request.args.get('data_inicial')
    if not periodo and not data_inicial:
        periodo = '30'  # Padrão para 30 dias


    # Definir data de referência
    if data_inicial:
        try:
            data_ref = datetime.strptime(data_inicial, '%Y-%m-%d').date()
        except ValueError:
            flash('Data inválida. Use o formato AAAA-MM-DD.', 'error')
            return redirect(url_for('gerencial.dashboard_administrativo'))
    else:
        try:
            dias = int(periodo)
            data_ref = (datetime.now() - timedelta(days=dias)).date()
        except:
            data_ref = (datetime.now() - timedelta(days=30)).date()
    
    # Processar dados
    dados_dashboard = data_dashboard_cobranca(
        data_ref.strftime('%Y-%m-%d')
    )
    print("dados do dash:",dados_dashboard)
    
    
    return render_template(
        'generic/gerenciais/financeiro/dashboard.html',
        dados=dados_dashboard,
        nome_user=nome_user
    )

@gerencial_bp.route('/dashboard_administrativo')
@login_required
@acesso('cadastro', 'administrativo')
@hierarquia('supervisor')
def dashboard_administrativo():
    from datetime import datetime, timedelta
    from ..models.database import data_dashboard_adm, data_dashboard_cobranca
    periodo = request.args.get('periodo', '')
    nome_user= session.get('user_nome')
    data_inicial = request.args.get('data_inicial')
    if not periodo and not data_inicial:
        periodo = '30'  # Padrão para 30 dias


    # Definir data de referência
    if data_inicial:
        try:
            data_ref = datetime.strptime(data_inicial, '%Y-%m-%d').date()
        except ValueError:
            flash('Data inválida. Use o formato AAAA-MM-DD.', 'error')
            return redirect(url_for('gerencial.dashboard_administrativo'))
    else:
        try:
            dias = int(periodo)
            data_ref = (datetime.now() - timedelta(days=dias)).date()
        except:
            data_ref = (datetime.now() - timedelta(days=30)).date()
    
    # Processar dados
    dados_dashboard = data_dashboard_adm(
        data_ref.strftime('%Y-%m-%d')
    )
    print("dados do dash:",dados_dashboard)
    
    
    return render_template(
        'generic/gerenciais/cadastro/dashboard.html',
        dados=dados_dashboard,
        nome_user=nome_user
    )
@gerencial_bp.route('/dashboard_vendas')
@login_required
@acesso('vendas')
@hierarquia('supervisor')
def dashboard():
    from ..models.database import data_dashboard_vendas
    from datetime import datetime, timedelta
    periodo = request.args.get('periodo', '')
    data_inicial = request.args.get('data_inicial')
    data_final = datetime.now().strftime('%Y-%m-%d')
    nome_user = session.get('user_nome')

    # Lógica para definir data_inicial baseada no período ou data personalizada
    if not periodo and not data_inicial:
        periodo = '30'  # Padrão para 30 dias


    # Definir data de referência
    if data_inicial:
        try:
            data_ref = datetime.strptime(data_inicial, '%Y-%m-%d').date()
        except ValueError:
            flash('Data inválida. Use o formato AAAA-MM-DD.', 'error')
            return redirect(url_for('gerencial.dashboard_administrativo'))
    else:
        try:
            dias = int(periodo)
            data_ref = (datetime.now() - timedelta(days=dias)).date()
        except:
            data_ref = (datetime.now() - timedelta(days=30)).date()
    # Filtros aplicados nas queries para considerar o período
    dados_dashboard = data_dashboard_vendas(
        data_ref.strftime('%Y-%m-%d')
    )

    return render_template(
        'generic/gerenciais/vendas/dashboard.html',
        dados=dados_dashboard,
        nome_user=nome_user
    )

@gerencial_bp.route('/dashboard_cobranca')
def dashboard_cobranca():
    from datetime import datetime, timedelta
    from ..models.database import data_dashboard_adm, data_dashboard_cobranca
    periodo = request.args.get('periodo', '')
    nome_user = session.get('user_nome')
    data_inicial = request.args.get('data_inicial')
    if not periodo and not data_inicial:
        periodo = '30'  # Padrão para 30 dias


    # Definir data de referência
    if data_inicial:
        try:
            data_ref = datetime.strptime(data_inicial, '%Y-%m-%d').date()
        except ValueError:
            flash('Data inválida. Use o formato AAAA-MM-DD.', 'error')
            return redirect(url_for('gerencial.dashboard_administrativo'))
    else:
        try:
            dias = int(periodo)
            data_ref = (datetime.now() - timedelta(days=dias)).date()
        except:
            data_ref = (datetime.now() - timedelta(days=30)).date()
    
    # Processar dados
    dados_dashboard = data_dashboard_cobranca(
        data_ref.strftime('%Y-%m-%d')
    )
    print("dados do dash:",dados_dashboard)
    
    
    return render_template(
        'generic/gerenciais/cobranca/dashboard.html',
        dados=dados_dashboard,
        nome_user= nome_user
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
    from ..models.database import get_data_relatorio, get_data_relatorio_wstatus
    from ..routes.doc_gen import gerar_csv
    data_inicial= request.args.get('venda_inicial')
    data_final= request.args.get('venda_final')
    status= request.args.get('status')

    print(data_inicial, data_final)

    if not status:
        dados= get_data_relatorio(data_inicial, data_final)
    if status:
        dados= get_data_relatorio_wstatus(data_inicial, data_final, status)
    
    if dados == None:
        flash('Sem contratos para as datas especificadas', 'error')
        return redirect(url_for('cad.acompanhar_cnt', lista='todos', filtro='sim'))
        
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

@gerencial_bp.route('/render_relatorio_concessionarias', methods=['GET','POST'])
@hierarquia('supervisor')
@acesso('vendas', 'financeiro')
def render_relatorio_concessionarias():
    from ..models.database import get_corretoras_ext
    from ..utils import verifica_log_att
    nome_log= 'log_atualizacoa_banco.txt'
    corretoras_ext = get_corretoras_ext()
    validade= verifica_log_att(nome_log)
    print("validade do log:",validade)

    if not validade:
        flash('O banco de beneficiários está desatualizado. Favor carregar atualização.', 'warning')
        return render_template('gerencial/errata.html')


    
    if request.method == 'POST':
        data_ref= request.form.get('data_ref')
        concessionaria= request.form.get('corretora')

        if not data_ref:
            data_ref= datetime.now().strftime('%Y-%m-%d')
            return redirect(url_for('gerencial.contratos_corretora', data_ref=data_ref, concessionaria=concessionaria))
        
        if not concessionaria:
            concessionaria= 'Todas'
            return redirect(url_for('gerencial.contratos_corretora', data_ref=data_ref, concessionaria=concessionaria))
        
        return redirect(url_for('gerencial.contratos_corretora', data_ref=data_ref, concessionaria=concessionaria))
        
    return render_template('gerencial/render_relatorio_concessionarias.html', corretora_ext=corretoras_ext)



@gerencial_bp.route('/contratos_concessionarias')
@hierarquia('supervisor')
@acesso('vendas', 'financeiro')
def contratos_corretora():
    from ..models.database import get_corretoras_cnt, get_corretoras_ext, get_extend_corretoras_ext
    from datetime import datetime, timedelta
    from .doc_gen import gerar_relatorio_concessionarias
    ##para fazer relatorio de pagamento das concessionarias
    corretora= request.args.get('concessionaria')
    data_ref= request.args.get('data_ref')
    data_ref= datetime.strptime(data_ref, '%Y-%m-%d')

    dias = int(90)
    
    data_entrada = (data_ref - timedelta(days=dias)).date()

    corretoras_vendas= get_corretoras_cnt(corretora, data_ref,data_entrada)
    
    corretora_infos = get_extend_corretoras_ext(corretora)

    # Se a função retornou lista, normaliza para um dict (pega primeiro registro)
    if isinstance(corretora_infos, list):
        corretora_infos = corretora_infos[0] if corretora_infos else {}

    # usar .get corretamente e fornecer valor padrão
    dados = corretora_infos.get('parcela1', '')
    

    

    # garantir que extend_corretoras esteja definido ao chamar o gerador
    extend_corretoras = corretora_infos
    csv_corretoras_vendas = gerar_relatorio_concessionarias(corretoras_vendas, corretora,extend_corretoras)
    
    

    return render_template('gerencial/download_relatorio.html')

    pass

