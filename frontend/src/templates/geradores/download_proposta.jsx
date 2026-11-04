// geradores/download_proposta.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function DownloadProposta() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Gerar Kit">
      <InlineStyle css={cssGerador} />
      <div className="card gerador">
        <div className="close-btn-container">
          <AppLink href={urlFor('auth.redir_atent')} className="close-btn" title="Fechar" aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </AppLink>
        </div>

        <span className="gerador-icone sucesso"><i className="fa-solid fa-file-circle-check" aria-hidden="true" /></span>
        <h1>Proposta gerada</h1>
        <h3>Sua proposta foi processada e gerada corretamente, clique abaixo para baixar o documento</h3>
        <div className="gerador-acoes">
          <AppLink download id="btn" className="btn" href={urlFor('doc_gen.download_proposta', { filename: ctx.filename })}>
            <i className="fa-solid fa-download" aria-hidden="true" /> <strong>Baixar documento</strong>
          </AppLink>
        </div>
      </div>
    </Base1Layout>
  )
}
