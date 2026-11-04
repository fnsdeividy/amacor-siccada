// geradores/download_liberado.html
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function DownloadLiberado() {
  return (
    <WindowLayout title="Download CPT">
      <InlineStyle css={cssGerador} />
      <div className="gerador">
        <span className="gerador-icone"><i className="fa-solid fa-file-arrow-down" aria-hidden="true" /></span>
        <h1>Selecione o formato do arquivo</h1>
        <h3>Em qual formato deseja baixar o arquivo?</h3>
        <div className="gerador-acoes">
          <AppLink download className="btn btn-secondary" href={urlFor('doc_gen.download_cpt', { tipo_documento: 'docx' })} title="Ideal para realizar edições no documento">
            <i className="fa-solid fa-file-word" aria-hidden="true" /> <strong>Docx</strong>
          </AppLink>
          {' '}
          <AppLink download className="btn" href={urlFor('doc_gen.download_cpt', { tipo_documento: 'pdf' })} title="Documento em pdf para criar kits">
            <i className="fa-solid fa-file-pdf" aria-hidden="true" /> <strong>PDF</strong>
          </AppLink>
        </div>
      </div>
    </WindowLayout>
  )
}
