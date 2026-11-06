"""
Tela de administração do suporte do sistema: lista os usuários, cadastra
novos, mostra os dados cadastrados e ativa/desativa o acesso, sem precisar
ir ao banco.

Só quem tem classe_usuario 'dev' acessa (o @hierarquia libera 'dev' e
ninguém mais quando a lista de classes é só 'dev').
"""
from flask import Blueprint, abort, flash, redirect, render_template, request, session, url_for

from app.models.database import (
    conflitos_novo_usuario,
    criar_usuario_admin,
    definir_usuario_ativo,
    get_usuario_admin,
    listar_usuarios_admin,
    resumo_usuarios_admin,
)
from app.utils import hierarquia, login_required
from ..verifix import verificar_injection

suporte_bp = Blueprint('suporte', __name__)

STATUS_VALIDOS = ('ativos', 'inativos')

# rótulos das colunas conhecidas da tabela usuarios; colunas novas aparecem
# nos detalhes com o próprio nome
ROTULOS_USUARIO = {
    'id': 'ID',
    'nome': 'Nome',
    'cpf': 'CPF',
    'email': 'E-mail / login',
    'tipo_usuario': 'Área',
    'classe_usuario': 'Classe (hierarquia)',
    'ativo': 'Situação',
    'autorizado': 'Autorizado (campo antigo)',
    'preferencias_wpp': 'Preferências de WhatsApp',
    'identificador_proposta_pf': 'Identificador de proposta PF',
    'identificador_proposta_pj': 'Identificador de proposta PJ',
}


def _filtros():
    filtros = {
        'busca': (request.args.get('busca') or '').strip(),
        'area': (request.args.get('area') or '').strip(),
        'classe': (request.args.get('classe') or '').strip(),
        'status': (request.args.get('status') or '').strip(),
    }
    if filtros['status'] not in STATUS_VALIDOS:
        filtros['status'] = ''
    if verificar_injection(list(filtros.values())):
        flash('Entrada inválida detectada.')
        filtros = {k: '' for k in filtros}
    return filtros


def _destino_seguro(destino):
    """Volta só para telas desta área (evita redirecionar para outro site)."""
    base = url_for('suporte.usuarios')
    if destino and destino.startswith(base) and '//' not in destino and '\\' not in destino:
        return destino
    return base


@suporte_bp.route('/usuarios')
@login_required
@hierarquia('dev')
def usuarios():
    filtros = _filtros()
    lista = listar_usuarios_admin(
        busca=filtros['busca'] or None,
        area=filtros['area'] or None,
        classe=filtros['classe'] or None,
        status=filtros['status'] or None,
    )
    totais, areas, classes = resumo_usuarios_admin()
    return render_template(
        'suporte/usuarios.html',
        usuarios=lista,
        filtros=filtros,
        totais=totais,
        areas=areas,
        classes=classes,
        usuario_logado_id=session.get('user_id'),
    )


# áreas e classes que o sistema conhece (login_redir, menus, @hierarquia);
# valores que já existirem no banco também entram na lista
AREAS_USUARIO = [
    ('administrativo', 'Administrativo'),
    ('autorizacao', 'Autorização'),
    ('cadastro', 'Cadastro'),
    ('cobranca', 'Cobrança'),
    ('enfermagem', 'Enfermagem'),
    ('financeiro', 'Financeiro'),
    ('sac', 'SAC / Atendimento'),
    ('vendas', 'Vendas'),
    ('dev', 'Suporte do sistema (dev)'),
]
CLASSES_USUARIO = [
    ('agente', 'Agente'),
    ('supervisor', 'Supervisor'),
    ('vendedor', 'Vendedor'),
    ('dev', 'Suporte do sistema (dev)'),
]
SENHA_MINIMO = 8
CAMPOS_NOVO_USUARIO = ('nome', 'cpf', 'email', 'tipo_usuario', 'classe_usuario',
                       'identificador_proposta_pf', 'identificador_proposta_pj')


def _opcoes(conhecidas, do_banco):
    opcoes = list(conhecidas)
    valores = {valor for valor, _ in conhecidas}
    opcoes += [(v, v) for v in do_banco if v and v not in valores]
    return [{'valor': v, 'rotulo': r} for v, r in opcoes]


def _validar_novo_usuario(dados, senha, confirmacao, areas, classes):
    """Erros por campo (vazio quando está tudo certo)."""
    erros = {}
    if len(dados['nome']) < 3:
        erros['nome'] = 'Informe o nome completo.'
    cpf = ''.join(ch for ch in dados['cpf'] if ch.isdigit())
    if len(cpf) != 11:
        erros['cpf'] = 'O CPF precisa ter 11 dígitos.'
    email = dados['email']
    if '@' not in email or '.' not in email.split('@')[-1] or ' ' in email:
        erros['email'] = 'Informe um e-mail válido.'
    if dados['tipo_usuario'] not in areas:
        erros['tipo_usuario'] = 'Escolha a área.'
    if dados['classe_usuario'] not in classes:
        erros['classe_usuario'] = 'Escolha a classe.'
    if dados['classe_usuario'] == 'vendedor':
        if not dados['identificador_proposta_pf']:
            erros['identificador_proposta_pf'] = 'Obrigatório para vendedor.'
        if not dados['identificador_proposta_pj']:
            erros['identificador_proposta_pj'] = 'Obrigatório para vendedor.'
    if len(senha) < SENHA_MINIMO:
        erros['senha'] = f'A senha precisa ter pelo menos {SENHA_MINIMO} caracteres.'
    elif senha != confirmacao:
        erros['senha_confirmacao'] = 'As senhas não conferem.'
    if verificar_injection([senha]):
        # o login recusa senhas com esses trechos; o usuário nunca conseguiria entrar
        erros['senha'] = 'Essa senha tem trechos que o login não aceita. Escolha outra.'
    if not erros:
        for campo in conflitos_novo_usuario(email, cpf):
            erros[campo] = ('Já existe um usuário com este e-mail.' if campo == 'email'
                            else 'Já existe um usuário com este CPF.')
    return erros


