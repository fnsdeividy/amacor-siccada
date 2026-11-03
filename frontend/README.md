# Siccada — front (React + Vite)

O front é separado do back, mas **as URLs e o comportamento são os mesmos do
sistema antigo**. Cada tela é carregada do back em modo JSON (`/api` + a URL)
e desenhada pelo componente React do template que o back renderizaria.
Redirects, permissões e mensagens continuam sendo decididos pelo back.

Detalhes do modo JSON: `backend/app/api.py`. Como portar/alterar uma tela:
[PORTING.md](PORTING.md).

## Rodando

Com o back no ar (`docker-compose up -d postgres backend` na raiz):

```bash
npm install
npm run dev
```

Abra http://localhost:5173. O Vite repassa `/api` e `/static` para o back
(`BACKEND_URL`, padrão `http://localhost:8001`).

Produção: `docker-compose up -d frontend` (nginx em http://localhost:8080,
servindo o build e repassando só `/api` e `/static` ao back — veja `nginx.conf`).

## Estrutura

- `src/templates/<nome do template>.jsx` — uma tela por template do back
  (`cadastro/home.html` → `src/templates/cadastro/home.jsx`)
- `src/layouts/` — `base1.html`, `window.html`, `base.html`, `base_amatiss.html`
- `src/lib/` — `urlFor` (igual ao `url_for` do Flask), filtros de moeda/data,
  semântica do Jinja (`truthy`, `show`...), chamadas ao back
- `src/components/` — `ApiForm` (formulário que envia para o back),
  `AppLink`, alerta de flash, loader

## Testes

```bash
npm test
```

- `tests/filters.test.js` — filtros de moeda/data contra a saída real dos
  filtros Jinja (`filters-fixtures.json`);
- `tests/urlFor.test.js` — `urlFor` contra o `url_for` do Flask em todos os
  endpoints (`urlfor-fixtures.json`);
- `tests/equivalence.test.jsx` — cada tela contra o HTML que o Flask gera para
  a mesma rota e usuário (texto visível e campos de formulário). Usa snapshots
  com dados reais, que **não vão para o git**; sem eles, o teste é pulado.

### Gerando os snapshots de equivalência

Na raiz, com o banco migrado:

```bash
docker-compose run --rm -T -v "$PWD/.cmp:/cmp" backend python tools/front_snapshots.py /cmp/snapshots 1 12 7
```

(os números são ids de usuários, um por perfil; `.cmp/` é ignorada pelo git).

### Regerando os mapas do back

`src/lib/routes-manifest.json` (endpoints → URLs), `templates-manifest.json`
(templates → arquivos) e os gabaritos `tests/*-fixtures.json` vêm do Flask.
Se rotas, templates ou filtros mudarem no back, regere e rode os testes:

```bash
docker-compose run --rm -T -v "$PWD/frontend:/frontend" backend python tools/front_manifests.py /frontend
```
