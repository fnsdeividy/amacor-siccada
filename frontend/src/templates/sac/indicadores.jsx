// sac/indicadores.html — aba "Indicadores" da planilha: índices do mês por canal, tipo e setor
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { SacEstilos, mesBr, pct } from './_sac.jsx'

const COLUNAS = [
  ['total', 'Demandas', (v) => v],
  ['pct_resolvidas', 'Resolvidas', pct],
  ['pct_primeiro_contato', '1º contato', pct],
  ['pct_recontato', 'Recontato', pct],
  ['pct_escalou', 'Escalou', pct],
  ['pct_no_prazo', 'No prazo', pct],
  ['em_andamento', 'Em andamento', (v) => v],
]

function Tabela({ titulo, linhas, rotulo, destacar = 0, nota }) {
  return (
    <div className="card">
      <h2 className="sac-secao">{titulo}</h2>
      {nota && <p className="sac-sub" style={{ marginTop: 'calc(-1 * var(--space-2))', marginBottom: 'var(--space-3)' }}>{nota}</p>}
      {linhas.length === 0 ? <p className="sac-sub">Sem demandas no mês.</p> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{rotulo}</th>
                {COLUNAS.map(([k, nome]) => <th key={k} className="sac-num">{nome}</th>)}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => (
                <tr key={l.nome} className={i < destacar && linhas.length > destacar ? 'sac-destaque' : undefined}>
                  <td>{l.nome}</td>
                  {COLUNAS.map(([k, , fmt]) => <td key={k} className="sac-num">{fmt(l[k])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function SacIndicadores() {
  const ctx = useTemplateContext()
  const ind = ctx.indicadores ?? {}
  const g = ind.geral ?? {}
  const evolucao = ctx.evolucao ?? []
  const ano = (ctx.mes || '').slice(0, 4)

  const cards = [
    ['Demandas no mês', g.total ?? 0],
    ['Resolvidas', pct(g.pct_resolvidas)],
    ['Resolvidas no 1º contato', pct(g.pct_primeiro_contato)],
    ['Recontato em até 30 dias', pct(g.pct_recontato)],
    ['Escalou (Ouvidoria/NIP)', pct(g.pct_escalou)],
    ['Respondidas no prazo', pct(g.pct_no_prazo)],
    ['Confirmadas pelo beneficiário', pct(g.pct_confirmadas)],
    ['Em andamento', g.em_andamento ?? 0],
  ]

  return (
    <Base1Layout title="SAC">
      <SacEstilos />
      <div className="sac">
        <div className="page-toolbar">
          <div>
            <h1>Indicadores de resolutividade</h1>
            <p className="sac-sub">Demandas abertas em {mesBr(ctx.mes, true)}</p>
          </div>
          <div className="page-toolbar-actions">
            <ApiForm key={ctx.mes} method="GET" action={urlFor('sac.indicadores')} className="sac-filtros-acoes">
              <input type="month" name="mes" defaultValue={ctx.mes} aria-label="Mês de referência" required />
              <button className="btn btn-secondary" type="submit">Ver mês</button>
            </ApiForm>
            <AppLink download className="btn" href={urlFor('sac.exportar', { mes: ctx.mes })}>
              <i className="fa-solid fa-file-arrow-down" aria-hidden="true" /> Exportar registro (CSV)
            </AppLink>
          </div>
        </div>

        <div className="card-container">
          {cards.map(([rotulo, valor]) => (
            <div className="stat-card" key={rotulo}>
              <div className="stat-label">{rotulo}</div>
              <div className="stat-value">{valor}</div>
            </div>
          ))}
        </div>

        <Tabela titulo="Por canal" rotulo="Canal" linhas={ind.por_canal ?? []} />
        <Tabela titulo="Por tipo de demanda" rotulo="Tipo de demanda" linhas={ind.por_tipo ?? []} destacar={3}
          nota="Ordenado pela pior resolutividade. Os 3 primeiros (destacados) entram na análise crítica do mês: causa, ação, responsável e prazo." />
        <Tabela titulo="Por setor responsável" rotulo="Setor" linhas={ind.por_setor ?? []} />

        <div className="card">
          <h2 className="sac-secao">Evolução em {ano}</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  {COLUNAS.map(([k, nome]) => <th key={k} className="sac-num">{nome}</th>)}
                </tr>
              </thead>
              <tbody>
                {evolucao.map((m) => (
                  <tr key={m.mes}>
                    <td>
                      <AppLink href={urlFor('sac.indicadores', { mes: m.mes })}>{mesBr(m.mes)}</AppLink>
                    </td>
                    {COLUNAS.map(([k, , fmt]) => <td key={k} className="sac-num">{m.total ? fmt(m[k]) : '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
