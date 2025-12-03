import requests
from flask import session, jsonify, url_for
import os
import base64 
from email.message import EmailMessage
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import smtplib
from ..models.database import get_nome
from ..routes.generic import get_relative_path_img

def consultar_api():
    #url da api
    url= 'https://sandbox.rapidoc.tech/tema'

    #headers 
    headers= {
        "Authorization": "Bearer eyJhbGciOiJSUzUxMiJ9.eyJjbGllbnQiOiJNSFZJREEifQ.dpb8Lazd9TDs1tKIhYi2TOTIPr6gnF_s1RdczDwLmpaP14lIY9Lp0XFb9I54kJOjgZ2d6jK6AxbMPDJ7ifioUK12jVBtvaB-wkKtl6NajpURab8mb2YGzeg-JNOF2JMfk80fdI-PYxwv2fq-QgJCq2dNgr8X_D3gXVfa3P6J5Z3UlOP0VvebB_KFUkKY1izLOhKMHlmWq5frXlxlshOy40u_9Rz-dO9fSazEiu5exCbSRCzX240PbG0I-Gvuc02CY-XQ0ypAogA5OpHMVSVCB20Ol_FUD2ls5Rom4Vo-ghOCSg7xVwfEoB6G1Yp6IfY13v_s0RADxGSZxUJa5HSeadrQ-mGVs9keylBTjdmzwANI-rd6JqM1XkbsAi0Yrygwf47lj0CuqDfVSim_9ADUy4tCP7Mwt1SD0ivoXq3wefX104YzBj-Uzd8FXeXMUQIo0VQyaXQ37U4Y__I2BNf2FBgY5eXfmfYX1ebnkI9VtJWSojVoHBG-nA8uJOYy4qyqdWnY6B64ibI674RVI1iuafEmLIWhbCw1G_nD1VPUejbG1lJCnV2s-mUJPoS9_qrAnNVShMaKElXB4nVAIrSbzW_bdsGhiqJJXmuvFxVCOzIbexFtBdT-VDwZdcik0SZDgfI1XsVqXnaMsZprSzXtofxDhF-MU8my4mEzKUz0Kys",
        "x-rapidoc-client": "3163f8c7-cd1a-4e04-a54d-d5335e9afd10",
        "Content-Type": "application/json"
    }

    #teste

    response = requests.get(url, headers=headers)

    # Verifique o status e imprima a resposta
    print("Status Code:", response.status_code)
    print("Resposta JSON:", response.json())

def consultar_cep(cep):
    """
    Consulta um CEP usando a API ViaCEP.
    Retorna um dicionário com os dados do endereço ou None se não encontrar.
    """
    
    cep = ''.join(filter(str.isdigit, str(cep)))
    print (cep)
    if len(cep) != 8:
        return None

    url = f'https://viacep.com.br/ws/{cep}/json/'
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if 'erro' in data:
            return None
        return data
    except Exception as e:
        print(f"Erro ao consultar CEP: {e}")
        return None

    
def siccada_kommo_excel():
    import pandas as pd
    import json
    dados = siccada_kommo()
    leads = dados.get('_embedded', {}).get('leads', [])
    lista_leads = []
    for lead in leads:
        lista_leads.append({
            'id': lead.get('id'),
            'name': lead.get('name'),
            'price': lead.get('price'),
            'responsible_user_id': lead.get('responsible_user_id'),
            'status_id': lead.get('status_id'),
            'created_at': lead.get('created_at'),
            'updated_at': lead.get('updated_at'),
            # Adicione outros campos que quiser aqui
        })
    df = pd.DataFrame(lista_leads)
    df.to_excel('leads_kommo.xlsx', index=False)
    print("Arquivo leads_kommo.xlsx criado com sucesso!")
    with open('leads_kommo.json', 'w', encoding='utf-8') as f:
        json.dump(lista_leads, f, ensure_ascii=False, indent=4)
    print("Arquivo leads_kommo.json criado com sucesso!")

