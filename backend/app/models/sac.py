"""
SAC: registro das demandas dos beneficiários, com protocolo, e o andamento
que cada setor lança até a resposta conclusiva.

Substitui a planilha "Controle de Resolutividade – Canais de Atendimento /
SAC" (abas Registro, Indicadores e Listas). As regras de prazo e os
indicadores seguem o procedimento descrito nela (RN 623/2024).

Tabelas (criadas na primeira vez que o módulo é usado):
  sac_atendimentos  uma linha por demanda (a linha da aba Registro)
  sac_andamentos    histórico: cada atualização, encaminhamento ou mudança
                    de status, com usuário, setor e data/hora
  sac_tipos         tipos de demanda e prazo de resposta (aba Listas)
  sac_feriados      dias não úteis (aba Listas)
  sac_contador      sequencial do protocolo
"""
import os
import threading
from datetime import date, datetime, timedelta

from app import db

# Número de registro da operadora na ANS: início de todo protocolo
REGISTRO_ANS = os.environ.get('SAC_REGISTRO_ANS', '412015')

CANAIS = ['Telefone (0800)', 'Presencial', 'WhatsApp', 'E-mail', 'Chat', 'Aplicativo', 'Site / Portal']

STATUS_ANDAMENTO = 'Em andamento'
STATUS_FINAIS = ['Resolvida', 'Parcialmente resolvida', 'Não resolvida']
STATUS = [STATUS_ANDAMENTO] + STATUS_FINAIS

ESCALONAMENTOS = ['Não', 'Ouvidoria', 'NIP / ANS']
CONFIRMACOES = ['Sim', 'Não', 'Não respondeu']

# Setores que recebem e tratam demandas. A chave é o tipo_usuario do login,
# então cada usuário cai direto na fila do próprio setor.
SETORES = {
    'sac': 'SAC / Atendimento',
    'autorizacao': 'Autorização',
    'cadastro': 'Cadastro',
    'financeiro': 'Financeiro',
    'cobranca': 'Cobrança',
    'enfermagem': 'Enfermagem',
    'administrativo': 'Administrativo',
    'vendas': 'Comercial',
    'ouvidoria': 'Ouvidoria',
}

RECONTATO_DIAS = 30

# Aba Listas da planilha
TIPOS_INICIAIS = [
    ('Urgência / emergência', 0, 'Assistencial', 'RN 623, art. 12, I: resposta imediata (0 = mesmo dia)'),
    ('Autorização de procedimento (demais casos)', 5, 'Assistencial', 'RN 623, art. 12, II, a: até 5 dias úteis'),
    ('Autorização – alta complexidade (PAC) / internação eletiva', 10, 'Assistencial',
     'RN 623, art. 12, II, b: resposta em até 10 dias úteis. Os 21 dias úteis são o prazo para REALIZAR '
     'o procedimento (RN 566/2022), não de resposta'),
    ('Reembolso', 5, 'Assistencial',
     'Resposta em 5 dias úteis (confirmar). Pagamento em até 30 dias (Lei 9.656/98) não é medido aqui'),
    ('Cancelamento / exclusão de beneficiário', 0, 'Não assistencial',
     'Pedido do beneficiário tem efeito imediato (RN 561/2022): resposta imediata (0 = mesmo dia)'),
    ('Inclusão / alteração cadastral', 7, 'Não assistencial', 'RN 623, art. 11, até 7 dias úteis'),
    ('Reajuste / mensalidade', 7, 'Não assistencial', 'RN 623, art. 11, até 7 dias úteis'),
    ('Rede credenciada', 5, 'Assistencial', 'Tratada como assistencial (confirmar classificação)'),
    ('Carência / cobertura', 5, 'Assistencial', 'Tratada como assistencial (confirmar classificação)'),
    ('Outros (não assistencial)', 7, 'Não assistencial', 'RN 623, art. 11, até 7 dias úteis'),
]

