// financeiro/return.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { useBodyClass } from '../../lib/useBodyClass.js'
import { urlFor } from '../../lib/urlFor.js'

const css = `
.finan-return { max-width: 560px; margin: var(--space-8) auto; text-align: center; padding: var(--space-8) var(--space-6); }
.finan-return .finan-return-icon { font-size: 40px; color: var(--success-700); margin-bottom: var(--space-4); }
.finan-return h3 { font-weight: 400; color: var(--text-soft); margin: 0; }
`

export default function Return() {
  // o <body class="body"> dentro do bloco passava a classe para o <body> da página
  useBodyClass('body')
  return (
    <Base1Layout title="Bem-vindo">
      <InlineStyle css={css} />
      <div className="card finan-return">
        <i className="fa-solid fa-circle-check finan-return-icon" aria-hidden="true" />
        <h1>Pagamento registrado</h1>
        <h3>Pagamento registrado no banco de dados, <AppLink href={urlFor('generic.home')}><strong>retorne a pagina inicial.</strong></AppLink></h3>
      </div>
    </Base1Layout>
  )
}
