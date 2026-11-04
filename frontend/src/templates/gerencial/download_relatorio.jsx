// gerencial/download_relatorio.html
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from '../geradores/estilo.js'

export default function DownloadRelatorio() {
  return (
    <WindowLayout title="Download Relatorio">
      <InlineStyle css={cssGerador} />
      <div className="gerador">
        <span className="gerador-icone sucesso"><i className="fa-solid fa-file-csv" aria-hidden="true" /></span>
        <h1>Download do Relatorio</h1>
        <h3>Relatório gerado com sucesso, selecione abaixo para baixar</h3>
        <div className="gerador-acoes">
          <AppLink download className="btn" href={urlFor('doc_gen.download_relatorio')} title="Documento CSV">
            <i className="fa-solid fa-download" aria-hidden="true" /> <strong>Baixar</strong>
          </AppLink>
        </div>
      </div>
    </WindowLayout>
  )
}
