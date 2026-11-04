// cadastro/atualizar_data.html
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useGoBack } from './_goBack.js'

export default function AtualizarData() {
  const ctx = useTemplateContext()
  const goBack = useGoBack()
  return (
    <Base1Layout title="Anexar documentos">
      <title>Atualizar banco</title>
      <div className="divisoria">
        <div className="close-btn-container">
          <a className="close-btn" href="#" onClick={goBack} title="Voltar" aria-label="Voltar">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </a>
        </div>
        <h1>Anexar carga de atualização </h1>
        <ApiForm action={urlFor('cad.atualizar_data')} method="POST" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="csv_banco">Adicione a carga de atualização do banco de dados:</label>
            <input type="file" name="csv_banco" id="csv_banco" multiple required />
          </div>
          <button type="submit" className="btn"><i className="fa-solid fa-upload" aria-hidden="true" /> Enviar</button>
        </ApiForm>

        {truthy(ctx.ultima_atualizacao) && (
          <div className="info-item" style={{ marginTop: '16px' }}>
            <span className="info-label">Última atualização registrada:</span>
            <span className="info-value">{show(ctx.ultima_atualizacao)}</span>
          </div>
        )}
      </div>
    </Base1Layout>
  )
}
