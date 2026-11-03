// financeiro/comprovante/comprovante.html
import { useNavigate } from 'react-router-dom'
import ApiForm from '../../../components/ApiForm.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'

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
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <a className="close-btn" href="javascript:void(0);" onClick={(e) => { e.preventDefault(); goBack() }}>{'<'}</a>
          </div>
          <h1>Anexar Comrpovante de pagamento</h1>
          <ApiForm action={urlFor('finan.receber_comprovante', { pagamento_id: ctx.pagamento_id })} method="POST" encType="multipart/form-data">
            <label htmlFor="arquivos">Selecione os documentos para upload:</label>
            <input type="file" name="comprovante" id="comprovante" multiple required />
            <button type="submit">Enviar</button>
          </ApiForm>
        </div>
      </div>
    </Base1Layout>
  )
}
