"""
SAC: atendimentos com protocolo e o andamento lançado pelos setores.
Regras e dados em app/models/sac.py.
"""
import csv
import io
from datetime import date, datetime

from flask import Blueprint, Response, flash, jsonify, redirect, render_template, request, session, url_for

from ..models import sac
from ..utils import hierarquia, login_required

sac_bp = Blueprint('sac', __name__)


@sac_bp.before_request
def _tabelas():
    if 'user_id' in session:
        sac.garantir_tabelas()


def _usuario():
    tipo = session.get('tipo_usuario')
    return {
        'id': session.get('user_id'),
        'nome': session.get('user_nome'),
        'setor': tipo if tipo in sac.SETORES else 'sac',
    }


def _pode_configurar():
    return session.get('classe_usuario') in ('supervisor', 'dev') or session.get('tipo_usuario') == 'dev'


def _listas():
    return {
        'canais': sac.CANAIS,
        'status_opcoes': sac.STATUS,
        'status_finais': sac.STATUS_FINAIS,
        'escalonamentos': sac.ESCALONAMENTOS,
        'confirmacoes': sac.CONFIRMACOES,
        'setores': [{'id': k, 'nome': v} for k, v in sac.SETORES.items()],
        'pode_configurar': _pode_configurar(),
    }


def _mes_valido(valor):
    try:
        return datetime.strptime(valor or '', '%Y-%m').strftime('%Y-%m')
    except ValueError:
        return date.today().strftime('%Y-%m')


@sac_bp.route('/')
@login_required
def home():
    usuario = _usuario()
    setor = request.args.get('setor')
    if setor is None:
        # cada setor abre na própria fila; o SAC vê todos
        setor = '' if usuario['setor'] == 'sac' or session.get('tipo_usuario') == 'dev' else usuario['setor']
    filtros = {
        'busca': request.args.get('busca', ''),
        'setor': setor,
        'situacao': request.args.get('situacao') or 'abertos',
        'canal': request.args.get('canal', ''),
        'tipo_id': request.args.get('tipo_id', ''),
        'mes': request.args.get('mes', ''),
    }
    if filtros['tipo_id'] and not filtros['tipo_id'].isdigit():
        filtros['tipo_id'] = ''
    atendimentos = sac.listar_atendimentos(filtros)
    return render_template(
        'sac/index.html',
        atendimentos=atendimentos,
        filtros=filtros,
        resumo=sac.resumo_abertos(setor or None),
        setor_usuario=usuario['setor'],
        tipos=sac.listar_tipos(somente_ativos=False),
        **_listas(),
    )


@sac_bp.route('/novo', methods=['GET', 'POST'])
@login_required
def novo():
    usuario = _usuario()
    tipos = sac.listar_tipos()
    form = {}
    if request.method == 'POST':
        form = {k: (request.form.get(k) or '').strip() for k in
                ('canal', 'tipo_id', 'beneficiario_nome', 'carteirinha', 'contato', 'descricao', 'setor',
                 'confirmacao')}
        form['resolvida_primeiro_contato'] = request.form.get('resolvida_primeiro_contato') == '1'
        erros = []
        tipo = sac.obter_tipo(int(form['tipo_id'])) if form['tipo_id'].isdigit() else None
        if form['canal'] not in sac.CANAIS:
            erros.append('Escolha o canal do atendimento.')
        if not tipo or not tipo['ativo']:
            erros.append('Escolha o tipo de demanda.')
        if not form['beneficiario_nome']:
            erros.append('Informe o nome do beneficiário.')
        if not form['descricao']:
            erros.append('Descreva o motivo da demanda.')
        if form['setor'] not in sac.SETORES:
            erros.append('Escolha o setor responsável.')
        if form['confirmacao'] and form['confirmacao'] not in sac.CONFIRMACOES:
            form['confirmacao'] = ''
        if len(form['beneficiario_nome']) > 200 or len(form['descricao']) > 5000 or len(form['contato']) > 200:
            erros.append('Texto muito longo.')
        if erros:
            for e in erros:
                flash(e)
        else:
            dados = dict(form, tipo_id=tipo['id'], tipo_nome=tipo['nome'], prazo_dias=tipo['prazo_dias'],
                         beneficiario_nome=form['beneficiario_nome'].upper(),
                         confirmacao=form['confirmacao'] if form['resolvida_primeiro_contato'] else '')
            novo_id, protocolo, recontatos = sac.abrir_atendimento(dados, usuario)
            flash(f'Protocolo {sac.formatar_protocolo(protocolo)} gerado. Informe-o ao beneficiário.')
            if recontatos:
                flash('Recontato: o beneficiário já tinha demanda do mesmo tipo nos últimos 30 dias '
                      f"(protocolo {', '.join(sac.formatar_protocolo(p) for p in recontatos)}). "
                      'A anterior foi marcada como recontato.')
            return redirect(url_for('sac.atendimento', atendimento_id=novo_id))
    return render_template(
        'sac/novo.html',
        tipos=tipos,
        form=form,
        setor_usuario=usuario['setor'],
        registro_ans=sac.REGISTRO_ANS,
        **_listas(),
    )


@sac_bp.route('/beneficiario')
@login_required
def beneficiario():
    """Nome do beneficiário pela carteirinha, para preencher o formulário."""
    encontrado = sac.buscar_beneficiario(request.args.get('carteirinha', ''))
    if not encontrado:
        return jsonify({'encontrado': False})
    return jsonify({'encontrado': True, **encontrado})


