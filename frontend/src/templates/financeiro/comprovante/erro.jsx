// financeiro/comprovante/erro.html
import AppLink from '../../../components/AppLink.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../../lib/page.jsx'
import { InlineStyle } from '../../../lib/useStylesheet.jsx'
import { urlFor } from '../../../lib/urlFor.js'

const css = `
.comprovante-erro { max-width: 560px; margin: var(--space-8) auto; text-align: center; padding: var(--space-8) var(--space-6); }
.comprovante-erro .comprovante-erro-icon { font-size: 40px; color: var(--warning-700); margin-bottom: var(--space-4); }
.comprovante-erro h3 { font-weight: 400; color: var(--text-soft); margin: 0; }
`

export default function Erro() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Bem-vindo">
      <InlineStyle css={css} />
      <div className="container">
        <div className="card divisoria2 comprovante-erro">
          <div className="close-btn-container">
            <AppLink className="close-btn" href={urlFor('finan.tab')} title="Voltar" aria-label="Voltar">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </AppLink>
          </div>
          <i className="fa-solid fa-file-circle-exclamation comprovante-erro-icon" aria-hidden="true" />
          <h1>Nenhum comprovante registrato</h1>
          <h3>Sem registro de comprovante, deseja <AppLink href={urlFor('finan.render_form_post', { pagamento_id: ctx.pagamento_id })}><strong>adicionar?</strong></AppLink></h3>
        </div>
      </div>
    </Base1Layout>
  )
}
