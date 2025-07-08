import requests
import base64 
from email.message import EmailMessage
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import smtplib

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

def siccada_kommo():
    access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImI1MTAzOTM5MWJmOThlZmQxMGEzMzY1MWEzZDA4YWUyYjRlMDI3YjVkNTNjODlkMDVmOWY3ZDhjMjllZjdiZDRkNzA3MjQ1N2I1ZmIyZDExIn0.eyJhdWQiOiI1ODE5NTI0OS02ZjBkLTRhYjQtYmRmZi02ZmUyMzdjMTFiY2QiLCJqdGkiOiJiNTEwMzkzOTFiZjk4ZWZkMTBhMzM2NTFhM2QwOGFlMmI0ZTAyN2I1ZDUzYzg5ZDA1ZjlmN2Q4YzI5ZWY3YmQ0ZDcwNzI0NTdiNWZiMmQxMSIsImlhdCI6MTc1MTk5Mzc3MiwibmJmIjoxNzUxOTkzNzcyLCJleHAiOjE3NTIwMTkyMDAsInN1YiI6IjEzMDE2OTE1IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjM0NDM1MzUxLCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiZjU2ZGQyNTUtYzdlMC00YWY1LThlZmEtYjNjYzA4ZTFjMDgyIiwiYXBpX2RvbWFpbiI6ImFwaS1jLmtvbW1vLmNvbSJ9.XOEise6PYMsKBC9oZ7V5ymtFTTqovy27fYyDBuCCSdI_3I80HYYxSOnGEosU8ENX9p97sUWYy0aO3opsCmkBlzfF_obxDGMdgREanqhsfXKVUP8DQUH2tnpN80CPovSU0Pkbt_JSkVmEzoONu06lViNyouatR4wfXiTrJnAuFgR8g8zu8uSBB6L70h7C3xlGeGnOdMDflfJekFEBsPmJ5LTs6MOv8HjWKuPkKU_sQvkF2l_lmHBXW3Bmm2WpQUeWXoRywQlzJodmJbXS2I9wIPXA1G7pUs42BwGqts7Zw6TpxAA44u8MaEhtLl7YzxWa71HZpl566iBCs2pFbCOvAw'
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


if __name__ == "__main__":
   enviar_email(
       'ccunha@amacor.com.br',
       'teste siccada envio',
       'mensagem de teste siccada envio')
