// cadastro/alterar_infos/excluir_proposta.html
import ApiForm from '../../../components/ApiForm.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { show } from '../../../lib/jinja.js'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'
import { useGoBack } from '../_goBack.js'

export default function ExcluirProposta() {
  const ctx = useTemplateContext()
  const goBack = useGoBack()
  // a rota alterar_infos_proposta passa tipo_exc (não tp_alt): aí tp_alt não existe e imprime ""
  const tpAlt = ctx.tp_alt
  return (
    <Base1Layout title="Anexar Comprovante">
      <title>Excluir proposta</title>
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <a className="close-btn" href="#" onClick={goBack}>{'<'}</a>
          </div>
          <h1>{show(tpAlt)} proposta n°: {show(ctx.proposta_id)}</h1>
          <ApiForm action={urlFor('cad.excluir_proposta', { proposta_id: ctx.proposta_id, tp_alt: tpAlt })} method="POST" encType="multipart/form-data">
            <p>Para realizar o cancelamento é necessario a senha de um supervisor</p>
            <label htmlFor="arquivos">Digite sua senha:</label>
            <input type="password" name="senha" id="senha" required />
            <input type="hidden" name="proposta" value={show(ctx.proposta_id)} />
            <input type="hidden" name="tp_alt" value={show(tpAlt)} />
            {tpAlt === 'excluir' && (
              <>
                <p>Motivo de exclusão:</p>
                <input type="text" name="motivo" id="motivo" required />
              </>
            )}
            <p>Você tem certeza que deseja excluir a proposta? <br />Essa ação não pode ser desfeita.</p>
            <p></p><br />
            <button className="btn" type="submit">Enviar</button>
          </ApiForm>
        </div>
      </div>
    </Base1Layout>
  )
}