# Feriados nacionais (a planilha pede para acrescentar os locais)
FERIADOS_INICIAIS = [
    ('2026-01-01', 'Confraternização Universal'), ('2026-04-03', 'Sexta-feira Santa'),
    ('2026-04-21', 'Tiradentes'), ('2026-05-01', 'Dia do Trabalho'),
    ('2026-09-07', 'Independência'), ('2026-10-12', 'Nossa Senhora Aparecida'),
    ('2026-11-02', 'Finados'), ('2026-11-15', 'Proclamação da República'),
    ('2026-11-20', 'Consciência Negra'), ('2026-12-25', 'Natal'),
    ('2027-01-01', 'Confraternização Universal'), ('2027-03-26', 'Sexta-feira Santa'),
    ('2027-04-21', 'Tiradentes'), ('2027-05-01', 'Dia do Trabalho'),
    ('2027-09-07', 'Independência'), ('2027-10-12', 'Nossa Senhora Aparecida'),
    ('2027-11-02', 'Finados'), ('2027-11-15', 'Proclamação da República'),
    ('2027-11-20', 'Consciência Negra'), ('2027-12-25', 'Natal'),
]

_SCHEMA = [
    """CREATE TABLE IF NOT EXISTS sac_atendimentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        protocolo TEXT NOT NULL UNIQUE,
        data_abertura TEXT NOT NULL,
        canal TEXT NOT NULL,
        tipo_id INTEGER,
        tipo_nome TEXT NOT NULL,
        prazo_dias INTEGER NOT NULL,
        beneficiario_nome TEXT NOT NULL,
        carteirinha TEXT,
        contato TEXT,
        descricao TEXT NOT NULL,
        setor_atual TEXT NOT NULL,
        status TEXT NOT NULL,
        resolvida_primeiro_contato INTEGER NOT NULL DEFAULT 0,
        data_resolucao TEXT,
        recontato INTEGER NOT NULL DEFAULT 0,
        recontato_de INTEGER,
        escalonamento TEXT NOT NULL DEFAULT 'Não',
        confirmacao TEXT,
        setor_abertura TEXT,
        usuario_abertura_id INTEGER,
        usuario_abertura_nome TEXT,
        atualizado_em TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS sac_andamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        atendimento_id INTEGER NOT NULL REFERENCES sac_atendimentos(id) ON DELETE CASCADE,
        data_hora TEXT NOT NULL,
        usuario_id INTEGER,
        usuario_nome TEXT,
        setor TEXT,
        descricao TEXT NOT NULL,
        status_anterior TEXT,
        status_novo TEXT,
        setor_destino TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS sac_tipos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        prazo_dias INTEGER NOT NULL,
        classificacao TEXT,
        base_legal TEXT,
        ativo INTEGER NOT NULL DEFAULT 1
    )""",
    """CREATE TABLE IF NOT EXISTS sac_feriados (
        data TEXT PRIMARY KEY,
        descricao TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS sac_contador (
        id INTEGER PRIMARY KEY,
        valor INTEGER NOT NULL
    )""",
    "CREATE INDEX IF NOT EXISTS sac_atendimentos_abertura ON sac_atendimentos (data_abertura)",
    "CREATE INDEX IF NOT EXISTS sac_atendimentos_setor_status ON sac_atendimentos (setor_atual, status)",
    "CREATE INDEX IF NOT EXISTS sac_atendimentos_carteirinha ON sac_atendimentos (carteirinha)",
    "CREATE INDEX IF NOT EXISTS sac_andamentos_atendimento ON sac_andamentos (atendimento_id)",
]

_schema_ok = False
_schema_lock = threading.Lock()


def conectar():
    conn = db.connect()
    conn.row_factory = db.Row
    return conn


