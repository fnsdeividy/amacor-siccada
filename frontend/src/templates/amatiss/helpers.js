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

/** Cor do badge de status usada nos scripts das telas de autorização. */
export function statusColors(status) {
  let statusColor = '#fff9b0'
  let statusTextColor = '#b3a100'
  if (status === 'aprovado') {
    statusColor = '#c6f5e0'
    statusTextColor = '#259661'
  } else if (status === 'rejeitado') {
    statusColor = '#ffadad'
    statusTextColor = '#b71c1c'
  } else if (status === 'em analise' || status === 'em análise') {
    statusColor = '#cbe7ff'
    statusTextColor = '#2176ae'
  } else if (status === 'cancelado') {
    statusColor = '#9b7b66ef'
    statusTextColor = 'rgb(61, 50, 50)'
  }
  return { statusColor, statusTextColor }
}
