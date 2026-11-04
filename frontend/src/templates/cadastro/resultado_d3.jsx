// cadastro/resultado_d3.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { formatDateBr, round } from '../../lib/format.js'
import { show, showFloat } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.cad-resultado-d3 .resultado-d3 { margin-bottom: var(--space-2); }
.cad-resultado-d3 .stat-card { box-shadow: none; background: var(--gray-50); }
.cad-resultado-d3 .stat-value { font-size: var(--text-xl); font-variant-numeric: tabular-nums; }
.cad-resultado-d3 .cad-periodo { font-size: var(--text-lg); }
`

/** '%.2f'|format(x) */
const f2 = (x) => Number(x).toFixed(2)

export default function ResultadoD3() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Resultado D3">
      <InlineStyle css={css} />
      <div className="card cad-resultado-d3">
        <div className="close-btn-container">
          <AppLink href={urlFor('auth.fechar')} className="close-btn" title="Fechar" aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </AppLink>
        </div>

        <h2>Resultado D3</h2>

        <div className="resultado-d3 card-container">
          {/* data_inicio/data_final são date no back (chegam como "aaaa-mm-dd") */}
          <div className="stat-card">
            <span className="stat-label">Período:</span>
            <span className="stat-value cad-periodo">{formatDateBr(ctx.data_inicio)} até {formatDateBr(ctx.data_final)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tempo (meses):</span>
            <span className="stat-value">{show(ctx.tempo)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Valor pago:</span>
            <span className="stat-value">R$ {f2(ctx.valor_pago)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Valor gasto:</span>
            <span className="stat-value">R$ {f2(ctx.valor_gasto)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Sinistralidade:</span>
            <span className="stat-value">{showFloat(round(ctx.sinistralidade * 100, 2))}%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Ticket médio mensal:</span>
            <span className="stat-value">R$ {f2(ctx.ticket_medio)}</span>
          </div>
        </div>

        <AppLink className="btn" href={urlFor('cad.d3_beneficiarios')}>
          <i className="fa-solid fa-rotate-left" aria-hidden="true" /> Novo cálculo
        </AppLink>
      </div>
    </Base1Layout>
  )
}
