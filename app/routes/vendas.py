from flask import Blueprint, render_template, request, session,redirect,url_for, flash
from ..models.database import query_db, salvar_venda, get_email, get_nome, get_status, listar_vendedor, get_corretoras_ext, listar_planos
import re
from app.utils import login_required, acesso, hierarquia
from datetime import datetime
import sqlite3
from ..api_conex.conections import email_gmail, msg_email
from flask import current_app


vendas_bp = Blueprint('vendas', __name__)


def formatar_cpf(cpf):
    cpf= re.sub(r'\D','',cpf)
    if len(cpf) != 11:
        return None
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"



@vendas_bp.route('/cpf',methods=['GET','POST'])
@login_required

def cpf():
    if request.method == "POST":
        cpf_input = request.form["cpf"]
        tipo=request.form["tipo"]
        # Consulta ao banco por CPF
        cpf= formatar_cpf(cpf_input)
        if not cpf:
            return render_template("vendas/verify.hTml", error="CPF invalido.")
        
        if tipo == "beneficiario":
            coluna = "sCpfUSR"
            tabela = "beneficiarios"
        elif tipo == "responsavel":
            coluna = "sCpfCgcResp"
            tabela = "beneficiarios"
        else:
            return render_template("vendas/verify.html", error="Tipo de busca inválido.")

        
        
        query = f"SELECT * FROM {tabela} WHERE {coluna} = ?"
        result = query_db(query, [cpf], one=False)

        

        return render_template('vendas/lista_cpf.html', result=result)

    return render_template("vendas/verify.html")



@vendas_bp.route('/lista_cpf')
def lista_retorno():    
   
    result = request.args.get('result')
    result('vendas/lista_cpf.html', result=result)

@vendas_bp.route('/informar_cnt', methods= ['GET', 'POST'])
@login_required
@acesso('vendas','cadastro','administrativo')
@hierarquia('supervisor','agente','vendedor')
def informar_cnt():
    
    vendedor = listar_vendedor()

   
    print("Vendedores:", vendedor)
    return render_template('vendas/adicionar_contrato.html', vendedor=vendedor)

@vendas_bp.route('/nova_venda_pj')
@acesso('vendas','cadastro','administrativo')
@hierarquia('supervisor','agente','vendedor')
def nova_venda_pj():
    planos= listar_planos()
    vendedor = listar_vendedor()
    print("Vendedores:", vendedor)  # Para verificar a lista de vendedores

    return render_template('vendas/vendas_form_pj.html', vendedor=vendedor, planos=planos)


@vendas_bp.route('/nova_venda')
@acesso('vendas','cadastro','administrativo')
@hierarquia('supervisor','agente','vendedor')
def nova_venda():
    planos= listar_planos()
    vendedor = listar_vendedor()
    corretoras= get_corretoras_ext()
    print('corretora exibida no vendas:',corretoras)
    print("Vendedores:", vendedor)  # Para verificar a lista de vendedores

    return render_template('vendas/vendas_form.html', vendedor=vendedor, corretora=corretoras,planos=planos)

@vendas_bp.route('/saldobenef')
@acesso('vendas','cadastro')
@hierarquia('supervisor','agente','vendedor')
def saldos():

    campo_result = request.args.get('campo_result')  # Recebe o parâmetro da URL
    print("campo_result:", campo_result)  # Para verificar o valor completo de campo_result

    if campo_result:
        # Realiza a consulta usando 'campo_result' como parâmetro (por exemplo, 'numero_contrato' ou 'nome_responsavel')
        try:
            query = "SELECT * FROM saldo_benef WHERE contrato = ?"
            result_saldo = query_db(query, [campo_result], one=True)  # Use sua função de consulta ao banco

            if result_saldo:
                return render_template('vendas/vendassaldo.html', result=result_saldo)
        
        except Exception as e:
            return f"Erro: {e}"
    
        return render_template('vendas/vendassaldo.html', error="Nenhum dado encontrado para o contrato.")
    
    return render_template('vendas/vendassaldo.html', error="Parâmetro inválido.")

