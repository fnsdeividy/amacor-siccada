# Guia de design do Siccada

Visual corporativo, claro e neutro, para uso interno o dia inteiro: fundo cinza
muito claro, conteúdo em cartões brancos, azul-marinho da marca (`#0a2f68`)
para navegação e ações principais, tipografia Inter.

## Onde fica cada coisa

- `src/styles/tokens.css` — cores, tipografia, espaçamentos, raios, sombras.
  **Use sempre as variáveis** (`var(--brand-700)`, `var(--text-muted)`,
  `var(--space-4)`...). Nada de cor solta.
- `src/styles/base.css` — elementos (títulos, formulários, botões, tabelas) e
  as classes que as telas antigas já usavam (`card`, `divisoria`,
  `form-group`, `form-row`, `info-item`, `stat-card`, `btn-tab-pix`,
  `status-green`...), já no visual novo.
- `src/styles/shell.css` — moldura (menu lateral, cabeçalho, menu do usuário,
  avisos) e telas de acesso (`auth-page`).
- Layouts (`src/layouts/`) já usam a moldura nova. A tela só cuida do conteúdo.

Exemplos prontos: `src/templates/login.jsx` (tela sem moldura) e
`src/templates/financeiro/tab_pix.jsx` (lista com filtros e tabela).

## Padrões de tela

```jsx
<Base1Layout title="Tabela de Pagamentos">          {/* título vai no cabeçalho */}
  <div className="card">                             {/* conteúdo em cartão */}
    <div className="page-toolbar">                   {/* título + ações */}
      <h1>…</h1>
      <div className="page-toolbar-actions">
        <AppLink className="btn btn-secondary" …>Filtrar</AppLink>
        <AppLink className="btn" …>Exportar</AppLink>
      </div>
    </div>
    <form className="form-row">…campos .form-group…</form>
    <div className="table-container"><table>…</table></div>
  </div>
</Base1Layout>
```

- **Botões**: `btn` (principal, azul), `btn btn-secondary` (contorno),
  `btn btn-danger` (excluir), `btn-sm` / `btn-lg`. Um principal por área.
- **Formulários**: rótulo em cima, campo largura total; agrupe em
  `form-row` (grade responsiva) quando houver campos curtos lado a lado.
- **Tabelas**: dentro de `table-container`; cabeçalho claro em caixa alta
  pequena; status como selo (`status-green`, `status-yellow`, `status-red`
  ou `badge`).
- **Indicadores**: `card-container` com `stat-card` (`stat-label` + `stat-value`).
- **Ícones**: Font Awesome 6 (`<i className="fa-solid fa-…" aria-hidden="true" />`).
  Troque emojis decorativos por ícones.
- **Fechar/voltar**: `close-btn` com `fa-xmark` (o canto superior direito do
  cartão já está posicionado).

## Regras

1. Não carregue os CSS antigos de `/static/css/` (`estilos.css`, `tabpix.css`,
   `dashboard.css`, `sidebar.css`, `estilos_login.css`...). Nem papel de
   parede, vidro fosco (`backdrop-filter`), texto branco sobre fundo escuro.
2. CSS específico de uma tela: `<InlineStyle css={…}>` com seletores
   prefixados por uma classe da própria tela (ex.: `.dash-vendas .grafico`),
   só com variáveis do `tokens.css`.
3. `style={{…}}` só para layout pontual (largura, alinhamento), nunca cores.
4. **Conteúdo e comportamento não mudam**: mesmos textos, mesmos campos de
   formulário (name/valor), mesmas regras dos scripts. O teste de equivalência
   (`tests/equivalence.test.jsx`) continua valendo e compara o conteúdo de
   cada tela com o sistema antigo (emojis e a moldura ficam de fora).
5. Responsivo: nada de larguras fixas grandes; tabelas rolam na horizontal
   dentro do `table-container`.
