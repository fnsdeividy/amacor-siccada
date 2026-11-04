// cadastro/alterar_infos/excluir_proposta.html
import ApiForm from '../../../components/ApiForm.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { show } from '../../../lib/jinja.js'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'
import { InlineStyle } from '../../../lib/useStylesheet.jsx'
import { useGoBack } from '../_goBack.js'

const css = `
.cad-excluir .cad-excluir-aviso {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  padding: var(--space-3) var(--space-4);
  margin: var(--space-4) 0;
  border-radius: var(--radius);
  background: var(--danger-50);
  color: var(--danger-700);
}
.cad-excluir .cad-excluir-aviso p { margin: 0; color: var(--danger-700); }
.cad-excluir .cad-excluir-aviso i { margin-top: 3px; }
`

export default function ExcluirProposta() {
  const ctx = useTemplateContext()
  const goBack = useGoBack()
  // a rota alterar_infos_proposta passa tipo_exc (não tp_alt): aí tp_alt não existe e imprime ""
  const tpAlt = ctx.tp_alt
  return (
    <Base1Layout title="Anexar Comprovante">
      <title>Excluir proposta</title>
      <InlineStyle css={css} />
      <div className="divisoria cad-excluir">
        <div className="close-btn-container">
          <a className="close-btn" href="#" onClick={goBack} title="Voltar" aria-label="Voltar">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </a>
        </div>
        <h1>{show(tpAlt)} proposta n°: {show(ctx.proposta_id)}</h1>
        <ApiForm action={urlFor('cad.excluir_proposta', { proposta_id: ctx.proposta_id, tp_alt: tpAlt })} method="POST" encType="multipart/form-data">
          <p>Para realizar o cancelamento é necessario a senha de um supervisor</p>
          <div className="form-group">
            <label htmlFor="senha">Digite sua senha:</label>
            <input type="password" name="senha" id="senha" required />
          </div>
          <input type="hidden" name="proposta" value={show(ctx.proposta_id)} />
          <input type="hidden" name="tp_alt" value={show(tpAlt)} />
          {tpAlt === 'excluir' && (
            <div className="form-group">
              <label htmlFor="motivo">Motivo de exclusão:</label>
              <input type="text" name="motivo" id="motivo" required />
            </div>
          )}
          <div className="cad-excluir-aviso">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <p>Você tem certeza que deseja excluir a proposta? <br />Essa ação não pode ser desfeita.</p>
          </div>
          <button className="btn btn-danger" type="submit">Enviar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
