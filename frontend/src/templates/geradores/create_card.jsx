// geradores/create_card.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function CreateCard() {
  return (
    <WindowLayout title="Gerador de carteirinhas">
      <InlineStyle css={cssGerador} />
      <div className="gerador">
        <span className="gerador-icone"><i className="fa-solid fa-id-card" aria-hidden="true" /></span>
        <h1>Gerador de carteirinhas</h1>
        <h3>Selecione o arquivo PDF da parte frontal da carteirinha:</h3>

        <ApiForm action={urlFor('pdfgen.upload_files')} method="POST" encType="multipart/form-data">
          <div className="form-group">
            <label className="info" htmlFor="back_pdf">Selecione o PDF da Parte Traseira:</label>
            <input className="info" type="file" name="back_pdf" required />
          </div>

          <div className="gerador-acoes">
            <button className="btn" type="submit">
              <i className="fa-solid fa-file-pdf" aria-hidden="true" /> Gerar PDF
            </button>
          </div>
        </ApiForm>
      </div>
    </WindowLayout>
  )
}
