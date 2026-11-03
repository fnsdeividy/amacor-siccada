# Amacor Siccada

Monorepo:

- `backend/` — API Flask (antigo projeto inteiro, agora usando Postgres)
- `frontend/` — (fase 4) SPA em React + Vite

## Rodando localmente

Requer Docker e Compose (no Mac com Colima: `brew install docker-compose` e use o comando `docker-compose`).

```bash
docker-compose up -d postgres
```

Migre os dados do SQLite antigo para o Postgres (uma vez, ou de novo com `--recriar`):

```bash
docker-compose run --rm -v /pasta/do/banco:/dados backend python db/migrate_sqlite_to_pg.py /dados/MHV_DB.db --recriar
```

O script avisa as colunas que tinham texto misturado com número no SQLite
(elas ficam como `text` no Postgres, para não perder dados).

Suba o back:

```bash
docker-compose up -d backend
```

O back fica em http://localhost:8001.

## Banco de dados

O código continua com SQL no dialeto do SQLite. A camada `backend/app/db.py`
tem a mesma interface do módulo `sqlite3` (`db.connect`, `db.Row`, `db.Error`)
e traduz cada consulta para o Postgres. A conexão vem de `DATABASE_URL`.

Além da sintaxe, a camada reproduz comportamentos do SQLite que mudariam o
que aparece na tela: nomes de colunas calculadas, `LIKE` sem diferenciar
maiúsculas, `SUM`/`AVG` com o mesmo arredondamento, posição dos `NULL` e
ordem das linhas em empates e em `GROUP BY`.

Com o banco real, as 103 telas `GET` sem parâmetros foram abertas no sistema
antigo (SQLite) e no novo (Postgres) com três perfis de usuário: 102 saíram
idênticas; a outra já dava erro 500 no sistema antigo.

### Correções de dados na migração

`db/migrate_sqlite_to_pg.py` corrige na cópia (o SQLite não é alterado):

- `beneficiarios`: descarta a linha que é o cabeçalho do CSV importado como dado;
- `faixas_etarias`: `idade_max_ref = '1000♣'` vira `1000` (sem isso a faixa
  "59 anos ou mais" pararia de casar no Postgres).

O que a camada ainda **não** cobre (fica para a fase 2, reescrita do SQL):

- `INSERT OR REPLACE` (gera erro explícito)
- parâmetros nomeados (`:nome`)
- comparações soltas em `SELECT` devolvem `true/false` em vez de `1/0`
- `create.py` ainda grava direto no SQLite
- colunas declaradas como número que têm texto (ex.: `titulares.valor` com
  `'R$ 148.94'`) ficaram como `text`; somar essas colunas em SQL daria erro
- telas com parâmetros na URL e formulários (`POST`) ainda não foram comparados