@vendas_bp.route('/select_tp_venda')
@login_required
@acesso('vendas', 'cadastro', 'administrativo')
@hierarquia('supervisor', 'agente', 'vendedor')
def render_tipo_venda():

    return render_template('vendas/tipo_venda.html')

@vendas_bp.route('inclusao_render', methods=['GET', 'POST'])
@login_required
@acesso('vendas', 'cadastro', 'administrativo')
@hierarquia('supervisor', 'agente', 'vendedor')
def inclusao_render_form():
    from ..models.database import get_info_cnt
   

    nome_usuario = session.get('user_nome')
    numero_contrato = request.form.get('numero_contrato')  # Note: verifique se é 'numero_contrato' ou 'numero_contrato'
    
    # Obter dados do contrato
    dados = get_info_cnt(numero_contrato)
    if not dados:
        flash("Contrato não encontrado. Verifique o número do contrato.", "error")
        return redirect (url_for('generic.home'))
    print(dados)
    if len(dados['cpf'])>14:
        tipo_contrato= 'empresarial'
    elif len(dados['cpf'])==14:
        tipo_contrato = 'individual'
    
    # Obter dados do SICCADA
    vendedor = listar_vendedor()
    
    
    print("Dados do contrato:", dados)
    data_str =dados['data_nascimento']
    try:
        data_str = datetime.strptime(data_str, '%Y-%m-%d').strftime('%d/%m/%Y')
        print(data_str)
        data_obj = datetime.strptime(data_str, '%d/%m/%Y').date()
        data_nascimento= data_obj
    except:
        data_str= datetime.strptime(data_str, '%d/%m/%Y').strftime('%d/%m/%Y')
        data_obj = datetime.strptime(data_str, '%d/%m/%Y').date()
        data_nascimento= data_obj
        

    
    
    return render_template(
        'vendas/inclusao_form.html',
        dados=dados,
        data_nascimento=data_nascimento,
        tipo_contrato=tipo_contrato,
        numero_contrato=numero_contrato,
        nome_usuario=nome_usuario,
        vendedor=vendedor
    )

@vendas_bp.route('inclusao_form', methods=['GET','POST'])
@login_required
@acesso('vendas','cadastro','administrativo')
@hierarquia('supervisor','agente','vendedor')

