// geradores/processar_csv.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function ProcessarCsv() {
  return (
    <WindowLayout title="Gerador de documentos">
      <title>Processar Arquivo CSV</title>
      <InlineStyle css={cssGerador} />
      <div className="gerador">
        <span className="gerador-icone"><i className="fa-solid fa-file-csv" aria-hidden="true" /></span>
        <h1>Processar Arquivo CSV</h1>
        <h2>Upload de Arquivo</h2>

        <ApiForm action={urlFor('doc_gen.processar_csv')} method="POST" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="arquivo_csv">Selecione o arquivo (.csv):</label>
            <input type="file" name="arquivo_csv" id="arquivo_csv" required />
          </div>
          <div className="gerador-acoes">
            <button className="btn" type="submit">
              <i className="fa-solid fa-upload" aria-hidden="true" /> Enviar
            </button>
          </div>
        </ApiForm>
      </div>
    </WindowLayout>
  )
}
