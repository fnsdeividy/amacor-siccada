# Deploy no Render

O `render.yaml` na raiz cria tudo:

| Recurso | Tipo | Para quê |
|---|---|---|
| `siccada-db` | Postgres 16 | banco |
| `siccada-backend` | serviço privado (Docker) | Flask com gunicorn; só o front chega nele. Tem disco de 5 GB em `/var/data` para os arquivos que o sistema grava (uploads, comprovantes, kits, fotos, logs) |
| `siccada` | serviço web (Docker) | front React servido pelo nginx; repassa `/api` e `/static` ao back pela rede interna |

Tudo na região Virginia (o Render não tem região no Brasil). Serviço com
disco precisa de plano pago; escolha os planos ao criar o Blueprint.

## Antes de começar

- Repositório privado e credenciais antigas trocadas (Gmail, Kommo, Rapidoc):
  as antigas ficaram públicas no histórico do GitHub.
- O Render precisa de acesso ao repositório (conecte a conta do GitHub
  `fnsdeividy` em Account Settings → Git).

## 1. Criar os serviços

1. Render → **New → Blueprint** → repositório `fnsdeividy/amacor-siccada`,
   branch `fase-1-postgres` (ou `main`, depois do merge).
2. O Render lê o `render.yaml` e pede as variáveis marcadas como `sync: false`:
   - `SMTP_SENHA_APP`: a **nova** senha de app do Gmail;
   - `RAPIDOC_*`, `KOMMO_*`: os novos tokens (pode deixar vazio se não usar);
   - `PUBLIC_URL`: deixe vazio por enquanto (passo 4).
   A `SECRET_KEY` é gerada pelo próprio Render.
3. Aguarde o primeiro deploy (o build do back instala o LibreOffice e leva alguns minutos).

## 2. Migrar os dados (janela de troca)

Para não perder nada do que for gravado no sistema antigo durante a troca:

1. Pare o sistema antigo (ou avise que ninguém deve usá-lo).
2. Copie o banco atual dele **com o sistema parado** para `backend/MHV_DB.db`
   (ou `sqlite3 MHV_DB.db ".backup copia.db"`). O arquivo é ignorado pelo git.
3. No Render: `siccada-db` → **Connect** → copie a **External Database URL**.
4. Na raiz do repositório:

   ```bash
   docker-compose run --rm -e DATABASE_URL="<External Database URL>" backend python db/migrate_sqlite_to_pg.py MHV_DB.db --recriar
   ```

   Confira se as contagens por tabela batem com o SQLite. Depois valide as
   consultas no banco novo:

   ```bash
   docker-compose run --rm -e DATABASE_URL="<External Database URL>" backend python db/check_sql.py
   ```

   (o esperado são os 4 erros antigos listados no README).

## 3. Copiar os arquivos do sistema antigo

O que o sistema gravou no servidor antigo não está no git e precisa ir para o
disco do back. No servidor antigo, estas pastas (dentro da pasta do projeto):

| No servidor antigo | No disco do Render |
|---|---|
| `static/` (comprovantes, Documento_propostas, uploads, kits...) | `/var/data/static/` |
| `app/static/uploads/` (fotos de perfil) | `/var/data/app_static/uploads/` |
| `uploads/` | `/var/data/uploads/` |

Envie pelo SSH do Render (`siccada-backend` → **Connect → SSH** mostra o
endereço), por exemplo:

```bash
scp -r -s static/comprovantes <servico>@ssh.virginia.render.com:/var/data/static/
```

Os modelos `.docx` e as imagens do repositório são copiados para o disco
sozinhos a cada deploy (`backend/docker-entrypoint.sh`).

## 4. Endereço público

1. Copie a URL do serviço `siccada` (ex.: `https://siccada.onrender.com`,
   ou o seu domínio, se configurar um em **Settings → Custom Domains**).
2. Em `siccada-backend` → **Environment**, preencha `PUBLIC_URL` com ela e
   salve (o back reinicia). É o endereço que vai no QR code da entrevista.

## 5. Conferir

- Abrir a URL, entrar com um usuário real, navegar pelos menus.
- Gerar um QR code de entrevista e conferir se o link abre de fora da empresa.
- Enviar um arquivo (ex.: comprovante) e conferir se ele continua lá após um
  novo deploy.

## Voltar atrás

O sistema antigo não é alterado. Se algo der errado, religue-o: ele continua
com o SQLite como estava no momento em que foi parado.
