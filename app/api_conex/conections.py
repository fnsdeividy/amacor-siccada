import requests
import base64 
from email.message import EmailMessage
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import smtplib
from ..models.database import get_nome

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
    msg = MIMEMultipart()
    msg["From"] = f"Amacor Alertas <{remetente}>"
    msg["To"] = destinatario
    msg["Subject"] = assunto
    

    html = f"""
        <html>
        <body style="margin:0; padding:0; font-family:Arial, sans-serif, background-color: #c9e3ff ;">
            <table width="100%" align="center" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto;">
            <tr>
                <td align="center">
                <img src="cid:logo_amacor" width="600" style="display:block;" alt="Amacor Planos de Saúde">
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; font-size: 16px; color: #333;">
                <p>{mensagem.replace('\n', '<br>')}</p>
                <p style="margin-top: 20px;">
                    <a href="{complemento}" style="display:inline-block; background-color:#007bff; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">
                    Acessar entrevista
                    </a>
                </p>
                <p style="margin-top: 10px;">
                    <a href="https://wa.me/2134059466" style="display:inline-block; background-color:#25D366; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">
                    Enviar mensagem no WhatsApp
                    </a>
                </p>
                </td>
            </tr>
            </table>
        </body>
        </html>
        """

    
    html1 = f"""
            <html>
            <body style="margin:0; padding:0; font-family:Arial, sans-serif;  background-color: #c9e3ff;">
                <table width="100%" align="center" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto;">
                <tr>
                    <td align="center">
                    <img src="cid:logo_amacor" width="600" style="display:block;" alt="Amacor Planos de Saúde">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; font-size: 16px; color: #333;">
                    <p>{mensagem.replace('\n', '<br>')}</p>
                    <p style="margin-top: 20px;">
                        <a href="https://wa.me/5521978914749?text=Olá,%20gostaria%20de%20informações%20sobre%20aquisição%20de%20planos" style="display:inline-block; background-color:#25D366; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">Enviar mensagem no WhatsApp</a>
                    </p>
                    </td>
                </tr>
                </table>
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

def msg_email(status,proposta, complemento):
            print(complemento)
            nome = get_nome(proposta)
            if status == 'entrevista online enviada':
                assunto = f'{nome} sua entrevista Online foi Enviada'
                mensagem = f'Olá {nome}, \nSua entrevista online foi enviada e está disponível para ser realizada no link abaixo.\n\n <a href="{complemento}" style="display:inline-block; background-color:#007bff; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">Acessae entrevista</a>  \n\nCaso tenha alguma dúvida, entre em contato com a nossa central de atendimento em: 2134059466. \n Att.: Equipe MH Vida.'
                return assunto, mensagem, complemento
            elif status == 'analise de declaração':
                assunto= f'{nome} sua entrevista Online foi enviada para análise'
                mensagem = f'Olá {nome}, \n\nSua entrevista online foi enviada para uma analise interna. \nDurante essa análise verificaremos se há necessidade de uma entrevista presencial com o médico. \n\nCaso tenha alguma dúvida, entre em contato com a nossa central de atendimento em: 2134059466. \n Att.: Equipe MH Vida. '
                return assunto, mensagem, complemento
            elif status == 'entrevista agendada':
                assunto = f'{nome} sua entrevista está agendada'
                mensagem = f'Olá {nome}, \nSua entrevista presencial foi agendada para {complemento}. \n Recomendamos que chegue 5 minutos antes do horario marcado para evitar atrasos.\n\nCaso tenha alguma dúvida, entre em contato com a nossa central de atendimento em: 2134059466. \n Att.: Equipe MH Vida.'
                return assunto, mensagem, complemento
            elif status == 'geração de kit':
                assunto = f'{nome} seu contrato está pronto para ser entregue!'
                mensagem = f"Olá {nome},\n Seu contrato está finalizado e o kit contratual será gerado e enviado em breve. \n\nCaso tenha alguma dúvida, entre em contato com a nossa central de atendimento em: 2134059466. \n Att.: Equipe MH Vida.'"
                return assunto, mensagem, complemento
            elif status == 'contrato finalizado':
                assunto = f'{nome} o processo de contratação está Finalizado'
                mensagem = f"Olá{nome},\n Seu contrato foi finalizado com sucesso, e sua carteirinha está pronta para ser enviada. Entre em contato pro Whatsapp e peça agora. \n Bem vindo à Amacor Planos de Sáude."
                return assunto, mensagem, complemento
            
            else:
                return complemento
