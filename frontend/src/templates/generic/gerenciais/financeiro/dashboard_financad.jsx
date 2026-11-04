// generic/gerenciais/financeiro/dashboard_financad.html
import { useSearchParams } from 'react-router-dom'
import ApiForm from '../../../../components/ApiForm.jsx'
import AppLink from '../../../../components/AppLink.jsx'
import Base1Layout from '../../../../layouts/Base1Layout.jsx'
import { formatCurrencyBr, formatDateBr, round } from '../../../../lib/format.js'
import { show, showFloat } from '../../../../lib/jinja.js'
import { useTemplateContext } from '../../../../lib/page.jsx'
import { urlFor } from '../../../../lib/urlFor.js'
import { InlineStyle } from '../../../../lib/useStylesheet.jsx'
import { dashboardCss } from '../../_dashboard.js'

/** {{ (a / b * 100)|round(2) }}: divisão do Python sempre dá float. */
function percent(quantidade, total) {
  return showFloat(round(quantidade / total * 100, 2))
}

/** "%.2f"|format(x or 0) */
function f2(value) {
  return Number(value || 0).toFixed(2)
}

export default function DashboardFinancad() {
  // O bloco trazia um documento inteiro: o <title> ficava no conteúdo (o <link> de
  // dashboard.css deu lugar ao CSS do visual novo, em _dashboard.js).
  // (o chart.js que o original carregava não era usado nesta tela)
  const ctx = useTemplateContext()
  const [params] = useSearchParams()
  const dados = ctx.dados ?? {}
  const periodo = dados.periodo ?? {}
  const resumo = dados.resumo_geral ?? {}
  const argPeriodo = params.get('periodo')
  // a opção marcada: {% if request.args.get('periodo') == ... %}selected
  const periodoSel = !argPeriodo ? '30' : (['7', '30', '90', '180', '365'].includes(argPeriodo) ? argPeriodo : undefined)

  return (
    <Base1Layout title="Dashboard Administrativo">
      <title>Dashboard Administrativo</title>
      <InlineStyle css={dashboardCss} />
      <div className="dash dash-financad">

        <div className="quick-actions">
          <h3>Ações Rápidas</h3>
          <div className="quick-actions-grid">
            <AppLink href={urlFor('finan.tab')} className="quick-action-card">
              <span className="quick-action-icon"><i className="fa-solid fa-magnifying-glass-dollar" aria-hidden="true" /></span>
              <p>Conferencia de pagamento</p>
            </AppLink>
            <AppLink href={urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' })} className="quick-action-card">
              <span className="quick-action-icon"><i className="fa-solid fa-chart-column" aria-hidden="true" /></span>
              <p>Relatorio de vendas</p>
            </AppLink>
            <AppLink href={urlFor('cad.acompanhar_cnt')} className="quick-action-card">
              <span className="quick-action-icon"><i className="fa-solid fa-users" aria-hidden="true" /></span>
              <p>Acompanhar contratos</p>
            </AppLink>
            <AppLink href={urlFor('gerencial.dashboard_financeiro')} className="quick-action-card">
              <span className="quick-action-icon"><i className="fa-solid fa-arrows-rotate" aria-hidden="true" /></span>
              <p>Alterar para modo financeiro</p>
            </AppLink>
          </div>
        </div>

        <div className="welcome-card">
          <h2><i className="fa-regular fa-hand" aria-hidden="true" /> Olá <span>{show(ctx.nome_user)}</span></h2>
          <p>Essa é a métrica de Cadastro no período: <strong>{formatDateBr(periodo.inicio)}</strong> até <strong>{formatDateBr(periodo.fim)}</strong></p>
        </div>
        <div className="dashboard-container">
          <h1 className="dashboard-title">Dashboard Cadastro-financeiro</h1>

          {/* Filtros */}
          <div className="filter-section">
            <ApiForm method="GET" action={urlFor('gerencial.dashboard_financeiro_cnt')}>
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

              <button className="btn" type="submit"><i className="fa-solid fa-filter" aria-hidden="true" /> Filtrar</button>
            </ApiForm>
          </div>

          <div className="card-container">
            {/* Card de Resumo Geral */}
            <div className="card stat-card">
              <div className="stat-value">{show(resumo.total_vendas)}</div>
              <div className="stat-label">Total de Vendas</div>
              <div className="stat-label">Período: {formatDateBr(periodo.inicio)} até {formatDateBr(periodo.fim)}</div>
            </div>

            {/* Card de Valor Total */}
            <div className="card stat-card">
              <div className="stat-value">R$ {formatCurrencyBr(resumo.valor_total)}</div>
              <div className="stat-label">Valor Total</div>
              <div className="stat-label">Ticket Médio: R$ {formatCurrencyBr(resumo.ticket_medio_geral)}</div>
            </div>

            {/* Listagem de Status */}
            <div className="card">
              <div className="status-header">
                <h3>Status das Vendas</h3>
                <span className="status-total">Total: {show(resumo.total_vendas)}</span>
              </div>
              <ul className="status-list">
                {(dados.por_status ?? []).map((status, i) => (
                  <li key={i} className="status-item">
                    <span className="status-name">{show(status.status)}</span>
                    <div>
                      <span className="status-count">{show(status.quantidade)}</span>
                      <span className="status-percentage">
                        {percent(status.quantidade, resumo.total_vendas)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tabela de Detalhamento por Status */}
          <div className="sales-table">
            <h3>Detalhamento por Status</h3>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Quantidade</th>
                    <th>Percentual</th>
                    <th>Valor Total</th>
                    <th>Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {(dados.por_status ?? []).map((status, i) => (
                    <tr key={i}>
                      <td>{show(status.status)}</td>
                      <td>{show(status.quantidade)}</td>
                      <td>{percent(status.quantidade, resumo.total_vendas)}%</td>
                      <td>R$ {f2(status.valor_total)}</td>
                      <td>R$ {f2(status.ticket_medio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de Vendas por Corretor */}
          <div className="sales-table">
            <h3>Vendas por Corretor</h3>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Corretor</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(dados.por_corretor ?? []).map((corretor, i) => (
                    <tr key={i}>
                      <td>{show(corretor.corretor_resp)}</td>
                      <td>{show(corretor.quantidade)}</td>
                      <td>R$ {f2(corretor.valor_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
