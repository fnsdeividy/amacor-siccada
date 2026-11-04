// geradores/confirmar_envio.html
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function ConfirmarEnvio() {
  return (
    <Base1Layout title="Gerador de documentos">
      <title>Confirmação de Envio</title>
      <InlineStyle css={cssGerador} />
      <div className="card gerador">
        <span className="gerador-icone sucesso"><i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /></span>
        <h1>Arquivo enviado com sucesso!</h1>
        <p className="gerador-texto">O arquivo foi enviado e está pronto para ser processado.</p>
        <ApiForm action={urlFor('doc_gen.processar_csv')} method="POST">
          <button className="btn" type="submit">
            <i className="fa-solid fa-gears" aria-hidden="true" /> Iniciar Processamento
          </button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
