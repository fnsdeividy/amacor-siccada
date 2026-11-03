// vendas/adicionar_contrato.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import Loader from '../../components/Loader.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function AdicionarContrato() {
  // o script mostra o loader ao enviar o formulário
  const [loading, setLoading] = useState(false)
  return (
    <WindowLayout title="Iniciar inclusão">
      {loading && <Loader />}
      {/* o template tem um documento HTML inteiro dentro do bloco; o
          navegador mantém o <title> no corpo (o texto "Document" aparece no DOM) */}
      <title>Document</title>

      <h1>Iniciar inclusão</h1>

      <div>
        <h2>Informe o contrato para incluir</h2>
      </div>

      <ApiForm id="adicionar_cnt" method="POST" action={urlFor('vendas.inclusao_render_form')}
        onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
        <label htmlFor="status">Adicionar beneficiario ao contrato:</label>
        <input type="text" id="numero_contrato" name="numero_contrato" placeholder="digite o número do contrato" required />

        <button className="btn" type="submit">Selecionar</button>
      </ApiForm>
    </WindowLayout>
  )
}
