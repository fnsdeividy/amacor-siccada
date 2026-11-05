"""
Comissão de vendedores e corretoras.

Regra (por vendedor, com vigência pelo mês da venda):
  - lista de parcelas; a parcela k (1, 2, 3...) da venda feita no mês M é paga
    no mês M + k (a 1ª no mês seguinte à venda);
  - cada parcela é um percentual sobre a venda ou sobre a parcela anterior
    (ex.: Marcelo Rosa: 100% da venda, 30% da 1ª, 3% da 2ª);
  - valor fixo mensal opcional, pago junto com a 1ª parcela de cada mês de
    venda coberto pela regra (ex.: R$ 1.000 nos três primeiros meses).

Uma parcela só é devida se a venda/contrato não terminou antes do mês em que
ela seria paga ("desde que não haja cancelamento" / "com o contrato ainda
ativo"). Fim da venda: data da fase quando o status é "venda cancelada";
senão, a data de exclusão do contrato na base de beneficiários.

Os valores são somados por mês de venda e arredondados no fim, como na
planilha (ex.: 30% de R$ 957,76 = R$ 287,33).
"""
import json
from datetime import date, datetime

BASE_VENDA = 'venda'
BASE_ANTERIOR = 'anterior'
STATUS_CANCELADA = 'venda cancelada'
MAX_PARCELAS = 6
MESES_ABREV = ('jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez')


# ---------------------------------------------------------------- datas/meses

def parse_data(valor):
    """Data de texto do banco ('2026-04-02', '02/04/2026', '02-04-2026'). None se inválida."""
    if valor is None:
        return None
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, date):
        return valor
    texto = str(valor).strip().replace('\xa0', '')
    for fmt, tamanho in (('%Y-%m-%d', 10), ('%d/%m/%Y', 10), ('%d-%m-%Y', 10)):
        try:
            d = datetime.strptime(texto[:tamanho], fmt).date()
        except ValueError:
            continue
        if 2000 <= d.year <= 2100:
            return d
        return None
    return None


def parse_mes(valor):
    """'2026-04' -> '2026-04' (normalizado) ou None."""
    try:
        ano, mes = str(valor).strip()[:7].split('-')
        ano, mes = int(ano), int(mes)
    except (ValueError, AttributeError):
        return None
    if not (2000 <= ano <= 2100 and 1 <= mes <= 12):
        return None
    return f'{ano:04d}-{mes:02d}'


def mes_de(d):
    return f'{d.year:04d}-{d.month:02d}'


def somar_meses(mes, n):
    ano, m = int(mes[:4]), int(mes[5:7])
    total = ano * 12 + (m - 1) + n
    return f'{total // 12:04d}-{total % 12 + 1:02d}'


def primeiro_dia(mes):
    return date(int(mes[:4]), int(mes[5:7]), 1)


def meses_entre(inicio, fim):
    meses, atual = [], inicio
    while atual <= fim:
        meses.append(atual)
        atual = somar_meses(atual, 1)
    return meses


def rotulo_mes(mes):
    """'2026-04' -> 'abr/26' (como na planilha)."""
    return f'{MESES_ABREV[int(mes[5:7]) - 1]}/{mes[2:4]}'


# ---------------------------------------------------------------- regras

def normalizar_parcelas(parcelas):
    """Lista de {'percentual': float, 'base': 'venda'|'anterior'} válida."""
    saida = []
    for p in parcelas or []:
        try:
            pct = float(str(p.get('percentual', '')).replace(',', '.'))
        except (TypeError, ValueError):
            continue
        base = BASE_ANTERIOR if p.get('base') == BASE_ANTERIOR and saida else BASE_VENDA
        saida.append({'percentual': pct, 'base': base})
    return saida


def fatores(parcelas):
    """Fração da venda paga em cada parcela (100/30/3 encadeado -> 1, 0.3, 0.009)."""
    saida = []
    for p in normalizar_parcelas(parcelas):
        frac = p['percentual'] / 100.0
        saida.append(saida[-1] * frac if p['base'] == BASE_ANTERIOR else frac)
    return saida


def descrever_regra(regra):
    """'100% da venda · 30% da venda · 3% da 2ª parcela + R$ 1.000,00 fixo'."""
    if not regra:
        return 'Sem regra cadastrada'
    partes = []
    for i, p in enumerate(normalizar_parcelas(regra.get('parcelas'))):
        pct = f"{p['percentual']:g}".replace('.', ',')
        partes.append(f"{pct}% da {'venda' if p['base'] == BASE_VENDA else f'{i}ª parcela'}")
    texto = ' · '.join(partes) or 'Sem parcelas'
    fixo = float(regra.get('valor_fixo') or 0)
    if fixo:
        texto += ' + ' + formatar_moeda(fixo) + ' fixo/mês'
    return texto


