// geradores/confirmar_processamento.html
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function ConfirmarProcessamento() {
  return (
    <Base1Layout title="Gerador de documentos">
      <title>Confirmação de Processamento</title>
      <InlineStyle css={cssGerador} />
      <div className="card gerador">
        <span className="gerador-icone sucesso"><i className="fa-solid fa-circle-check" aria-hidden="true" /></span>
        <h1>Processamento Concluído!</h1>
        <p className="gerador-texto">O arquivo foi processado com sucesso.</p>
        <ApiForm action={urlFor('doc_gen.dividir_csv')} method="POST">
          <button className="btn" type="submit">
            <i className="fa-solid fa-scissors" aria-hidden="true" /> Dividir Arquivo
          </button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
