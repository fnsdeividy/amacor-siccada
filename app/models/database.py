import sqlite3
from flask import current_app
import os
from datetime import timedelta, datetime


def get_db_connection(database_path=None):
    """
    Retorna uma conexão com o banco de dados.
    Se `database_path` for fornecido, usa esse caminho; caso contrário, usa o banco configurado no Flask.
    """
    db_path = database_path or current_app.config['DATABASE']
    print(f"Conectando ao banco: {db_path}")  # Adicione este print
    print("Banco usado:", os.path.abspath(current_app.config['DATABASE']))
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def query_db_doc(query, one=False, database_path=None):
    """
    Executa uma consulta no banco de dados.
    """
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    cur.execute(query)
    rv = cur.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv


def query_db(query, args=(), one=False, database_path=None):
    """
    Executa uma consulta no banco de dados.
    """
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv

def alter_db(query, args=(), database_path=None):
    """
    Executa uma alteração no banco de dados (INSERT, UPDATE, DELETE).
    """
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    try:
        cur.execute(query, args)
        conn.commit()
    except sqlite3.Error as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def update_db(query, args=(), database_path=None):
    """
    Executa uma atualização no banco de dados.
    """
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    try:
        cur.execute(query, args)
        conn.commit()
    except sqlite3.Error as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def mudar_senha(email, novasenha, database_path=None):
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    usuario = query_db(
            "SELECT * FROM usuarios WHERE email = ?", 
            (email,), 
            one=True
        )

    if usuario:
           conn = sqlite3.connect(current_app.config['DATABASE'])
           cur = conn.cursor()
           cur.execute(
               "UPDATE USUARIOS SET senha = ? WHERE email = ?",
               (novasenha, email),
           )
           
    conn.commit()
    conn.close()

def salvar_venda(venda, responsavel, titular, dependentes, database_path=None):
    from ..api_conex.conections import email_gmail, msg_email
    """
    Salva os dados da venda, responsável, titular e dependentes no banco de dados.
    Agora usa apenas proposta_id (TEXT) como referência, sem venda_id.
    """
    try:
        conn = get_db_connection(database_path)
        cur = conn.cursor()

        print('tentando salvar venda')

        # Inserir dados da venda
        cur.execute("""
            INSERT INTO venda (numero_proposta, data_venda, tipo_contrato, tipo_produto, corretor_resp, status, digitador, valor_venda, dt_cadastro, taxa_inscricao, iss, valor_tabela, vidas, nome_responsavel,tipo_pagamento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (venda['numero_proposta'], venda['data_venda'], venda['tipo_contrato'], venda['tipo_produto'],
              venda['corretor_resp'], venda['status'], venda['digitador'], venda['valor_venda'], venda['dt_cadastro'], 
              venda['taxa_inscricao'], venda['iss'], venda['valor_tabela'], venda['vida'], venda['nome_responsavel'],venda['tipo_pagamento']))
        print(venda['tipo_pagamento'])

        proposta_id = venda['numero_proposta']  # Usar o número da proposta como referência
        print("numero_proposta",venda['numero_proposta'])
        print(proposta_id)
        # Inserir dados do responsável
        cur.execute("""
            INSERT INTO responsavel (proposta_id, nome, cpf, data_nascimento, cep, celular, email, estado_civil, complemento_cep, rg,socio,cnpj)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)
        """, (proposta_id, responsavel['nome'], responsavel['cpf'], responsavel['data_nascimento'],
              responsavel['cep'], responsavel['celular'], responsavel['email'], responsavel['estado_civil'], responsavel['endereco'], responsavel['rg'],responsavel['nome_socio'],responsavel['cnpj']))
        print('dados de responsavel inseridos')
        # Inserir dados do titular
        cur.execute("""
            INSERT INTO titulares (proposta_id, nome, cpf, data_nascimento, idade,grau_parentesco, cep, celular, email, estado_civil, nome_mae, nome_pai, sexo, numero_rg, valor_titular)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (proposta_id, titular['nome'], titular['cpf'], titular['data_nascimento'], titular['idade'],titular['grau_parentesco'],
              titular['endereco'], titular['celular'], titular['email'], titular['estado_civil'],
              titular['nome_mae'], titular['nome_pai'], titular['sexo'], titular['rg'],titular['valor_titular']))

        # Inserir dados dos dependentes
        if dependentes:
            for dependente in dependentes:
                print("dependentes",dependentes)
                
                cur.execute("""
                    INSERT INTO dependentes (proposta_id, nome, cpf, data_nascimento, grau_parentesco, cpf_titular,nome_mae,sexo, valor_dependente, idade_dependente)
                    VALUES (?, ?, ?, ?, ?, ?,?,?,?,?)
                """, (proposta_id, dependente['nome'], dependente['cpf'], dependente['data_nascimento'],
                    dependente['grau_parentesco'], dependente['cpf_titular'],dependente['mae_dependente'],dependente['dependente_sexo'], dependente['valor_dependente'], dependente['idade_dependente']))

        conn.commit()
        conn.close()

        status= venda['status']
        complemento= None
        
        email= responsavel['email']
        nome= responsavel['nome']

        assunto= assunto= f'{nome} seu processo de contratação foi iniciado'
        mensagem = f'''
        <p>Olá {nome},</p>
        <p>Recebemos a documentação da sua proposta do plano de saúde e o processo de contratação foi iniciado.</p>
        <p>Dentro dos próximos 02 dias entraremos em contato para prosseguir com o processo de adesão ao plano.</p>
        <h3 style="color: #0a2f68; border-bottom: 2px solid #0a2f68; padding-bottom: 5px; display: inline-block;">
            Próximas etapas do seu plano:
        </h3>
        <div style="margin: 25px 0; position: relative;">
            <!-- Etapa 1 -->
            <div style="display: flex; margin-bottom: 25px; align-items: flex-start;">
                <div style="background-color: #0a2f68; color: white; width: 28px; height: 28px; 
                            border-radius: 50%; display: flex; justify-content: center; align-items: center; 
                            margin-right: 15px; flex-shrink: 0;">1</div>
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #0a2f68;">Entrevista Presencial</h4>
                    <p style="margin: 0; color: #555;">Entraremos em contato para agendar uma entrevista de acolhimento do novo cliente ao plano.</p>
                </div>
            </div>
            <!-- Etapa 2 -->
            <div style="display: flex; margin-bottom: 25px; align-items: flex-start;">
                <div style="background-color: #0a2f68; color: white; width: 28px; height: 28px; 
                            border-radius: 50%; display: flex; justify-content: center; align-items: center; 
                            margin-right: 15px; flex-shrink: 0;">2</div>
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #0a2f68;">Análise de Declaração</h4>
                    <p style="margin: 0; color: #555;">Sua entrevista de acolhimento será analisada por nossa equipe.</p>
                </div>
            </div>
            <!-- Etapa 3 -->
            <div style="display: flex; margin-bottom: 25px; align-items: flex-start;">
                <div style="background-color: #0a2f68; color: white; width: 28px; height: 28px; 
                            border-radius: 50%; display: flex; justify-content: center; align-items: center; 
                            margin-right: 15px; flex-shrink: 0;">3</div>
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #0a2f68;">Cadastro</h4>
                    <p style="margin: 0; color: #555;">Após analise da entrevista, os dados do novo cliente serão adicionados aos nossos sistemas e ele se torna um beneficiario Amacor Planos de saúde.</p>
                </div>
            </div>
            <!-- Etapa 4 -->
            <div style="display: flex; margin-bottom: 25px; align-items: flex-start;">
                <div style="background-color: #0a2f68; color: white; width: 28px; height: 28px; 
                            border-radius: 50%; display: flex; justify-content: center; align-items: center; 
                            margin-right: 15px; flex-shrink: 0;">4</div>
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #0a2f68;">Geração de Kit</h4>
                    <p style="margin: 0; color: #555;">Emitiremos todos os documentos necessários para seu contrato.</p>
                </div>
            </div>
            <!-- Etapa 5 -->
            <div style="display: flex; align-items: flex-start;">
                <div style="background-color: #0a2f68; color: white; width: 28px; height: 28px; 
                            border-radius: 50%; display: flex; justify-content: center; align-items: center; 
                            margin-right: 15px; flex-shrink: 0;">5</div>
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #0a2f68;">Finalização do Contrato</h4>
                    <p style="margin: 0; color: #555;">Enviaremos seu kit contratual para assinatura digital e pedido da carteirinha.</p>
                </div>
            </div>
        </div>
        
        <div style="background-color: #fff8e6; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
            <p style="margin: 0; color: #856404; font-weight: 500;">
                ⏱️ <strong>Todo esse processo deverá ser realizado em até 30 dias corridos</strong> a partir da data de pagamento da adesão. 
                Caso não cumpra o prazo o plano será suspenso e após 10 dias de suspensão seu plano será <strong>cancelado.</strong>
            </p>
        </div>
        '''
        print("preparando inserçao de dados")
        email_gmail(destinatario=email, assunto=assunto, mensagem=mensagem, complemento=complemento)


    except Exception as e:
        print("erro em:", e)
        conn.rollback()
        conn.close()
        raise e
    
