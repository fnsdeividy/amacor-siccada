// geradores/upload_documento.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function UploadDocumento() {
  // o template não define {% block title %}: fica o padrão "Inicial"
  return (
    <WindowLayout>
      <title>Upload de Documento</title>
      <h1>Upload de Documento</h1>
      <ApiForm action={urlFor('doc_gen.upload_documento')} method="POST" encType="multipart/form-data">
        <label htmlFor="arquivos">Selecione os documentos para upload:</label>
        <input type="file" name="arquivos" id="arquivos" multiple required />
        <button type="submit">Enviar</button>
      </ApiForm>
    </WindowLayout>
  )
}