def enviar_email(destinatario, assunto, corpo):
    EMAIL = 'alertaamacor.siccada@gmail.com'
    SENHA = 'Amacor@2025'  # Use senha de app, não a senha normal!

    msg = EmailMessage()
    msg['Subject'] = assunto
    msg['From'] = EMAIL
    msg['To'] = destinatario
    msg.set_content(corpo)

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(EMAIL, SENHA)
        smtp.send_message(msg)
        print('E-mail enviado com sucesso!')


def autorizar():
    import webbrowser

    # Substitua pelas suas credenciais
    CLIENT_ID = '58195249-6f0d-4ab4-bdff-6fe237c11bcd'
    REDIRECT_URI = 'http://192.168.0.150:8001/api/callback'  # O redirect URI
    SUBDOMAIN = 'marcosheberlima'  # Seu subdomínio Kommo

    # URL de autorização (onde o usuário vai autorizar o acesso)
    auth_url = f'https://{SUBDOMAIN}.kommo.com/oauth?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code'

    # Abra a URL no navegador
    print(f'Abra a seguinte URL no navegador e autorize o acesso: {auth_url}')
    webbrowser.open(auth_url)  # Isso vai abrir a URL no seu navegador


def siccada_kommo():
    access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImY4OWEyYTgzZmJiYWY5YmEwZTE4NmIxNGM0NDQxMzEyNzJiOTZlNDI3OTM4ZTA1Mjc1YmNiNDNjODE0MzlmMzZlMTVkNmRmODczZWI4YTg0In0.eyJhdWQiOiI1ODE5NTI0OS02ZjBkLTRhYjQtYmRmZi02ZmUyMzdjMTFiY2QiLCJqdGkiOiJmODlhMmE4M2ZiYmFmOWJhMGUxODZiMTRjNDQ0MTMxMjcyYjk2ZTQyNzkzOGUwNTI3NWJjYjQzYzgxNDM5ZjM2ZTE1ZDZkZjg3M2ViOGE4NCIsImlhdCI6MTc1MjA4MTIxNCwibmJmIjoxNzUyMDgxMjE0LCJleHAiOjE3NTIxMDU2MDAsInN1YiI6IjEzMDE2OTE1IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0NDM1MzUxLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMzBhM2I4OWMtM2NkMC00NmM2LWI0YTgtZDQ5NjY2MWU1OGVlIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.k02isA6rLFMy9ZC_YiRdHtjGRSplluqK2b4j1gRztj5d0U0l4QL7-bdZacQ6RH1Z23fPjzxhRYV5zePzumW2pTo3r_nhMxFRw6bi6VAA9oV4GDDjA5RAeDNursNEmZx4wiN3vLu_IpMRrVlT7HqTQ1peyQUSc85fRkVJnCTpUq-eNYEmi-w8pmLSUCkgHkdpbgii8FeoV9a--CKsR8_XJRF57FOKexRFmaPZi5l6qwd8RzQJV3ziYGoIedlW4hyDyswpkYS4Qu1S8JZNnn_2y4I7VO8nxpWUKhitKcspUSzCa-gJ9m9sGfJ_DD3hozbvnq8RiTfQmfQFERbEOEhYWA'
    subdomain = 'marcosheberlima'
    headers= {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
    }

    url = f'https://{subdomain}.kommo.com/api/v4/leads'
    response = requests.get(url, headers=headers)
    print(response.status_code)
    print(response.json())

    return response.json()