def get_email(proposta_id, database_path=None):
    print(f"Proposta ID para email recebido: {proposta_id}")
    conn = get_db_connection(database_path)
    cur=conn.cursor()

    cur.execute("SELECT email FROM responsavel WHERE proposta_id = ?", (proposta_id,))
    email= cur.fetchone()
    conn.close()
    print('email enviado', email)
    return email['email'] if email else None

def get_nome(proposta_id, database_path=None):
    print(f"proposta recebida: {proposta_id}") 
    conn = get_db_connection(database_path)
    cur=conn.cursor()

    cur.execute("SELECT nome FROM responsavel WHERE proposta_id = ?", (proposta_id,))
    nome= cur.fetchone()
    conn.close()
    print('nome enviado: ', nome['nome'])
    return nome['nome'] if nome else None

def listar_vendedor(database_path= None):
    conn = get_db_connection(database_path)
    cur=conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE classe_usuario = 'vendedor'")
    vendedores = cur.fetchall()
    cur.close()
    conn.close()
    return vendedores

def get_acompanhar_cnt(tipo_consulta, valor_espex, database_path= None):
    conn = get_db_connection(database_path)
    cur=conn.cursor()

    print (f'consultando para {tipo_consulta} com valor {valor_espex}')

    if tipo_consulta == 'corretor':
        cur.execute("SELECT * FROM venda WHERE corretor_resp = ? ORDER BY data_venda DESC", (valor_espex,))
        result = cur.fetchall()
        
    elif tipo_consulta == 'filtar':
        cur.execute("SELECT * FROM venda WHERE status= ? ORDER BY data_venda DESC", (valor_espex,))
        result = cur.fetchall()
    

    return result
    
    


    

def get_status(proposta_id, database_path=None):
    print(f"proposta recebida: {proposta_id}") 
    conn = get_db_connection(database_path)
    cur=conn.cursor()

    cur.execute("SELECT status FROM venda WHERE numero_proposta = ?", (proposta_id,))
    status= cur.fetchone()
    conn.close()
    print('status: ', status)
    return status['status'] if status else None

def senha_aleatoria(tamanho,email):
    import random
    import string
    from ..cripto import hash_senha
    # Define os caracteres permitidos na senha
    caracteres = string.ascii_letters + string.digits

    # Gera uma senha aleatória de 12 caracteres
    senha = ''.join(random.choice(caracteres) for _ in range(tamanho))
    #alterar senha no usuario
    
    print(f"Senha gerada: {senha}")

    senhahash= hash_senha(senha)
    print(f"Senha hasheada: {senhahash}")

    database_path = None
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    cur.execute("""
        UPDATE usuarios SET senha = ? WHERE email = ?""", (senhahash, email))
    conn.commit()
    conn.close()

    return senha

def get_pagamento(data_pagamento, valor, numero_contrato,database_path=None):
    print(f"dados recebidos: {data_pagamento, valor}") 
    conn = get_db_connection(database_path)
    cur=conn.cursor()

    cur.execute("""
    SELECT id FROM pagamentos 
    WHERE valor = ? AND data_pagamento = ? AND ncontrato = ?
    ORDER BY id DESC 
    LIMIT 1
    """, (valor, data_pagamento,numero_contrato))
    id= cur.fetchone()
    conn.close()
    print(f'id retornado: ,{ id}')
    return id['id'] if id else None


def get_from_sig(numero_contrato, database_path=None):
    """Busca informações na tabela beneficiarios e mapeia os dados do SIG para o formato esperado"""
    
    # Mapeamento das colunas do SIG para as colunas da tabela 'beneficiarios'
    sig_to_beneficiarios_map = {
        'sCpfCgcResp': 'cpf',
        'sNomeResp': 'nome_responsavel',
        'sNumeroCNT': 'numero_contrato',
        'dNascimentoTIT': 'data_nascimento',
        'Fone_CNT': 'celular',
        'sCodigoUSR': 'codigo_usr',
        'sNomeTIT': 'nome_titular',
        'dMatricula': 'data_venda',
        'dExclusao': 'data_exclusao',
        'sMotivoCancelamentoTIT': 'motivo_cancelamento',
        'sDescricaoCancTit': 'descricao_cancelamento',
        'sCpfUSR': 'cpf_usr',
        'sNomeUSR': 'nome_usr',
        'dNascimento': 'data_nascimento_usr',
        'sTipoUsuario': 'tipo_usuario',
        'sNomePRD': 'tipo_produto',
        'cPrecoPRD': 'preco_produto',
        'IdadeUSR': 'idade_usr',
        'IdadeTIT': 'idade_titular',
        'TempoPermanenciaUSR': 'tempo_permanencia_usr',
        'TempoPermanenciaTIT': 'tempo_permanencia_titular',
    }
    
    try:
        # Conectando ao banco de dados
        conn = get_db_connection(database_path)
        cur = conn.cursor()

        # Executando a query para pegar os dados do SIG
        cur.execute("""
            SELECT * FROM beneficiarios 
            WHERE sNumeroCNT = ? 
        """, (numero_contrato,))
        
        # Obtendo o resultado
        resultado = cur.fetchone()
        
        if resultado:
            # Convertendo para dict e aplicando o mapeamento das chaves
            dados_sig = dict(resultado)
            
            
            # Mapeando os dados para o formato esperado pela tabela 'beneficiarios'
            dados_mapeados = {sig_to_beneficiarios_map.get(key, key): value for key, value in dados_sig.items()}
            
            # Retorna os dados já no formato mapeado
            dados_mapeados['info_origem'] = 'sig'
            return dados_mapeados
        else:
            return None
            
    except Exception as e:
        print(f'Erro ao buscar no SIG: {e}')
        return None
    finally:
        if 'conn' in locals():
            conn.close()


def get_from_siccada(numero_contrato, database_path=None):
    """Busca informações nas tabelas venda + responsavel"""
    try:
        conn = get_db_connection(database_path)
        conn.row_factory = sqlite3.Row  # faz cada linha agir como um dict
        cur = conn.cursor()

        # Busca proposta
        cur.execute("""
            SELECT numero_proposta FROM venda 
            WHERE numero_contrato = ?
        """, (numero_contrato,))
                    
        resultado = cur.fetchone()
        dados_siccada= dict(resultado)
        dados_siccada['info_origem'] = 'siccada'
        return dict(resultado) if resultado else None
        
    except Exception as e:
        print(f'Erro ao buscar no SICCADA: {e}')
        return None
    finally:
        if 'conn' in locals():
            conn.close()


def get_info_cnt(numero_contrato, database_path=None):
    print(f"Buscando informações para contrato: {numero_contrato}")
    
    print("buscando de SIG")

    dados=get_from_sig(numero_contrato)
    if dados==None:
        print("não encontrados em SIG")
        print("buscando em SICCADA")
        dados= get_from_siccada(numero_contrato)
        print (dados)

    elif dados != None: 
        print("dados recebidos a partir do SIG")
        
        print(dados)



    return dados
    
def get_contrato(cpf, database_path=None):
    print(f"dados recebidos: {cpf}") 
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT sNumeroCNT FROM beneficiarios 
        WHERE sCpfCgcResp = ? 
    """, (cpf,))  

    resultado = cur.fetchone()
    conn.close()

    print(f'id retornado: {resultado}')
    return resultado['sNumeroCNT'] if resultado else None

def get_nome_contrato(cpf,database_path=None):
    print(f"dados recebidos: {cpf}") 
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT sNomeResp FROM beneficiarios 
        WHERE sCpfCgcResp = ? 
    """, (cpf,))  

    resultado = cur.fetchone()
    conn.close()

    print(f'responsavel retornado: {resultado}')
    return resultado['sNomeResp'] if resultado else None

