// geradores/render_cpt.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function RenderCpt() {
  return (
    <WindowLayout title="Envia CPT">
      <h1>Upload de Documento</h1>
      <ApiForm action={urlFor('doc_gen.render_cpt')} method="POST" encType="multipart/form-data">
        <label htmlFor="arquivo">Selecione os documentos para upload:</label>
        <input type="file" name="arquivo" id="arquivo" required />
        <button type="submit">Enviar</button>
      </ApiForm>
    </WindowLayout>
  )
}
