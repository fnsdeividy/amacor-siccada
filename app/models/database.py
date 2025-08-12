import sqlite3
from flask import current_app

def get_db_connection(database_path=None):
    """
    Retorna uma conexão com o banco de dados.
    Se `database_path` for fornecido, usa esse caminho; caso contrário, usa o banco configurado no Flask.
    """
    db_path = database_path or current_app.config['DATABASE']
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

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

def salvar_venda(venda, responsavel, titular, dependentes, database_path=None):
    """
    Salva os dados da venda, responsável, titular e dependentes no banco de dados.
    Agora usa apenas proposta_id (TEXT) como referência, sem venda_id.
    """
    try:
        conn = get_db_connection(database_path)
        cur = conn.cursor()

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

        # Inserir dados do titular
        cur.execute("""
            INSERT INTO titulares (proposta_id, nome, cpf, data_nascimento, idade,grau_parentesco, cep, celular, email, estado_civil, nome_mae, nome_pai, sexo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (proposta_id, titular['nome'], titular['cpf'], titular['data_nascimento'], titular['idade'],titular['grau_parentesco'],
              titular['endereco'], titular['celular'], titular['email'], titular['estado_civil'],
              titular['nome_mae'], titular['nome_pai'], titular['sexo']))

        # Inserir dados dos dependentes
        for dependente in dependentes:
            
            cur.execute("""
                INSERT INTO dependentes (proposta_id, nome, cpf, data_nascimento, grau_parentesco, cpf_titular,nome_mae)
                VALUES (?, ?, ?, ?, ?, ?,?)
            """, (proposta_id, dependente['nome'], dependente['cpf'], dependente['data_nascimento'],
                  dependente['grau_parentesco'], dependente['cpf_titular'],dependente['mae_dependente']))

        conn.commit()
        conn.close()



    except Exception as e:
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
    print('nome enviado: ', nome)
    return nome['nome'] if nome else None

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
    """Busca informações na tabela beneficiarios"""
    try:
        conn = get_db_connection(database_path)
        cur = conn.cursor()

        cur.execute("""
            SELECT * FROM beneficiarios 
            WHERE sNumeroCNT = ? 
        """, (numero_contrato,))  

        resultado = cur.fetchone()
        return dict(resultado) if resultado else None
        
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
        
        proposta = cur.fetchone()
        
        if not proposta:
            print(f"Contrato {numero_contrato} não encontrado na tabela venda")
            return None
            
        # Busca responsável
        cur.execute("""
            SELECT * FROM responsavel 
            WHERE proposta_id = ?
        """, (proposta["numero_proposta"],))  # já acessa como dict
        
        resultado = cur.fetchone()
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

    return dados
    
    print("dados encontrados:",dados)

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
        SELECT senha FROM usuarios WHERE tipo_usuario = 'vendas' AND classe_usuario = 'supervisor'
    """, )
    resultado = cur.fetchall()
    conn.close()

    if resultado:
        return [row['senha'] for row in resultado]
    
def excluir_proposta(proposta, database_path=None):
    """
    Exclui uma proposta e todos os seus dados associados do banco de dados.
    """
    try:
        conn = get_db_connection(database_path)
        cur = conn.cursor()
        # Excluir venda
        cur.execute("DELETE FROM venda WHERE numero_proposta = ?", (proposta,))

        conn.commit()
        conn.close()
    except Exception as e:
        conn.rollback()
        conn.close()
        raise e

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