def garantir_tabelas():
    """Cria as tabelas e as listas iniciais (uma vez por processo)."""
    global _schema_ok
    if _schema_ok:
        return
    with _schema_lock:
        if _schema_ok:
            return
        conn = conectar()
        try:
            cur = conn.cursor()
            for ddl in _SCHEMA:
                cur.execute(ddl)
            if not cur.execute("SELECT 1 FROM sac_tipos LIMIT 1").fetchone():
                cur.executemany(
                    "INSERT INTO sac_tipos (nome, prazo_dias, classificacao, base_legal) VALUES (?, ?, ?, ?)",
                    TIPOS_INICIAIS)
            if not cur.execute("SELECT 1 FROM sac_feriados LIMIT 1").fetchone():
                cur.executemany("INSERT INTO sac_feriados (data, descricao) VALUES (?, ?)", FERIADOS_INICIAIS)
            if not cur.execute("SELECT 1 FROM sac_contador WHERE id = 1").fetchone():
                inicial = int(os.environ.get('SAC_SEQUENCIAL_INICIAL', '1'))
                cur.execute("INSERT INTO sac_contador (id, valor) VALUES (1, ?)", (inicial - 1,))
            conn.commit()
            _schema_ok = True
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()


# ---------------------------------------------------------------------------
# Datas e dias úteis
# ---------------------------------------------------------------------------

def agora():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def para_data(valor):
    """'2026-10-22', '2026-10-22 14:03:00' ou date -> date (ou None)."""
    if not valor:
        return None
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, date):
        return valor
    texto = str(valor).strip()[:10]
    try:
        return datetime.strptime(texto, '%Y-%m-%d').date()
    except ValueError:
        try:
            return datetime.strptime(texto, '%d/%m/%Y').date()
        except ValueError:
            return None


def feriados():
    conn = conectar()
    try:
        return {para_data(r['data']) for r in conn.execute("SELECT data FROM sac_feriados").fetchall()}
    finally:
        conn.close()


def dia_util(dia, dias_nao_uteis):
    return dia.weekday() < 5 and dia not in dias_nao_uteis


def dias_uteis_entre(inicio, fim, dias_nao_uteis):
    """Dias úteis depois da abertura até a resposta (mesmo dia = 0)."""
    if not inicio or not fim or fim <= inicio:
        return 0
    total, dia = 0, inicio
    while dia < fim:
        dia += timedelta(days=1)
        if dia_util(dia, dias_nao_uteis):
            total += 1
    return total


def somar_dias_uteis(inicio, quantidade, dias_nao_uteis):
    """Data limite da resposta: abertura + N dias úteis (0 = mesmo dia)."""
    dia, faltam = inicio, quantidade
    while faltam > 0:
        dia += timedelta(days=1)
        if dia_util(dia, dias_nao_uteis):
            faltam -= 1
    return dia


def calcular(atendimento, dias_nao_uteis, hoje=None):
    """Colunas calculadas da planilha (Mês, Dias úteis, Prazo, Dentro do prazo)
    e a situação do prazo para quem está tratando a demanda."""
    hoje = hoje or date.today()
    a = dict(atendimento)
    abertura = para_data(a['data_abertura'])
    resolucao = para_data(a.get('data_resolucao'))
    limite = somar_dias_uteis(abertura, a['prazo_dias'] or 0, dias_nao_uteis)
    a['mes_ref'] = abertura.strftime('%Y-%m')
    a['data_limite'] = limite.isoformat()
    a['encerrada'] = a['status'] in STATUS_FINAIS
    a['setor_atual_nome'] = SETORES.get(a['setor_atual'], a['setor_atual'])
    if a['encerrada'] and resolucao:
        a['dias_uteis'] = dias_uteis_entre(abertura, resolucao, dias_nao_uteis)
        a['dentro_prazo'] = a['dias_uteis'] <= (a['prazo_dias'] or 0)
        a['situacao_prazo'] = 'no_prazo' if a['dentro_prazo'] else 'fora_prazo'
    else:
        a['dias_uteis'] = dias_uteis_entre(abertura, hoje, dias_nao_uteis)
        a['dentro_prazo'] = None
        if hoje > limite:
            a['situacao_prazo'] = 'atrasada'
        elif hoje == limite:
            a['situacao_prazo'] = 'vence_hoje'
        else:
            a['situacao_prazo'] = 'no_prazo'
    return a


