import pandas as pd
import sqlite3
import shutil
import os
import json

db_name = "MHV_DB.db"

# Função para criar a tabela beneficiarios
def criar_tabela_beneficiarios(csv_file):
    df = pd.read_csv(csv_file, delimiter=';', encoding='latin1')
    db_name = "MHV_DB.db"
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Escolha a chave única que identifica o beneficiário
    chave_unica = "sCodigoUSR"   # 🔑 troque se for outra

    # Monta dinamicamente as colunas
    cols = ",".join(df.columns)
    placeholders = ",".join(["?"] * len(df.columns))

    # Gera a parte do UPDATE (exceto a chave)
    update_stmt = ",".join([f"{col}=excluded.{col}" for col in df.columns if col != chave_unica])

    sql = f"""
    INSERT INTO beneficiarios ({cols})
    VALUES ({placeholders})
    ON CONFLICT({chave_unica}) DO UPDATE SET {update_stmt};
    """

    cursor.executemany(sql, df.values.tolist())
    conn.commit()
    conn.close()
    print("Tabela 'beneficiarios' atualizada com sucesso!")

# Nova função para criar a tabela usuarios
def criar_tabela_usuarios():
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        senha TEXT NOT NULL,
        tipo_usuario TEXT NOT NULL,
        autorizado INTEGER DEFAULT 0 CHECK(autorizado IN (0, 1))
    );
    """)

    conn.commit()
    conn.close()
    print("Tabela 'usuarios' criada com sucesso!")

def alterar():
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    cursor.execute("""
       ALTER TABLE usuarios RENAME TO usuarios_bkp;       
""")
    
    print('alterado')


def copiar_usr():
    conn= sqlite3.connect(db_name)
    cursor= conn.cursor()

    cursor.execute("""
    INSERT INTO usuarios (id, nome, cpf, email, senha, tipo_usuario, autorizado)
    SELECT id, nome, cpf, email, senha, tipo_usuario, autorizado
    FROM usuarios_bkp;
""")
    
    print('copiados')


def criar_novatab():
    conn= sqlite3.connect(db_name)
    cursor= conn.cursor()
    cursor.execute("""
    CREATE TABLE pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL, -- Relaciona com a tabela de usuários,
    ncontrato TEXT,
    nresponsavel TEXT NOT NULL,
    valor REAL NOT NULL,
    data_pagamento DATE NOT NULL,
    metodo_pagamento TEXT NOT NULL, -- Exemplo: 'PIX', 'Cartão', 'Boleto'
    descricao TEXT, -- Detalhes adicionais sobre o pagamento
    status TEXT DEFAULT 'pendente' CHECK(status IN ('efetuado', 'baixado', 'cancelado')),
    nusuario TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);""")

def criar_venda():
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_proposta TEXT NOT NULL UNIQUE,
        data_venda DATE NOT NULL,
        tipo_contrato TEXT NOT NULL,
        tipo_produto TEXT NOT NULL,
        corretor_resp TEXT NOT NULL,
        status TEXT,
        digitador varchar(50),
        valor_venda REAL NOT NULL,
        dt_cadastro DATE NOT NULL,
        taxa_inscricao REAL NOT NULL,
        iss REAL NOT NULL,
        valor_tabela REAL NOT NULL,
        numero_contrato TEXT,
        last_resp TEXT,
        vidas INTEGER NOT NULL,
        finalizado_em DATE,
        exportado INTEGER DEFAULT 0 CHECK(exportado IN (0, 1))
    );
    """)
    conn.commit()
    conn.close()
    print("Tabela 'vendas' criada com sucesso!")

def criar_responsavel():
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS responsavel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposta_id TEXT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL,
        data_nascimento DATE NOT NULL,
        cep TEXT NOT NULL,
        celular TEXT NOT NULL,
        email TEXT NOT NULL,
        estado_civil TEXT NOT NULL,
        FOREIGN KEY (proposta_id) REFERENCES venda (numero_proposta) ON DELETE CASCADE
    );
    """)
    conn.commit()
    conn.close()
    print("Tabela 'responsaveis' criada com sucesso!")

def criar_titular():
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS titulares")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS titulares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposta_id TEXT NOT NULL UNIQUE,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        data_nascimento DATE NOT NULL,
        idade INTEGER NOT NULL,
        cep TEXT NOT NULL,
        celular TEXT NOT NULL,
        email TEXT NOT NULL,
        estado_civil TEXT NOT NULL,
        nome_mae TEXT NOT NULL,
        nome_pai TEXT,
        sexo TEXT NOT NULL,
        FOREIGN KEY (proposta_id) REFERENCES venda (numero_proposta) ON DELETE CASCADE
    );
    """)
    conn.commit()
    conn.close()
    print("Tabela 'titulares' criada com sucesso!")

