import routes from './routes-manifest.json'

// Mapa endpoint -> regras de URL do Flask, gerado do back com:
//   python - <<< "from app import create_app; ..." (veja frontend/README.md)

// O Werkzeug não escapa estes caracteres em segmentos de caminho
const PATH_SAFE = { '%2F': '/', '%3A': ':', '%24': '$', '%26': '&', '%2B': '+', '%2C': ',', '%3B': ';', '%3D': '=', '%40': '@' }

function quotePath(value) {
  return encodeURIComponent(value).replace(/%(2F|3A|24|26|2B|2C|3B|3D|40)/gi, (m) => PATH_SAFE[m.toUpperCase()])
}

/**
 * Equivalente ao url_for() do Flask/Jinja: monta a URL de um endpoint.
 * Parâmetros que fazem parte da rota entram no caminho; os demais viram
 * query string, na ordem em que foram passados.
 *   urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' })
 *     -> '/cad/cnt-acompanhamento?lista=todos&filtro=sim'
 *   urlFor('static', { filename: 'css/estilos.css' }) -> '/static/css/estilos.css'
 */
export function urlFor(endpoint, params = {}) {
  if (endpoint === 'static') return '/static/' + params.filename
  const rules = routes[endpoint]
  if (!rules) throw new Error(`urlFor: endpoint desconhecido "${endpoint}"`)
  const given = Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== null)
  // como o Flask: a primeira regra cujos argumentos estão todos presentes
  const rule = rules.find((r) => r.args.every((a) => given.includes(a))) || rules[0]
  let path = rule.rule.replace(/<(?:[^:<>]+:)?([^<>]+)>/g, (_, name) => quotePath(String(params[name] ?? '')))
  const query = new URLSearchParams()
  for (const k of given) if (!rule.args.includes(k)) query.append(k, String(params[k]))
  const qs = query.toString()
  if (qs) path += '?' + qs
  return path
}