# ---------------------------------------------------------------------------
# Protocolo
# ---------------------------------------------------------------------------

def _proximo_protocolo(cur, quando):
    """Registro ANS + ano + mês + dia + sequencial de 6 dígitos
    (ex.: 412015 2026 10 22 000123 -> 41201520261022000123).
    O UPDATE trava a linha do contador até o commit: dois atendimentos
    abertos ao mesmo tempo nunca recebem o mesmo número."""
    cur.execute("UPDATE sac_contador SET valor = valor + 1 WHERE id = 1")
    valor = cur.execute("SELECT valor FROM sac_contador WHERE id = 1").fetchone()['valor']
    return f"{REGISTRO_ANS}{quando.strftime('%Y%m%d')}{int(valor) % 1000000:06d}"


def formatar_protocolo(protocolo):
    """41201520261022000123 -> '412015 2026 10 22 000123' (como na planilha)."""
    p = str(protocolo or '')
    if len(p) != 20 or not p.isdigit():
        return p
    return f"{p[:6]} {p[6:10]} {p[10:12]} {p[12:14]} {p[14:]}"


def so_digitos(texto):
    return ''.join(ch for ch in str(texto or '') if ch.isdigit())


# ---------------------------------------------------------------------------
# Listas
# ---------------------------------------------------------------------------

def listar_tipos(somente_ativos=True):
    conn = conectar()
    try:
        sql = "SELECT id, nome, prazo_dias, classificacao, base_legal, ativo FROM sac_tipos"
        if somente_ativos:
            sql += " WHERE ativo = 1"
        return [dict(r) for r in conn.execute(sql + " ORDER BY nome").fetchall()]
    finally:
        conn.close()


def obter_tipo(tipo_id):
    conn = conectar()
    try:
        r = conn.execute("SELECT * FROM sac_tipos WHERE id = ?", (tipo_id,)).fetchone()
        return dict(r) if r else None
    finally:
        conn.close()


def salvar_tipo(tipo_id, nome, prazo_dias, classificacao, base_legal, ativo):
    conn = conectar()
    try:
        if tipo_id:
            conn.execute("""UPDATE sac_tipos SET nome = ?, prazo_dias = ?, classificacao = ?, base_legal = ?, ativo = ?
                            WHERE id = ?""", (nome, prazo_dias, classificacao, base_legal, 1 if ativo else 0, tipo_id))
        else:
            conn.execute("INSERT INTO sac_tipos (nome, prazo_dias, classificacao, base_legal, ativo) VALUES (?, ?, ?, ?, 1)",
                         (nome, prazo_dias, classificacao, base_legal))
        conn.commit()
    except db.IntegrityError:
        conn.rollback()
        raise ValueError('Já existe um tipo de demanda com esse nome.')
    finally:
        conn.close()


def listar_feriados():
    conn = conectar()
    try:
        return [dict(r) for r in conn.execute("SELECT data, descricao FROM sac_feriados ORDER BY data").fetchall()]
    finally:
        conn.close()


def adicionar_feriado(dia, descricao):
    conn = conectar()
    try:
        if conn.execute("SELECT 1 FROM sac_feriados WHERE data = ?", (dia,)).fetchone():
            raise ValueError('Essa data já está na lista de feriados.')
        conn.execute("INSERT INTO sac_feriados (data, descricao) VALUES (?, ?)", (dia, descricao))
        conn.commit()
    finally:
        conn.close()


def remover_feriado(dia):
    conn = conectar()
    try:
        conn.execute("DELETE FROM sac_feriados WHERE data = ?", (dia,))
        conn.commit()
    finally:
        conn.close()


