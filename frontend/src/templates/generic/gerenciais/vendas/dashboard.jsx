// generic/gerenciais/vendas/dashboard.html
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ApiForm from '../../../../components/ApiForm.jsx'
import AppLink from '../../../../components/AppLink.jsx'
import Base1Layout from '../../../../layouts/Base1Layout.jsx'
import { formatCurrencyBr, formatDateBr } from '../../../../lib/format.js'
import { show, showFloat, truthy } from '../../../../lib/jinja.js'
import { useTemplateContext } from '../../../../lib/page.jsx'
import { urlFor } from '../../../../lib/urlFor.js'
import { InlineStyle } from '../../../../lib/useStylesheet.jsx'
import { dashboardCss } from '../../_dashboard.js'

// CSS só desta tela (o resto vem de _dashboard.js)
const css = `
.dash-vendas .vendas-card-title { margin-bottom: var(--space-3); font-weight: 600; color: var(--text); }
.dash-vendas .thermometer-body { display: flex; align-items: center; gap: var(--space-4); }
.dash-vendas .thermo-stop-top { stop-color: var(--brand-600); }
.dash-vendas .thermo-stop-bottom { stop-color: var(--brand-900); }
.dash-vendas .thermo-track { fill: var(--brand-50); }
.dash-vendas .thermo-bulb { fill: var(--brand-900); }
.dash-vendas .stat-card strong { color: var(--text); font-weight: 600; }
.dash-vendas .vendas-graficos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}
.dash-vendas .chart-card { margin-bottom: 0; background: var(--white); }
.dash-vendas .chart-card .card-title { margin-bottom: var(--space-3); font-weight: 600; color: var(--text); }
.dash-vendas .chart-box { position: relative; height: 260px; }
`

// o mesmo <script src> do template, carregado uma vez
const CHART_JS = 'https://cdn.jsdelivr.net/npm/chart.js'
let chartJsPromise = null
function loadChartJs() {
  if (window.Chart) return Promise.resolve(window.Chart)
  if (!chartJsPromise) {
    chartJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = CHART_JS
      script.onload = () => resolve(window.Chart)
      script.onerror = (e) => { chartJsPromise = null; reject(e) }
      document.head.appendChild(script)
    })
  }
  return chartJsPromise
}

/** cores da marca (tokens.css) para os gráficos: o canvas não lê var(--...) */
function tokens() {
  const css = getComputedStyle(document.documentElement)
  const t = (name) => css.getPropertyValue(name).trim()
  return {
    brand900: t('--brand-900'), brand700: t('--brand-700'), brand600: t('--brand-600'),
    brand100: t('--brand-100'), gray400: t('--gray-400'), gray500: t('--gray-500'),
    gray200: t('--gray-200'), text: t('--text-soft'), font: t('--font'), white: t('--white'),
  }
}

/** opções visuais comuns (fundo branco, grade discreta, fonte do app) */
function chartOptions(c, { axes = true } = {}) {
  const scale = {
    grid: { color: c.gray200 },
    border: { color: c.gray200 },
    ticks: { color: c.gray500, font: { family: c.font, size: 12 } },
  }
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: c.text, font: { family: c.font, size: 12 }, boxWidth: 12 } },
      tooltip: { backgroundColor: c.brand900, titleFont: { family: c.font }, bodyFont: { family: c.font } },
    },
    ...(axes ? { scales: { x: { ...scale, grid: { display: false } }, y: { ...scale, beginAtZero: true } } } : {}),
  }
}

/** lista|map(attribute=...)|list, ou [] quando a lista não existe/está vazia */
function mapAttr(list, attr) {
  return truthy(list) ? list.map((item) => item?.[attr]) : []
}

