from flask import Blueprint, render_template, request, redirect, flash, url_for, session
from app.models.database import (
    get_usuario_por_email_senha,
    usuario_esta_ativo,
    usuario_existe_por_email,
    cadastrar_usuario,
    corretora_existe_por_cnpj,
)
from app.utils import login_required, hierarquia
from ..verifix import verificar_injection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    from ..cripto import hash_senha
    if request.method == 'POST':
        email = request.form['email']
        senha = request.form['senha']

        if verificar_injection([email, senha]):
            flash('Entrada inválida detectada.')
            return redirect(url_for('auth.login'))

        senha = hash_senha(senha)  
        print("senha hasehada: ",senha)

        # Verifica se os campos foram preenchidos
        if not email or not senha:
            flash('Por favor, preencha todos os campos.')
            return redirect(url_for('auth.login'))

        # Consulta ao banco de dados
        usuario = get_usuario_por_email_senha(email, senha)
        


        if usuario and not usuario_esta_ativo(usuario):
            flash('Seu usuário está desativado. Procure o suporte do sistema.')
            return redirect(url_for('auth.login'))

        if usuario:
            # Salva informações do usuário na sessão
            session['user_id'] = usuario['id']
            session['tipo_usuario'] = usuario['tipo_usuario']
            session['user_nome']= usuario['nome']
            session['classe_usuario'] = usuario['classe_usuario']
            session['preferencia_wpp']= usuario['preferencias_wpp']
            
            classe_usuario= session.get('classe_usuario')
            session.permanent = True
            print (classe_usuario)
            return redirect(url_for('auth.login_redir'))

        # Verifica se o usuário foi encontrado
        else:
            flash('Credenciais inválidas.')
            return redirect(url_for('auth.login'))

        
    return render_template('login.html')


@auth_bp.route('/cadastrar', methods=['GET','POST'])
@hierarquia('supervisor')
def cadastrar():
    from ..cripto import hash_senha
    
    if request.method=='POST':
        nome = request.form['nome']
        nome_format = nome.strip()  # Remove espaços em branco extras
        nome = nome_format  # Formata o nome para ter a primeira letra maiúscula
        cpf= request.form['cpf']
        email = request.form['email']
        senha = request.form['senha']
        tipo_usuario = request.form['tipo_usuario']
        classe_usuario = request.form['classe_usuario']
        identificador_proposta_pf = request.form.get('identificador_proposta_PF', '').strip() or None
        identificador_proposta_pj = request.form.get('identificador_proposta_PJ', '').strip() or None

        if classe_usuario != 'vendedor':
            identificador_proposta_pf = None
            identificador_proposta_pj = None

        if verificar_injection([
            nome,
            cpf,
            email,
            senha,
            tipo_usuario,
            classe_usuario,
            identificador_proposta_pf,
            identificador_proposta_pj,
        ]):
            flash('Entrada inválida detectada.')
            return redirect(request.url)

        senha_hashed = hash_senha(senha)
        senha=senha_hashed

        exist = usuario_existe_por_email(email)
   

        if exist:
            flash("Este email já possui cadastro")

        else:

           
            cadastro_ok = cadastrar_usuario(
                nome,
                cpf,
                email,
                senha,
                tipo_usuario,
                classe_usuario,
                identificador_proposta_pf=identificador_proposta_pf,
                identificador_proposta_pj=identificador_proposta_pj,
            )
            if not cadastro_ok:
                flash('Não foi possível cadastrar usuário. Verifique os dados informados.')
                return redirect(request.url)

            flash('Usuário cadastrado com sucesso! Faça login.')
            return redirect(url_for('auth.fechar'))

    return render_template('cadastrar.html')
    

@auth_bp.route('/logoff')
def logoff():
    session.clear()
    flash ('Desconectado com sucesso!')
    return redirect(url_for('auth.login'))


@auth_bp.route('/redirect')
def redirecionar_usuario():

    return render_template('generic/errata.html')

@auth_bp.route('/esqueci_senha', methods=['GET', 'POST'])
def esqueci_senha():
    from ..models.database import get_email_user
    from ..api_conex.conections import redefinir_senha
    if request.method == 'POST':
        email = request.form['email']
        if verificar_injection(email):
            flash('Entrada inválida detectada.')
            return redirect(url_for('auth.esqueci_senha'))

        confirmar_email= get_email_user(email)
        if email == confirmar_email:
            # Gera um token de redefinição de senha
            from ..api_conex.conections import email_gmail, redefinir_senha
            from ..models.database import senha_aleatoria
            senha= senha_aleatoria(8,email)
            assunto, mensagem, complemento =redefinir_senha(email,senha)
            email_gmail(destinatario = email , assunto=assunto, mensagem=mensagem, complemento=complemento)

            flash('Instruções de redefinição de senha enviadas para o seu e-mail.')
            return redirect(url_for('auth.login'))
        else:
            flash('E-mail não encontrado. Por favor, verifique o e-mail digitado.')
            return redirect(url_for('auth.esqueci_senha'))
    return render_template('generic/esqueci_senha.html')

           
