// cadastro/resultado_d3.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { formatDateBr, round } from '../../lib/format.js'
import { show, showFloat } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

/** '%.2f'|format(x) */
const f2 = (x) => Number(x).toFixed(2)

export default function ResultadoD3() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Resultado D3">
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <AppLink href={urlFor('auth.fechar')} className="close-btn">✖</AppLink>
          </div>

          <h2>Resultado D3</h2>

          <div className="resultado-d3">
            {/* data_inicio/data_final são date no back (chegam como "aaaa-mm-dd") */}
            <p><strong>Período:</strong> {formatDateBr(ctx.data_inicio)} até {formatDateBr(ctx.data_final)}</p>
            <p><strong>Tempo (meses):</strong> {show(ctx.tempo)}</p>
            <p><strong>Valor pago:</strong> R$ {f2(ctx.valor_pago)}</p>
            <p><strong>Valor gasto:</strong> R$ {f2(ctx.valor_gasto)}</p>
            <p><strong>Sinistralidade:</strong> {showFloat(round(ctx.sinistralidade * 100, 2))}%</p>
            <p><strong>Ticket médio mensal:</strong> R$ {f2(ctx.ticket_medio)}</p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <AppLink className="btn" href={urlFor('cad.d3_beneficiarios')}>Novo cálculo</AppLink>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
