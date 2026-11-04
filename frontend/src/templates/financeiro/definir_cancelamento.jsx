// financeiro/definir_cancelamento.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.filtro-cancelamento { max-width: 640px; }
.filtro-cancelamento .filter-header { margin-bottom: var(--space-5); }
.filtro-cancelamento .filter-title { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1); }
.filtro-cancelamento .filter-title i { color: var(--brand-700); }
.filtro-cancelamento .filter-subtitle { color: var(--text-muted); margin: 0; }
.filtro-cancelamento .input-label i { color: var(--text-muted); margin-right: var(--space-1); }
.filtro-cancelamento .filter-actions { display: flex; justify-content: flex-end; }
`

export default function DefinirCancelamento() {
  return (
    <WindowLayout>
      <InlineStyle css={css} />
      <div className="filter-container filtro-cancelamento">
        <div className="filter-header">
          <h1 className="filter-title">
            <i className="fa-solid fa-filter" aria-hidden="true"></i>
            Filtragem de Pagamentos
          </h1>
          <p className="filter-subtitle">Selecione o período para visualizar os pagamentos</p>
        </div>

        <div className="filter-form-container">
          <ApiForm method="POST" action={urlFor('finan.render_cancelamento_boletos')} className="filter-form">
            <div className="form-row date-inputs">
              <div className="form-group input-group">
                <label htmlFor="data_inicial" className="input-label">
                  <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                  Data de Início
                </label>
                <input type="date" id="data_inicial" name="data_inicial" className="date-input" />
              </div>

              <div className="form-group input-group">
                <label htmlFor="data_final" className="input-label">
                  <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                  Data de Fim
                </label>
                <input type="date" id="data_final" name="data_final" className="date-input" />
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn btn-primary" type="submit">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                Filtrar
              </button>
            </div>
          </ApiForm>
        </div>
      </div>
    </WindowLayout>
  )
}