def formatar_moeda(valor):
    texto = f'{valor:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return f'R$ {texto}'


def regra_vigente(regras, mes):
    """Versão da regra válida para vendas do mês (a última com vigência <= mês)."""
    escolhida = None
    for r in sorted(regras, key=lambda r: r['vigencia']):
        if r['vigencia'] <= mes:
            escolhida = r
    return escolhida


# ---------------------------------------------------------------- cálculo

def fim_da_venda(venda, encerramentos):
    """Data a partir da qual a venda deixa de gerar comissão (ou None)."""
    if (venda.get('status') or '').strip().lower() == STATUS_CANCELADA:
        return parse_data(venda.get('data_att_fase')) or parse_data(venda.get('data_venda'))
    contrato = (venda.get('numero_contrato') or '').strip().replace('\xa0', '')
    return encerramentos.get(contrato)


def calcular(vendas, regras, encerramentos, mes_atual):
    """
    Comissão de um vendedor.

    vendas: dicts com numero_proposta, data_venda, valor_venda, status,
            data_att_fase, numero_contrato, nome_responsavel
    regras: versões da regra do vendedor ({'vigencia', 'parcelas', 'valor_fixo'})
    encerramentos: {numero_contrato: date} (contratos excluídos)
    mes_atual: 'AAAA-MM'

    Devolve {'por_mes_venda': {mes: {...}}, 'a_pagar': {mes_pagamento: valor},
             'vendas': [...], 'invalidas': [...], 'n_parcelas': int}
    """
    por_mes = {}
    detalhes, invalidas = [], []
    n_parcelas = max([len(normalizar_parcelas(r['parcelas'])) for r in regras] + [1])

    def linha(mes):
        if mes not in por_mes:
            por_mes[mes] = {'valor_vendas': 0.0, 'qtd_vendas': 0,
                            'parcelas': [0.0] * n_parcelas, 'fixo': 0.0}
        return por_mes[mes]

    for v in vendas:
        d = parse_data(v.get('data_venda'))
        valor = float(v.get('valor_venda') or 0)
        if d is None:
            invalidas.append({'numero_proposta': v.get('numero_proposta'),
                              'data_venda': v.get('data_venda'), 'valor_venda': valor})
            continue
        mes = mes_de(d)
        fim = fim_da_venda(v, encerramentos)
        regra = regra_vigente(regras, mes)
        fs = fatores(regra['parcelas']) if regra else []
        cancelada = (v.get('status') or '').strip().lower() == STATUS_CANCELADA

        item = linha(mes)
        if not cancelada:
            item['valor_vendas'] += valor
            item['qtd_vendas'] += 1

        parcelas_venda = []
        for k, fator in enumerate(fs):
            mes_pag = somar_meses(mes, k + 1)
            devida = fim is None or fim >= primeiro_dia(mes_pag)
            if devida:
                item['parcelas'][k] += valor * fator
            parcelas_venda.append({'mes_pagamento': mes_pag, 'devida': devida,
                                   'valor': round(valor * fator, 2) if devida else 0.0})
        detalhes.append({
            'numero_proposta': v.get('numero_proposta'),
            'nome_responsavel': v.get('nome_responsavel'),
            'numero_contrato': v.get('numero_contrato'),
            'data_venda': d.isoformat(),
            'mes_venda': mes,
            'valor_venda': valor,
            'status': v.get('status'),
            'fim': fim.isoformat() if fim else None,
            'parcelas': parcelas_venda,
        })

    # valor fixo mensal: um por mês de venda coberto pela regra, pago no mês seguinte
    if regras:
        primeira = min(r['vigencia'] for r in regras)
        for mes in meses_entre(primeira, mes_atual):
            regra = regra_vigente(regras, mes)
            fixo = float(regra.get('valor_fixo') or 0) if regra else 0.0
            if fixo:
                linha(mes)['fixo'] = fixo

    # soma sem arredondar e arredonda só o total do mês, como a planilha
    # (jul/26 do Marcelo: 357,11 + 31,005 + 8,6198 = 396,73)
    a_pagar = {}
    for mes, item in por_mes.items():
        for k, valor in enumerate(item['parcelas']):
            pag = somar_meses(mes, k + 1)
            a_pagar[pag] = a_pagar.get(pag, 0.0) + valor
        if item['fixo']:
            pag = somar_meses(mes, 1)
            a_pagar[pag] = a_pagar.get(pag, 0.0) + item['fixo']
        item['valor_vendas'] = round(item['valor_vendas'], 2)
        item['parcelas'] = [round(x, 2) for x in item['parcelas']]
    a_pagar = {m: round(v + 1e-9, 2) for m, v in a_pagar.items()}

    detalhes.sort(key=lambda x: (x['data_venda'], str(x['numero_proposta'])))
    return {'por_mes_venda': por_mes, 'a_pagar': a_pagar, 'vendas': detalhes,
            'invalidas': invalidas, 'n_parcelas': n_parcelas}


