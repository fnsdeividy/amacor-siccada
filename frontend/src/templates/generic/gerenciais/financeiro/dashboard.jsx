// generic/gerenciais/financeiro/dashboard.html
import { useSearchParams } from 'react-router-dom'
import ApiForm from '../../../../components/ApiForm.jsx'
import AppLink from '../../../../components/AppLink.jsx'
import Base1Layout from '../../../../layouts/Base1Layout.jsx'
import { formatCurrencyBr, formatDateBr } from '../../../../lib/format.js'
import { show } from '../../../../lib/jinja.js'
import { useTemplateContext } from '../../../../lib/page.jsx'
import { urlFor } from '../../../../lib/urlFor.js'
import { useStylesheet } from '../../../../lib/useStylesheet.jsx'

/** dados.lista[0] (vazio -> objeto vazio, para não quebrar a tela) */
function first(list) {
  return (Array.isArray(list) && list[0]) || {}
}

/** {{ x or 0 }} */
function or0(value) {
  return value ? show(value) : 0
}

export default function DashboardFinanceiro() {
  // O bloco trazia um documento inteiro: o <link> valia e o <title> ficava no conteúdo.
  // (o chart.js que o original carregava não era usado nesta tela)
  useStylesheet('/static/css/dashboard.css')
  const ctx = useTemplateContext()
  const [params] = useSearchParams()
  const dados = ctx.dados ?? {}
  const periodo = dados.periodo ?? {}
  const resumo = dados.resumo_geral ?? {}
  const argPeriodo = params.get('periodo')
  // a opção marcada: {% if request.args.get('periodo') == ... %}selected
  const periodoSel = !argPeriodo ? '30' : (['7', '30', '90', '180', '365'].includes(argPeriodo) ? argPeriodo : undefined)

  return (
    <Base1Layout title="Dashboard Financeiro">
      <title>Dashboard Financeiro</title>

      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="quick-actions-grid">
          <AppLink href={urlFor('finan.tab', { status: 'efetuado' })} className="quick-action-card">
            <span>💲</span>
            <p>Conferencia de pagamento</p>
          </AppLink>
          <AppLink href={urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' })} className="quick-action-card">
            <span>📊</span>
            <p>Relatorio de vendas</p>
          </AppLink>
          <AppLink href={urlFor('cad.acompanhar_cnt')} className="quick-action-card">
            <span>👥</span>
            <p>Acompanhar contratos</p>
          </AppLink>
          <AppLink href={urlFor('gerencial.dashboard_financeiro_cnt')} className="quick-action-card">
            <span>🔃</span>
            <p>Alterar para cadastro-financeiro</p>
          </AppLink>
        </div>
      </div>

      <div className="welcome-card">
        <h2>👋 Olá <span>{show(ctx.nome_user)}</span></h2>
        <p>Essa é a métrica do Financeiro no período: <strong>{formatDateBr(periodo.inicio)}</strong> até <strong>{formatDateBr(periodo.fim)}</strong></p>
      </div>

      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard Financeiro</h1>

        {/* Filtros */}
        <div className="filter-section">
          <ApiForm method="GET" action={urlFor('gerencial.dashboard_financeiro')}>
            <label>Período:</label>
            <select name="periodo" defaultValue={periodoSel}>
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="180">6 meses</option>
              <option value="365">1 ano</option>
            </select>

            <span>ou</span>

            <label>Data inicial:</label>
            <input type="date" name="data_inicial" defaultValue={show(params.get('data_inicial'))} />

            <button type="submit">Filtrar</button>
          </ApiForm>
        </div>
        {/* Botão no canto direito */}
      </div>
      {/* o original tinha um </div> a mais aqui, que fechava também a #content do
          layout (os cards ficavam fora dela); aqui ficam dentro, logo após a .dashboard-container */}
      <div className="card-container">
        {/* Card de Resumo Geral */}
        <div className="card stat-card">
          <div className="stat-value">{show(resumo.total_pagamentos)}</div>
          <div className="stat-label">Total de pagamentos</div>
          <div className="stat-label">Período: {formatDateBr(periodo.inicio)} até {formatDateBr(periodo.fim)}</div>
        </div>
        {/* Card de Valor em atraso */}
        <div className="card stat-card">
          <div className="stat-value"> {or0(first(dados.pgts_atrasados).quantidade)}</div>
          <div className="stat-label">Efetuados em atraso</div>
          <div className="stat-label">Total pago em atraso: R${formatCurrencyBr(first(dados.pgts_atrasados).valor_total)}</div>
        </div>

        {/* Card de Valor em dia */}
        <div className="card stat-card">
          <div className="stat-value"> {or0(first(dados.pgts_em_dia).quantidade)}</div>
          <div className="stat-label">Efetuados em dia</div>
          <div className="stat-label">Total pago em dia: R${formatCurrencyBr(first(dados.pgts_em_dia).valor_total)}</div>
        </div>
        {/* Lançamentos em atraso */}
        <div className="card stat-card">
          <div className="stat-value"> {show(dados.pendentes)}</div>
          <div className="stat-label">Baixas pendentes no periodo</div>
          <div className="stat-label">Baixas pendentes de: {formatDateBr(periodo.inicio)} até {formatDateBr(periodo.fim)}</div>
        </div>
        {/* Card de Valor Total */}
        <div className="card stat-card">
          <div className="stat-value">R$ {formatCurrencyBr(resumo.valor_total)}</div>
          <div className="stat-label">Valor Total arrecado no periodo</div>
        </div>

        {/* a .card-container não era fechada no original: a tabela ficava dentro dela */}
        <div className="sales-table">
          <h3>Registro de ultimos pagamentos</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Responsavel</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(dados.pagamentos ?? []).map((pagamentos, i) => (
                <tr key={i}>
                  <td>{show(pagamentos.nresponsavel)}</td>
                  <td>R$ {formatCurrencyBr(pagamentos.valor)}</td>
                  <td> {show(pagamentos.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Base1Layout>
  )
}