def get_carteirinha(cpf, database_path=None):
    print(f"dados recebidos: {cpf}") 
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT sCodigoUSR FROM beneficiarios 
        WHERE sCpfUSR = ? 
    """, (cpf,))  

    resultado = cur.fetchone()
    conn.close()

    print(f'responsavel retornado: {resultado}')
    return resultado['sNomeResp'] if resultado else None

def get_carteirinha_to_app(cpf, database_path=None):
    print(f"dados recebidos: {cpf}") 
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM beneficiarios 
        WHERE sCpfUSR = ? AND 
        dExclusaoUSR IS NULL
        
    """, (cpf,))  

    resultado = cur.fetchone()
    conn.close()

    print(f'responsavel retornado: {resultado}')
    
    # Converte o resultado em um dicionário
    if resultado:
        result= (dict(resultado))
        print (result)
        return result
    
    return None

def get_payment_to_app(data, database_path=None):
    print(f"dados recebidos: {data}")
    ncontrato= data
    print(f"dados recebidos: {ncontrato}") 
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
       SELECT * FROM boletos
                WHERE contrato = ?
        
    """, (ncontrato,))  
    resultado = cur.fetchall()
    conn.close()

    print(f'responsavel retornado: {resultado}')
    
    # Converte o resultado em um dicionário
    for result in resultado:
        print(dict(result))
    if resultado:
        return [dict(row) for row in resultado]
    return None

def get_especialidade_to_app(especialidade, database_path= None):
    print('dados recebidos:', especialidade)
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT c.* 
        FROM clinicas c
        INNER JOIN clinica_especialidade ce ON c.id = ce.clinica_id
        INNER JOIN especialidades e ON ce.especialidade_id = e.id
        WHERE LOWER(e.nome) LIKE LOWER(?);
    """,(especialidade,))

    resultado = cur.fetchall()
    conn.close()
    for result in resultado:
        print(dict(result))
    if resultado:
        return [dict(row) for row in resultado]
    return None

def get_data_status_plano_to_app(contrato, database_path=None):
    print(f"dados recebidos: {contrato}")
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT status, complemento_fase FROM venda 
        WHERE numero_contrato = ? 
        AND (status = 'entrevista online enviada' OR status = 'kit enviado')
    """, (contrato,))
    
    resultado = cur.fetchone()
    conn.close()
    
    if resultado:
        # Converte a tupla para dicionário
        return {
            'status': resultado[0],
            'complemento_fase': resultado[1]
        }
    return None

def post_suspender_cnt_to_app(contrato, motivo, database_path=None):
    print(f"dados recebidos: {contrato}, motivo: {motivo}")
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE beneficiarios 
            SET motivo_suspensao = ?, suspenso = 1 
            WHERE sNumeroCNT = ?
        """, (motivo, contrato))

        # Verifica se alguma linha foi afetada
        if cur.rowcount > 0:
            print(f"✅ Contrato {contrato} suspenso com sucesso. Linhas afetadas: {cur.rowcount}")
        else:
            print(f"⚠️  Nenhum contrato encontrado com o número: {contrato}")

        conn.commit()
        
    except Exception as e:
        print(f"❌ Erro ao suspender contrato: {e}")
        conn.rollback()
        
    finally:
        conn.close()


def get_data_relatorio(data_inicial, data_final, database_path=None):
    print(f"dados recebidos: data inicial:{data_inicial} data final: {data_final}")

    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM venda 
        WHERE data_venda BETWEEN ? AND ? 
    """, (data_inicial, data_final))

    # Obtendo todos os resultados como lista de dicionários
    col_names = [desc[0] for desc in cur.description]  # Pegando os nomes das colunas
    resultado = [dict(zip(col_names, row)) for row in cur.fetchall()]
    
    conn.close()

    print(f"Quantidade de resultados: {len(resultado)}")
    print(f"Primeiros 5 resultados: {resultado[:5]}")  # Mostrar os 5 primeiros resultados

    return resultado if resultado else None

def get_data_relatorio_wstatus(data_inicial, data_final, status, database_path=None):
    print(f"dados recebidos: data inicial:{data_inicial} data final: {data_final}")

    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM venda 
        WHERE data_venda BETWEEN ? AND ? AND status= ?
    """, (data_inicial, data_final, status))

    # Obtendo todos os resultados como lista de dicionários
    col_names = [desc[0] for desc in cur.description]  # Pegando os nomes das colunas
    resultado = [dict(zip(col_names, row)) for row in cur.fetchall()]
    
    conn.close()

    print(f"Quantidade de resultados: {len(resultado)}")
    print(f"Primeiros 5 resultados: {resultado[:5]}")  # Mostrar os 5 primeiros resultados

    return resultado if resultado else None

def get_boleto(contrato, database_path= None):
    print(f"dados recebidos: {contrato}")

    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT cod_barras FROM beneficiarios 
        WHERE sNumeroCNT = ?
    """, (contrato,))

    # Obtendo todos os resultados como lista de dicionários
    resultado = cur.fetchone()

    conn.close()

    cod_barras = resultado['cod_barras']  # Acessa o campo 'cod_barras' diretamente

    print(f"Valor do código de barras: {cod_barras}")

    return cod_barras
    
def get_senha(database_path=None):
    
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT senha FROM usuarios WHERE tipo_usuario IN ('vendas', 'administrativo') AND classe_usuario = 'supervisor'
    """, )
    resultado = cur.fetchall()
    conn.close()

    if resultado:
        return [row['senha'] for row in resultado]
    
def cancelar_proposta(proposta_id, last_resp,database_path=None):
    from ..utils import log_atualiza_status
    """
    Exclui uma proposta e todos os seus dados associados do banco de dados.
    """
    try:
        print("iniciando cancelamento proposta: ", proposta_id)

        conn = get_db_connection(database_path)
        conn.execute("PRAGMA foreign_keys = ON;")  # Ativa cascade
        cur = conn.cursor()

        cur.execute("UPDATE venda SET status = 'venda cancelada' WHERE numero_proposta = ?", (proposta_id,))

        
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
        fase= 'venda cancelada'
        
        log_atualiza_status(proposta_id, fase, last_resp)

def excluir_proposta(proposta_id, motivo,database_path=None):
    from ..utils import log_exclusao_proposta
    """
    Exclui uma proposta e todos os seus dados associados do banco de dados.
    """
    try:
        dados= get_info_cancelamento(proposta_id)
        print(dados)
        print("iniciando exclusao proposta: ", proposta_id)
        
        conn = get_db_connection(database_path)
        conn.execute("PRAGMA foreign_keys = ON;")  # Ativa cascade
        cur = conn.cursor()

        cur.execute("DELETE FROM venda WHERE numero_proposta = ?", (proposta_id,))
        conn.commit()
        valor_mensalidade= dados['valor_venda']
        vidas= dados['vidas']
        corretor_resp= dados['corretor_resp']

        log_exclusao_proposta(proposta_id, motivo, valor_mensalidade, vidas, corretor_resp)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_dados_proposta(proposta_id, database_path=None):
    """
    Obtém os dados de uma proposta específica.
    """
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT * FROM venda WHERE numero_proposta = ?
    """, (proposta_id,))
    
    venda = cur.fetchone()
    
    if not venda:
        conn.close()
        return None

    cur.execute("""
        SELECT * FROM responsavel WHERE proposta_id = ?
    """, (proposta_id,))
    
    responsavel = cur.fetchone()

    cur.execute("""
        SELECT * FROM titulares WHERE proposta_id = ?
    """, (proposta_id,))
    
    titular = cur.fetchone()

    cur.execute("""
        SELECT * FROM dependentes WHERE proposta_id = ?
    """, (proposta_id,))
    
    dependentes = cur.fetchall()

    conn.close()

    return {
        'venda': dict(venda),
        'responsavel': dict(responsavel) if responsavel else None,
        'titular': dict(titular) if titular else None,
        'dependentes': [dict(dep) for dep in dependentes]
    } if venda else None

def get_email_user(email, database_path=None):
    """
    Obtém o email de um usuário específico.
    """
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
        SELECT email FROM usuarios WHERE email = ?
    """, (email,))
    
    resultado = cur.fetchone()
    
    conn.close()

    return resultado['email'] if resultado else None

