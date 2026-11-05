"""
Tela de administração do suporte do sistema: lista os usuários, mostra os
dados cadastrados e ativa/desativa o acesso, sem precisar ir ao banco.

Só quem tem classe_usuario 'dev' acessa (o @hierarquia libera 'dev' e
ninguém mais quando a lista de classes é só 'dev').
"""
from flask import Blueprint, abort, flash, redirect, render_template, request, session, url_for

from app.models.database import (
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
