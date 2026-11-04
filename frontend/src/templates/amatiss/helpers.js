// Helpers do grupo amatiss (não são templates).
import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useSubmit } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

/** location.reload(): busca de novo a página atual no back e mostra. */
export function useReload() {
  const submit = useSubmit()
  const location = useLocation()
  return useCallback(() => submit(location.pathname + location.search), [submit, location])
}

/**
 * url_for('amatiss.servir_documento', filename=...): o conversor <path:>
 * do Flask mantém as barras do caminho (o urlFor genérico as codificaria).
 */
export function documentoUrl(filename) {
  return urlFor('amatiss.servir_documento', { filename: '' }) + encodeURI(String(filename ?? ''))
}

/** Python: str(x).lower() como o filtro |lower do Jinja. */
export function lower(value) {
  if (value === null || value === undefined) return 'none'
  return String(value).toLowerCase()
}

/**
 * Cor do badge de status usada nos scripts das telas de autorização
 * (cores de estado de tokens.css).
 */
export function statusColors(status) {
  let statusColor = 'var(--warning-50)'
  let statusTextColor = 'var(--warning-700)'
  if (status === 'aprovado') {
    statusColor = 'var(--success-50)'
    statusTextColor = 'var(--success-700)'
  } else if (status === 'rejeitado') {
    statusColor = 'var(--danger-50)'
    statusTextColor = 'var(--danger-700)'
  } else if (status === 'em analise' || status === 'em análise') {
    statusColor = 'var(--info-50)'
    statusTextColor = 'var(--info-700)'
  } else if (status === 'cancelado') {
    statusColor = 'var(--gray-100)'
    statusTextColor = 'var(--gray-700)'
  }
  return { statusColor, statusTextColor }
}
