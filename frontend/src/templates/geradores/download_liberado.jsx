// geradores/download_liberado.html
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function DownloadLiberado() {
  return (
    <WindowLayout title="Download CPT">
      <h1>Selecione o formato do arquivo</h1>
      <h3>Em qual formato deseja baixar o arquivo?</h3>
      <br />
      <AppLink download className="btn" href={urlFor('doc_gen.download_cpt', { tipo_documento: 'docx' })} title="Ideal para realizar edições no documento">
        <strong>Docx</strong>
      </AppLink>
      {' '}
      <AppLink download className="btn" href={urlFor('doc_gen.download_cpt', { tipo_documento: 'pdf' })} title="Documento em pdf para criar kits">
        <strong>PDF</strong>
      </AppLink>
    </WindowLayout>
  )
}