def email_gmail(destinatario, assunto, mensagem,complemento):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from email.mime.image import MIMEImage
    import os
    from flask import current_app
    caminho_imagem = os.path.join(current_app.root_path, 'static', 'image', 'logo_amacor.png')


    # Configurações do remetente
    remetente = "alertaamacor.siccada@gmail.com"
    senha_app = "sajg qyhm vmsf cvgr"  # sem espaços!

    # Configurações do destinatário
   

    # Monta o e-mail
    print("monatando email...")
    msg = MIMEMultipart()
    msg["From"] = f"Amacor Alertas <{remetente}>"
    msg["To"] = destinatario
    msg["Subject"] = assunto
    

    
    mensagem_html = mensagem

    html1 = f"""
<html>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif;">
    <table width="100%" align="center" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto;">
      <tr>
        <td align="center">
          <img src="cid:logo_amacor" width="600" style="display:block; width:100%; max-width:600px; height:auto;" alt="Amacor Planos de Saúde">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; font-size: 16px; color: #333;">
          <p>{mensagem_html}</p>
        </td>
      </tr>
    </table>

    <div style="background-color: #1a1a1a; color: white; padding: 30px 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; max-width:600px; margin:auto;"><strong>Abraços,<br>Equipe Amacor</strong></p>

      <p style="color: #cccccc;">
        A Amacor é uma empresa especializada em planos de saúde, oferecendo soluções personalizadas para atender às suas necessidades. Nossa missão é proporcionar saúde e bem-estar a todos os nossos clientes.</p>
        <p style="color: #cccccc;">Por favor, pedimos que você não responda este e-mail, pois se trata de uma mensagem automática.
        
      </p>
        Faça parte da nossa comunidade e fique por dentro das novidades da Amacor.
      <p style="color: #cccccc;">
        
      </p>

      <div style="margin: 20px 0; display: flex; gap: 20px;">
        <a href="https://wa.me/5521978914749?text=Olá,%20gostaria%20de%20informações%20sobre%20planos" target="_blank"><img src="https://img.icons8.com/ios-filled/24/ffffff/whatsapp.png" alt="WhatsApp" /></a>
        <a href="https://www.instagram.com/amacorplanosdesaude/"><img src="https://img.icons8.com/ios-filled/24/ffffff/instagram-new.png" alt="Instagram" /></a>
        <a href="https://www.facebook.com/amacorsaude?locale=pt_BR"><img src="https://img.icons8.com/ios-filled/24/ffffff/facebook-new.png" alt="Facebook" /></a>
        <a href="https://www.youtube.com/@AmacorPlanos"><img src="https://img.icons8.com/ios-filled/24/ffffff/youtube-play.png" alt="YouTube" /></a>
      </div>

      <p style="color: #cccccc;">
        Tem alguma dúvida sobre seu plano? Fale com a gente pelo WhatsApp ou nossos canais oficiais.
      </p>

      <p style="margin-top: 20px;">
        <strong>Amacor Planos de Saúde</strong><br>
        <strong>R. Augusto de Vasconcelos, 544  - Rio de Janeiro, RJ - 23050-340</strong>
      </p>
    </div>
  </body>
</html>
"""

    with open(caminho_imagem, 'rb') as img:
        mime_img = MIMEImage(img.read())
        mime_img.add_header('Content-ID', '<logo_amacor>')
        mime_img.add_header('Content-Disposition', 'inline', filename="logo_amacor.png")
        msg.attach(mime_img)

    if complemento == None:   
        msg.attach(MIMEText(html1, 'html'))

    else:
        # Anexar o HTML
        if len(complemento)>20:
            msg.attach(MIMEText(html1, 'html'))
        else:
            msg.attach(MIMEText(html1, 'html'))

        


    # Envia via servidor SMTP do Gmail
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(remetente, senha_app)
            server.send_message(msg)
            print("✅ E-mail enviado com sucesso!")
    except Exception as e:
        print("❌ Erro ao enviar e-mail:", str(e))