@auth_bp.route('/mudar_senha', methods=['GET', 'POST'])
def mudar_senha():
    from ..cripto import hash_senha
    from ..models.database import mudar_senha as db_mudar_senha
    if request.method == 'POST':
        email = request.form['email']
        novasenha = request.form['novasenha']

        if verificar_injection([email, novasenha]):
            flash('Entrada inválida detectada.')
            return redirect(url_for('auth.mudar_senha'))

        novasenha = hash_senha(novasenha)
        print("senha hasehada: ",novasenha)
        troca_ok = db_mudar_senha(email, novasenha)
        if not troca_ok:
            flash('Não foi possível alterar a senha. Verifique os dados informados.')
            return redirect(url_for('auth.mudar_senha'))
        
        flash('senha alterada!')
        return redirect(url_for('auth.login_redir'))
        
     
    return render_template('generic/mudar_senha.html')


@auth_bp.route('/auten_redir', methods=['GET', 'POST'])
@login_required
def redir_atent():
    
    tipo_usuario= session.get('tipo_usuario')
    classe_usuario= session.get('classe_usuario')

    if tipo_usuario == 'vendas':
        if classe_usuario == 'vendedor':
            corretor_resp= session.get('user_nome')
            print(corretor_resp)
            return redirect(url_for('cad.acompanhar_cnt',resp=corretor_resp))
        elif classe_usuario == 'supervisor':
            resp= None
            print(resp)
            return redirect(url_for('cad.acompanhar_cnt',resp=resp))
    elif tipo_usuario == 'cadastro' or tipo_usuario == 'dev':
        resp= None
        print(resp)
        return redirect(url_for('cad.acompanhar_cnt',resp=resp))
    elif tipo_usuario == 'administrativo':
        resp= None
        print(resp)
        return redirect(url_for('cad.acompanhar_cnt',resp=resp))
    elif tipo_usuario == 'financeiro':
        resp= None
        print(resp)
        return redirect(url_for('cad.acompanhar_cnt',resp=resp))
    
    else:
        flash('Tipo de usuário inválido.')
        print(tipo_usuario)
        return redirect(url_for('generic.home'))
    

@auth_bp.route('/login_redir')
def login_redir():
    tipo_usuario = session.get('tipo_usuario')
    classe_usuario= session.get("classe_usuario")
    if tipo_usuario == 'vendas':
        if classe_usuario == 'vendedor':
            return redirect(url_for('generic.home_corretor'))
        elif classe_usuario == 'supervisor':
            return redirect(url_for('gerencial.dashboard'))
    elif tipo_usuario == 'cadastro':
        if classe_usuario == 'agente':
            return redirect(url_for('generic.home'))
        else:
            return redirect(url_for('gerencial.dashboard_administrativo'))
    elif tipo_usuario == 'cobranca':
        if classe_usuario == 'agente':
            return redirect(url_for('generic.home'))
        elif classe_usuario == 'supervisor':
            return redirect(url_for('gerencial.dashboard_cobranca'))
        else:
            return redirect(url_for('gerencial.dashboard_administrativo'))    
    elif tipo_usuario == 'administrativo':
        if classe_usuario == 'agente':
            return redirect(url_for('generic.home'))
        else:
            return redirect(url_for('gerencial.dashboard_administrativo'))
    elif tipo_usuario == 'financeiro':
       if classe_usuario == 'agente':
            return redirect(url_for('generic.home'))
       else:
            return redirect(url_for('gerencial.dashboard_financeiro'))
    elif tipo_usuario == 'enfermagem':
        return redirect(url_for('generic.home'))
    elif tipo_usuario == 'autorizacao':
        return redirect(url_for('amatiss.home'))
    elif tipo_usuario == 'sac':
        return redirect(url_for('sac.home'))
    else:
        flash(f'Local de utilização {tipo_usuario}.')
        return redirect(url_for('generic.home'))
    
@auth_bp.route('/fechar')
def fechar():
    return redirect(url_for('auth.login_redir'))
    
@auth_bp.route('/cadastrar_corretora', methods=['GET','POST'])
def cadastrar_corretora():
    from ..models.database import cadastrar_corretora
    if request.method=='POST':
        nome = request.form['nome']
        nome_format = nome.strip()  # Remove espaços em branco extras
        nome = nome_format
        
        cnpj= request.form['cnpj']
        parcela1= request.form['taxa1']
        parcela2= request.form['taxa2']
        parcela3= request.form['taxa3']
        vitalicia = request.form['taxa4']

        if verificar_injection([nome, cnpj, parcela1, parcela2, parcela3, vitalicia]):
            flash('Entrada inválida detectada.')
            return redirect(request.url)

        dados= {
            'nome': nome,
            'cnpj': cnpj,
            'parcela1': parcela1,
            'parcela2': parcela2,
            'parcela3': parcela3,
            'vitalicia': vitalicia
        }

        exist = corretora_existe_por_cnpj(cnpj)
   

        if exist:
            flash("Esta corretora já possui cadastro")
            return redirect(request.url)

        else:
            
            cadastro_corretora_ok = cadastrar_corretora(dados)
            if not cadastro_corretora_ok:
                flash('Não foi possível cadastrar corretora. Verifique os dados informados.')
                return redirect(request.url)

            flash('Corretora cadastrada com sucesso!')
            return redirect(url_for('auth.fechar'))
    return render_template('generic/cadastrar_corretoras.html')


@auth_bp.route('manutencao')
def manutencao():
    return render_template('generic/manutencao.html')