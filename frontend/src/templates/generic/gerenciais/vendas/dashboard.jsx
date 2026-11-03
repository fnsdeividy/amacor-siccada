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
import { useStylesheet } from '../../../../lib/useStylesheet.jsx'

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

/** lista|map(attribute=...)|list, ou [] quando a lista não existe/está vazia */
function mapAttr(list, attr) {
  return truthy(list) ? list.map((item) => item?.[attr]) : []
}

export default function DashboardVendas() {
  // <link> de estilos.css e dashboard.css dentro do bloco
  useStylesheet('/static/css/estilos.css')
  useStylesheet('/static/css/dashboard.css')
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
      // o template procurava #graficoTipoPlano, que não existe nesta tela
      const elTipoPlano = document.getElementById('graficoTipoPlano')
      if (elTipoPlano) {
        charts.push(new Chart(elTipoPlano.getContext('2d'), {
          type: 'pie',
          data: {
            labels: labelsTipoPlano,
            datasets: [{
              data: valoresTipoPlano,
              backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56'],
            }],
          },
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
              backgroundColor: '#36a2eb',
            }],
          },
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
              borderColor: '#ff6384',
              fill: false,
            }],
          },
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
      {/* o <header> do original nunca era fechado: envolve todo o conteúdo */}
      <header>
        <div className="quick-actions">
          <h3>Ações Rápidas</h3>
          <div className="quick-actions-grid">
            <AppLink href={urlFor('vendas.render_tipo_venda')} className="quick-action-card">
              <span>➕</span>
              <p>Nova Venda</p>
            </AppLink>
            <AppLink href={urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' })} className="quick-action-card">
              <span>📊</span>
              <p>Relatorio de vendas</p>
            </AppLink>

            <AppLink href={urlFor('auth.redir_atent')} className="quick-action-card">
              <span>🧾</span>
              <p>Acompanhar contratos</p>
            </AppLink>
          </div>
        </div>

        <div className="welcome-card">
          <h2>👋 Olá <span>{show(ctx.nome_user)}</span></h2>
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

              <button type="submit">Filtrar</button>
            </ApiForm>
          </div>
          <div className="card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', marginBottom: '40px' }}>
            {/* Card de Valor Total */}

            <div className="card thermometer-card" style={{ minWidth: '260px', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '1.3rem', color: '#36a2eb', fontWeight: 600, marginBottom: '8px' }}>Termômetro de Vidas</div>
              <svg width="60" height="120" viewBox="0 0 60 120" style={{ marginBottom: '8px' }}>
                <defs>
                  <linearGradient id="thermoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#36a2eb" />
                    <stop offset="100%" stopColor="#ff6384" />
                  </linearGradient>
                </defs>
                <rect x="25" y="20" width="10" height="70" rx="5" fill="url(#thermoGrad)" />
                <circle cx="30" cy="100" r="18" fill="#ff6384" stroke="#36a2eb" strokeWidth="3" />
              </svg>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#fff' }}>
                {resumo.total_vendas !== undefined ? show(resumo.total_vendas) : '0'}
              </div>
              <div style={{ fontSize: '1rem', color: '#ddd' }}>Vidas vendidas no período</div>
            </div>
            {/* Card de Valor Total */}
            <div className="card stat-card">
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '140px' }}>
                <div className="stat-value" style={{ fontSize: '2.3rem', fontWeight: 700, color: '#43e97b', marginBottom: '8px', textShadow: '0 2px 12px rgba(67,233,123,0.18)' }}>
                  R$ {formatCurrencyBr(resumo.valor_total)}
                </div>
                <div className="stat-label" style={{ fontSize: '1.1rem', color: '#36a2eb', fontWeight: 500, marginBottom: '4px', letterSpacing: '0.5px' }}>
                  Valor Total
                </div>
                <div className="stat-label" style={{ fontSize: '1rem', color: '#ececec', fontWeight: 500, marginBottom: '2px' }}>
                  Ticket Médio: <span style={{ color: '#fff', fontWeight: 600 }}>R$ {formatCurrencyBr(resumo.ticket_medio_geral)}</span>
                </div>
              </div>
            </div>
            <div className="card">
              <canvas id="graficoCorretor" ref={corretorRef} width="250" height="200"></canvas>
              <div className="card-title">Vendas por corretor</div>
            </div>
            <div className="card">
              <canvas id="graficoEvolucao" ref={evolucaoRef} width="250" height="200"></canvas>
              <div className="card-title">Evolução de vendas</div>
            </div>
          </div>

          <div className="sales-table">
            <h3>Últimas vendas e contratos</h3>
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
      </header>
    </Base1Layout>
  )
}
