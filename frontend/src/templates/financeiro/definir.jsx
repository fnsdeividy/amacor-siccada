// financeiro/definir.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.filtro-pagamentos { max-width: 720px; }
.filtro-pagamentos .tab-panel { display: none; }
.filtro-pagamentos .tab-panel.active { display: block; }
.filtro-pagamentos .filter-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.filtro-pagamentos .filter-header .close-btn-container { position: static; }
.filtro-pagamentos .filter-title { display: flex; align-items: center; gap: var(--space-2); margin: 0 0 var(--space-1); }
.filtro-pagamentos .filter-title i { color: var(--brand-700); }
.filtro-pagamentos .filter-subtitle { color: var(--text-muted); margin: 0; }
.filtro-pagamentos .filtro-secao {
  margin: 0 0 var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.filtro-pagamentos .filtro-acoes {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
`

export default function Definir() {
  const ctx = useTemplateContext()
  const [tab, setTab] = useState('geral')
  const btn = (name) => 'tabb-btn' + (tab === name ? ' active' : '')
  const panel = (name) => 'tab-panel' + (tab === name ? ' active' : '')

  return (
    <WindowLayout title=" Filtragem de Pagamentos ">
      <InlineStyle css={css} />
      <div className="filter-tabs filtro-pagamentos">
        {ctx.tipo_usuario === 'supervisor' && (
          <div className="tabs">
            <button type="button" className={btn('geral')} data-tab="geral" onClick={() => setTab('geral')}>Geral</button>

            <button type="button" className={btn('especificas')} data-tab="especificas" onClick={() => setTab('especificas')}>Específicas</button>

          </div>
        )}
        <div className="filter-container">

          <div className="filter-header">
            <div className="close-btn-container">
              <AppLink href={urlFor('finan.tab')} className="close-btn" title="Voltar" aria-label="Voltar">
                <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              </AppLink>
            </div>
            <div>
              <h1 className="filter-title">
                <i className="fa-solid fa-filter" aria-hidden="true"></i>
                Filtragem de Pagamentos
              </h1>
              <p className="filter-subtitle">Selecione os critérios para filtrar os pagamentos</p>
            </div>
          </div>

          <div className="tab-content">
            <div id="geral" className={panel('geral')}>
              <ApiForm method="GET" action={urlFor('finan.tab')}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="data_inicio">Data de Início:</label>
                    <input type="date" id="data_inicio" name="data_inicio" className="date-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="data_fim">Data de Fim:</label>
                    <input type="date" id="data_fim" name="data_fim" className="date-input" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="metodo_pagamento">Método de Pagamento:</label>
                    <select id="metodo_pagamento" name="metodo_pagamento">
                      <option value="">Todos</option>
                      <option value="cartao">Cartão</option>
                      <option value="boleto">Boleto</option>
                      <option value="PIX">Pix</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tipo_lancamento">Tipo de lançamento</label>
                    <select name="tipo_lancamento" id="tipo_lancamento">
                      <option value="">Todos</option>
                      <option value="adesao">Adesão</option>
                      <option value="mensalidade">Mensalidade</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select id="status" name="status">
                      <option value="">Todos</option>
                      <option value="efetuado">Efetuado</option>
                      <option value="baixado">Baixado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="filtro-acoes">
                  <button className="btn" type="submit"><i className="fa-solid fa-filter" aria-hidden="true" /> Filtrar</button>
                </div>
              </ApiForm>
            </div>

            <div id="especificas" className={panel('especificas')}>
              <ApiForm method="GET" action={urlFor('finan.tab')}>
                {/* Campos específicos; por padrão duplicam os campos principais. Ajuste conforme necessário. */}

                <h3 className="filtro-secao" htmlFor="data_quitacao">Data de quitação:</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dt_qtc">inicial</label>
                    <input type="date" id="data_quitacao_inicial" name="data_quitacao_inicial" className="date-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dt_qtc">final</label>
                    <input type="date" id="data_quitacao_final" name="data_quitacao_final" className="date-input" />
                  </div>
                </div>

                <div className="filtro-acoes">
                  <button className="btn" type="submit"><i className="fa-solid fa-filter" aria-hidden="true" /> Filtrar Específico</button>
                </div>
              </ApiForm>
            </div>
          </div>
        </div>
      </div>
    </WindowLayout>
  )
}
