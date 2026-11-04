// financeiro/comprovante/comprovante.html
import { useNavigate } from 'react-router-dom'
import ApiForm from '../../../components/ApiForm.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../../lib/page.jsx'
import { InlineStyle } from '../../../lib/useStylesheet.jsx'
import { urlFor } from '../../../lib/urlFor.js'

const css = `
.comprovante-anexar { max-width: 560px; margin: 0 auto; }
.comprovante-anexar .page-toolbar h1 { font-size: var(--text-lg); }
`

export default function Comprovante() {
  const ctx = useTemplateContext()
  const navigate = useNavigate()

  function goBack() {
    // no front a "página anterior" é o histórico do próprio app
    if (window.history.state && window.history.state.idx > 0) {
      // Voltar para a página anterior
      navigate(-1)
    } else {
      // Redirecionar para a home se não houver página anterior
      navigate('/')
    }
  }

  return (
    <Base1Layout title="Anexar Comprovante">
      <InlineStyle css={css} />
      <div className="container">
        <div className="card divisoria2 comprovante-anexar">
          <div className="close-btn-container">
            <a className="close-btn" href="javascript:void(0);" title="Voltar" aria-label="Voltar"
              onClick={(e) => { e.preventDefault(); goBack() }}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </a>
          </div>
          <div className="page-toolbar">
            <h1>Anexar Comrpovante de pagamento</h1>
          </div>
          <ApiForm action={urlFor('finan.receber_comprovante', { pagamento_id: ctx.pagamento_id })} method="POST" encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="arquivos">Selecione os documentos para upload:</label>
              <input type="file" name="comprovante" id="comprovante" multiple required />
            </div>
            <button type="submit"><i className="fa-solid fa-upload" aria-hidden="true" /> Enviar</button>
          </ApiForm>
        </div>
      </div>
    </Base1Layout>
  )
}
