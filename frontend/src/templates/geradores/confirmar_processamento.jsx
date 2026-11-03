// geradores/confirmar_processamento.html
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function ConfirmarProcessamento() {
  return (
    <Base1Layout title="Gerador de documentos">
      <title>Confirmação de Processamento</title>

      <br /><br />
      <h1>Processamento Concluído!</h1>
      <p>O arquivo foi processado com sucesso.</p>
      <ApiForm action={urlFor('doc_gen.dividir_csv')} method="POST">
        <button type="submit">Dividir Arquivo</button>
      </ApiForm>
    </Base1Layout>
  )
}