def get_propostas(database_path=None):

    try:
        # Estabelece a conexão com o banco de dados
        conn = get_db_connection(database_path)
        cur = conn.cursor()

        # Executa a consulta SQL
        cur.execute("""
        SELECT numero_proposta FROM venda WHERE exportado = 0 AND numero_contrato IS NULL
        """)

        # Obtém os nomes das colunas
        columns = [description[0] for description in cur.description]

        # Converte o resultado em uma lista de dicionários
        vendas = [dict(zip(columns, row)) for row in cur.fetchall()]
        
        conn.close()
        print("vendas:", vendas)
        return vendas

    
    except Exception as e:
        return str(e)
    
def get_export(numero_proposta, database_path=None):
    print("iniciando obtenção de dados do siccada para exportaçõa\n proposta recebida para exportação:", numero_proposta)

    try:
        # Estabelece a conexão com o banco de dados
        conn = get_db_connection(database_path)
        cur = conn.cursor()

        cur.execute("""
        SELECT * from venda WHERE numero_proposta = ?
        """,(numero_proposta,))
        colunas_venda = [desc[0] for desc in cur.description]
        dados_venda = [dict(zip(colunas_venda, row)) for row in cur.fetchall()]
        
        
        cur.execute("""
        SELECT * from titulares WHERE proposta_id = ?
        """,(numero_proposta,))
        colunas_titular = [desc[0] for desc in cur.description]
        dados_titular = [dict(zip(colunas_titular, row)) for row in cur.fetchall()]
        print(dados_titular)

        
        cur.execute("""
        SELECT * from dependentes WHERE proposta_id = ?
        """,(numero_proposta,))
        colunas_dependentes = [desc[0] for desc in cur.description]
        dados_dependentes = [dict(zip(colunas_dependentes, row)) for row in cur.fetchall()]
        
        conn.close()
        

        resultado= {
            "venda": dados_venda,
            "titulares": dados_titular,
            "dependentes": dados_dependentes
        }
        print("resultado",resultado)
                

        return resultado
    except Exception as e:
        return str(e)
        
def data_dashboard_adm(data_ref,database_path=None):
    from datetime import datetime, timedelta
    hoje = datetime.now().date()

    print(f"Data de hoje: {hoje}")

    ## Vendas dos dias no gap

    conn = get_db_connection(database_path)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT * FROM venda
                WHERE data_venda BETWEEN ? AND ?
    """, (data_ref, hoje))
    dados_venda= cur.fetchall()

    ##dados necessarios: #total de vendas, total por status, tempo medio entre entrada e saida, total por corretor:
    print(dados_venda)

    # Transformar os resultados em lista de dicionários
    vendas_formatadas = []
    for row in dados_venda:
        vendas_formatadas.append(dict(row))
    
    for row in cur.fetchall():
        dados_venda.append(dict(row))
    # Estatísticas por status
    cur.execute("""
        SELECT status, COUNT(*) as quantidade, 
               SUM(valor_venda) as valor_total, 
               AVG(valor_venda) as ticket_medio
        FROM venda 
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY status
        ORDER BY quantidade DESC
    """, (data_ref, hoje))
    
    stats_status = []
    for row in cur.fetchall():
        stats_status.append(dict(row))
    
    # Total geral de vendas
    total_vendas = sum(item['quantidade'] for item in stats_status)
    
    # Vendas por corretor
    cur.execute("""
        SELECT corretor_resp, COUNT(*) as quantidade, 
               SUM(valor_venda) as valor_total
        FROM venda 
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY corretor_resp
        ORDER BY quantidade DESC
    """, (data_ref, hoje))
    
    stats_corretor = []
    for row in cur.fetchall():
        stats_corretor.append(dict(row))
    
    # Evolução temporal (vendas por dia/semana/mês)
    cur.execute("""
        SELECT DATE(data_venda) as data, 
               COUNT(*) as quantidade,
               SUM(valor_venda) as valor_total
        FROM venda 
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY DATE(data_venda)
        ORDER BY data
    """, (data_ref, hoje))
    
    evolucao_temporal = []
    for row in cur.fetchall():
        evolucao_temporal.append(dict(row))
    
    conn.close()
    #tempo medio para o processo inteiro


    ## dados para pendentes do financeiro
    

    # Preparar dados para o dashboard
    dashboard_data = {
        'periodo': {
            'inicio': data_ref,
            'fim': hoje.strftime('%Y-%m-%d')
        },
        'resumo_geral': {
            'total_vendas': total_vendas,
            'valor_total': sum(item['valor_total'] or 0 for item in stats_status),
            'ticket_medio_geral': sum(item['valor_total'] or 0 for item in stats_status) / total_vendas if total_vendas > 0 else 0
        },
        'por_status': stats_status,
        'por_corretor': stats_corretor,
        'evolucao_temporal': evolucao_temporal,
        'vendas_detalhadas': vendas_formatadas[:20]  # Limitar para não sobrecarregar
    }
    
    return dashboard_data

def data_dashboard_cobranca(data_ref,database_path=None):
    from datetime import datetime, timedelta
    hoje = datetime.now().date()

    print(f"Data de hoje: {hoje}")
    ##dados necessarios: #total de pagamentos efetuados, total de pagamentos pendentes, total de pagamentos pagos em atraso, total pago antes do vencimento, cancelamento por inadimplencia
    
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    ##pendentes e atrasadas para baixa
    cur.execute("""
    SELECT COUNT(*) FROM pagamentos
        WHERE status = 'efetuado'
        AND data_cadastro < ?
        AND data_pagamento BETWEEN ? AND ?

    """,(hoje, data_ref, hoje))
    dados_pendente = cur.fetchone()[0]
    print(dados_pendente)

    #ultimos pgs
    
    cur.execute("""
    SELECT nresponsavel, valor, status, data_pagamento from pagamentos
    WHERE data_pagamento BETWEEN ? AND ?
    ORDER BY data_pagamento	DESC
            
    """,(data_ref, hoje))

    dados_pagamentos= []
    for row in cur.fetchall():
        dados_pagamentos.append(dict(row))
    
    ##pagos antes ou depois do vencimento
    cur.execute("""
        SELECT 
    COUNT(*) as quantidade,
    SUM(valor) as valor_total,
    'no prazo' as status_pagamento
FROM pagamentos
WHERE data_pagamento BETWEEN ? AND ? 
    AND data_pagamento <= data_vencimento