def situacao_pagamento(mes_pagamento, mes_atual, pagamento):
    if pagamento:
        return 'pago'
    if mes_pagamento <= mes_atual:
        return 'a pagar'
    return 'previsto'


# ---------------------------------------------------------------- banco

CRIAR_TABELAS = (
    """
    CREATE TABLE IF NOT EXISTS comissao_regra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        corretor TEXT NOT NULL,
        vigencia TEXT NOT NULL,
        parcelas TEXT NOT NULL,
        valor_fixo REAL DEFAULT 0,
        observacao TEXT,
        atualizado_em TEXT,
        atualizado_por TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS comissao_pagamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        corretor TEXT NOT NULL,
        mes_ref TEXT NOT NULL,
        valor_pago REAL NOT NULL,
        data_pagamento TEXT NOT NULL,
        registrado_por TEXT,
        registrado_em TEXT
    )
    """,
)

_tabelas_ok = False


def _conectar():
    from .models.database import get_db_connection
    global _tabelas_ok
    conn = get_db_connection()
    if not _tabelas_ok:
        cur = conn.cursor()
        for sql in CRIAR_TABELAS:
            cur.execute(sql)
        conn.commit()
        _tabelas_ok = True
    return conn


def _linhas(sql, args=()):
    conn = _conectar()
    try:
        cur = conn.cursor()
        cur.execute(sql, args)
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()


def _executar(comandos):
    conn = _conectar()
    try:
        cur = conn.cursor()
        for sql, args in comandos:
            cur.execute(sql, args)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def carregar_vendas():
    return _linhas("""
        SELECT numero_proposta, data_venda, valor_venda, status, data_att_fase,
               numero_contrato, nome_responsavel, corretor_resp
        FROM venda
    """)


def carregar_encerramentos():
    """{numero_contrato: data de exclusão} dos contratos em que todos os
    beneficiários estão excluídos (contrato encerrado)."""
    datas, abertos = {}, set()
    for r in _linhas("SELECT snumerocnt, dexclusao FROM beneficiarios"):
        cnt = (r.get('snumerocnt') or '').strip()
        if not cnt:
            continue
        d = parse_data(r.get('dexclusao'))
        if d is None:
            abertos.add(cnt)
        elif cnt not in datas or d > datas[cnt]:
            datas[cnt] = d
    return {c: d for c, d in datas.items() if c not in abertos}


def carregar_regras(corretor=None):
    sql = "SELECT * FROM comissao_regra"
    args = ()
    if corretor is not None:
        sql += " WHERE corretor = ?"
        args = (corretor,)
    sql += " ORDER BY corretor, vigencia"
    regras = []
    for r in _linhas(sql, args):
        try:
            r['parcelas'] = normalizar_parcelas(json.loads(r.get('parcelas') or '[]'))
        except ValueError:
            r['parcelas'] = []
        r['valor_fixo'] = float(r.get('valor_fixo') or 0)
        r['descricao'] = descrever_regra(r)
        r['vigencia_rotulo'] = rotulo_mes(r['vigencia'])
        regras.append(r)
    return regras


