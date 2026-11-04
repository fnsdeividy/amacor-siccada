// geradores/concluido.html
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useBodyClass } from '../../lib/useBodyClass.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function Concluido() {
  // <body class="body"> dentro do conteúdo: o navegador aplicava a classe ao body
  useBodyClass('body')
  return (
    <WindowLayout title="Gerador de documentos">
      <InlineStyle css={cssGerador} />
      <div className="gerador">
        <span className="gerador-icone sucesso"><i className="fa-solid fa-circle-check" aria-hidden="true" /></span>
        {/* o {% block title %} estava dentro do window_content: aparece também aqui */}
        <p className="text-muted">Gerador de documentos</p>

        <h1>Kit gerado</h1>
        <h3>Kit processado e gerado corretamente, <AppLink download href={urlFor('doc_gen.download_documento_final')}><strong>clique aqui para baixar.</strong></AppLink></h3>

        <div className="gerador-acoes">
          <AppLink className="btn btn-secondary" href={urlFor('doc_gen.gerar_documentos')}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> voltar
          </AppLink>
        </div>
      </div>
    </WindowLayout>
  )
}
