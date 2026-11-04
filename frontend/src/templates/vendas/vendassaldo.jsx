// vendas/vendassaldo.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { col, show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const CSS = `
.vendas-saldo { max-width: 600px; margin: 0 auto; }
.vendas-saldo .result { margin-bottom: var(--space-5); }
.vendas-saldo .info-item strong { color: var(--text-muted); font-size: var(--text-sm); font-weight: 500; }
.vendas-saldo .info-value { font-weight: 500; color: var(--text); text-align: right; }
.vendas-saldo .aviso {
  display: flex; gap: var(--space-3); padding: var(--space-4); margin-bottom: var(--space-5);
  background: var(--warning-50); border: 1px solid var(--border); border-radius: var(--radius);
}
.vendas-saldo .aviso > i { margin-top: 2px; color: var(--warning-700); }
.vendas-saldo .aviso .prince { font-weight: 600; color: var(--warning-700); margin-bottom: var(--space-1); }
.vendas-saldo .aviso p:last-child { margin-bottom: 0; }
`

export default function VendasSaldo() {
  const ctx = useTemplateContext()
  const result = ctx.result
  return (
    <Base1Layout title="Vendas">
      <InlineStyle css={CSS} />
      <div className="vendas-saldo">
        <div className="card">
          <h1>Resultado da Consulta</h1>

          {truthy(result) ? (
            <div className="result">
              <div className="info-item"><strong>Nome Responsável:</strong> <span className="info-value">{show(col(result, 1))}</span></div>
              <div className="info-item"><strong>Numero do Contrato:</strong> <span className="info-value">{show(col(result, 0))}</span></div>
              <div className="info-item"><strong>Parcelas em aberto:</strong> <span className="info-value">{show(col(result, 2))}</span></div>
              <div className="info-item"><strong>Valor Total:</strong> <span className="info-value">{show(col(result, 4))}</span></div>
            </div>
          ) : (
            <div className="aviso">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
              <div>
                <p className="prince">Registro Financeiro não encontrado.</p>
                <p>Não foi possível encontrar os dados para o contrato especificado, talvez a informação seja muito antiga.</p>
              </div>
            </div>
          )}

          <AppLink href={urlFor('vendas.cpf')} className="btn btn-secondary">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar
          </AppLink>
        </div>
      </div>
    </Base1Layout>
  )
}
