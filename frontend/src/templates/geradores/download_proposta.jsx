// geradores/download_proposta.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function DownloadProposta() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Gerar Kit">
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <AppLink href={urlFor('auth.redir_atent')} className="close-btn">✖</AppLink>
          </div>

          <h1>Proposta gerada</h1>
          <h3>Sua proposta foi processada e gerada corretamente, clique abaixo para baixar o documento</h3>
          <br />
          <AppLink download id="btn" className="btn" href={urlFor('doc_gen.download_proposta', { filename: ctx.filename })}><strong>Baixar documento</strong></AppLink>
        </div>
      </div>
    </Base1Layout>
  )
}