@sac_bp.route('/atendimento/<int:atendimento_id>')
@login_required
def atendimento(atendimento_id):
    a = sac.obter_atendimento(atendimento_id)
    if not a:
        flash('Atendimento não encontrado.')
        return redirect(url_for('sac.home'))
    a = sac.calcular(a, sac.feriados())
    a['protocolo_formatado'] = sac.formatar_protocolo(a['protocolo'])
    return render_template(
        'sac/atendimento.html',
        atendimento=a,
        hoje=date.today().isoformat(),
        setor_usuario=_usuario()['setor'],
        **_listas(),
    )


@sac_bp.route('/atendimento/<int:atendimento_id>/andamento', methods=['POST'])
@login_required
def andamento(atendimento_id):
    f = request.form
    dados = {
        'descricao': (f.get('descricao') or '').strip()[:5000],
        'status': f.get('status') if f.get('status') in sac.STATUS else None,
        'setor': f.get('setor') if f.get('setor') in sac.SETORES else None,
        'data_resolucao': None,
        'escalonamento': f.get('escalonamento') if f.get('escalonamento') in sac.ESCALONAMENTOS else None,
        'confirmacao': f.get('confirmacao') if f.get('confirmacao') in sac.CONFIRMACOES + [''] else None,
        'recontato': None if f.get('recontato') is None else f.get('recontato') == '1',
    }
    resol = sac.para_data(f.get('data_resolucao'))
    if resol:
        if resol > date.today():
            flash('A data da resposta não pode ser futura.')
            return redirect(url_for('sac.atendimento', atendimento_id=atendimento_id))
        dados['data_resolucao'] = resol.isoformat()
    try:
        sac.registrar_andamento(atendimento_id, dados, _usuario())
        flash('Andamento registrado.')
    except (ValueError, LookupError) as e:
        flash(str(e))
    return redirect(url_for('sac.atendimento', atendimento_id=atendimento_id))


@sac_bp.route('/indicadores')
@login_required
def indicadores():
    mes = _mes_valido(request.args.get('mes'))
    return render_template(
        'sac/indicadores.html',
        mes=mes,
        indicadores=sac.indicadores(mes),
        evolucao=sac.evolucao_anual(mes[:4]),
        **_listas(),
    )


def _sim_nao(v):
    return 'Sim' if v else 'Não'


@sac_bp.route('/exportar')
@login_required
def exportar():
    """Registro do mês em CSV (evidência do fechamento mensal)."""
    mes = _mes_valido(request.args.get('mes'))
    saida = io.StringIO()
    w = csv.writer(saida, delimiter=';')
    w.writerow(['Protocolo', 'Data de abertura', 'Canal', 'Tipo de demanda', 'Nome beneficiário',
                'Beneficiário (carteirinha)', 'Motivo / descrição', 'Setor atual', 'Resolvida no 1º contato?',
                'Status', 'Data de resolução', 'Recontato em até 30 dias?', 'Escalou?',
                'Beneficiário confirmou resolução?', 'Responsável/Operador', 'Mês ref.',
                'Dias úteis até resolver', 'Prazo resposta (dias úteis)', 'Dentro do prazo?'])
    for a in sac.atendimentos_do_mes(mes):
        abertura = sac.para_data(a['data_abertura'])
        resol = sac.para_data(a['data_resolucao'])
        w.writerow([
            sac.formatar_protocolo(a['protocolo']), abertura.strftime('%d/%m/%Y'), a['canal'], a['tipo_nome'],
            a['beneficiario_nome'], a['carteirinha'] or '', a['descricao'], a['setor_atual_nome'],
            _sim_nao(a['resolvida_primeiro_contato']), a['status'],
            resol.strftime('%d/%m/%Y') if resol else '', _sim_nao(a['recontato']), a['escalonamento'],
            a['confirmacao'] or '', a['usuario_abertura_nome'] or '', a['mes_ref'],
            a['dias_uteis'] if a['encerrada'] else '', a['prazo_dias'],
            '' if a['dentro_prazo'] is None else _sim_nao(a['dentro_prazo']),
        ])
    # BOM: o Excel abre o CSV com acentos corretos
    return Response('﻿' + saida.getvalue(), mimetype='text/csv',
                    headers={'Content-Disposition': f'attachment; filename=sac_registro_{mes}.csv'})


@sac_bp.route('/configuracoes', methods=['GET', 'POST'])
@login_required
@hierarquia('supervisor')
def configuracoes():
    if request.method == 'POST':
        acao = request.form.get('acao')
        try:
            if acao in ('novo_tipo', 'salvar_tipo'):
                nome = (request.form.get('nome') or '').strip()
                prazo = request.form.get('prazo_dias', '')
                if not nome or not prazo.isdigit() or int(prazo) > 60:
                    raise ValueError('Informe o nome e o prazo (0 a 60 dias úteis).')
                tipo_id = int(request.form['tipo_id']) if acao == 'salvar_tipo' else None
                sac.salvar_tipo(tipo_id, nome[:200], int(prazo), (request.form.get('classificacao') or '')[:60],
                                (request.form.get('base_legal') or '').strip()[:500],
                                request.form.get('ativo', '1') == '1')
                flash('Tipo de demanda salvo.')
            elif acao == 'novo_feriado':
                dia = sac.para_data(request.form.get('data'))
                if not dia:
                    raise ValueError('Informe a data do feriado.')
                sac.adicionar_feriado(dia.isoformat(), (request.form.get('descricao') or '').strip()[:120])
                flash('Feriado incluído.')
            elif acao == 'remover_feriado':
                sac.remover_feriado(request.form.get('data', ''))
                flash('Feriado removido.')
        except ValueError as e:
            flash(str(e))
        return redirect(url_for('sac.configuracoes'))
    return render_template(
        'sac/configuracoes.html',
        tipos=sac.listar_tipos(somente_ativos=False),
        feriados=sac.listar_feriados(),
        registro_ans=sac.REGISTRO_ANS,
        **_listas(),
    )
