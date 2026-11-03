// geradores/confirmar_envio.html
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function ConfirmarEnvio() {
  return (
    <Base1Layout title="Gerador de documentos">
      <title>Confirmação de Envio</title>
      <h1>Arquivo enviado com sucesso!</h1>
      <p>O arquivo foi enviado e está pronto para ser processado.</p>
      <ApiForm action={urlFor('doc_gen.processar_csv')} method="POST">
        <button type="submit">Iniciar Processamento</button>
      </ApiForm>
    </Base1Layout>
  )
}
