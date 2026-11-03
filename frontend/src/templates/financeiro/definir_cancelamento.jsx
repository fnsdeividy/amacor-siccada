// financeiro/definir_cancelamento.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

export default function DefinirCancelamento() {
  useStylesheet('/static/css/dashboard.css')
  // Adicionando Font Awesome para ícones
  useStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css')
  return (
    <WindowLayout>
      <div className="filter-container">
        <div className="filter-header">
          <h1 className="filter-title">
            <i className="fas fa-filter"></i>
            Filtragem de Pagamentos
          </h1>
          <p className="filter-subtitle">Selecione o período para visualizar os pagamentos</p>
        </div>

        <div className="filter-form-container">
          <ApiForm method="POST" action={urlFor('finan.render_cancelamento_boletos')} className="filter-form">
            <div className="date-inputs">
              <div className="input-group">
                <label htmlFor="data_inicial" className="input-label">
                  <i className="far fa-calendar-alt"></i>
                  Data de Início
                </label>
                <input type="date" id="data_inicial" name="data_inicial" className="date-input" />
              </div>

              <div className="input-group">
                <label htmlFor="data_final" className="input-label">
                  <i className="far fa-calendar-alt"></i>
                  Data de Fim
                </label>
                <input type="date" id="data_final" name="data_final" className="date-input" />
              </div>
            </div>

            <button className="btn btn-primary" type="submit">
              <i className="fas fa-search"></i>
              Filtrar
            </button>
          </ApiForm>
        </div>
      </div>
    </WindowLayout>
  )
}
