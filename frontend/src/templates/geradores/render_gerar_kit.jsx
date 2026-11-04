// geradores/render_gerar_kit.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import Loader from '../../components/Loader.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function RenderGerarKit() {
  const [loading, setLoading] = useState(false)
  return (
    <WindowLayout title="Gerar KIT">
      {loading && <Loader />}
      <title>Document</title>
      <InlineStyle css={cssGerador} />

      <div className="gerador">
        <span className="gerador-icone"><i className="fa-solid fa-box-archive" aria-hidden="true" /></span>
        <h1>Iniciar KIT</h1>

        <div>
          <h2>Informe o numero do contrato</h2>
          <p className="gerador-texto">Digite o numero do contrato para o qual deseja criar documento de KIT.</p>
        </div>

        <ApiForm id="adicionar_cnt" method="POST" action={urlFor('doc_gen.render_gerar_kit')}
          onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
          <div className="form-group">
            <label htmlFor="status">Numero de Contrato:</label>
            <input type="text" id="numero_contrato" name="numero_contrato" placeholder="digite o número do contrato" required />
          </div>

          <div className="gerador-acoes">
            <button className="btn" type="submit">
              <i className="fa-solid fa-check" aria-hidden="true" /> Selecionar
            </button>
          </div>
        </ApiForm>
      </div>
    </WindowLayout>
  )
}
