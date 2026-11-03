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
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <a className="close-btn" href="#" onClick={goBack}>{'<'}</a>
          </div>
          <h1>Anexar carga de atualização </h1>
          <ApiForm action={urlFor('cad.atualizar_data')} method="POST" encType="multipart/form-data">
            <label htmlFor="arquivos">Adicione a carga de atualização do banco de dados:</label><br />
            <input type="file" name="csv_banco" id="csv_banco" multiple required />
            <button type="submit">Enviar</button>
          </ApiForm>

          {truthy(ctx.ultima_atualizacao) && (
            <p style={{ marginTop: '16px' }}><strong>Última atualização registrada:</strong> {show(ctx.ultima_atualizacao)}</p>
          )}
        </div>
      </div>
    </Base1Layout>
  )
}
