// geradores/processar_csv.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function ProcessarCsv() {
  return (
    <WindowLayout title="Gerador de documentos">
      <title>Processar Arquivo CSV</title>

      <h1>Processar Arquivo CSV</h1>
      <h2>Upload de Arquivo</h2>

      <ApiForm action={urlFor('doc_gen.processar_csv')} method="POST" encType="multipart/form-data">
        <label htmlFor="arquivo_csv">Selecione o arquivo (.csv):</label>
        <br />
        <input type="file" name="arquivo_csv" id="arquivo_csv" required />
        <br /><br />
        <button className="btn" type="submit">Enviar</button>
      </ApiForm>
    </WindowLayout>
  )
}
