// geradores/render_gerar_kit.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import Loader from '../../components/Loader.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function RenderGerarKit() {
  const [loading, setLoading] = useState(false)
  return (
    <WindowLayout title="Gerar KIT">
      {loading && <Loader />}
      <title>Document</title>

      <h1>Iniciar KIT</h1>

      <div>
        <h2>Informe o numero do contrato</h2>
        <p>Digite o numero do contrato para o qual deseja criar documento de KIT.</p>
      </div>

      <ApiForm id="adicionar_cnt" method="POST" action={urlFor('doc_gen.render_gerar_kit')}
        onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
        <label htmlFor="status">Numero de Contrato:</label>
        <input type="text" id="numero_contrato" name="numero_contrato" placeholder="digite o número do contrato" required />

        <button className="btn" type="submit">Selecionar</button>
      </ApiForm>
    </WindowLayout>
  )
}