def criar_dependente():
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dependentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposta_id TEXT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL,
        data_nascimento DATE NOT NULL,
        grau_parentesco TEXT NOT NULL,
        cpf_titular TEXT NOT NULL,
        FOREIGN KEY (proposta_id) REFERENCES venda (numero_proposta) ON DELETE CASCADE,
        FOREIGN KEY (cpf_titular) REFERENCES titulares (cpf) ON DELETE CASCADE
    );
    """)
    conn.commit()
    conn.close()
    print("Tabela 'dependentes' criada com sucesso!")

def criar_saldo():
    df = pd.read_csv(csv_file, delimiter=';', encoding='latin1')

    conn= sqlite3.connect(db_name)
    cursor= conn.cursor()
    cursor.execute("""
    CREATE TABLE saldo_benef (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_contrato TEXT NOT NULL,
    nome_responsavel TEXT NOT NULL,
    parcela_abt REAL NOT NULL,
    valor_total REAL NOT NULL
    );""")
    
    df.to_sql("saldo_benef", conn, if_exists='replace', index=False)
    conn.commit()
    conn.close()
    print("Tabela 'beneficiarios' criada e populada com sucesso!")

def resetar_tabelas():
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    cursor.execute("PRAGMA foreign_keys = OFF")

    cursor.execute("DROP TABLE IF EXISTS dependentes")
    cursor.execute("DROP TABLE IF EXISTS titulares")
    cursor.execute("DROP TABLE IF EXISTS responsavel")
    cursor.execute("DROP TABLE IF EXISTS venda")

    cursor.execute("PRAGMA foreign_keys = ON")

    conn.commit()
    conn.close()
    print("Tabelas 'dependentes' e 'titulares' removidas com sucesso.")

def backup_and_replace_db(db_path, backup_path):
    # Cria backup do banco atual
    shutil.copy2(db_path, backup_path)
    print(f"Backup criado em: {backup_path}")

    # Remove o banco original
    os.remove(db_path)
    print(f"Banco original removido: {db_path}")

    # Restaura o backup (se quiser restaurar imediatamente)
    shutil.copy2(backup_path, db_path)
    print(f"Banco restaurado a partir do backup: {db_path}")

def backup_db(db_path, backup_path):
    """
    Cria um backup simples do banco SQLite, sem alterar nada no banco original.
    """
    import shutil
    shutil.copy2(db_path, backup_path)
    print(f"Backup criado em: {backup_path}")

def backup_tabelas_especificas(origem, destino, tabelas):
    """
    Cria um novo banco SQLite contendo apenas as tabelas especificadas e seus dados.
    """
    import sqlite3
    import shutil
    # Cria uma cópia do banco original
    shutil.copy2(origem, destino)
    conn = sqlite3.connect(destino)
    cursor = conn.cursor()
    # Lista todas as tabelas do banco
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    todas = [row[0] for row in cursor.fetchall()]
    # Remove as tabelas que não estão na lista desejada
    for tabela in todas:
        if tabela not in tabelas and not tabela.startswith('sqlite_'):
            cursor.execute(f"DROP TABLE IF EXISTS {tabela}")
    conn.commit()
    conn.close()
    print(f"Backup criado em: {destino} apenas com as tabelas: {', '.join(tabelas)}")

def exportar_tabelas_para_novo_banco(origem, destino, tabelas):
    """
    Exporta apenas as tabelas especificadas e seus dados para um novo banco SQLite.
    """
    import sqlite3
    # Cria novo banco vazio
    conn_origem = sqlite3.connect(origem)
    conn_destino = sqlite3.connect(destino)
    cursor_origem = conn_origem.cursor()
    cursor_destino = conn_destino.cursor()
    for tabela in tabelas:
        # Recupera o comando de criação da tabela
        cursor_origem.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (tabela,))
        create_sql = cursor_origem.fetchone()
        if create_sql:
            cursor_destino.execute(create_sql[0])
            # Copia os dados
            cursor_origem.execute(f"SELECT * FROM {tabela}")
            rows = cursor_origem.fetchall()
            if rows:
                # Monta o insert
                n_cols = len(rows[0])
                placeholders = ','.join(['?'] * n_cols)
                cursor_destino.executemany(f"INSERT INTO {tabela} VALUES ({placeholders})", rows)
    conn_destino.commit()
    conn_origem.close()
    conn_destino.close()
    print(f"Novo banco '{destino}' criado apenas com as tabelas: {', '.join(tabelas)}")

def apagar_tabelas(tabelas, db_path):
    """
    Apaga as tabelas especificadas do banco SQLite informado.
    """
    import sqlite3
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    for tabela in tabelas:
        cursor.execute(f"DROP TABLE IF EXISTS {tabela}")
    conn.commit()
    conn.close()
    print(f"Tabelas apagadas: {', '.join(tabelas)}")

def registrar_clinicas(db_path, json_clinicas_path, json_coordenadas_path):
    # Conectar ao banco
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Criar tabelas (só se não existirem)
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS clinicas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bloco_id TEXT UNIQUE,
        nome TEXT,
        endereco TEXT,
        telefone TEXT,
        horario_funcionamento TEXT
    );

    CREATE TABLE IF NOT EXISTS coordenadas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clinica_id INTEGER,
        endereco_original TEXT,
        endereco_formatado TEXT,
        latitude REAL,
        longitude REAL,
        confianca TEXT,
        FOREIGN KEY (clinica_id) REFERENCES clinicas(id)
    );

    CREATE TABLE IF NOT EXISTS especialidades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS clinica_especialidade (
        clinica_id INTEGER,
        especialidade_id INTEGER,
        FOREIGN KEY (clinica_id) REFERENCES clinicas(id),
        FOREIGN KEY (especialidade_id) REFERENCES especialidades(id)
    );
    """)

    # Ler os arquivos JSON
    with open(json_clinicas_path, 'r', encoding='utf-8') as f:
        dados_clinicas = json.load(f)

    with open(json_coordenadas_path, 'r', encoding='utf-8') as f:
        dados_coordenadas = json.load(f)

    # Percorrer os blocos do JSON
    for bloco_id, clinica in dados_clinicas.items():
        nome = clinica.get("nome_clinica")
        endereco = clinica.get("endereco")
        telefone = clinica.get("telefone")
        horario = clinica.get("horario_funcionamento", "")
        especialidades = clinica.get("especialidades", [])

        # Inserir clínica
        cur.execute("""
            INSERT OR IGNORE INTO clinicas (bloco_id, nome, endereco, telefone, horario_funcionamento)
            VALUES (?, ?, ?, ?, ?)
        """, (bloco_id, nome, endereco, telefone, horario))

        # Pegar ID da clínica (mesmo se já existir)
        cur.execute("SELECT id FROM clinicas WHERE bloco_id = ?", (bloco_id,))
        clinica_id = cur.fetchone()[0]

        # Inserir coordenadas se existirem no outro JSON
        dados_coord = dados_coordenadas.get(bloco_id)
        if dados_coord:
            coord = dados_coord.get("coordenadas")
            if isinstance(coord, dict):  # <-- garante que não é None
                cur.execute("""
                    INSERT OR IGNORE INTO coordenadas
                    (clinica_id, endereco_original, endereco_formatado, latitude, longitude, confianca)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    clinica_id,
                    coord.get("endereco_original"),
                    coord.get("endereco_formatado"),
                    coord.get("latitude"),
                    coord.get("longitude"),
                    coord.get("confianca")
                ))
        # Inserir especialidades (removendo duplicadas)
        for nome_esp in set(especialidades):
            cur.execute("INSERT OR IGNORE INTO especialidades (nome) VALUES (?)", (nome_esp,))
            cur.execute("SELECT id FROM especialidades WHERE nome = ?", (nome_esp,))
            esp_id = cur.fetchone()[0]
            cur.execute("""
                INSERT OR IGNORE INTO clinica_especialidade (clinica_id, especialidade_id)
                VALUES (?, ?)
            """, (clinica_id, esp_id))

    # Confirmar e fechar
    conn.commit()
    conn.close()
    print("✅ Clínicas registradas com sucesso!")


import sqlite3
import pandas as pd

def criar_planos(db_path):
    import sqlite3
    import pandas as pd

    EXCEL_PATH = "Amacor_Tabela.xlsx"

    # 1. Ler Excel
    df = pd.read_excel(EXCEL_PATH)

    # 2. Normalizar valores
    def parse_val(v):
        v = str(v).strip().replace(",", ".")
        try:
            return float(v)
        except:
            return None

    df["Valor"] = df["Valor (R$)"].apply(parse_val)

    # --- LIMPEZA CRÍTICA PARA EVITAR O ERRO ---
    # Remover linhas sem nome de plano
    df = df.dropna(subset=["Plano"])

    # Remover espaços em branco
    df["Plano"] = df["Plano"].astype(str).str.strip()
    df["Categoria"] = df["Categoria"].astype(str).str.strip()
    df["Faixa Etária"] = df["Faixa Etária"].astype(str).str.strip()

    # Remover valores "nan" como string
    df = df[df["Plano"].str.lower() != "nan"]

    # 3. Conectar
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 4. Criar tabelas
    cur.execute("""
    CREATE TABLE IF NOT EXISTS planos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_plano TEXT NOT NULL,
        categoria TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS faixas_etarias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faixa TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS precos_plano (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plano_id INTEGER NOT NULL,
        faixa_id INTEGER NOT NULL,
        valor REAL,
        FOREIGN KEY (plano_id) REFERENCES planos(id),
        FOREIGN KEY (faixa_id) REFERENCES faixas_etarias(id)
    );
    """)

    # 5. Inserir planos
    df_planos = df[["Plano", "Categoria"]].drop_duplicates()

    plano_ids = {}

    for _, row in df_planos.iterrows():
        nome = row["Plano"]
        categoria = row["Categoria"]

        if not nome:
            continue

        cur.execute(
            "INSERT INTO planos (nome_plano, categoria) VALUES (?, ?)",
            (nome, categoria)
        )
        plano_ids[(nome, categoria)] = cur.lastrowid

    # 6. Inserir faixas etárias
    df_faixas = df["Faixa Etária"].drop_duplicates()
    faixa_ids = {}

    for faixa in df_faixas:
        if not faixa:
            continue
        cur.execute("INSERT INTO faixas_etarias (faixa) VALUES (?)", (faixa,))
        faixa_ids[faixa] = cur.lastrowid

    # 7. Inserir preços
    for _, row in df.iterrows():
        plano_id = plano_ids.get((row["Plano"], row["Categoria"]))
        faixa_id = faixa_ids.get(row["Faixa Etária"])
        valor = row["Valor"]

        if plano_id and faixa_id:
            cur.execute("""
                INSERT INTO precos_plano (plano_id, faixa_id, valor)
                VALUES (?, ?, ?)
            """, (plano_id, faixa_id, valor))

    conn.commit()
    conn.close()

    print("Importação concluída com sucesso!")

def criar_tabelas_patologias(database_path):
    """Cria as tabelas necessárias para o sistema de patologias"""
    
    conn = sqlite3.connect(database_path)
    cursor = conn.cursor()
    
    # Remover tabela existente (se houver)
    cursor.execute('DROP TABLE IF EXISTS patologias')
    
    # Tabela de patologias MODIFICADA - apenas um registro por pessoa
    cursor.execute('''
        CREATE TABLE patologias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titular_id INTEGER NULL UNIQUE,
            dependente_id INTEGER NULL UNIQUE,
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
    cursor.execute('CREATE INDEX idx_patologias_titular ON patologias(titular_id)')
    cursor.execute('CREATE INDEX idx_patologias_dependente ON patologias(dependente_id)')
    cursor.execute('CREATE INDEX idx_patologias_risco ON patologias(grau_risco)')
    
    conn.commit()
    conn.close()
    print("✅ Tabelas criadas com sucesso!")
if __name__ == "__main__":
    criar_tabelas_patologias(db_name)