""",(data_ref, hoje))
    dados_em_dia=[]
    for row in cur.fetchall():
        dados_em_dia.append(dict(row))
    print(dados_em_dia)
    
    cur.execute("""
    SELECT 
        COUNT(*) as quantidade,
        SUM(valor) as valor_total,
        'atrasado' as status_pagamento
    FROM pagamentos
    WHERE data_pagamento BETWEEN ? AND ?
        AND data_pagamento > data_vencimento;
                    """,(data_ref, hoje))
    
    dados_atraso=[]
    for row in cur.fetchall():
        dados_atraso.append(dict(row))
    print(dados_atraso)

    ##evolução de vendas mes a mes
    cur.execute("""
        SELECT 
            strftime('%Y-%m', data_pagamento) as mes_ano, 
            count(*) as quantidade,
            sum(valor) as valor_total
        FROM pagamentos
        WHERE data_pagamento BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m', data_pagamento)
        ORDER BY mes_ano;         
    """, (data_ref, hoje))
    
    mes_stats = []
    for row in cur.fetchall():
        mes_stats.append(dict(row))

    print (mes_stats)

    
    ##quantidade de cancelamentos por inadimplencia no periodo
    cur.execute("""
        SELECT COUNT(*) as quantidade_cancelamento
                FROM beneficiarios
                WHERE dExclusao BETWEEN ? AND ? 
                AND sMotivoCancelamentoTIT = '4.0'

    """, (data_ref, hoje))
    cancelamentos = cur.fetchone()


    total_faturado= sum(item['valor_total']or 0 for item in mes_stats)
    total_pagamentos= sum(item['quantidade']or 0 for item in mes_stats)
    dashboard_data = {
        'periodo': {
            'inicio': data_ref,
            'fim': hoje.strftime('%Y-%m-%d')
        },
        'resumo_geral': {
            'total_pagamentos': total_pagamentos,
            'valor_total': total_faturado,
            'ticket_medio_geral': total_faturado / total_pagamentos if total_pagamentos > 0 else 0
        },
        'por_status': 'stats_status',
        'pagamentos': dados_pagamentos[:10],
        'evolucao_temporal': 'evolucao_temporal',
        'pgts_atrasados': dados_atraso,
        'pgts_em_dia': dados_em_dia, # Limitar para não sobrecarregar
        'inadimplencia': cancelamentos['quantidade_cancelamento'],
        'pendentes': dados_pendente
    }
    
    return dashboard_data
    
def data_dashboard_corretor(data_ref, corretor_resp, database_path=None):
    from datetime import datetime, timedelta
    hoje = datetime.now().date()

    print(f"Data de hoje: {hoje}")

    ## Vendas dos dias no gap

    conn = get_db_connection(database_path)
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM venda
                WHERE data_venda BETWEEN ? AND ?
                AND corretor_resp = ?
    """, (data_ref, hoje, corretor_resp))
    dados_venda= cur.fetchall()

    ##dados necessarios: #total de vendas, total por status, tempo medio entre entrada e saida, total por corretor:
    print(dados_venda)

    # Transformar os resultados em lista de dicionários
    vendas_formatadas = []
    for row in dados_venda:
        vendas_formatadas.append(dict(row))
    
    for row in cur.fetchall():
        dados_venda.append(dict(row))
    # Estatísticas por status
    cur.execute("""
        SELECT status, COUNT(*) as quantidade, 
               SUM(valor_venda) as valor_total, 
               AVG(valor_venda) as ticket_medio
        FROM venda 
        WHERE data_venda BETWEEN ? AND ?
        AND corretor_resp = ?
        GROUP BY status
        ORDER BY quantidade DESC
    """, (data_ref, hoje, corretor_resp))
    
    stats_status = []
    for row in cur.fetchall():
        stats_status.append(dict(row))
    
    # Total geral de vendas
    total_vendas = sum(item['quantidade'] for item in stats_status)
    
    # Vendas por corretor
    cur.execute("""
        SELECT corretor_resp, COUNT(*) as quantidade, 
               SUM(valor_venda) as valor_total
        FROM venda 
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY corretor_resp
        ORDER BY quantidade DESC
    """, (data_ref, hoje))
    
    stats_corretor = []
    for row in cur.fetchall():
        stats_corretor.append(dict(row))
    
    # Evolução temporal (vendas por dia/semana/mês)
    cur.execute("""
        SELECT DATE(data_venda) as data, 
               COUNT(*) as quantidade,
               SUM(valor_venda) as valor_total
        FROM venda 
        WHERE data_venda BETWEEN ? AND ?
        AND corretor_resp = ?
        GROUP BY DATE(data_venda)
        ORDER BY data
    """, (data_ref, hoje, corretor_resp))
    
    evolucao_temporal = []
    for row in cur.fetchall():
        evolucao_temporal.append(dict(row))
    
    conn.close()
    #tempo medio para o processo inteiro


    ## dados para pendentes do financeiro
    

    # Preparar dados para o dashboard
    dashboard_data = {
        'periodo': {
            'inicio': data_ref,
            'fim': hoje.strftime('%Y-%m-%d')
        },
        'resumo_geral': {
            'total_vendas': total_vendas,
            'valor_total': sum(item['valor_total'] or 0 for item in stats_status),
            'ticket_medio_geral': sum(item['valor_total'] or 0 for item in stats_status) / total_vendas if total_vendas > 0 else 0
        },
        'por_status': stats_status,
        'por_corretor': stats_corretor,
        'evolucao_temporal': evolucao_temporal,
        'vendas_detalhadas': vendas_formatadas[:20]  # Limitar para não sobrecarregar
    }
    
    return dashboard_data

def data_dashboard_vendas(data_ref, database_path=None):
    from datetime import datetime, timedelta
    hoje = datetime.now().date()

    print(f"Data de hoje: {hoje}")

    ## Vendas dos dias no gap

    conn = get_db_connection(database_path)
    cur = conn.cursor()


    ## selecionar o tipo de produto
    cur.execute(""" 
        SELECT tipo_produto, COUNT(*) as quantidade FROM venda
                WHERE data_venda BETWEEN ? AND ?
                GROUP BY tipo_produto
""",(data_ref, hoje))
    tipo_produto = []
    for row in cur.fetchall():
        tipo_produto.append(dict(row))
        print(tipo_produto)
    
    ##dados de vendas por corretor
    cur.execute("""
        SELECT corretor_resp, COUNT(*) as quantidade, 
               SUM(valor_venda) as valor_total
        FROM venda 
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY corretor_resp
        ORDER BY quantidade DESC
    """, (data_ref, hoje))
    
    stats_corretor = []
    for row in cur.fetchall():
        stats_corretor.append(dict(row))

    ##VALORES
    cur.execute("""
        SELECT status, COUNT(*) as quantidade, 
               SUM(valor_venda) as valor_total, 
               AVG(valor_venda) as ticket_medio
        FROM venda 
        WHERE data_venda BETWEEN ? AND ?
        GROUP BY status
        ORDER BY quantidade DESC
    """, (data_ref, hoje))
    
    stats_status = []
    for row in cur.fetchall():
        stats_status.append(dict(row))
    
    # Total geral de vendas
    total_vendas = sum(item['quantidade'] for item in stats_status)

    ## dados de evolução temporal
    cur.execute("""
        SELECT strftime('%Y-%m', data_venda), SUM(valor_venda) FROM venda
                WHERE data_venda BETWEEN ? AND ?
                GROUP BY strftime('%Y-%m', data_venda)
                ORDER BY strftime('%Y-%m', data_venda)
            """,(data_ref, hoje))
    evolucao_temporal = []
    for row in cur.fetchall():
        evolucao_temporal.append(dict(row))
    
    ##ultimas vendas
    cur.execute("""
        SELECT * FROM venda                
                WHERE data_venda BETWEEN ? AND ?
                ORDER BY data_venda DESC LIMIT 10
        """,(data_ref, hoje))
    ultimas_vendas = []
    for row in cur.fetchall():
        ultimas_vendas.append(dict(row))
    
    ##total de vidas no periodo
    cur.execute("""
        SELECT SUM(vidas) as total_vidas FROM venda
                WHERE data_venda BETWEEN ? AND ?
        """,(data_ref, hoje))
    total_vidas= cur.fetchone()
    cur.close()

    dashboard_data = {
        'periodo': {
            'inicio': data_ref,
            'fim': hoje.strftime('%Y-%m-%d')
        },
        'resumo_geral': {
            'total_vendas': total_vendas,
            'valor_total': sum(item['valor_total'] or 0 for item in stats_status),
            'ticket_medio_geral': sum(item['valor_total'] or 0 for item in stats_status) / total_vendas if total_vendas > 0 else 0
        },
        'por_corretor': stats_corretor,
        'evolucao_temporal': evolucao_temporal,
        'vendas_detalhadas': ultimas_vendas[:20]  # Limitar para não sobrecarregar
    }
    print(dashboard_data)
    return dashboard_data

