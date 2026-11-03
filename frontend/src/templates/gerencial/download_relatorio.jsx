// gerencial/download_relatorio.html
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function DownloadRelatorio() {
  return (
    <WindowLayout title="Download Relatorio">
      <h1>Download do Relatorio</h1>
      <h3>Relatório gerado com sucesso, selecione abaixo para baixar</h3>
      <br />
      <AppLink download className="btn" href={urlFor('doc_gen.download_relatorio')} title="Documento CSV">
        <strong>Baixar</strong>
      </AppLink>
    </WindowLayout>
  )
}
