# Amacor Siccada

Monorepo:

- `backend/` — Flask com Postgres. As rotas, regras e permissões são as do
  sistema antigo; cada rota também responde JSON sob `/api` para o front.
- `frontend/` — React + Vite. Uma tela por template do sistema antigo,
  com as mesmas URLs. Veja [frontend/README.md](frontend/README.md).

## Rodando localmente

Requer Docker e Compose (no Mac com Colima: `brew install docker-compose` e
use o comando `docker-compose`).

1. Variáveis de ambiente: copie `.env.example` para `.env` e preencha
   (no mínimo `SECRET_KEY`). O `.env` não vai para o git.
2. Banco:

   ```bash
   docker-compose up -d postgres
   docker-compose run --rm -v /pasta/do/banco:/dados backend python db/migrate_sqlite_to_pg.py /dados/MHV_DB.db --recriar
   ```

   O script avisa as colunas que tinham texto misturado com número no SQLite
   (ficam como `text` no Postgres, para não perder dados).
3. Back: `docker-compose up -d backend` → http://localhost:8001 (código
   montado do disco; o Flask recarrega a cada alteração).
4. Front em desenvolvimento: `npm --prefix frontend install` e
   `npm --prefix frontend run dev` → http://localhost:5173.
   Front compilado (como em produção): `docker-compose up -d frontend` → http://localhost:8080.

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `SECRET_KEY` | assina o cookie de sessão. **Obrigatória** fora do modo debug |
| `FLASK_DEBUG` | `1` liga o modo debug (só desenvolvimento) |
| `DATABASE_URL` | Postgres (o compose já define) |
| `SMTP_REMETENTE`, `SMTP_SENHA_APP` | e-mails de alerta e de "esqueci minha senha" |
| `RAPIDOC_TOKEN`, `RAPIDOC_CLIENT_ID`, `KOMMO_CLIENT_ID`, `KOMMO_ACCESS_TOKEN` | integrações |

## Banco de dados

O código continua com SQL no dialeto do SQLite. A camada `backend/app/db.py`
tem a mesma interface do módulo `sqlite3` (`db.connect`, `db.Row`, `db.Error`)
e traduz cada consulta para o Postgres. Além da sintaxe, ela reproduz
comportamentos do SQLite que mudariam o que aparece na tela: nomes de colunas
calculadas, `LIKE` sem diferenciar maiúsculas, `SUM`/`AVG` com o mesmo
arredondamento, posição dos `NULL` e ordem das linhas em empates e em `GROUP BY`.

- `backend/db/check_sql.py` valida no Postgres (com `EXPLAIN`, sem executar)
  todas as consultas escritas no código.
- `backend/db/migrate_sqlite_to_pg.py` copia o SQLite e corrige na cópia:
  a linha de cabeçalho de CSV em `beneficiarios` e o `idade_max_ref = '1000♣'`
  de `faixas_etarias` (que pararia de casar a faixa "59 anos ou mais").

Limitações conhecidas da camada: `INSERT OR REPLACE` e parâmetros nomeados
(`:nome`) dão erro explícito (o código atual não usa); uma comparação solta
num `SELECT` devolve `true/false` em vez de `1/0`; colunas declaradas como
número que têm texto (ex.: `titulares.valor = 'R$ 148.94'`) ficam `text`.

## Equivalência com o sistema antigo

- Back: as 103 telas `GET` sem parâmetros, abertas com o código antigo
  (SQLite) e o novo (Postgres) em três perfis: idênticas, exceto uma que já
  dava erro 500. O modo `/api` responde de forma coerente com o HTML em todas.
- Front: `frontend/tests/equivalence.test.jsx` compara cada tela React com o
  HTML do Flask para a mesma rota e usuário.

## Bugs que já existiam (mantidos)

O Postgres aponta os mesmos erros que o SQLite já dava:

- `app/models/database.py:520` — tabela `boletos` não existe;
- `app/models/database.py:769` — coluna `cod_barras` não existe em `beneficiarios`;
- `app/models/database.py:1738` e o percentual de corretora em `doc_gen.py`
  — usam colunas `parcela1..3`, mas em `corretora_ext` elas se chamam `taxa1..3`;
- `app/routes/cadastro.py:296` — `UPDATE` com aspas sem fechar;
- templates referenciados que não existem: `geradores/confirmar_processamento_geren.html`,
  `geradores/relatorio_gerado.html`, `geradores/upload_gerencial.html`, e
  `'cadastro/sem_registro.html '` (com espaço no fim);
- `vendas/verify.hTml` só funciona em disco que não diferencia maiúsculas.