@suporte_bp.route('/usuarios/novo', methods=['GET', 'POST'])
@login_required
@hierarquia('dev')
def novo_usuario():
    from ..cripto import hash_senha

    _, areas_banco, classes_banco = resumo_usuarios_admin()
    areas = _opcoes(AREAS_USUARIO, areas_banco)
    classes = _opcoes(CLASSES_USUARIO, classes_banco)
    dados = {campo: '' for campo in CAMPOS_NOVO_USUARIO}
    dados['classe_usuario'] = 'agente'
    erros = {}

    if request.method == 'POST':
        dados = {campo: (request.form.get(campo) or '').strip() for campo in CAMPOS_NOVO_USUARIO}
        dados['nome'] = ' '.join(dados['nome'].split())
        if dados['classe_usuario'] != 'vendedor':
            dados['identificador_proposta_pf'] = ''
            dados['identificador_proposta_pj'] = ''
        senha = request.form.get('senha') or ''
        confirmacao = request.form.get('senha_confirmacao') or ''

        if verificar_injection(list(dados.values())):
            erros['geral'] = 'Entrada inválida detectada. Revise os campos.'
        else:
            erros = _validar_novo_usuario(
                dados, senha, confirmacao,
                {o['valor'] for o in areas}, {o['valor'] for o in classes},
            )

        if not erros:
            cpf = ''.join(ch for ch in dados['cpf'] if ch.isdigit())
            novo_id = criar_usuario_admin(
                dados['nome'], cpf, dados['email'], hash_senha(senha),
                dados['tipo_usuario'], dados['classe_usuario'],
                identificador_proposta_pf=dados['identificador_proposta_pf'] or None,
                identificador_proposta_pj=dados['identificador_proposta_pj'] or None,
            )
            print(f"[suporte] usuário {novo_id} ({dados['email']}, {dados['tipo_usuario']}/"
                  f"{dados['classe_usuario']}) criado por {session.get('user_id')} ({session.get('user_nome')})")
            flash(f"Usuário {dados['nome']} cadastrado. Ele já pode entrar com o e-mail "
                  f"{dados['email']} e a senha definida.")
            if novo_id:
                return redirect(url_for('suporte.usuario_detalhe', usuario_id=novo_id))
            return redirect(url_for('suporte.usuarios'))

    return render_template(
        'suporte/usuario_novo.html',
        dados=dados,
        erros=erros,
        areas=areas,
        classes=classes,
        senha_minimo=SENHA_MINIMO,
    )


@suporte_bp.route('/usuarios/<int:usuario_id>')
@login_required
@hierarquia('dev')
def usuario_detalhe(usuario_id):
    usuario = get_usuario_admin(usuario_id)
    if not usuario:
        flash('Usuário não encontrado.')
        return redirect(url_for('suporte.usuarios'))
    campos = [
        {'coluna': coluna, 'rotulo': ROTULOS_USUARIO.get(coluna, coluna), 'valor': valor}
        for coluna, valor in usuario.items()
    ]
    return render_template(
        'suporte/usuario_detalhe.html',
        usuario=usuario,
        campos=campos,
        usuario_logado_id=session.get('user_id'),
    )


@suporte_bp.route('/usuarios/<int:usuario_id>/ativo', methods=['POST'])
@login_required
@hierarquia('dev')
def alterar_ativo(usuario_id):
    destino = _destino_seguro(request.form.get('voltar'))
    valor = request.form.get('ativo')
    if valor not in ('0', '1'):
        abort(400)
    ativar = valor == '1'

    if not ativar and usuario_id == session.get('user_id'):
        flash('Você não pode desativar o seu próprio usuário.')
        return redirect(destino)

    usuario = get_usuario_admin(usuario_id)
    if not usuario:
        flash('Usuário não encontrado.')
        return redirect(url_for('suporte.usuarios'))

    definir_usuario_ativo(usuario_id, ativar)
    print(f"[suporte] usuário {usuario_id} ({usuario.get('email')}) "
          f"{'ativado' if ativar else 'desativado'} por {session.get('user_id')} ({session.get('user_nome')})")
    if ativar:
        flash(f"Usuário {usuario.get('nome')} ativado. Ele já pode entrar no sistema.")
    else:
        flash(f"Usuário {usuario.get('nome')} desativado. Ele não consegue mais entrar e a sessão aberta foi encerrada.")
    return redirect(destino)
