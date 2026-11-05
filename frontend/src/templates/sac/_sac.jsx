// Apoio das telas do SAC (sac/*.html). Estas telas não existiam no sistema
// antigo: foram criadas direto no front, no padrão do DESIGN.md.
import { useState } from 'react'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { usePage } from '../../lib/page.jsx'

/** '2026-10-22' ou '2026-10-22 14:03:00' -> '22/10/2026' */
export function dataBr(valor) {
  if (!valor) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor))
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(valor)
}

/** '2026-10-22 14:03:00' -> '22/10/2026 14:03' */
export function dataHoraBr(valor) {
  if (!valor) return ''
  const hora = /[ T](\d{2}:\d{2})/.exec(String(valor))
  return dataBr(valor) + (hora ? ` ${hora[1]}` : '')
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto',
  'setembro', 'outubro', 'novembro', 'dezembro']

/** '2026-10' -> 'out/2026' (ou 'outubro de 2026' com longo) */
export function mesBr(valor, longo = false) {
  const m = /^(\d{4})-(\d{2})/.exec(valor || '')
  if (!m) return valor || ''
  const i = Number(m[2]) - 1
  return longo ? `${MESES_LONGOS[i]} de ${m[1]}` : `${MESES[i]}/${m[1]}`
}

/** 41201520261022000123 -> '412015 2026 10 22 000123' */
export function protocoloFmt(p) {
  const s = String(p ?? '')
  if (!/^\d{20}$/.test(s)) return s
  return `${s.slice(0, 6)} ${s.slice(6, 10)} ${s.slice(10, 12)} ${s.slice(12, 14)} ${s.slice(14)}`
}

export function pct(v) {
  return v === null || v === undefined ? '—' : `${String(v).replace('.', ',')}%`
}

const STATUS_CLASSE = {
  'Em andamento': 'status-yellow',
  Resolvida: 'status-green',
  'Parcialmente resolvida': 'status-yellow',
  'Não resolvida': 'status-red',
}

export function StatusSelo({ status }) {
  return <span className={`badge ${STATUS_CLASSE[status] || ''}`}>{status}</span>
}

/** Situação do prazo de resposta (dias úteis) de um atendimento calculado no back. */
export function PrazoSelo({ atendimento: a, completo = false }) {
  if (a.encerrada) {
    if (a.dentro_prazo === null || a.dentro_prazo === undefined) return null
    return a.dentro_prazo
      ? <span className="badge status-green">No prazo</span>
      : <span className="badge status-red">Fora do prazo</span>
  }
  const limite = dataBr(a.data_limite)
  if (a.situacao_prazo === 'atrasada') {
    return <span className="badge status-red"><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Atrasada{completo ? ` (venceu ${limite})` : ''}</span>
  }
  if (a.situacao_prazo === 'vence_hoje') return <span className="badge status-yellow">Vence hoje</span>
  return <span className="badge sac-badge-neutro">Até {limite}</span>
}

/** Mensagens do back (validação etc.) fixas na tela, além do aviso flutuante. */
export function Avisos() {
  const page = usePage()
  const flashes = page?.flashes ?? []
  if (!flashes.length) return null
  return (
    <div className="sac-avisos" role="status">
      {flashes.map((f, i) => (
        <div key={i} className="sac-aviso"><i className="fa-solid fa-circle-info" aria-hidden="true" /> {f.message}</div>
      ))}
    </div>
  )
}

