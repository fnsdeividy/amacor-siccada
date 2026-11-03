// Comunicação com o back. Toda rota do sistema existe também sob /api e
// responde JSON (veja backend/app/api.py):
//   { type: 'page', template, context, flashes, session }
//   { type: 'redirect', location, flashes, session }
//   { type: 'html', html, flashes, session }
//   { type: 'error', status, flashes, session }
// Rotas que já devolviam JSON ou arquivos respondem como antes.

export const API_PREFIX = '/api'

/** URL do back para um caminho do sistema (ex.: links de download). */
export function apiUrl(path) {
  if (/^https?:\/\//.test(path)) return path
  return API_PREFIX + (path.startsWith('/') ? path : '/' + path)
}

/** Caminho do front a partir de um Location do back (absoluto ou relativo). */
export function toAppPath(location) {
  try {
    const url = new URL(location, window.location.origin)
    if (url.origin !== window.location.origin) return null // site externo
    let path = url.pathname
    if (path === API_PREFIX || path.startsWith(API_PREFIX + '/')) path = path.slice(API_PREFIX.length) || '/'
    return path + url.search + url.hash
  } catch {
    return location
  }
}

function filenameFrom(response) {
  const cd = response.headers.get('Content-Disposition') || ''
  const star = /filename\*=UTF-8''([^;]+)/i.exec(cd)
  if (star) return decodeURIComponent(star[1])
  const plain = /filename="?([^";]+)"?/i.exec(cd)
  return plain ? plain[1] : 'arquivo'
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Chama uma rota do sistema em modo API.
 * Devolve o envelope JSON, ou { type: 'json', data } para rotas que já
 * respondiam JSON, ou { type: 'file' } quando a resposta era um arquivo
 * (o download é iniciado aqui).
 */
export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const response = await fetch(apiUrl(path), {
    method,
    body,
    headers,
    credentials: 'same-origin',
    redirect: 'manual',
  })
  const type = response.headers.get('Content-Type') || ''
  if (type.includes('application/json')) {
    const data = await response.json()
    if (data && typeof data === 'object' && ['page', 'redirect', 'html', 'error'].includes(data.type) && 'flashes' in data) {
      return data
    }
    return { type: 'json', data, status: response.status }
  }
  const disposition = response.headers.get('Content-Disposition') || ''
  if (disposition || !type.startsWith('text/')) {
    saveBlob(await response.blob(), filenameFrom(response))
    return { type: 'file', status: response.status }
  }
  return { type: 'html', html: await response.text(), flashes: [], status: response.status }
}

/** fetch() para rotas JSON do back (equivalente aos fetch() dos templates). */
export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), { credentials: 'same-origin', ...options })
}
