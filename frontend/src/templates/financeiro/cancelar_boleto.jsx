// financeiro/cancelar_boleto.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { pagamentoCss } from './_shared.js'

/**
 * dados[i] como o Jinja imprime. A rota passa uma linha (fetchone, com
 * numero_contrato) ou uma lista de linhas (fetchall, sem numero_contrato);
 * na lista, dados[i] é uma linha inteira (impressa como tupla) ou indefinido.
 */
function item(dados, i) {
  if (dados === null || dados === undefined) return ''
  if (Array.isArray(dados)) {
    const row = dados[i]
    if (row === undefined) return ''
    const values = Array.isArray(row) ? row : (row && typeof row === 'object' ? Object.values(row) : null)
    if (!values) return show(row)
    const inner = show(values).slice(1, -1)
    return '(' + inner + (values.length === 1 ? ',' : '') + ')'
  }
  const values = Object.values(dados)
  return i < values.length ? show(values[i]) : ''
}

export default function CancelarBoleto() {
  const ctx = useTemplateContext()
  const { dados } = ctx
  return (
    <WindowLayout>
      <h1 className="titulo-pagamento">Mudar status de boleto emitido</h1>

      <ApiForm method="POST" className="form-pagamento" action={urlFor('finan.cancelar_boleto')}>
        <div className="info-pagamento">
          <p><strong>Número de Contrato:</strong> {item(dados, 0)}</p>
          <p><strong>Responsável:</strong> {item(dados, 2)}</p>

          <p><strong>Data de Cancelamento:</strong> {item(dados, 7)}</p>

          <p><strong>Motivo:</strong> {item(dados, 8)}</p>
        </div>

        <div className="campo-status">
          <label htmlFor="status"><strong>Status:</strong></label>
          <select id="status" name="status" required defaultValue="">
            <option value="" disabled>Selecione</option>
            <option value="1">Cancelado</option>
          </select>
        </div>
        {/* no template os value= não tinham aspas: só a primeira palavra vale */}
        <input type="hidden" name="numero_contrato" defaultValue={item(dados, 0).split(/\s/)[0]} />
        <input type="hidden" name="data_inicial" defaultValue={show(ctx.data_inicial).split(/\s/)[0]} />
        <input type="hidden" name="data_final" defaultValue={show(ctx.data_final).split(/\s/)[0]} />
        <div className="acoes-form">
          <button className="btn" type="submit">Salvar</button>

        </div>
      </ApiForm>
      <InlineStyle css={pagamentoCss} />
    </WindowLayout>
  )
}
