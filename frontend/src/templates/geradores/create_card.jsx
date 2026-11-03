// geradores/create_card.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function CreateCard() {
  return (
    <WindowLayout title="Gerador de carteirinhas">
      <h1>Gerador de carteirinhas</h1>
      <h3>Selecione o arquivo PDF da parte frontal da carteirinha:</h3>

      <ApiForm action={urlFor('pdfgen.upload_files')} method="POST" encType="multipart/form-data">
        <label className="info" htmlFor="back_pdf">Selecione o PDF da Parte Traseira:</label>
        <input className="info" type="file" name="back_pdf" required /><br /><br />

        <button className="btn" type="submit">Gerar PDF</button>
      </ApiForm>
    </WindowLayout>
  )
}
