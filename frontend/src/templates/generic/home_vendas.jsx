// generic/home_vendas.html
import { useSearchParams } from 'react-router-dom'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { formatCurrencyBr, round } from '../../lib/format.js'
import { show, showFloat } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

/** {{ (a / b * 100)|round(2) }}: divisão do Python sempre dá float. */
function percent(quantidade, total) {
  return showFloat(round(quantidade / total * 100, 2))
}

/** "%.2f"|format(x or 0) */
function f2(value) {
  return Number(value || 0).toFixed(2)
}

export default function HomeVendas() {
  // O bloco trazia um documento inteiro: o <link> valia e o <title> ficava no conteúdo.
  // (o chart.js que o original carregava não era usado nesta tela)
  useStylesheet('/static/css/dashboard.css')
  const ctx = useTemplateContext()
  const [params] = useSearchParams()
  const dados = ctx.dados ?? {}
  const periodo = dados.periodo ?? {}
  const resumo = dados.resumo_geral ?? {}
  const porStatus = dados.por_status ?? []

  const argPeriodo = params.get('periodo')
  const periodoSel = !argPeriodo ? '30' : (['7', '30', '90', '180', '365'].includes(argPeriodo) ? argPeriodo : undefined)

  return (
    <Base1Layout title="Dashboard Corretor">
      <title>Home</title>

      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="quick-actions-grid">
          <AppLink href={urlFor('vendas.render_tipo_venda')} className="quick-action-card">
            <span>➕</span>
            <p>Nova Venda</p>
          </AppLink>
          <a href="" className="quick-action-card">
            <span>👨‍👩‍👦</span>
            <p>Incluir beneficiario</p>
          </a>
          <AppLink href={urlFor('vendas.cpf')} className="quick-action-card">
            <span>👥</span>
            <p>Verificar Elegibilidade</p>
          </AppLink>
          <AppLink href={urlFor('auth.redir_atent')} className="quick-action-card">
            <span>🧾</span>
            <p>Acompanhar contratos</p>
          </AppLink>
        </div>
      </div>

      <div className="welcome-card">
        <h2>👋 Olá <span>{show(ctx.corretor_resp)}</span></h2>
        <p>Essa é a sua métrica no período: <strong>{show(periodo.inicio)}</strong> até <strong>{show(periodo.fim)}</strong></p>
      </div>
      <div className="dashboard-container">

        {/* Filtros */}
        <div className="filter-section">
          <ApiForm method="GET" action={urlFor('generic.home_corretor')}>
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

        <div className="card-container">
          {/* Card de Resumo Geral */}

          <div className="card stat-card">
            <div className="stat-value">{show(resumo.total_vendas)}</div>
            <div className="stat-label">Total de Vendas</div>
            <div className="stat-label">Período: {show(periodo.inicio)} até {show(periodo.fim)}</div>
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
              {porStatus.map((status, i) => (
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
              {porStatus.map((status, i) => (
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

        {/* Tabela de Vendas por Corretor */}

      </div>
    </Base1Layout>
  )
}