export function CopiarProtocolo({ protocolo }) {
  const [copiado, setCopiado] = useState(false)
  async function copiar() {
    try {
      await navigator.clipboard.writeText(protocolo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }
  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={copiar}>
      <i className={`fa-solid ${copiado ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" /> {copiado ? 'Copiado' : 'Copiar'}
    </button>
  )
}

export function SacEstilos() {
  return <InlineStyle css={SAC_CSS} />
}

const SAC_CSS = `
.sac .sac-sub { color: var(--text-muted); font-size: var(--text-sm); margin: var(--space-1) 0 0; }
.sac .sac-filtros { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--space-3); align-items: end; margin-bottom: var(--space-4); }
.sac .sac-filtros .form-group { margin: 0; }
.sac .sac-filtros .sac-busca { grid-column: span 2; }
@media (max-width: 640px) { .sac .sac-filtros .sac-busca { grid-column: auto; } }
.sac .sac-filtros-acoes { display: flex; gap: var(--space-2); align-items: center; }
.sac .sac-protocolo { font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 600; }
.sac td .sac-sub { white-space: nowrap; }
.sac td.sac-desc { min-width: 160px; max-width: 280px; color: var(--text-soft); }
.sac td.sac-desc span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sac .sac-badge-neutro { color: var(--text-soft); background: var(--surface-muted); }
.sac .stat-card.sac-alerta .stat-value { color: var(--danger-700); }
.sac .sac-avisos { display: grid; gap: var(--space-2); margin-bottom: var(--space-4); }
.sac .sac-aviso { padding: var(--space-3) var(--space-4); border-radius: var(--radius); background: var(--info-50); color: var(--info-700); font-size: var(--text-sm); }
.sac .sac-aviso-alerta { background: var(--warning-50); color: var(--warning-700); }
.sac .sac-vazio { text-align: center; color: var(--text-muted); padding: var(--space-8) var(--space-4); }
.sac .sac-grid-2 { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: var(--space-4); align-items: start; }
@media (max-width: 960px) { .sac .sac-grid-2 { grid-template-columns: minmax(0, 1fr); } }
.sac .sac-protocolo-box { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); padding: var(--space-4); border: 1px solid var(--brand-100); background: var(--brand-50); border-radius: var(--radius-lg); margin-bottom: var(--space-4); }
.sac .sac-protocolo-box .sac-protocolo-rotulo { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: .04em; color: var(--text-muted); }
.sac .sac-protocolo-box .sac-protocolo-num { font-size: var(--text-xl); font-weight: 700; color: var(--brand-900); font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.sac .sac-protocolo-box .sac-selos { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-left: auto; }
.sac .sac-dados { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-3) var(--space-4); margin: 0; }
.sac .sac-dados dt { font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: .03em; }
.sac .sac-dados dd { margin: 2px 0 0; color: var(--text); overflow-wrap: anywhere; }
.sac .sac-texto { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; }
.sac h2.sac-secao { font-size: var(--text-md); margin: 0 0 var(--space-3); }
.sac .sac-historico { list-style: none; margin: 0; padding: 0; }
.sac .sac-historico li { position: relative; padding: 0 0 var(--space-4) var(--space-6); border-left: 2px solid var(--border); margin-left: var(--space-2); }
.sac .sac-historico li:last-child { border-left-color: transparent; padding-bottom: 0; }
.sac .sac-historico li::before { content: ''; position: absolute; left: -7px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--surface); border: 2px solid var(--brand-600); }
.sac .sac-historico .sac-hist-topo { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-1); }
.sac .sac-historico .sac-hist-topo strong { color: var(--text); font-weight: 600; }
.sac .sac-check { display: flex; gap: var(--space-2); align-items: flex-start; font-weight: 500; }
.sac .sac-check input { width: auto; margin-top: 3px; }
.sac .sac-dica { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1); }
.sac .sac-dica.sac-ok { color: var(--success-700); }
.sac .sac-dica.sac-erro { color: var(--danger-700); }
.sac .sac-acoes-form { display: flex; gap: var(--space-2); justify-content: flex-end; flex-wrap: wrap; margin-top: var(--space-4); }
.sac .sac-num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.sac tr.sac-destaque td { background: var(--warning-50); }
.sac .sac-mini-lista { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-2); font-size: var(--text-sm); }
.sac .sac-mini-lista li { display: flex; justify-content: space-between; gap: var(--space-2); flex-wrap: wrap; }
.sac .card + .card { margin-top: var(--space-4); }
.sac .sac-grid-2 > .card + .card { margin-top: 0; }
`
