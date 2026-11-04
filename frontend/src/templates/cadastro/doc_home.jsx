// cadastro/doc_home.html
import BaseLayout from '../../layouts/BaseLayout.jsx'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.cad-doc-home .quick-action-card i { font-size: var(--text-lg); color: var(--brand-700); }
.cad-doc-home .quick-action-card { font-weight: 500; }
`

export default function DocHome() {
  return (
    <BaseLayout title="Bem-vindo">
      <InlineStyle css={css} />
      <div className="cad-doc-home">
        <div className="quick-actions-grid">
          <a className="quick-action-card" href="">
            <i className="fa-solid fa-box" aria-hidden="true" />criar kit
          </a>
          <a className="quick-action-card" href="">
            <i className="fa-solid fa-file-circle-xmark" aria-hidden="true" />criar documento de cancelamento
          </a>
          <a className="quick-action-card" href="">
            <i className="fa-solid fa-file-invoice-dollar" aria-hidden="true" />criar documento de dividas
          </a>
        </div>
      </div>
    </BaseLayout>
  )
}
