# Guia de porte: template Jinja → componente React

Objetivo: cada tela do front React deve ser **equivalente** à tela que o Flask
renderizava — mesmo texto, mesmos campos de formulário, mesmas classes/ids
(o CSS em `/static` é o mesmo), mesmo comportamento dos scripts.

## Como o front funciona

- O front abre `/api` + a URL atual. O back roda **a mesma rota** e responde
  `{type: 'page', template, context, session, flashes}` — `context` é
  exatamente o que a rota passou ao `render_template` (veja `backend/app/api.py`).
- O componente do template é escolhido pelo nome:
  `'cadastro/home.html'` → `src/templates/cadastro/home.jsx`;
  `'cadastrar.html'` → `src/templates/cadastrar.jsx`.
  O nome é o que a rota passa ao `render_template`
  (lista completa em `frontend/templates-manifest.json`, com o arquivo de origem).
- Redirects, permissões e mensagens de flash continuam no back.

## Esqueleto de um componente

```jsx
// cadastro/home.html
import WindowLayout from '../../layouts/WindowLayout.jsx'
import AppLink from '../../components/AppLink.jsx'
import ApiForm from '../../components/ApiForm.jsx'
import { useTemplateContext, usePage } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { truthy, show } from '../../lib/jinja.js'
import { formatCurrencyBr, formatDateBr } from '../../lib/format.js'
import { useStylesheet, InlineStyle } from '../../lib/useStylesheet.jsx'

export default function Home() {
  const ctx = useTemplateContext()          // variáveis passadas ao template
  const { session } = usePage()             // session['user_nome'] etc.
  return (
    <WindowLayout title="Cadastro">
      ...
    </WindowLayout>
  )
}
```

## Tradução

| Jinja / template                                   | React                                                                 |
|----------------------------------------------------|-----------------------------------------------------------------------|
| `{% extends 'base1.html' %}` + `{% block content %}` | `<Base1Layout title="...">…</Base1Layout>`                         |
| `{% extends 'window.html' %}` + `window_content`     | `<WindowLayout title="...">…</WindowLayout>`                       |
| `{% extends 'base.html' %}`                          | `<BaseLayout>…</BaseLayout>`                                       |
| `{% extends 'base_amatiss.html' %}`                  | `<AmatissLayout title="...">` (`src/layouts/AmatissLayout.jsx`)    |
| `{% block title %}X{% endblock %}`                   | prop `title="X"` do layout                                         |
| `{{ x }}`                                            | `{show(ctx.x)}` (None → "None"); para float de coluna REAL: `showFloat` |
| `{% if x %}`                                         | `truthy(ctx.x) && …` — **nunca** `ctx.x &&` (lista vazia!)         |
| `{% for r in rows %}` / `loop.index`                 | `(ctx.rows ?? []).map((r, i) => …)` / `i + 1`                      |
| `row.col`, `row['col']`                              | `row.col` (linhas chegam como objetos com o nome original da coluna) |
| `row[0]` (linha do banco por posição)                | `col(row, 0)`                                                      |
| `x\|length`, `d.items()`                             | `length(x)`, `items(d)`                                            |
| `\|format_currency_br`, `\|format_date_br`, `\|format_date_iso` | `formatCurrencyBr`, `formatDateBr`, `formatDateIso`     |
| `\|tojson` (dentro de script)                        | o próprio valor em JS (já é JSON)                                  |
| `\|round(n)`                                         | `round(x, n)` de `lib/format.js`                                   |
| `url_for('cad.x', a=1)`                              | `urlFor('cad.x', { a: 1 })` — **sempre**, nunca URL escrita à mão  |
| `url_for('static', filename='css/a.css')`            | `'/static/css/a.css'`                                              |
| `<a href="{{ url_for(...) }}">`                      | `<AppLink href={urlFor(...)}>`                                     |
| link para rota que devolve arquivo (download)        | `<AppLink download href={urlFor(...)}>`                            |
| `<form action=... method="POST">`                    | `<ApiForm action={urlFor(...)} method="POST">` (arquivos funcionam) |
| `<form method="GET">`                                | `<ApiForm action=... method="GET">` (navega com a query string)    |
| `request.args.get('x')`                              | `useSearchParams()` do react-router                                |
| `session['user_nome']`, `session.get('x')`           | `usePage().session.user_nome`                                      |
| `<link rel="stylesheet" href="...static/css/x.css">` | `useStylesheet('/static/css/x.css')`                               |
| `<style>…</style>`                                   | `<InlineStyle css={`…`} />` (copie o CSS sem alterar)              |
| `<body class="x">`                                   | `useBodyClass('x')` (`lib/useBodyClass.js`)                        |
| `get_flashed_messages()` (alerta)                    | já está nos layouts (`FlashMessage`); telas sem layout: `<FlashMessage />` |
| `fetch('/rota')` em script                           | `apiFetch('/rota')` (`lib/api.js`) — mesma resposta JSON           |
| `window.location.href = '/rota'`                     | `navigate(urlFor(...))` do react-router                            |
| `onclick="f()"`, `getElementById(...).style...`      | estado React + handlers; mesmo comportamento                       |

Atributos HTML em JSX: `class`→`className`, `for`→`htmlFor`, `style="a:b"`→`style={{a:'b'}}`,
`onclick`→`onClick`, `value` em input editável → `defaultValue` (ou `value`+`onChange`),
`checked` → `defaultChecked`, `selected` em option → `defaultValue` no `<select>`.
**Para o teste de equivalência ver o valor do campo**, use `defaultValue`/`defaultChecked`
(eles viram atributo `value`/`checked` no HTML gerado).

## Regras

1. Mantenha a estrutura de elementos, classes e ids do template: o CSS original depende delas.
2. Texto visível idêntico, inclusive erros de digitação do original e espaços dentro de `{{ }}`.
3. Scripts: porte a lógica para React mantendo o mesmo comportamento (validações,
   máscaras, cálculos, chamadas `fetch`, mensagens `alert`). Não "melhore" regras.
4. Não altere arquivos compartilhados (`src/lib`, `src/components`, `src/layouts`,
   `src/main.jsx`, `src/PageView.jsx`, `tests/`). Se precisar de um helper novo,
   crie dentro da pasta do seu grupo em `src/templates/...` e mencione no relatório.
5. Não altere o back.
6. Os snapshots em `.cmp/snapshots/` têm **dados reais de pessoas**: use-os só para
   entender o formato do `context`. Nunca copie valores deles para o código ou relatórios.

## Como verificar

```bash
cd frontend
ONLY=cadastro/home npx vitest run tests/equivalence.test.jsx   # um template
npx vitest run tests/equivalence.test.jsx                      # todos
npx vite build                                                 # tudo compila
```

O teste renderiza o componente com o `context` real de cada rota/usuário e compara
com o HTML que o Flask gerou: texto visível e campos de formulário. Ele precisa
passar para todo template que tem snapshot. Templates sem snapshot (só aparecem
depois de um POST ou em rota com parâmetro) precisam compilar e ser conferidos
lendo a rota no back (`frontend/templates-manifest.json` diz o arquivo e as rotas).
