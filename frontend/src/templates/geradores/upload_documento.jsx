// geradores/upload_documento.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function UploadDocumento() {
  // o template não define {% block title %}: fica o padrão "Inicial"
  return (
    <WindowLayout>
      <title>Upload de Documento</title>
      <InlineStyle css={cssGerador} />
      <div className="gerador">
        <span className="gerador-icone"><i className="fa-solid fa-file-arrow-up" aria-hidden="true" /></span>
        <h1>Upload de Documento</h1>
        <ApiForm action={urlFor('doc_gen.upload_documento')} method="POST" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="arquivos">Selecione os documentos para upload:</label>
            <input type="file" name="arquivos" id="arquivos" multiple required />
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