export default function DashboardVendas() {
  // (o <link> de estilos.css e dashboard.css deu lugar ao CSS do visual novo)
  const ctx = useTemplateContext()
  const [params] = useSearchParams()
  const dados = ctx.dados ?? {}
  const periodo = dados.periodo ?? {}
  const resumo = dados.resumo_geral ?? {}
  const argPeriodo = params.get('periodo')
  // a opção marcada: {% if request.args.get('periodo') == ... %}selected
  const periodoSel = !argPeriodo ? '30' : (['7', '30', '90', '180', '365'].includes(argPeriodo) ? argPeriodo : undefined)

  const corretorRef = useRef(null)
  const evolucaoRef = useRef(null)

  useEffect(() => {
    const labelsTipoPlano = mapAttr(dados.tipo_produto, 'tipo_produto')
    const valoresTipoPlano = mapAttr(dados.tipo_produto, 'quantidade')
    const labelsCorretor = mapAttr(dados.por_corretor, 'corretor_resp')
    const valoresCorretor = mapAttr(dados.por_corretor, 'quantidade')
    // {% set evolucao_labels = dados.evolucao_temporal | map(attribute="strftime('%Y-%m', data_venda)") ... %}
    const labelsEvolucao = mapAttr(dados.evolucao_temporal, "strftime('%Y-%m', data_venda)")
    const valoresEvolucao = mapAttr(dados.evolucao_temporal, 'SUM(valor_venda)')

    let cancelled = false
    const charts = []
    loadChartJs().then((Chart) => {
      if (cancelled) return
      const c = tokens()
      // o template procurava #graficoTipoPlano, que não existe nesta tela
      const elTipoPlano = document.getElementById('graficoTipoPlano')
      if (elTipoPlano) {
        charts.push(new Chart(elTipoPlano.getContext('2d'), {
          type: 'pie',
          data: {
            labels: labelsTipoPlano,
            datasets: [{
              data: valoresTipoPlano,
              backgroundColor: [c.brand900, c.brand600, c.gray400],
              borderColor: c.white,
            }],
          },
          options: chartOptions(c, { axes: false }),
        }))
      }

      const elCorretor = corretorRef.current
      if (elCorretor) {
        charts.push(new Chart(elCorretor.getContext('2d'), {
          type: 'bar',
          data: {
            labels: labelsCorretor,
            datasets: [{
              label: 'Vendas',
              data: valoresCorretor,
              backgroundColor: c.brand700,
              hoverBackgroundColor: c.brand900,
              borderRadius: 4,
              maxBarThickness: 40,
            }],
          },
          options: chartOptions(c),
        }))
      }

      const elEvolucao = evolucaoRef.current
      if (elEvolucao) {
        charts.push(new Chart(elEvolucao.getContext('2d'), {
          type: 'line',
          data: {
            labels: labelsEvolucao,
            datasets: [{
              label: 'Evolução de vendas',
              data: valoresEvolucao,
              borderColor: c.brand900,
              backgroundColor: c.brand900,
              pointBackgroundColor: c.white,
              pointBorderColor: c.brand900,
              tension: 0.3,
              fill: false,
            }],
          },
          options: chartOptions(c),
        }))
      }
    }).catch((e) => console.error(e))
    return () => {
      cancelled = true
      charts.forEach((c) => c.destroy())
    }
  }, [dados])

  return (
    <Base1Layout title="Dashboard Gerencial">
      <InlineStyle css={dashboardCss + css} />
      {/* o <header> do original nunca era fechado: envolvia todo o conteúdo */}
      <div className="dash dash-vendas">
        <div className="quick-actions">
          <h3>Ações Rápidas</h3>
          <div className="quick-actions-grid">
            <AppLink href={urlFor('vendas.render_tipo_venda')} className="quick-action-card">
              <span className="quick-action-icon"><i className="fa-solid fa-plus" aria-hidden="true" /></span>
              <p>Nova Venda</p>
            </AppLink>
            <AppLink href={urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' })} className="quick-action-card">
              <span className="quick-action-icon"><i className="fa-solid fa-chart-column" aria-hidden="true" /></span>
              <p>Relatorio de vendas</p>
            </AppLink>

            <AppLink href={urlFor('auth.redir_atent')} className="quick-action-card">
              <span className="quick-action-icon"><i className="fa-solid fa-file-contract" aria-hidden="true" /></span>
              <p>Acompanhar contratos</p>
            </AppLink>
          </div>
        </div>

        <div className="welcome-card">
          <h2><i className="fa-regular fa-hand" aria-hidden="true" /> Olá <span>{show(ctx.nome_user)}</span></h2>
          <p>Essa é a métrica do Comercial no período: <strong>{formatDateBr(periodo.inicio)}</strong> até <strong>{formatDateBr(periodo.fim)}</strong></p>
        </div>
        <div className="dashboard-container">

          <div className="filter-section">
            <ApiForm method="GET" action={urlFor('gerencial.dashboard')}>
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

          <div className="card-container vendas-indicadores">
            {/* Termômetro de vidas */}
            <div className="card stat-card thermometer-card">
              <div className="stat-label vendas-card-title">Termômetro de Vidas</div>
              <div className="thermometer-body">
                <svg width="36" height="72" viewBox="0 0 60 120" aria-hidden="true">
                  <defs>
                    <linearGradient id="thermoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" className="thermo-stop-top" />
                      <stop offset="100%" className="thermo-stop-bottom" />
                    </linearGradient>
                  </defs>
                  <rect className="thermo-track" x="25" y="12" width="10" height="78" rx="5" />
                  <rect x="25" y="20" width="10" height="70" rx="5" fill="url(#thermoGrad)" />
                  <circle className="thermo-bulb" cx="30" cy="100" r="16" />
                </svg>
                <div>
                  <div className="stat-value">
                    {resumo.total_vendas !== undefined ? show(resumo.total_vendas) : '0'}
                  </div>
                  <div className="stat-label">Vidas vendidas no período</div>
                </div>
              </div>
            </div>
            {/* Card de Valor Total */}
            <div className="card stat-card">
              <div className="stat-value">
                R$ {formatCurrencyBr(resumo.valor_total)}
              </div>
              <div className="stat-label">
                Valor Total
              </div>
              <div className="stat-label">
                Ticket Médio: <strong>R$ {formatCurrencyBr(resumo.ticket_medio_geral)}</strong>
              </div>
            </div>
          </div>

          <div className="vendas-graficos">
            <div className="card chart-card">
              <div className="card-title">Vendas por corretor</div>
              <div className="chart-box">
                <canvas id="graficoCorretor" ref={corretorRef} width="250" height="200"></canvas>
              </div>
            </div>
            <div className="card chart-card">
              <div className="card-title">Evolução de vendas</div>
              <div className="chart-box">
                <canvas id="graficoEvolucao" ref={evolucaoRef} width="250" height="200"></canvas>
              </div>
            </div>
          </div>

          <div className="sales-table">
            <h3>Últimas vendas e contratos</h3>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Proposta</th>
                    <th>Data</th>
                    <th>Corretor</th>
                    <th>Produto</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {(dados.vendas_detalhadas ?? []).map((venda, i) => (
                    <tr key={i}>
                      <td>{show(venda.numero_proposta)}</td>
                      <td>{show(venda.data_venda)}</td>
                      <td>{show(venda.corretor_resp)}</td>
                      <td>{show(venda.tipo_produto)}</td>
                      <td>R$ {showFloat(venda.valor_venda)}</td>
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
