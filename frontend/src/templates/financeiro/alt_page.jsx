// financeiro/alt_page.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { col, show, showFloat } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { pagamentoCss } from './_shared.js'

export default function AltPage() {
  const ctx = useTemplateContext()
  const p = ctx.pagamento
  const status = col(p, 8)
  const financeiro = ctx.tipo_usuario === 'financeiro'
  // option com "selected" no template (nenhuma: o navegador mostra a primeira)
  let selected
  if (financeiro && status === 'pendente') selected = 'efetuado'
  else if (financeiro && status === 'pago') selected = 'baixado'
  else if (status === 'cancelado') selected = 'cancelado'

  return (
    <WindowLayout>
      <h1 className="titulo-pagamento">Editar Lançamento de Pagamento</h1>

      <ApiForm method="POST" className="form-pagamento">
        <div className="info-pagamento">
          <p><strong>Número de Contrato:</strong> {show(col(p, 2))}</p>
          <p><strong>Responsável:</strong> {show(col(p, 3))}</p>
          <p><strong>Valor:</strong> R$ {showFloat(col(p, 4))}</p>
          <p><strong>Data de Pagamento:</strong> {show(col(p, 5))}</p>
          <p><strong>Método:</strong> {show(col(p, 6))}</p>
          <p><strong>Descrição:</strong> {show(col(p, 7))}</p>
        </div>

        <div className="campo-status">
          <label htmlFor="status"><strong>Status:</strong></label>
          <select id="status" name="status" required defaultValue={selected}>
            {financeiro && (
              <>
                <option value="efetuado">Pendente</option>
                <option value="baixado">Baixado</option>
              </>
            )}
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="acoes-form">
          <button className="btn" type="submit">Salvar</button>
          <AppLink className="btn-cancela" href={urlFor('finan.tab', { status })}>Cancelar</AppLink>
        </div>
      </ApiForm>
      <InlineStyle css={pagamentoCss} />
    </WindowLayout>
  )
}