def inclusao_form():
    nome_usuario = session.get('user_nome')
    try:
        print(nome_usuario)
        # Dados da venda
        venda = {
            "numero_proposta": request.form.get('numero_proposta'),
            "data_venda": request.form.get('data_venda'),
            "tipo_contrato": request.form.get('tipo_contrato'),
            "tipo_produto": request.form.get('tipo_produto'),
            "corretor_resp": request.form.get('corretor_resp'),
            "status": "Enviado ao cadastro",
            "digitador": nome_usuario,
            "valor_venda": float(request.form.get('valor_venda', '0').replace(',', '.')),
            "dt_cadastro": datetime.now().strftime("%d-%m-%Y"),
            "tipo_pagamento": request.form.get('forma_pagamento'),
        }
        print(venda['tipo_pagamento'])

        # Calcular valores adicionais
        # Calcular valores adicionais
        tipo = venda["tipo_contrato"]
        venda["taxa_inscricao"] = 0
        valor_base = venda["valor_venda"] 

        
        if tipo == "empresarial":
            taxa = venda["taxa_inscricao"]
            valor_sem_taxa = venda['valor_venda'] - taxa
            mensalidade = round(valor_sem_taxa / 1.05, 2)
            iss = round(valor_sem_taxa - mensalidade, 2)

            venda["valor_tabela"] = mensalidade
            venda["iss"] = iss

        elif tipo == "individual":
            venda["valor_tabela"] = round(valor_base, 2)
            venda["iss"] = 0

        elif tipo == "inclusao empresarial":
            #taxa = venda["taxa_inscricao"]
            valor_sem_taxa = venda['valor_venda']
            mensalidade = round(valor_sem_taxa / 1.05, 2)
            iss = round(valor_sem_taxa - mensalidade, 2)

            venda["valor_tabela"] = mensalidade
            venda["iss"] = iss
        elif tipo == 'inclusao individual':
            venda["valor_tabela"] = round(valor_base, 2)
            venda["iss"] = 0

        print(f"Valor tabela: {venda['valor_tabela']}, ISS: {venda['iss']}")



        # Dados do responsável
        responsavel = {
            "nome": request.form.get('nome_responsavel'),
            "cpf": request.form.get('cpf_responsavel'),
            "cnpj": request.form.get('cnpj_responsavel'),
            "nome_socio": request.form.get("nome_socio"),
            "cpf_socio": request.form.get('cpf_socio'),
            "data_nascimento": request.form.get('dt_nascimento_responsavel'),
            "cep": request.form.get('cep_responsavel'),
            "endereco": request.form.get('endereco_responsavel'),
            "celular": request.form.get('celular_responsavel'),
            "email": request.form.get('email_responsavel'),
            "estado_civil": request.form.get('estado_cv_responsavel'),
            "rg": request.form.get('rg_responsavel'),
        }
        print(responsavel)
        
        

        # Dados do titular
        titular = {
            "nome": request.form.get('nome_beneficiario'),
            "cpf": request.form.get('cpf_beneficiario'),
            "rg": request.form.get('rg_titular'),
            "data_nascimento": request.form.get('dt_nascimento_beneficiario'),
            "idade": request.form.get('idade_beneficiario'),
            "grau_parentesco":request.form.get('grau_parentesco_titular'),
            "endereco": request.form.get('endereco_beneficiario'),
            "celular": request.form.get('celular_titular'),
            "email": request.form.get('email_titular'),
            "estado_civil": request.form.get('estado_cv_beneficiario'),
            "nome_mae": request.form.get('nome_mae_beneficiario'),
            "nome_pai": request.form.get('nome_pai_beneficiario'),
            "sexo": request.form.get('sexo_beneficiario'),
            "quantidade_titular" : 1
        }
        print(titular)

        # Dados dos dependentes
        quantidade_dependentes = int(request.form.get('quantidade_dependentes', 0))
        dependentes = []
        nomes_dependentes = request.form.getlist('nome_dependente[]')
        cpfs_dependentes = request.form.getlist('cpf_dependente[]')
        datas_nascimento_dependentes = request.form.getlist('dt_nascimento_dependente[]')
        graus_parentesco_dependentes = request.form.getlist('grau_parentesco_dependente[]')
        mae_dependente = request.form.getlist('mae_dependente[]')
        dependente_sexo = request.form.getlist('dependente_sexo[]')

        

        # Usa o menor tamanho entre as listas para evitar erro de index
        num_dependentes = min(
            len(nomes_dependentes),
            len(cpfs_dependentes),
            len(datas_nascimento_dependentes),
            len(graus_parentesco_dependentes),
            len(mae_dependente),
            len(dependente_sexo)
        )

        for i in range(num_dependentes):
            dependente = {
                "nome": nomes_dependentes[i],
                "cpf": cpfs_dependentes[i],
                "data_nascimento": datas_nascimento_dependentes[i],
                "grau_parentesco": graus_parentesco_dependentes[i],
                "mae_dependente": mae_dependente[i],
                "dependente_sexo": dependente_sexo[i]
            }
           
            dependente["cpf_titular"] = titular["cpf"]
            dependente["data_nascimento"] = datetime.strptime(dependente["data_nascimento"], "%Y-%m-%d").strftime("%d/%m/%Y")
            dependentes.append(dependente)
            quantidade_dependentes += 1
        

        venda["vida"] = titular["quantidade_titular"] + quantidade_dependentes
        venda['nome_responsavel'] = responsavel['nome']
        print(venda['nome_responsavel'])
        print(venda["vida"])

        numero_proposta= venda['numero_proposta']

        
        try:
            salvar_venda(venda, responsavel, titular, dependentes)
        except Exception as e:
            erro = str(e)

            # Mapeamento de mensagens
            if "UNIQUE constraint failed: venda.numero_proposta" in erro:
                motivo = "Proposta já cadastrada. Verifique o número da proposta."
            elif "NOT NULL constraint failed" in erro:
                motivo = "Algum campo obrigatório não foi preenchido."
            elif "FOREIGN KEY constraint failed" in erro:
                motivo = "Dados relacionados não encontrados. Verifique dependentes/titular."
            elif "UNIQUE constraint failed: titulares.cpf" in erro:
                motivo = "Dados de titular já cadastrado, verifique as informações da venda"
            elif "UNIQUE constraint failed: responsavel.cpf" in erro:
                motivo = "Dados de responsavel já cadastrado, verifique as informações da venda"
            else:
                motivo = "Erro inesperado ao salvar a venda."

            flash(f"Erro ao salvar venda: {motivo}", "error")
            return render_template(
            "vendas/vendas_form.html", 
            form_data=request.form
        )

    except Exception as e:
        return f"Erro ao processar os dados: {e}"