def atualiza_atrasos(database_path=None):
    from datetime import datetime
    from flask import current_app
    import sqlite3

    if database_path is None:
        database_path = current_app.config.get('DATABASE', 'MHV_DB.db')

    conn = sqlite3.connect(database_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    hoje = datetime.now().date()
    print(f"Data de hoje: {hoje}")

    limites = {
        'Enviado ao cadastro': 1,
        'entrevista online enviada': 2,
        'entrevista agendada': 7,
        'enviado para financeiro': 3,
        'analise de declaração': 2,
        'geração de kit': 1,
        'em pendencia': 10,
        'boleto emitido': 1,
    }

    cur.execute("""
        SELECT id, status, data_att_fase FROM venda 
        WHERE status NOT IN ('venda cancelada', 'contrato finalizado')
    """)

    rows = cur.fetchall()
    total_atrasadas = 0
    total_atualizadas = 0

    for row in rows:
        venda_proposta = row['id']
        status = (row['status'] or '').lower()
        data_atualizacao = row['data_att_fase']

        if not data_atualizacao:
            continue

        try:
            # Detecta formato de data
            if ' ' in data_atualizacao:
                data_atualizacao = datetime.fromisoformat(data_atualizacao).date()
            else:
                data_atualizacao = datetime.strptime(data_atualizacao, '%Y-%m-%d').date()

            dias = (hoje - data_atualizacao).days
            limite = limites.get(status)

            if limite is None:
                print(f"ℹ️ Status '{status}' sem limite definido, ignorando...")
                continue

            print(f"Venda {venda_proposta}: {dias} dias desde atualização (limite={limite})")

            if dias > limite:
                cur.execute("UPDATE venda SET em_atraso = ? WHERE id = ?", (1, venda_proposta))
                total_atrasadas += 1
            else:
                cur.execute("UPDATE venda SET em_atraso = ? WHERE id = ?", (0, venda_proposta))
                total_atualizadas += 1

        except Exception as e:
            print(f"❌ Erro ao processar venda {venda_proposta}: {e}")

    conn.commit()
    conn.close()

    print(f"✅ Atualização concluída: {total_atrasadas} atrasadas, {total_atualizadas} dentro do prazo.")

def get_corretoras_cnt(nome_corretora, data_ref, data_entrada, database_path=None):
    """
    Retorna um dicionário:
      { 'resultados_dic': [ {linha1}, {linha2}, ... ], 'corretora': nome_corretora }
    Aceita data_ref/data_entrada como date/datetime/str.
    """
    from datetime import date, datetime

    def _to_date_str(d):
        if d is None:
            return None
        if isinstance(d, datetime):
            return d.date().strftime('%Y-%m-%d')
        if isinstance(d, date):
            return d.strftime('%Y-%m-%d')
        return str(d)
    
    dados_corretora= get_extend_corretoras_ext(nome_corretora)
    vitalicia = dados_corretora.get('vitalicia')
    print (vitalicia)

    data_ref_s = _to_date_str(data_ref)
    data_entrada_s = _to_date_str(data_entrada)

    nome_corretora = (nome_corretora or '').strip()
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    try:
        resultados = []
        if nome_corretora.lower() in ('todas', ''):
            corretoras = get_corretoras_ext(database_path)
            if not corretoras:
                resultados = []
            else:
                placeholders = ','.join('?' for _ in corretoras)
                query = f"""
                     SELECT v.*
            FROM venda v
            WHERE v.corretor_resp IN ({placeholders})
              AND v.data_venda BETWEEN ? AND ?
              AND EXISTS (
                  SELECT 1 
                  FROM beneficiarios o 
                  WHERE o.sNumeroCNT = v.numero_contrato 
                  AND o.sMotivoCancelamentoTIT IS NULL
              )
                """
                params = tuple(corretoras) + (data_entrada_s, data_ref_s)
                cur.execute(query, params)
                resultados = cur.fetchall()

        elif vitalicia:
            query = f"""
                    SELECT v.*
            FROM venda v
            WHERE v.corretor_resp = '{nome_corretora}'
              AND EXISTS (
                  SELECT 1 
                  FROM beneficiarios o 
                  WHERE o.sNumeroCNT = v.numero_contrato 
                  AND o.sMotivoCancelamentoTIT IS NULL)
                """
            cur.execute(query)
            resultados = cur.fetchall()

        # converter resultados para lista de dicts
        resultados_list = []
        if resultados:
            # se cursor tiver descrição e rows forem tuplas, usar zip; sqlite3.Row -> dict(row) funciona
            col_names = [d[0] for d in cur.description] if cur.description else []
            for row in resultados:
                if hasattr(row, 'keys'):
                    resultados_list.append(dict(row))
                else:
                    resultados_list.append(dict(zip(col_names, row)))

        return {'resultados_dic': resultados_list, 'corretora': nome_corretora or 'Todas'}
    finally:
        cur.close()
        conn.close()

def get_corretoras_ext(database_path=None):
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    # usa 1/0 para booleano no sqlite
    cur.execute("SELECT nome_corretora FROM corretora_ext WHERE corretora_ativa = 1")
    corretora = cur.fetchall()
    cur.close()
    conn.close()
            
    return corretora

def get_extend_corretoras_ext(corretora, database_path=None):
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    
    if corretora == 'Todas':
        cur.execute("SELECT * FROM corretora_ext WHERE corretora_ativa = 1")
    else:
        cur.execute("SELECT * FROM corretora_ext WHERE nome_corretora = ? AND corretora_ativa = 1", (corretora,))
    
    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Se encontrou resultados, retorna o PRIMEIRO como dicionário
    if rows:
        if hasattr(rows[0], 'keys'):  # Se já é sqlite3.Row (que se comporta como dict)
            return dict(rows[0])      # Converte para dict normal
        else:                         # Se é tupla
            col_names = [description[0] for description in cur.description]
            return dict(zip(col_names, rows[0]))
    
    # Retorna dict vazio se não encontrou
    return {}

def cadastrar_corretora(dados, database_path=None):
    print(dados)
    from datetime import datetime
    nome= dados.get('nome')
    cnpj= dados.get('cnpj')
    parcela1= dados.get('parcela1')
    parcela2= dados.get('parcela2')
    parcela3= dados.get('parcela3')
    vitalicia= dados.get('vitalicia')
    data_cadastro = datetime.now().strftime('%Y-%m-%d')
    corretora_ativa= True
    #data_cadastro = dados.get('data_cadastro')
    
    print(f"nome:{nome},cnpj{cnpj},data:{data_cadastro}")

    if data_cadastro:
            from datetime import datetime
            data_cadastro = datetime.now().strftime('%Y-%m-%d')
            try:
                conn= get_db_connection(database_path)
                cur= conn.cursor()
                print("tentando acessar os dados para escrecer no banco")
                cur.execute("""
                INSERT INTO corretora_ext(nome_corretora,data_cadastro,corretora_ativa,cnpj, parcela1,parcela2,parcela3,vitalicia)
                            VALUES(?,?,?,?,?,?,?,?)
                """, (nome,data_cadastro,corretora_ativa,cnpj, parcela1,parcela2,parcela3, vitalicia))
                conn.commit()
                conn.close()
                return True
            except Exception as e:
                print(f"Erro ao cadastrar corretora: {e}")
                return False
    
def user_preference(preferencia,user_id, database_path= None):
    conn= get_db_connection(database_path)
    cur= conn.cursor()
    try:    
        cur.execute("""
            UPDATE usuarios SET preferencias_wpp = ? WHERE id = ?;
        """,(preferencia, user_id))

        conn.commit()
        conn.close()

    except Exception as e:
        print("erro:",e)

def get_user_preference(user_id):
     conn = get_db_connection()
     cur = conn.cursor()
     cur.execute("SELECT preferencias_wpp FROM usuarios WHERE id = ?", (user_id,))
     result = cur.fetchone()
     conn.close()
        
     preferencia = result[0] if result and result[0] else None
     
     return preferencia
        
def get_relatorio_cancelamento_boletos(data_inicial, data_final, database_path=None):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            WITH validos AS (
                SELECT sNumeroCNT
                FROM beneficiarios
                GROUP BY sNumeroCNT
                HAVING SUM(
                    CASE 
                        WHEN 
                            date(substr(dExclusaoUSR, 7, 4) || '-' || 
                                 substr(dExclusaoUSR, 4, 2) || '-' || 
                                 substr(dExclusaoUSR, 1, 2))
                            BETWEEN date(?) AND date(?)
                            AND sDescricaoCancTit <> 'Inadimpl?cia'
                        THEN 0 ELSE 1
                    END
                ) = 0
            ),
            primeiro_registro AS (
                SELECT sNumeroCNT,
                       sCodigoUSR,
                       sNomeUSR,
                       '',
                       cPrecoPRD,
                       sDescricaoCancUsu,
                       dExclusao,
                       dExclusaoUSR,
                       sDescricaoCancTit AS cancelamentos,
                       ROW_NUMBER() OVER (PARTITION BY sNumeroCNT ORDER BY sNumeroCNT DESC) AS rn
                FROM beneficiarios
                WHERE sNumeroCNT IN (SELECT sNumeroCNT FROM validos)
            )
            SELECT sNumeroCNT,
                   sCodigoUSR,
                   sNomeUSR,
                   '',
                   cPrecoPRD,
                   sDescricaoCancUsu,
                   dExclusao,
                   dExclusaoUSR,
                   cancelamentos
            FROM primeiro_registro
            WHERE rn = 1;
        """, (data_inicial, data_final))
        
        rows = cur.fetchall()
        return rows
        
    except Exception as e:
        print(f"Erro na consulta: {e}")
        return []
    finally:
        # Garante que a conexão será fechada
        cur.close()
        conn.close()

def criar_tabela_cancelar_boleto(dados, database_path=None):
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    
    try:
        # 1️⃣ Cria a tabela caso não exista
        cur.execute("""
            CREATE TABLE IF NOT EXISTS boletos_a_cancelar (
                sNumeroCNT TEXT PRIMARY KEY,
                sCodigoUSR TEXT,
                sNomeUSR TEXT,
                campo_vazio TEXT,
                cPrecoPRD REAL,
                sDescricaoCancUsu TEXT,
                dExclusao TEXT,
                dExclusaoUSR TEXT,
                cancelamentos TEXT,
                pago BOOLEAN DEFAULT 0,
                update_date TEXT
            );
        """)

        # 2️⃣ Insere registros sem duplicar
        cur.executemany("""
            INSERT OR IGNORE INTO boletos_a_cancelar (
                sNumeroCNT, sCodigoUSR, sNomeUSR, campo_vazio,
                cPrecoPRD, sDescricaoCancUsu, dExclusao, dExclusaoUSR, cancelamentos
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, dados)

        conn.commit()
        print(f"{len(dados)} registros processados com sucesso.")
        
    except Exception as e:
        print(f"Erro ao criar tabela: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def get_cancelamentos(numero_contato, data_inicial, data_final, database_path=None):
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    
    try:
        if not numero_contato:
            cur.execute("""
                SELECT * FROM boletos_a_cancelar
                WHERE date(substr(dExclusaoUSR, 7, 4) || '-' || 
                          substr(dExclusaoUSR, 4, 2) || '-' || 
                          substr(dExclusaoUSR, 1, 2))
                BETWEEN date(?) AND date(?)
            """, (data_inicial, data_final))
            dados = cur.fetchall()
        else:
            # CORREÇÃO: Use parâmetros em vez de f-string
            cur.execute("""
                SELECT * FROM boletos_a_cancelar
                WHERE sNumeroCNT = ?
            """, (numero_contato,))
            dados = cur.fetchone()
            
        return dados
        
    except Exception as e:
        print(f"Erro na consulta: {e}")
        return None
    finally:
        cur.close()
        conn.close()

def alterar_registro_cancelamento(numero_contrato, database_path=None):
    print("Tentando alterar info de registro")
    print('Valor do contrato:', numero_contrato)
    
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    
    try:
        hoje = datetime.now().date()
        
        # CORREÇÃO: Use parâmetros em vez de f-string
        cur.execute("""
            UPDATE boletos_a_cancelar 
            SET pago = 1, update_date = ?
            WHERE sNumeroCNT = ?
        """, (str(hoje), numero_contrato))
        
        conn.commit()
        print("Registro atualizado com sucesso!")
        
    except Exception as e:
        print(f"Erro ao atualizar registro: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def delete_registros_antigos(database_path=None, limite=7):
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    
    try:
        data_limite = (datetime.now() - timedelta(days=limite)).date()
        
        cur.execute("""
            DELETE FROM boletos_a_cancelar 
            WHERE update_date < ?
        """, (str(data_limite),))
        
        conn.commit()
        print(f"Registros antigos anteriores a {data_limite} removidos.")
        
    except Exception as e:
        print(f"Erro ao deletar registros: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def get_idades(idade, plano, database_path=None):
    print("dados recebidos: ", idade, plano)

    conn = get_db_connection(database_path)
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT pp.valor
            FROM precos_plano pp
            INNER JOIN planos p ON pp.plano_id = p.id
            INNER JOIN faixas_etarias f ON pp.faixa_id = f.id
            WHERE LOWER(p.nome_plano) = LOWER(?)
              AND ? BETWEEN f.idade_min_ref AND f.idade_max_ref;
        """, (plano, idade))

        row = cur.fetchone()
        return row["valor"] if row else None

    finally:
        conn.close()

def listar_planos(database_path=None):

    conn = get_db_connection(database_path)
    cur = conn.cursor()
    try:
        cur.execute("""
        SELECT nome_plano from planos
    """) 
        
        nome= cur.fetchall()

        return nome

    except Exception as e:
        print(f"Erro na consulta: {e}")
        return []
    finally:
        # Garante que a conexão será fechada
        cur.close()
        conn.close()

def get_titular_dependente(cpf,database_path= None):
   
    conn = get_db_connection(database_path)
    # IMPORTANTE: Configurar para retornar dicionários
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    print("cpf recebido: ", cpf)

    try:
        # Buscar como titular
        cur.execute("SELECT * FROM titulares WHERE cpf = ?", (cpf,))
        resultado = cur.fetchone()
        
        if resultado:
            # Converter Row para dicionário e adicionar tipo_pessoa
            resultado_dict = dict(resultado)
            resultado_dict['tipo_pessoa'] = 'titular'
            return resultado_dict
        else:
            # Buscar como dependente
            cur.execute("SELECT * FROM dependentes WHERE cpf = ?", (cpf,))
            resultado = cur.fetchone()
            
            if resultado:
                resultado_dict = dict(resultado)
                resultado_dict['tipo_pessoa'] = 'dependente'
                return resultado_dict
            
            return None
            
    except Exception as e:
        print(f"Erro ao buscar pessoa: {e}")
        return None
    finally:
        conn.close()

# No arquivo enfermagem.py, remova a linha problemática e defina a função localmente:

def criar_tabelas_patologias(database_path):
    """Cria as tabelas necessárias para o sistema de patologias"""
    
    conn = sqlite3.connect(database_path)
    cursor = conn.cursor()
    
    # Tabela de patologias MODIFICADA - apenas um registro por pessoa
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patologias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titular_id INTEGER NULL,
            dependente_id INTEGER NULL,
            tipo_pessoa TEXT NOT NULL,
            
            -- Todas as doenças em um único campo (JSON)
            patologias_json TEXT NOT NULL DEFAULT '{}',
            
            -- CID principal (o mais grave)
            cid_principal TEXT,
            
            -- Risco calculado
            grau_risco TEXT,
            pontuacao_risco INTEGER DEFAULT 0,
            
            -- Data
            data_declaracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Constraints
            CHECK (
                (titular_id IS NOT NULL AND dependente_id IS NULL) OR 
                (titular_id IS NULL AND dependente_id IS NOT NULL)
            )
        )
    ''')
    
    # Criar índices
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_patologias_titular ON patologias(titular_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_patologias_dependente ON patologias(dependente_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_patologias_risco ON patologias(grau_risco)')
    
    conn.commit()
    conn.close()
    print("✅ Tabelas criadas com sucesso!")

def get_entrevista_info(id, tipo_pessoa, database_path=None):
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    print("dados recebidos: ", tipo_pessoa, id)

    if tipo_pessoa.lower() == 'titular':
        cur.execute("""
            SELECT * FROM patologias WHERE titular_id = ?
        """, (id,))
    else:
        cur.execute("""
            SELECT * FROM patologias WHERE dependente_id = ?
        """, (id,))
    
    # Se você configurou row_factory como sqlite3.Row, pode usar:
    dados = cur.fetchall()
    
    # Debug: mostrar o que retornou
    print(f"DEBUG - Total de registros encontrados: {len(dados)}")
    
    if not dados:
        conn.close()
        return None
    
    # Converter para lista de dicionários
    resultados = []
    for row in dados:
        # Se row_factory é sqlite3.Row, converta para dict
        if hasattr(row, 'keys'):
            resultados.append(dict(row))
        else:
            # Se for tupla, precisamos saber os nomes das colunas
            colunas = [desc[0] for desc in cur.description]
            resultados.append(dict(zip(colunas, row)))
    
    conn.close()
    
    # Retornar o primeiro resultado (se houver)
    if resultados:
        # Debug: mostrar primeiro resultado
        print(f"DEBUG - Primeiro resultado: {resultados[0]}")
        return resultados[0]  # Retorna apenas o primeiro registro
    
    return None

def alterar_cnt(proposta, database_path=None):
    conn = get_db_connection(database_path)
    cur=conn.cursor()
    try:
        cur.execute("""
            UPDATE venda SET status= 'analise de declaração' WHERE id= ?;
        """,(proposta,))
        conn.commit()
        conn.close()
    except Exception as e:
        print ("erro: ", e)

def get_credenciadas(buscar,database_path= None):
    conn= get_db_connection(database_path)
    cur= conn.cursor()
    if buscar:
        cur.execute("""
        SELECT * FROM clinicas
            WHERE nome LIKE ?
    """, (f"%{buscar}%",))
    else:
        cur.execute("""
            SELECT * FROM clinicas
        """)
    dados= cur.fetchall()

    return dados

def post_amatiss_aut(data, database_path=None):
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    app_user_id= data.get('app_user_id')
    
    try:
        resultado= verificar_last_auth(app_user_id)
        
        if resultado:
            # UPDATE
            registro_id = resultado[0]
            cur.execute("""
                UPDATE autorizacoes 
                SET token_auth = ?,
                    time_stamp_auth = ?,
                    nome_beneficiario = ?,
                    card_beneficiario = ?,
                    latitude_usuario = ?,
                    longitude_usuario = ?,
                    updated_at = datetime('now')
                WHERE id = ?
            """, (
                data.get('token_auth'),
                data.get('time_stamp_auth'),
                data.get('nome_beneficiario'),
                data.get('card_beneficiario'),
                data.get('latitude_usuario'),
                data.get('longitude_usuario'),
                registro_id
            ))
            print(f"UPDATE realizado no registro ID: {registro_id}")
        else:
            # INSERT
            cur.execute("""
                INSERT INTO autorizacoes 
                (app_user_id, token_auth, time_stamp_auth, nome_beneficiario, 
                 card_beneficiario, latitude_usuario, longitude_usuario)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                data.get('app_user_id'),
                data.get('token_auth'),
                data.get('time_stamp_auth'),
                data.get('nome_beneficiario'),
                data.get('card_beneficiario'),
                data.get('latitude_usuario'),
                data.get('longitude_usuario')
            ))
            print("INSERT realizado - novo registro criado")
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Erro ao processar autorização: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def verificar_last_auth(app_user_id, database_path=None):
    """Função apenas para verificação (mantida para compatibilidade)"""
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id FROM autorizacoes
        WHERE app_user_id = ? 
        AND datetime(created_at) >= datetime('now', '-30 minutes') 
        AND amatiss_id IS NULL
        ORDER BY created_at DESC
        LIMIT 1
    """, (app_user_id,))
    
    resultado = cur.fetchone()
    conn.close()
    
    return resultado  # True se existe, False se não

def get_info_cancelamento(proposta_id, database_path=None):
    conn = get_db_connection(database_path)
    cur = conn.cursor()

    cur.execute("""
            SELECT vidas, corretor_resp, valor_venda FROM venda
                WHERE numero_proposta= ?
    """, (proposta_id,))

    dados = cur.fetchone()
    print("dados recebidos", dados)
    dados= dict(dados) if dados else None
    return dados


def get_last_proposta(corretor_resp, plano_tipo, database_path=None):

    """Retorna a última `numero_proposta` para um `corretor_resp`,
    ignorando propostas cujo `numero_proposta` começa com letra.

    A consulta ordena pelo valor numérico de `numero_proposta` (maior primeiro)
    e retorna o primeiro resultado. Usa `substr` para checar o primeiro
    caractere e evitar valores que comecem por A-Z ou a-z.
    """
    conn = get_db_connection(database_path)
    cur = conn.cursor()
    print("dados recebidos: ", corretor_resp, plano_tipo)

    try:
        # Se plano_tipo foi fornecido, filtra por ele
        if plano_tipo and plano_tipo.strip():
            query = """
                SELECT numero_proposta 
                FROM venda 
                WHERE 
                    corretor_resp = ? 
                    AND tipo_contrato = ?
                    AND NOT (
                        (substr(numero_proposta, 1, 1) BETWEEN 'A' AND 'Z')
                        OR (substr(numero_proposta, 1, 1) BETWEEN 'a' AND 'z')
                    )
                ORDER BY CAST(numero_proposta AS INTEGER) DESC
                LIMIT 1
            """
            params = (corretor_resp, plano_tipo,)
        else:
            # Sem filtro de plano, busca a última proposta do corretor
            query = """
                SELECT numero_proposta
                FROM venda
                WHERE corretor_resp = ?
                  AND NOT (
                      (substr(numero_proposta, 1, 1) BETWEEN 'A' AND 'Z')
                      OR (substr(numero_proposta, 1, 1) BETWEEN 'a' AND 'z')
                  )
                ORDER BY CAST(numero_proposta AS INTEGER) DESC
                LIMIT 1
            """
            params = (corretor_resp,)
        
        cur.execute(query, params)
        row = cur.fetchone()
        
        if row:
            numero = row['numero_proposta']
            print(f"✅ Última proposta encontrada: {numero}")
            return numero
        else:
            print(f"⚠️ Nenhuma proposta encontrada para {corretor_resp}")
            return None
            
    except Exception as e:
        print(f"❌ Erro ao buscar última proposta: {e}")
        return None
    finally:
        conn.close()

def post_autorizar_tiss(data, database_path=None):
    """
    Insere/Atualiza autorização TISS
    """
    import json
    
    try:
        # Se data for string, converter para dicionário
        if isinstance(data, str):
            print(f"Convertendo string para dict: {data[:100]}...")
            try:
                data = json.loads(data)
            except json.JSONDecodeError as e:
                print(f"Erro ao decodificar JSON: {e}")
                # Tenta limpar a string
                data = data.replace("'", '"')
                data = json.loads(data)
        
        print(f"Dados recebidos (tipo: {type(data)}): {data}")
        
        # OS DADOS ESTÃO DENTRO DE 'aut_data'!
        # Extrair os dados reais
        aut_data = data.get('aut_data')
        if not aut_data:
            print("Erro: Dados não contêm 'aut_data'")
            return False
        
        print(f"Dados da autorização: {aut_data}")
        
        conn = get_db_connection(database_path)
        cur = conn.cursor()
        
        # Agora acesse os dados de aut_data
        token = aut_data.get('user_token')
        id_clinica = aut_data.get('id_clinica', '')
        nome_clinica = aut_data.get('nome_clinica', '')
        
        # Serviços está dentro de aut_data
        servicos = aut_data.get('servicos', [])
        
        # Pegar código e descrição do primeiro serviço
        codigo_tuss = ''
        exame = ''
        
        if servicos and len(servicos) > 0:
            primeiro_servico = servicos[0]
            codigo_tuss = primeiro_servico.get('codigo', '')
            exame = primeiro_servico.get('descricao', '')
        
        auth_clinica = 'auth'
        
        print(f"Token: {token}")
        print(f"ID Clínica: {id_clinica}")
        print(f"Nome Clínica: {nome_clinica}")
        print(f"Código TUSS: {codigo_tuss}")
        print(f"Exame: {exame}")
        
        # Verificar se token existe
        if not token:
            print("Erro: Token não encontrado")
            return False
        
        # Primeiro verificar se a autorização já existe
        autorizacao_existe= verificar_last_auth(token)
        if autorizacao_existe:
            # UPDATE
            print("atualizando tabela")
            cur.execute("""
                UPDATE autorizacoes
                SET amatiss_id = ?, 
                    clinica_id = ?, 
                    nome_clinica = ?,
                    exame_solicitado = ?, 
                    codigo_tuss = ?,
                    auth_clinica = ?,
                    updated_at = datetime('now')
                WHERE token_auth = ?
            """, (
                id_clinica,      # amatiss_id
                id_clinica,      # clinica_id
                nome_clinica,    # nome_clinica
                exame,           # exame_solicitado
                codigo_tuss,     # codigo_tuss
                auth_clinica,    # auth_clinica
                token            # WHERE token_auth
            ))
            print(f"Autorização atualizada para token: {token}")
        else:
            # INSERT
            cur.execute("""
                INSERT INTO autorizacoes (
                    token_auth, amatiss_id, clinica_id, nome_clinica,
                    exame_solicitado, codigo_tuss, auth_clinica, status_aprovacao,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDENTE', 
                         datetime('now'), datetime('now'))
            """, (
                token, id_clinica, id_clinica, nome_clinica,
                exame, codigo_tuss, auth_clinica
            ))
            print(f"Nova autorização inserida para token: {token}")
        
        conn.commit()
        cur.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"Erro em post_autorizar_tiss: {e}")
        import traceback
        traceback.print_exc()
        raise