def buscar_beneficiario(carteirinha):
    """Nome e situação do beneficiário pela carteirinha (código do usuário)."""
    codigo = str(carteirinha or '').strip()
    if not codigo:
        return None
    conn = conectar()
    try:
        r = conn.execute("""SELECT sCodigoUSR, sNomeUSR, sNumeroCNT, dExclusaoUSR, fone_tit, fone_cnt
                            FROM beneficiarios WHERE sCodigoUSR = ?""", (codigo,)).fetchone()
        if not r:
            return None
        return {
            'carteirinha': r['sCodigoUSR'],
            'nome': (r['sNomeUSR'] or '').strip(),
            'contrato': r['sNumeroCNT'],
            'ativo': not (r['dExclusaoUSR'] or '').strip(),
            'telefone': (r['fone_tit'] or r['fone_cnt'] or '').strip(),
        }
    except db.Error:
        return None
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Atendimentos
# ---------------------------------------------------------------------------

def _mesmo_beneficiario_sql(carteirinha, nome):
    if carteirinha:
        return "carteirinha = ?", carteirinha
    return "UPPER(TRIM(beneficiario_nome)) = ?", nome.strip().upper()


def abrir_atendimento(dados, usuario):
    """Grava a demanda, gera o protocolo e registra a abertura no histórico.
    Se o mesmo beneficiário abriu demanda do mesmo tipo nos últimos 30 dias,
    marca 'Recontato' na anterior (passo 4 do procedimento).
    Devolve (id, protocolo, protocolos_marcados_como_recontato)."""
    agora_dt = datetime.now()
    momento = agora_dt.strftime('%Y-%m-%d %H:%M:%S')
    resolvida = dados['resolvida_primeiro_contato']
    status = 'Resolvida' if resolvida else STATUS_ANDAMENTO
    conn = conectar()
    try:
        cur = conn.cursor()
        protocolo = _proximo_protocolo(cur, agora_dt)

        filtro, valor = _mesmo_beneficiario_sql(dados['carteirinha'], dados['beneficiario_nome'])
        desde = (agora_dt - timedelta(days=RECONTATO_DIAS)).strftime('%Y-%m-%d %H:%M:%S')
        anteriores = cur.execute(
            f"""SELECT id, protocolo FROM sac_atendimentos
                WHERE {filtro} AND tipo_id = ? AND data_abertura >= ?
                ORDER BY data_abertura DESC""",
            (valor, dados['tipo_id'], desde)).fetchall()

        cur.execute(
            """INSERT INTO sac_atendimentos (
                protocolo, data_abertura, canal, tipo_id, tipo_nome, prazo_dias, beneficiario_nome,
                carteirinha, contato, descricao, setor_atual, status, resolvida_primeiro_contato,
                data_resolucao, recontato_de, escalonamento, confirmacao, setor_abertura,
                usuario_abertura_id, usuario_abertura_nome, atualizado_em)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (protocolo, momento, dados['canal'], dados['tipo_id'], dados['tipo_nome'], dados['prazo_dias'],
             dados['beneficiario_nome'], dados['carteirinha'] or None, dados['contato'] or None,
             dados['descricao'], dados['setor'], status, 1 if resolvida else 0,
             agora_dt.strftime('%Y-%m-%d') if resolvida else None,
             anteriores[0]['id'] if anteriores else None, 'Não',
             dados.get('confirmacao') or None, usuario['setor'], usuario['id'], usuario['nome'], momento))
        novo_id = cur.lastrowid

        texto = 'Atendimento aberto.'
        if dados['setor'] != usuario['setor']:
            texto += f" Encaminhado para {SETORES.get(dados['setor'], dados['setor'])}."
        if resolvida:
            texto += ' Resolvido no primeiro contato.'
        cur.execute(
            """INSERT INTO sac_andamentos (atendimento_id, data_hora, usuario_id, usuario_nome, setor, descricao,
                                           status_anterior, status_novo, setor_destino)
               VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)""",
            (novo_id, momento, usuario['id'], usuario['nome'], usuario['setor'], texto, status, dados['setor']))

        marcados = []
        for ant in anteriores:
            cur.execute("UPDATE sac_atendimentos SET recontato = 1, atualizado_em = ? WHERE id = ?", (momento, ant['id']))
            cur.execute(
                """INSERT INTO sac_andamentos (atendimento_id, data_hora, usuario_id, usuario_nome, setor, descricao)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (ant['id'], momento, usuario['id'], usuario['nome'], usuario['setor'],
                 f"Recontato: o beneficiário voltou com o mesmo assunto no protocolo {formatar_protocolo(protocolo)}."))
            marcados.append(ant['protocolo'])
        conn.commit()
        return novo_id, protocolo, marcados
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def obter_atendimento(atendimento_id):
    conn = conectar()
    try:
        r = conn.execute("SELECT * FROM sac_atendimentos WHERE id = ?", (atendimento_id,)).fetchone()
        if not r:
            return None
        a = dict(r)
        a['andamentos'] = [dict(x) for x in conn.execute(
            "SELECT * FROM sac_andamentos WHERE atendimento_id = ? ORDER BY data_hora, id",
            (atendimento_id,)).fetchall()]
        for an in a['andamentos']:
            an['setor_nome'] = SETORES.get(an['setor'], an['setor'] or '')
            an['setor_destino_nome'] = SETORES.get(an['setor_destino'], an['setor_destino'] or '')
        a['recontato_de_protocolo'] = None
        if a['recontato_de']:
            ant = conn.execute("SELECT protocolo FROM sac_atendimentos WHERE id = ?", (a['recontato_de'],)).fetchone()
            a['recontato_de_protocolo'] = ant['protocolo'] if ant else None
        a['outros_do_beneficiario'] = []
        filtro, valor = _mesmo_beneficiario_sql(a['carteirinha'], a['beneficiario_nome'])
        a['outros_do_beneficiario'] = [dict(x) for x in conn.execute(
            f"""SELECT id, protocolo, data_abertura, tipo_nome, status FROM sac_atendimentos
                WHERE {filtro} AND id <> ? ORDER BY data_abertura DESC LIMIT 10""",
            (valor, atendimento_id)).fetchall()]
        return a
    finally:
        conn.close()


