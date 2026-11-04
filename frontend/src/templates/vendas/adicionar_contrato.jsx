// vendas/adicionar_contrato.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import Loader from '../../components/Loader.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const CSS = `
.adicionar-contrato { max-width: 520px; }
.adicionar-contrato .subtitulo { font-weight: 400; color: var(--text-muted); margin-bottom: var(--space-5); }
.adicionar-contrato .acoes { display: flex; justify-content: flex-end; margin-top: var(--space-2); }
`

export default function AdicionarContrato() {
  // o script mostra o loader ao enviar o formulário
  const [loading, setLoading] = useState(false)
  return (
    <WindowLayout title="Iniciar inclusão">
      <InlineStyle css={CSS} />
      {loading && <Loader />}
      {/* o template tem um documento HTML inteiro dentro do bloco; o
          navegador mantém o <title> no corpo (o texto "Document" aparece no DOM) */}
      <title>Document</title>

      <div className="adicionar-contrato">
        <h1>Iniciar inclusão</h1>

        <div>
          <h2 className="subtitulo">Informe o contrato para incluir</h2>
        </div>

        <ApiForm id="adicionar_cnt" method="POST" action={urlFor('vendas.inclusao_render_form')}
          onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
          <div className="form-group">
            <label htmlFor="status">Adicionar beneficiario ao contrato:</label>
            <input type="text" id="numero_contrato" name="numero_contrato" placeholder="digite o número do contrato" required />
          </div>

          <div className="acoes">
            <button className="btn" type="submit">
              <i className="fa-solid fa-user-plus" aria-hidden="true" /> Selecionar
            </button>
          </div>
        </ApiForm>
      </div>
    </WindowLayout>
  )
}