def msg_email(status, proposta, complemento):
    nome = get_nome(proposta)
    
    # Template para os círculos de progresso (reutilizável)
    def criar_etapa(numero, titulo, subtitulo, ativo=False, concluido=False):
        if concluido:
            cor_fundo = "#0a2f68"
            cor_texto = "#0a2f68"
            status_texto = "Concluído"
        elif ativo:
            cor_fundo = "#0a2f68"
            cor_texto = "#0a2f68"
            status_texto = "Em andamento"
        else:
            cor_fundo = "#e0e0e0"
            cor_texto = "#666"
            status_texto = "Pendente"
            
        return f"""
        <div style="text-align: center; width: 24%; min-width: 80px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 10px;">
                <tr>
                    <td style="background-color: {cor_fundo}; color: white; width: 30px; height: 30px; border-radius: 50%; text-align: center; font-weight: bold; font-size: 16px; line-height: 30px;">
                        {numero}
                    </td>
                </tr>
            </table>
            <p style="margin: 0; font-size: 14px; color: {cor_texto}; font-weight: bold;">{titulo}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">{status_texto}</p>
        </div>
        """
    
    if status == 'entrevista online enviada':
        assunto = f'{nome} sua Declaração de saúde Online foi Enviada'
        mensagem = f"""
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p style="font-size: 16px; margin-bottom: 20px;">Olá {nome},</p>
    
    <p style="font-size: 16px;">Sua Declaração de saúde online foi enviada e está disponível para ser realizada no link abaixo:</p>
    
    <div style="text-align: center; margin: 25px 0;">
        <a href="{complemento}" 
           style="display: inline-block; background-color: #0a2f68; color: white; 
                  padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                  font-weight: bold; font-size: 16px;">
            Acessar Declaração de saúde Online
        </a>
    </div>
    
    <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 30px;">
        <strong>Prazo para realização:</strong> 48 horas após o recebimento deste e-mail
    </p>
    
    <!-- Linha do tempo de progresso CORRIGIDA -->
    <div style="margin: 40px 0; position: relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
            <tr>
                <td width="25%" align="center">
                    {criar_etapa("1", "Cadastro", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("2", "Declaração", "", ativo=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("3", "Análise", "", ativo=False)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("4", "Finalização", "", ativo=False)}
                </td>
            </tr>
        </table>
        
        <!-- Barra de progresso -->
        <div style="height: 4px; background-color: #e0e0e0; position: relative; margin: 0 12%;">
            <div style="width: 50%; height: 100%; background-color: #0a2f68; position: absolute;"></div>
        </div>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
        Após concluir a Declaração de saúde, nosso time dará continuidade ao processo de análise.
        Você receberá atualizações por e-mail.
    </p>
</div>
"""
        return assunto, mensagem, complemento
    
    elif status == 'analise de declaração':
        assunto= f'{nome} sua Declaração de saúde foi enviada para análise'
        mensagem = f"""
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p style="font-size: 16px; margin-bottom: 20px;">Olá {nome},</p>
    
    <p style="font-size: 16px;">Sua Declaração de saúde online foi enviada para análise interna.</p>
    
    <p style="font-size: 16px;">Durante essa análise verificaremos as patologias declaradas na entrevista de acolhimento.</p>

    <!-- Linha do tempo de progresso CORRIGIDA -->
    <div style="margin: 40px 0; position: relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
            <tr>
                <td width="25%" align="center">
                    {criar_etapa("1", "Entrevista", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("2", "Análise", "", ativo=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("3", "Cadastro", "", ativo=False)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("4", "Finalização", "", ativo=False)}
                </td>
            </tr>
        </table>
        
        <!-- Barra de progresso -->
        <div style="height: 4px; background-color: #e0e0e0; position: relative; margin: 0 12%;">
            <div style="width: 30%; height: 100%; background-color: #0a2f68; position: absolute;"></div>
        </div>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
        Você receberá uma atualização por e-mail ou Whatsapp assim que a análise for concluída, 
        informando os próximos passos do processo.
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
        <strong>Prazo estimado:</strong> 2-3 dias úteis
    </p>
</div>
"""
        return assunto, mensagem, complemento
    
    elif status == 'entrevista agendada':
        assunto = f'{nome} sua entrevista está agendada'
        mensagem = f"""
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p style="font-size: 16px; margin-bottom: 20px;">Olá {nome},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Sua entrevista presencial foi agendada para:</p>
    
    <div style="background-color: #f5f9ff; border-left: 4px solid #0a2f68; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
        <p style="font-size: 18px; color: #0a2f68; font-weight: bold; margin: 0; text-align: center;">
            {complemento}
        </p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 30px;">
        <strong>Recomendações:</strong><br>
        • Chegue 5 minutos antes do horário marcado<br>
        • Traga seu documento de identificação com foto<br>
        • Use máscara (caso necessário)<br>
        • Local: Clínica Amacor
    </p>

    <!-- Linha do tempo de progresso CORRIGIDA -->
    <div style="margin: 40px 0; position: relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
            <tr>
                <td width="25%" align="center">
                    {criar_etapa("1", "Entrevista", "", ativo=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("2", "Análise", "", ativo=False)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("3", "Cadastro", "", ativo=False)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("4", "Finalização", "", ativo=False)}
                </td>
            </tr>
        </table>
        
        <!-- Barra de progresso -->
        <div style="height: 4px; background-color: #e0e0e0; position: relative; margin: 0 12%;">
            <div style="width: 5%; height: 100%; background-color: #0a2f68; position: absolute;"></div>
        </div>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
        Caso precise reagendar ou tenha alguma dúvida, entre em contato pelo WhatsApp:
        <a href="https://wa.me/5521978914749" style="color: #0a2f68; text-decoration: none; font-weight: bold;">
            (21) 97891-4749
        </a>
    </p>
</div>
"""
        return assunto, mensagem, complemento
    
    elif status == 'geração de kit':
        assunto = f'{nome} seu contrato está pronto para ser entregue!'
        mensagem = f"""
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    
    <div style="background-color: #f0f8ff; border: 1px solid #0a2f68; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
        <p style="font-size: 18px; color: #0a2f68; font-weight: bold; margin: 0 0 10px 0;">
        {nome}, seu contrato está pronto para ser entregue!
        </p>
        <p style="font-size: 16px; margin: 0;">
            O kit contratual será gerado e enviado em breve.
        </p>
    </div>

    <!-- Linha do tempo de progresso CORRIGIDA -->
    <div style="margin: 40px 0; position: relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
            <tr>
                <td width="25%" align="center">
                    {criar_etapa("1", "Entrevista", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("2", "Análise", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("3", "Cadastro", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("4", "Kit", "Contratual", ativo=True)}
                </td>
            </tr>
        </table>
        
        <!-- Barra de progresso -->
        <div style="height: 4px; background-color: #e0e0e0; position: relative; margin: 0 12%;">
            <div style="width: 90%; height: 100%; background-color: #0a2f68; position: absolute;"></div>
        </div>
    </div>
    
    <p style="font-size: 16px; margin: 25px 0;">
        <strong>O que acontece agora?</strong><br>
        • Seu kit contratual está sendo preparado<br>
        • Você receberá um e-mail com os documentos para assinatura digital<br>
        • Após a assinatura, sua carteirinha será emitida
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
        <strong>Prazo estimado para recebimento:</strong> 2-3 dias úteis
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://wa.me/5521978914749" 
           style="display: inline-block; background-color: #0a2f68; color: white; 
                  padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                  font-weight: bold; font-size: 16px;">
            Falar com Atendente
        </a>
    </div>
</div>
"""
        return assunto, mensagem, complemento
    
    elif status == 'contrato finalizado':
        assunto = f'{nome} o processo de contratação está Finalizado'
        mensagem = f"""
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    
    <div style="background-color: #f0f8ff; border: 2px solid #0a2f68; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
        <p style="font-size: 20px; color: #0a2f68; font-weight: bold; margin: 0 0 10px 0;">
             Parabéns {nome}! Seu contrato foi finalizado com sucesso!
        </p>
        <p style="font-size: 16px; margin: 0;">
            Sua carteirinha está pronta para ser enviada.
        </p>
    </div>

    <!-- Linha do tempo de progresso COMPLETA CORRIGIDA -->
    <div style="margin: 40px 0; position: relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
            <tr>
                <td width="25%" align="center">
                    {criar_etapa("1", "Entrevista", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("2", "Análise", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("3", "Cadastro", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("4", "Kit", "Assinado", concluido=True)}
                </td>
            </tr>
        </table>
        
        <!-- Barra de progresso -->
        <div style="height: 4px; background-color: #e0e0e0; position: relative; margin: 0 12%;">
            <div style="width: 100%; height: 100%; background-color: #0a2f68; position: absolute;"></div>
        </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://wa.me/5521978914749?text=Olá,%20gostaria%20de%20solicitar%20a%20carteirinha" 
           style="display: inline-block; background-color: #0a2f68; color: white; 
                  padding: 15px 30px; text-decoration: none; border-radius: 4px; 
                  font-weight: bold; font-size: 18px; box-shadow: 0 4px 8px rgba(10, 47, 104, 0.2);">
            📲 Solicitar Carteirinha Agora
        </a>
    </div>
    
    <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 30px;">
        <strong>Prazo de entrega:</strong> até 1 hora após a solicitação
    </p>
    
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="font-size: 16px; margin-top: 0; font-weight: bold;">Informações importantes:</p>
        <ul style="padding-left: 20px; margin-bottom: 0;">
            <li style="margin-bottom: 8px;">O modelo digital da sua carteirinha será enviado por Whatsapp, no momento apenas o modelo digital de carteirinha está disponível</li>
        </ul>
    </div>
</div>
"""
        return assunto, mensagem, complemento
    
    elif status == 'kit enviado':
        assunto = f'{nome} seu kit foi enviado'
        mensagem = f"""
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p style="font-size: 16px; margin-bottom: 20px;">Olá {nome},</p>
    <p style="font-size: 16px; margin: 0;">
            Seu kit contratual foi enviado e deve ser assinado <strong>dentro de 24 horas</strong> a partir do recebimento.
        </p>
        <p style="font-size: 16px; margin: 0;">
            Realize a assinatura a partir do link abaixo.
        </p>
        <br>
        <a href="{complemento}" 
           style="display: inline-block; background-color: #0a2f68; color: white; 
                  padding: 15px 30px; text-decoration: none; border-radius: 4px; 
                  font-weight: bold; font-size: 18px; box-shadow: 0 4px 8px rgba(10, 47, 104, 0.2);">
            Assinar Contrato
        </a>
    
    <!-- Linha do tempo de progresso CORRIGIDA -->
    <div style="margin: 40px 0; position: relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
            <tr>
                <td width="25%" align="center">
                    {criar_etapa("1", "Entrevista", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("2", "Análise", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("3", "Cadastro", "", concluido=True)}
                </td>
                <td width="25%" align="center">
                    {criar_etapa("4", "Kit", "Enviado", ativo=True)}
                </td>
            </tr>
        </table>
        
        <!-- Barra de progresso -->
        <div style="height: 4px; background-color: #e0e0e0; position: relative; margin: 0 12%;">
            <div style="width: 70%; height: 100%; background-color: #0a2f68; position: absolute;"></div>
        </div>
    </div>
    
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="font-size: 16px; margin-top: 0; font-weight: bold;">Como assinar seu contrato:</p>
        <ol style="padding-left: 20px; margin-bottom: 0;">
            <li style="margin-bottom: 8px;">Acesse o link recebido no e-mail</li>
            <li style="margin-bottom: 8px;">Verifique todos os dados do contrato</li>
            <li style="margin-bottom: 8px;">Assine digitalmente todos os documentos</li>
            <li>Confirme o recebimento da confirmação por e-mail</li>
        </ol>
    </div>
    
    <div style="background-color: #fff5f5; border: 2px solid #d80000; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
        <p style="font-size: 18px; color: #d80000; font-weight: bold; margin: 0 0 10px 0;">
            ⏳ ATENÇÃO: Prazo de 24 horas para assinatura!
        </p>
    <p style="font-size: 16px; color: #d80000; font-weight: bold; text-align: center;">
        ⚠️ Após 5 dias a partir do envio, o contrato será cancelado automaticamente se não for assinado.
    </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="https://wa.me/5521978914749" 
           style="display: inline-block; background-color: #0a2f68; color: white; 
                  padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                  font-weight: bold; font-size: 16px;">
            Precisa de ajuda? Fale conosco
        </a>
    </div>
</div>
"""
        return assunto, mensagem, complemento
    
    elif status == 'Enviado ao cadastro':
        assunto = f'{nome} seu processo de contratação foi iniciado'
        mensagem = f'''
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p>Olá {nome},</p>
    <p>Recebemos a documentação da sua proposta do plano de saúde e o processo de contratação foi iniciado.</p>
    <p>Dentro dos próximos 02 dias entraremos em contato para prosseguir com o processo de adesão ao plano.</p>
    
    <h3 style="color: #0a2f68; border-bottom: 2px solid #0a2f68; padding-bottom: 5px; display: inline-block;">
        Próximas etapas do seu plano:
    </h3>
    
    <!-- Etapas usando a função criar_etapa -->
    <div style="margin: 40px 0; position: relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 15px;">
            <tr>
                <td width="20%" align="center">
                    {criar_etapa("1", "Entrevista", "Presencial", ativo=True)}
                </td>
                <td width="20%" align="center">
                    {criar_etapa("2", "Análise", "Declaração", ativo=False)}
                </td>
                <td width="20%" align="center">
                    {criar_etapa("3", "Cadastro", "", ativo=False)}
                </td>
                <td width="20%" align="center">
                    {criar_etapa("4", "Geração", "Kit", ativo=False)}
                </td>
                <td width="20%" align="center">
                    {criar_etapa("5", "Contrato", "Finalizado", ativo=False)}
                </td>
            </tr>
        </table>
    </div>
    
    <div style="background-color: #fff8e6; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
        <p style="margin: 0; color: #856404; font-weight: 500;">
            ⏱️ <strong>Todo esse processo deverá ser realizado em até 30 dias corridos</strong> a partir da data de pagamento da adesão. 
            Caso não cumpra o prazo o plano será suspenso e após 10 dias de suspensão seu plano será <strong>cancelado.</strong>
        </p>
    </div>
</div>
'''
        return assunto, mensagem, complemento
    
    else:
        print(f"Status não reconhecido: {status}")
        return complemento




def redefinir_senha(email,senha):
    from ..models.database import senha_aleatoria
    # Gerar uma senha aleatória de 8 caracteres
    
    destinatario = email
    assunto = "Redefinição de Senha"
    mensagem = f"""
    Olá,\n\nSua senha foi redefinida com sucesso. Sua nova senha é: {senha}\n\nPor favor, faça login com essa senha e altere-a imediatamente para garantir a segurança da sua conta.
    """
    complemento = None
    return assunto, mensagem, complemento

def get_profile_photo():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'foto_url': None})
    
    # Verifica se a foto existe
    foto_path = os.path.join(get_relative_path_img(), f'foto_perfil{user_id}')
    extensions = ['.jpg', '.jpeg', '.png', '.gif']
    
    for ext in extensions:
        caminho_completo = foto_path + ext
        if os.path.exists(caminho_completo):
            # Retorna a URL relativa para o frontend
            foto_url = url_for('static', filename=f'uploads/profile_photos/foto_perfil{user_id}{ext}')
            return jsonify({'foto_url': foto_url})
    
    return jsonify({'foto_url': None})