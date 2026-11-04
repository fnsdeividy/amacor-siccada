// cadastro/home.html
import AppLink from '../../components/AppLink.jsx'
import BaseLayout from '../../layouts/BaseLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.cad-home .quick-action-card i { font-size: var(--text-lg); color: var(--brand-700); }
.cad-home .quick-action-card { font-weight: 500; }
`

export default function Home() {
  return (
    <BaseLayout title="Bem-vindo">
      <InlineStyle css={css} />
      <div className="cad-home">
        <div className="quick-actions-grid">
          <AppLink className="quick-action-card" href={urlFor('pdfgen.create_card')}>
            <i className="fa-solid fa-id-card" aria-hidden="true" />criar carteirinha
          </AppLink>
          <a className="quick-action-card" href="">
            <i className="fa-solid fa-video" aria-hidden="true" />lote de telemedicina
          </a>
          <AppLink className="quick-action-card" href={urlFor('doc_gen.gerar_documentos')}>
            <i className="fa-solid fa-box" aria-hidden="true" />gerador de kit
          </AppLink>
          <AppLink className="quick-action-card" href={urlFor('doc_gen.gerar_documentos')}>
            <i className="fa-solid fa-box" aria-hidden="true" />gerador de kit
          </AppLink>
        </div>
      </div>
    </BaseLayout>
  )
}