@vendas_bp.route('venda_form_pj', methods=['GET','POST'])
@login_required
@acesso('vendas','cadastro','administrativo')
@hierarquia('supervisor','agente','vendedor')

def venda_form_pj():
    nome_usuario = session.get('user_nome')
    try:
        print(nome_usuario)
        # Dados da venda
        valor_venda_str = request.form.get('valor_venda', '0').replace('R$ ', '').strip()

        venda = {
            "numero_proposta": request.form.get('numero_proposta'),
            "data_venda": request.form.get('data_venda'),
            "tipo_contrato": request.form.get('tipo_contrato'),
            "tipo_produto": request.form.get('tipo_produto'),
            "corretor_resp": request.form.get('corretor_resp'),
            "status": "Enviado ao cadastro",
            "digitador": nome_usuario,
            "valor_venda_str": valor_venda_str,
            "valor_venda": float(valor_venda_str.replace(',', '.')),
            "dt_cadastro": datetime.now().strftime("%d-%m-%Y"),
            "tipo_pagamento": request.form.get('forma_pagamento'),
        }
        print(venda['tipo_pagamento'])

        # Calcular valores adicionais
        # Calcular valores adicionais
        tipo = venda["tipo_contrato"]
        venda["taxa_inscricao"] = 0
        valor_base = venda["valor_venda"] 

        if tipo == "empresarial":
            taxa = venda["taxa_inscricao"]
            valor_sem_taxa = venda['valor_venda'] - taxa
            mensalidade = round(valor_sem_taxa / 1.05, 2)
            iss = round(valor_sem_taxa - mensalidade, 2)

            venda["valor_tabela"] = mensalidade
            venda["iss"] = iss

        elif tipo == "individual":
            venda["valor_tabela"] = round(valor_base, 2)
            venda["iss"] = 0

        else:
            venda["valor_tabela"] = "CANCELADO"
            venda["iss"] = 0

        print(f"Valor tabela: {venda['valor_tabela']}, ISS: {venda['iss']}")




        # Dados do responsável
        responsavel = {
            "nome": request.form.get('nome_responsavel'),
            "cpf": request.form.get('cpf_socio'),
            "cnpj": request.form.get('cnpj_responsavel'),
            "nome_socio": request.form.get("nome_socio"),
            "cpf_socio": request.form.get('cpf_socio'),
            "data_nascimento": request.form.get('dt_nascimento_responsavel'),
            "cep": request.form.get('cep_responsavel'),
            "endereco": request.form.get('endereco_responsavel'),
            "celular": request.form.get('celular_responsavel'),
            "email": request.form.get('email_responsavel'),
            "estado_civil": request.form.get('estado_cv_responsavel'),
            "rg": request.form.get('rg_responsavel'),
        }
       
        
        

        # Dados do titular
        titular = {
            "nome": request.form.get('nome_beneficiario'),
            "cpf": request.form.get('cpf_beneficiario'),
            "rg": request.form.get('rg_titular'),
            "data_nascimento": request.form.get('dt_nascimento_beneficiario'),
            "idade": request.form.get('idade_beneficiario'),
            "grau_parentesco":request.form.get('grau_parentesco_titular'),
            "endereco": request.form.get('endereco_beneficiario'),
            "celular": request.form.get('celular_titular'),
            "email": request.form.get('email_titular'),
            "estado_civil": request.form.get('estado_cv_beneficiario'),
            "nome_mae": request.form.get('nome_mae_beneficiario'),
            "nome_pai": request.form.get('nome_pai_beneficiario'),
            "sexo": request.form.get('sexo_beneficiario'),
            "quantidade_titular" : 1,
            "valor_titular": request.form.get('valor_titular')
        }
        print (titular)

         # Dados dos dependentes
        quantidade_dependentes = int(request.form.get('quantidade_dependentes', 0))
        dependentes = []
        nomes_dependentes = request.form.getlist('nome_dependente[]')
        cpfs_dependentes = request.form.getlist('cpf_dependente[]')
        datas_nascimento_dependentes = request.form.getlist('dt_nascimento_dependente[]')
        idade_dependente = request.form.getlist('idade_dependente[]')  # CORREÇÃO: adicionar []
        graus_parentesco_dependentes = request.form.getlist('grau_parentesco_dependente[]')
        mae_dependente = request.form.getlist('mae_dependente[]')
        dependente_sexo = request.form.getlist('dependente_sexo[]')
        valor_dependente = request.form.getlist('valor_dependente[]')  # CORREÇÃO: adicionar []

        print(nomes_dependentes)
        print(dependente_sexo)
        

        # Usa o menor tamanho entre as listas para evitar erro de index
        num_dependentes = min(
            len(nomes_dependentes),
            len(cpfs_dependentes),
            len(datas_nascimento_dependentes),
            len(idade_dependente),
            len(graus_parentesco_dependentes),
            len(mae_dependente),
            len(dependente_sexo),
            len(valor_dependente)
        )

        for i in range(num_dependentes):
            dependente = {
            "nome": nomes_dependentes[i],
            "cpf": cpfs_dependentes[i],
            "data_nascimento": datas_nascimento_dependentes[i],
            "idade_dependente": idade_dependente[i],
            "grau_parentesco": graus_parentesco_dependentes[i],
            "mae_dependente": mae_dependente[i],
            "dependente_sexo": dependente_sexo[i],
            "valor_dependente": valor_dependente[i]  # CORREÇÃO: mudar para "valor" (sem _dependente)
        }
            print("dependente: ", dependente)
        dependente["cpf_titular"] = titular["cpf"]
        dependente["data_nascimento"] = datetime.strptime(dependente["data_nascimento"], "%Y-%m-%d").strftime("%d/%m/%Y")
        dependentes.append(dependente)
        quantidade_dependentes += 1
                

        venda["vida"] = titular["quantidade_titular"] + quantidade_dependentes
        venda['nome_responsavel'] = responsavel['nome']
        print(venda['nome_responsavel'])
        print(venda["vida"])

        numero_proposta= venda['numero_proposta']

        
        # Salvar os dados no banco
        try:
            salvar_venda(venda, responsavel, titular, dependentes)
        except Exception as e:
            erro = str(e)

            # Mapeamento de mensagens
            if "UNIQUE constraint failed: venda.numero_proposta" in erro:
                motivo = "Proposta já cadastrada. Verifique o número da proposta."
            elif "NOT NULL constraint failed" in erro:
                motivo = "Algum campo obrigatório não foi preenchido."
            elif "FOREIGN KEY constraint failed" in erro:
                motivo = "Dados relacionados não encontrados. Verifique dependentes/titular."
            elif "UNIQUE constraint failed: titulares.cpf" in erro:
                motivo = "Dados de titular já cadastrado, verifique as informações da venda"
            elif "UNIQUE constraint failed: responsavel.cpf" in erro:
                motivo = "Dados de responsavel já cadastrado, verifique as informações da venda"
            else:
                motivo = "Erro inesperado ao salvar a venda."

            flash(f"Erro ao salvar venda: {motivo}", "error")
            return redirect (url_for('auth.manutencao'
        ))


        flash("Venda salva com sucesso!", "success")
        return redirect(url_for('vendas.concluido', proposta=numero_proposta, tipo_contrato=venda['tipo_contrato']))

        

        
    except KeyError as e:
        return f"Erro: chave não encontrada {e}"

    except Exception as e:
        return f"Erro ao processar os dados: {e}"