def salvar_regra(corretor, vigencia, parcelas, valor_fixo, observacao, usuario):
    agora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    _executar([
        ("DELETE FROM comissao_regra WHERE corretor = ? AND vigencia = ?", (corretor, vigencia)),
        ("""INSERT INTO comissao_regra (corretor, vigencia, parcelas, valor_fixo, observacao,
                                        atualizado_em, atualizado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
         (corretor, vigencia, json.dumps(normalizar_parcelas(parcelas)), float(valor_fixo or 0),
          observacao, agora, usuario)),
    ])


def excluir_regra(corretor, vigencia):
    _executar([("DELETE FROM comissao_regra WHERE corretor = ? AND vigencia = ?", (corretor, vigencia))])


def carregar_pagamentos(corretor=None):
    sql = "SELECT * FROM comissao_pagamento"
    args = ()
    if corretor is not None:
        sql += " WHERE corretor = ?"
        args = (corretor,)
    return {(p['corretor'], p['mes_ref']): p for p in _linhas(sql, args)}


def registrar_pagamento(corretor, mes_ref, valor_pago, data_pagamento, usuario):
    agora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    _executar([
        ("DELETE FROM comissao_pagamento WHERE corretor = ? AND mes_ref = ?", (corretor, mes_ref)),
        ("""INSERT INTO comissao_pagamento (corretor, mes_ref, valor_pago, data_pagamento,
                                            registrado_por, registrado_em)
            VALUES (?, ?, ?, ?, ?, ?)""",
         (corretor, mes_ref, float(valor_pago), data_pagamento, usuario, agora)),
    ])


def excluir_pagamento(corretor, mes_ref):
    _executar([("DELETE FROM comissao_pagamento WHERE corretor = ? AND mes_ref = ?", (corretor, mes_ref))])


# ---------------------------------------------------------------- telas

def _vendas_por_corretor(vendas):
    grupos = {}
    for v in vendas:
        nome = (v.get('corretor_resp') or '').strip()
        if nome:
            grupos.setdefault(nome, []).append(v)
    return grupos


def resumo_do_mes(mes_pagamento, mes_atual):
    """Uma linha por vendedor: quanto pagar no mês de pagamento escolhido."""
    vendas = _vendas_por_corretor(carregar_vendas())
    encerramentos = carregar_encerramentos()
    regras_por = {}
    for r in carregar_regras():
        regras_por.setdefault(r['corretor'], []).append(r)
    pagamentos = carregar_pagamentos()

    # quem tem regra, ou vendeu nos 3 meses que geram pagamento neste mês
    janela = {somar_meses(mes_pagamento, -k) for k in (1, 2, 3)}
    nomes = set(regras_por)
    for nome, vs in vendas.items():
        if any((d := parse_data(v.get('data_venda'))) and mes_de(d) in janela for v in vs):
            nomes.add(nome)

    linhas = []
    for nome in sorted(nomes, key=str.lower):
        regras = regras_por.get(nome, [])
        calc = calcular(vendas.get(nome, []), regras, encerramentos, mes_atual)
        pag = pagamentos.get((nome, mes_pagamento))
        regra_atual = regra_vigente(regras, mes_atual) if regras else None
        linhas.append({
            'corretor': nome,
            'tem_regra': bool(regras),
            'regra': descrever_regra(regra_atual) if regras else 'Sem regra cadastrada',
            'valor_a_pagar': calc['a_pagar'].get(mes_pagamento, 0.0),
            'valor_pago': pag['valor_pago'] if pag else None,
            'data_pagamento': pag['data_pagamento'] if pag else None,
            'situacao': situacao_pagamento(mes_pagamento, mes_atual, pag) if regras else 'sem regra',
        })
    total = round(sum(l['valor_a_pagar'] for l in linhas), 2)
    return linhas, total


def extrato_do_corretor(corretor, inicio, fim, mes_atual):
    """Tabela no formato da planilha: uma linha por mês de venda, com o
    pagamento do mês seguinte ao lado."""
    todas = _vendas_por_corretor(carregar_vendas())
    vendas = todas.get(corretor, [])
    regras = carregar_regras(corretor)
    pagamentos = carregar_pagamentos(corretor)
    calc = calcular(vendas, regras, carregar_encerramentos(), mes_atual)

    linhas = []
    for mes in meses_entre(inicio, fim):
        item = calc['por_mes_venda'].get(mes) or {
            'valor_vendas': 0.0, 'qtd_vendas': 0, 'parcelas': [0.0] * calc['n_parcelas'], 'fixo': 0.0}
        mes_pag = somar_meses(mes, 1)
        pag = pagamentos.get((corretor, mes_pag))
        linhas.append({
            'mes_venda': mes,
            'mes_venda_rotulo': rotulo_mes(mes),
            'valor_vendas': item['valor_vendas'],
            'qtd_vendas': item['qtd_vendas'],
            'parcelas': item['parcelas'],
            'fixo': item['fixo'],
            'mes_pagamento': mes_pag,
            'mes_pagamento_rotulo': rotulo_mes(mes_pag),
            'valor_a_pagar': calc['a_pagar'].get(mes_pag, 0.0),
            'valor_pago': pag['valor_pago'] if pag else None,
            'data_pagamento': pag['data_pagamento'] if pag else None,
            'situacao': situacao_pagamento(mes_pag, mes_atual, pag) if regras else 'sem regra',
        })

    vendas_periodo = [v for v in calc['vendas'] if inicio <= v['mes_venda'] <= fim]
    for v in vendas_periodo:
        v['mes_venda_rotulo'] = rotulo_mes(v['mes_venda'])
        for p in v['parcelas']:
            p['mes_pagamento_rotulo'] = rotulo_mes(p['mes_pagamento'])

    return {
        'linhas': linhas,
        'vendas': vendas_periodo,
        'invalidas': calc['invalidas'],
        'n_parcelas': calc['n_parcelas'],
        'regras': regras,
        'tem_fixo': any(r['valor_fixo'] for r in regras),
    }


def lista_corretores():
    nomes = {(v.get('corretor_resp') or '').strip() for v in carregar_vendas()}
    nomes |= {r['corretor'] for r in carregar_regras()}
    return sorted((n for n in nomes if n), key=str.lower)
