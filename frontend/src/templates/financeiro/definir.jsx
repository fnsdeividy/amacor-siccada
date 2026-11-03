// financeiro/definir.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
/* Tabs header styling: aparência de cabeçalho no topo */
.tabs{
    display:flex;
    gap:150px;
    margin:0 0 12px 0;
    width:100%;
    justify-content:center;
    padding:10px 12px;
   
    position:sticky;
    top:0;
    z-index:20;
    box-shadow:0 2px 6px rgba(0,0,0,0.06);
    border-bottom:1px solid #e6e6e6;
    align-items:center;
}
.tabb-btn{
    padding:10px 18px;
    border:1px solid transparent;
    background:#f3f3f379;
    cursor:pointer;
    border-radius:6px;
    font-weight:600;
    color:#333;
}
.tabb-btn.active{
    background:#599ee9b2;
    color:#fff;
    
    box-shadow:0 1px 0 rgba(0,0,0,0.04);
}
.tab-panel{display:none}
.tab-panel.active{display:block}
.filter-container .date-input{display:block;margin-bottom:8px}
`

export default function Definir() {
  const ctx = useTemplateContext()
  const [tab, setTab] = useState('geral')
  const btn = (name) => 'tabb-btn' + (tab === name ? ' active' : '')
  const panel = (name) => 'tab-panel' + (tab === name ? ' active' : '')

  return (
    <WindowLayout title=" Filtragem de Pagamentos ">
      <div className="filter-tabs">
        {ctx.tipo_usuario === 'supervisor' && (
          <div className="tabs">
            <button type="button" className={btn('geral')} data-tab="geral" onClick={() => setTab('geral')}>Geral</button>

            <button type="button" className={btn('especificas')} data-tab="especificas" onClick={() => setTab('especificas')}>Específicas</button>

          </div>
        )}
        <div className="filter-container">

          <div className="filter-header">
            <div className="close-btn-container">
              <AppLink href={urlFor('finan.tab')} className="close-btn">
                <i className="fas fa-times"></i>
              </AppLink>
            </div>
            <h1 className="filter-title">
              <i className="fas fa-filter"></i>
              Filtragem de Pagamentos
            </h1>
            <p className="filter-subtitle">Selecione os critérios para filtrar os pagamentos</p>
          </div>

          <div className="tab-content">
            <div id="geral" className={panel('geral')}>
              <ApiForm method="GET" action={urlFor('finan.tab')}>
                <label htmlFor="data_inicio">Data de Início:</label>
                <input type="date" id="data_inicio" name="data_inicio" className="date-input" />

                <label htmlFor="data_fim">Data de Fim:</label>
                <input type="date" id="data_fim" name="data_fim" className="date-input" />

                <label htmlFor="metodo_pagamento">Método de Pagamento:</label>
                <select id="metodo_pagamento" name="metodo_pagamento">
                  <option value="">Todos</option>
                  <option value="cartao">Cartão</option>
                  <option value="boleto">Boleto</option>
                  <option value="PIX">Pix</option>
                </select>

                <label htmlFor="tipo_lancamento">Tipo de lançamento</label>
                <select name="tipo_lancamento" id="tipo_lancamento">
                  <option value="">Todos</option>
                  <option value="adesao">Adesão</option>
                  <option value="mensalidade">Mensalidade</option>
                </select>

                <label htmlFor="status">Status:</label>
                <select id="status" name="status">
                  <option value="">Todos</option>
                  <option value="efetuado">Efetuado</option>
                  <option value="baixado">Baixado</option>
                  <option value="cancelado">Cancelado</option>
                </select>

                <br /><br />
                <button className="btn" type="submit">Filtrar</button>
              </ApiForm>
            </div>

            <div id="especificas" className={panel('especificas')}>
              <ApiForm method="GET" action={urlFor('finan.tab')}>
                {/* Campos específicos; por padrão duplicam os campos principais. Ajuste conforme necessário. */}

                <h3 htmlFor="data_quitacao">Data de quitação:</h3>
                <label htmlFor="dt_qtc">inicial</label>
                <input type="date" id="data_quitacao_inicial" name="data_quitacao_inicial" className="date-input" />
                <label htmlFor="dt_qtc">final</label>

                <input type="date" id="data_quitacao_final" name="data_quitacao_final" className="date-input" />

                <br /><br />
                <button className="btn" type="submit">Filtrar Específico</button>
              </ApiForm>
            </div>
          </div>
        </div>
      </div>

      <InlineStyle css={css} />
    </WindowLayout>
  )
}