@vendas_bp.route('venda_form', methods=['GET','POST'])
@login_required
@acesso('vendas','cadastro','administrativo')
@hierarquia('supervisor','agente','vendedor')


def venda_form():  
    nome_usuario = session.get('user_nome')
    
    print(nome_usuario)
    
    try:
        print(nome_usuario)
        # Dados da venda
        valor_venda_str = request.form.get('valor_venda', '0').replace('R$ ', '').strip()

        venda = {
            "numero_proposta": request.form.get('numero_proposta'),
            "data_venda": request.form.get('data_venda'),
            "tipo_contrato": request.form.get('tipo_contrato'),
            "tipo_produto": request.form.get('tipo_produto'),
            "corretor_resp": request.form.get('corretor_resp'),
            "status": "Enviado ao cadastro",
            "digitador": nome_usuario,
            "valor_venda_str": valor_venda_str,
            "valor_venda": float(valor_venda_str.replace(',', '.')),
            "dt_cadastro": datetime.now().strftime("%d-%m-%Y"),
            "tipo_pagamento": request.form.get('forma_pagamento'),
        }
        print(venda['tipo_pagamento'])

        # Calcular valores adicionais
        # Calcular valores adicionais
        tipo = venda["tipo_contrato"]
        venda["taxa_inscricao"] = 0
        valor_base = venda["valor_venda"] 

        if tipo == "empresarial":
            taxa = venda["taxa_inscricao"]
            valor_sem_taxa = venda['valor_venda'] - taxa
            mensalidade = round(valor_sem_taxa / 1.05, 2)
            iss = round(valor_sem_taxa - mensalidade, 2)

            venda["valor_tabela"] = mensalidade
            venda["iss"] = iss

        elif tipo == "individual":
            venda["valor_tabela"] = round(valor_base, 2)
            venda["iss"] = 0

        else:
            venda["valor_tabela"] = "CANCELADO"
            venda["iss"] = 0

        print(f"Valor tabela: {venda['valor_tabela']}, ISS: {venda['iss']}")



        # Dados do responsável
        responsavel = {
            "nome": request.form.get('nome_responsavel'),
            "cpf": request.form.get('cpf_responsavel'),
            "cnpj": request.form.get('cnpj_responsavel'),
            "nome_socio": request.form.get("nome_socio"),
            "cpf_socio": request.form.get('cpf_socio'),
            "data_nascimento": request.form.get('dt_nascimento_responsavel'),
            "cep": request.form.get('cep_responsavel'),
            "endereco": request.form.get('endereco_responsavel'),
            "celular": request.form.get('celular_responsavel'),
            "email": request.form.get('email_responsavel'),
            "estado_civil": request.form.get('estado_cv_responsavel'),
            "rg": request.form.get('rg_responsavel'),
        }
        
        

        # Dados do titular
        titular = {
            "nome": request.form.get('nome_beneficiario'),
            "cpf": request.form.get('cpf_beneficiario'),
            "rg": request.form.get('rg_titular'),
            "data_nascimento": request.form.get('dt_nascimento_beneficiario'),
            "idade": request.form.get('idade_beneficiario'),
            "grau_parentesco":request.form.get('grau_parentesco_titular'),
            "endereco": request.form.get('endereco_beneficiario'),
            "celular": request.form.get('celular_titular'),
            "email": request.form.get('email_titular'),
            "estado_civil": request.form.get('estado_cv_beneficiario'),
            "nome_mae": request.form.get('nome_mae_beneficiario'),
            "nome_pai": request.form.get('nome_pai_beneficiario'),
            "sexo": request.form.get('sexo_beneficiario'),
            "quantidade_titular" : 1,
            "valor_titular": request.form.get('valor_titular')
        }
        print (titular)
        

        # Dados dos dependentes
        quantidade_dependentes = int(request.form.get('quantidade_dependentes', 0))
        dependentes = []
        nomes_dependentes = request.form.getlist('nome_dependente[]')
        cpfs_dependentes = request.form.getlist('cpf_dependente[]')
        datas_nascimento_dependentes = request.form.getlist('dt_nascimento_dependente[]')
        idade_dependente = request.form.getlist('idade_dependente[]')  # CORREÇÃO: adicionar []
        graus_parentesco_dependentes = request.form.getlist('grau_parentesco_dependente[]')
        mae_dependente = request.form.getlist('mae_dependente[]')
        dependente_sexo = request.form.getlist('dependente_sexo[]')
        valor_dependente = request.form.getlist('valor_dependente[]')  # CORREÇÃO: adicionar []

        print(nomes_dependentes)
        print(dependente_sexo)
        

        # Usa o menor tamanho entre as listas para evitar erro de index
        num_dependentes = min(
            len(nomes_dependentes),
            len(cpfs_dependentes),
            len(datas_nascimento_dependentes),
            len(idade_dependente),
            len(graus_parentesco_dependentes),
            len(mae_dependente),
            len(dependente_sexo),
            len(valor_dependente)
        )

        for i in range(num_dependentes):
            dependente = {
            "nome": nomes_dependentes[i],
            "cpf": cpfs_dependentes[i],
            "data_nascimento": datas_nascimento_dependentes[i],
            "idade_dependente": idade_dependente[i],
            "grau_parentesco": graus_parentesco_dependentes[i],
            "mae_dependente": mae_dependente[i],
            "dependente_sexo": dependente_sexo[i],
            "valor_dependente": valor_dependente[i]  # CORREÇÃO: mudar para "valor" (sem _dependente)
        }
            print("dependente: ", dependente)
        dependente["cpf_titular"] = titular["cpf"]
        dependente["data_nascimento"] = datetime.strptime(dependente["data_nascimento"], "%Y-%m-%d").strftime("%d/%m/%Y")
        dependentes.append(dependente)
        quantidade_dependentes += 1
                

        venda["vida"] = titular["quantidade_titular"] + quantidade_dependentes
        venda['nome_responsavel'] = responsavel['nome']
        print(venda['nome_responsavel'])
        print(venda["vida"])

        numero_proposta= venda['numero_proposta']

        
        # Salvar os dados no banco
        try:
            print("iniciando salvar venda")
            salvar_venda(venda, responsavel, titular, dependentes)
        except Exception as e:
            erro = str(e)

            # Mapeamento de mensagens
            if "UNIQUE constraint failed: venda.numero_proposta" in erro:
                motivo = "Proposta já cadastrada. Verifique o número da proposta."
            elif "NOT NULL constraint failed" in erro:
                motivo = "Algum campo obrigatório não foi preenchido."
            elif "FOREIGN KEY constraint failed" in erro:
                motivo = "Dados relacionados não encontrados. Verifique dependentes/titular."
            elif "UNIQUE constraint failed: titulares.cpf" in erro:
                motivo = "Dados de titular já cadastrado, verifique as informações da venda"
            elif "UNIQUE constraint failed: responsavel.cpf" in erro:
                motivo = "Dados de responsavel já cadastrado, verifique as informações da venda"
            else:
                motivo = "Erro inesperado ao salvar a venda."

            flash(f"Erro ao salvar venda: {motivo}", "error")
            return redirect(url_for('auth.manutencao'
        ))


        flash("Venda salva com sucesso!", "success")
        return redirect(url_for('vendas.concluido', proposta=numero_proposta, tipo_contrato=venda['tipo_contrato']))

        
    except KeyError as e:
        return f"Erro: chave não encontrada {e}"

    except Exception as e:
        return f"Erro ao processar os dados: {e}"

# app/routes/vendas.py
from flask import Blueprint, request, jsonify
from app.api_conex.conections import consultar_cep

@vendas_bp.route('/buscar_endereco_cep', methods=['POST'])
def buscar_endereco_cep():
    cep = request.json.get('cep')
    print(cep)
    endereco = consultar_cep(cep)
    if endereco:
        return jsonify(endereco)
    return jsonify({'erro': 'Endereço não encontrado'}), 404

@vendas_bp.route('/concluido')
def concluido():
    proposta = request.args.get('proposta')
    tipo_contrato = request.args.get('tipo_contrato')

    return render_template('vendas/concluido.html', proposta=proposta, tipo_contrato=tipo_contrato)

@vendas_bp.route('/preco/idade/<int:idade>/<string:plano>', methods= ["GET","POST"])
def preco_idade(idade,plano):
    from ..models.database import get_idades
    preco= get_idades(idade,plano)

    return jsonify({
        "idade": idade,
        "plano": plano,
        "preco" : preco
    })