def registrar_andamento(atendimento_id, dados, usuario):
    """Lança um andamento. Mudanças de status, setor, escalonamento,
    confirmação e recontato entram no texto do histórico automaticamente."""
    momento = agora()
    conn = conectar()
    try:
        cur = conn.cursor()
        atual = cur.execute("SELECT * FROM sac_atendimentos WHERE id = ?", (atendimento_id,)).fetchone()
        if not atual:
            raise LookupError('Atendimento não encontrado.')
        atual = dict(atual)

        mudancas, campos = [], {}
        status = dados.get('status') or atual['status']
        if status != atual['status']:
            mudancas.append(f"Status: {atual['status']} → {status}")
            campos['status'] = status
        if status in STATUS_FINAIS:
            data_resol = dados.get('data_resolucao') or atual['data_resolucao'] or momento[:10]
            if data_resol != atual['data_resolucao']:
                campos['data_resolucao'] = data_resol
                if atual['data_resolucao']:
                    mudancas.append(f"Data da resposta: {_br(atual['data_resolucao'])} → {_br(data_resol)}")
        elif atual['data_resolucao']:
            campos['data_resolucao'] = None  # reaberta

        setor = dados.get('setor') or atual['setor_atual']
        if setor != atual['setor_atual']:
            mudancas.append(f"Encaminhado: {SETORES.get(atual['setor_atual'], atual['setor_atual'])} → "
                            f"{SETORES.get(setor, setor)}")
            campos['setor_atual'] = setor

        for campo, rotulo in (('escalonamento', 'Escalou'), ('confirmacao', 'Confirmação do beneficiário')):
            novo = dados.get(campo)
            if novo is not None and novo != (atual[campo] or ''):
                mudancas.append(f"{rotulo}: {atual[campo] or '—'} → {novo or '—'}")
                campos[campo] = novo or None
        if dados.get('recontato') is not None and int(dados['recontato']) != int(atual['recontato'] or 0):
            mudancas.append('Recontato em até 30 dias: ' + ('Sim' if dados['recontato'] else 'Não'))
            campos['recontato'] = 1 if dados['recontato'] else 0

        texto = (dados.get('descricao') or '').strip()
        if not texto and not mudancas:
            raise ValueError('Descreva o andamento ou altere algum campo.')

        if campos:
            campos['atualizado_em'] = momento
            sets = ', '.join(f"{c} = ?" for c in campos)
            cur.execute(f"UPDATE sac_atendimentos SET {sets} WHERE id = ?", (*campos.values(), atendimento_id))
        else:
            cur.execute("UPDATE sac_atendimentos SET atualizado_em = ? WHERE id = ?", (momento, atendimento_id))

        descricao = '\n'.join(filter(None, [texto, '; '.join(mudancas)]))
        cur.execute(
            """INSERT INTO sac_andamentos (atendimento_id, data_hora, usuario_id, usuario_nome, setor, descricao,
                                           status_anterior, status_novo, setor_destino)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (atendimento_id, momento, usuario['id'], usuario['nome'], usuario['setor'], descricao,
             atual['status'] if 'status' in campos else None, campos.get('status'),
             campos.get('setor_atual')))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _br(iso):
    d = para_data(iso)
    return d.strftime('%d/%m/%Y') if d else ''


def listar_atendimentos(filtros):
    """Filtros: busca (protocolo, nome, carteirinha), setor, situacao
    ('abertos', 'encerrados', 'todos' ou um status), canal, tipo_id, mes (AAAA-MM)."""
    where, args = [], []
    busca = (filtros.get('busca') or '').strip()
    if busca:
        digitos = so_digitos(busca)
        partes = ["beneficiario_nome LIKE ?", "carteirinha LIKE ?"]
        args += [f'%{busca}%', f'%{busca}%']
        if len(digitos) >= 4:
            partes.append("protocolo LIKE ?")
            args.append(f'%{digitos}%')
        where.append('(' + ' OR '.join(partes) + ')')
    if filtros.get('setor'):
        where.append("setor_atual = ?")
        args.append(filtros['setor'])
    situacao = filtros.get('situacao') or 'abertos'
    if situacao == 'abertos':
        where.append("status = ?")
        args.append(STATUS_ANDAMENTO)
    elif situacao == 'encerrados':
        where.append("status <> ?")
        args.append(STATUS_ANDAMENTO)
    elif situacao in STATUS:
        where.append("status = ?")
        args.append(situacao)
    if filtros.get('canal'):
        where.append("canal = ?")
        args.append(filtros['canal'])
    if filtros.get('tipo_id'):
        where.append("tipo_id = ?")
        args.append(int(filtros['tipo_id']))
    if filtros.get('mes'):
        where.append("data_abertura LIKE ?")
        args.append(filtros['mes'] + '%')
    sql = "SELECT * FROM sac_atendimentos"
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY data_abertura DESC, id DESC LIMIT 500"
    conn = conectar()
    try:
        rows = conn.execute(sql, args).fetchall()
    finally:
        conn.close()
    nao_uteis = feriados()
    hoje = date.today()
    return [calcular(r, nao_uteis, hoje) for r in rows]


def resumo_abertos(setor=None):
    """Contadores do painel: em andamento, atrasados e vencendo hoje
    (do setor, se informado), e encerrados no mês corrente."""
    conn = conectar()
    try:
        sql, args = "SELECT * FROM sac_atendimentos WHERE status = ?", [STATUS_ANDAMENTO]
        if setor:
            sql += " AND setor_atual = ?"
            args.append(setor)
        abertos = conn.execute(sql, args).fetchall()
        mes = date.today().strftime('%Y-%m')
        sql = "SELECT COUNT(*) AS n FROM sac_atendimentos WHERE status <> ? AND data_resolucao LIKE ?"
        args = [STATUS_ANDAMENTO, mes + '%']
        if setor:
            sql += " AND setor_atual = ?"
            args.append(setor)
        encerrados_mes = conn.execute(sql, args).fetchone()['n']
    finally:
        conn.close()
    nao_uteis = feriados()
    calc = [calcular(r, nao_uteis) for r in abertos]
    return {
        'em_andamento': len(calc),
        'atrasados': sum(1 for a in calc if a['situacao_prazo'] == 'atrasada'),
        'vencem_hoje': sum(1 for a in calc if a['situacao_prazo'] == 'vence_hoje'),
        'encerrados_mes': encerrados_mes,
    }


def atendimentos_do_mes(mes):
    conn = conectar()
    try:
        rows = conn.execute(
            "SELECT * FROM sac_atendimentos WHERE data_abertura LIKE ? ORDER BY data_abertura, id",
            (mes + '%',)).fetchall()
    finally:
        conn.close()
    nao_uteis = feriados()
    return [calcular(r, nao_uteis) for r in rows]


def _pct(parte, total):
    return round(100.0 * parte / total, 1) if total else None


def _indices(lista):
    total = len(lista)
    encerradas = [a for a in lista if a['encerrada']]
    return {
        'total': total,
        'em_andamento': total - len(encerradas),
        'encerradas': len(encerradas),
        'resolvidas': sum(1 for a in lista if a['status'] == 'Resolvida'),
        'pct_resolvidas': _pct(sum(1 for a in lista if a['status'] == 'Resolvida'), total),
        'pct_primeiro_contato': _pct(sum(1 for a in lista if a['resolvida_primeiro_contato']), total),
        'pct_recontato': _pct(sum(1 for a in lista if a['recontato']), total),
        'pct_escalou': _pct(sum(1 for a in lista if (a['escalonamento'] or 'Não') != 'Não'), total),
        'pct_no_prazo': _pct(sum(1 for a in encerradas if a['dentro_prazo']), len(encerradas)),
        'pct_confirmadas': _pct(sum(1 for a in encerradas if a['confirmacao'] == 'Sim'), len(encerradas)),
        'atrasadas': sum(1 for a in lista if a['situacao_prazo'] == 'atrasada'),
    }


def indicadores(mes):
    """Aba Indicadores: índices do mês por canal, por tipo de demanda e por setor."""
    lista = atendimentos_do_mes(mes)

    def agrupar(chave, rotulo=lambda k: k):
        grupos = {}
        for a in lista:
            grupos.setdefault(a[chave], []).append(a)
        return [{'nome': rotulo(k), **_indices(v)} for k, v in grupos.items()]

    por_tipo = agrupar('tipo_nome')
    # análise crítica: pior resolutividade primeiro, depois mais recontato
    por_tipo.sort(key=lambda t: (t['pct_resolvidas'] if t['pct_resolvidas'] is not None else 101,
                                 -(t['pct_recontato'] or 0), -t['total']))
    por_canal = agrupar('canal')
    por_canal.sort(key=lambda c: (CANAIS.index(c['nome']) if c['nome'] in CANAIS else 99, c['nome']))
    por_setor = agrupar('setor_atual', lambda k: SETORES.get(k, k))
    por_setor.sort(key=lambda s: -s['total'])
    return {'geral': _indices(lista), 'por_canal': por_canal, 'por_tipo': por_tipo, 'por_setor': por_setor}


def evolucao_anual(ano):
    """Total e % resolvidas/no prazo mês a mês (gráfico de evolução do ano)."""
    conn = conectar()
    try:
        rows = conn.execute("SELECT * FROM sac_atendimentos WHERE data_abertura LIKE ?", (f'{ano}-%',)).fetchall()
    finally:
        conn.close()
    nao_uteis = feriados()
    por_mes = {}
    for r in rows:
        a = calcular(r, nao_uteis)
        por_mes.setdefault(a['mes_ref'], []).append(a)
    return [{'mes': f'{ano}-{m:02d}', **_indices(por_mes.get(f'{ano}-{m:02d}', []))} for m in range(1, 13)]
