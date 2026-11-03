// Semântica do Jinja/Python que muda o resultado se for traduzida "no olho"
// para JavaScript. Use estes helpers ao portar os templates.

/**
 * {% if x %}: no Python, lista/dict/string vazios, 0 e None são falsos.
 * (Em JS, [] e {} são verdadeiros — por isso este helper.)
 */
export function truthy(value) {
  if (value === null || value === undefined || value === false) return false
  if (value === 0 || value === '' || Number.isNaN(value)) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

/**
 * {{ x }}: como o Jinja imprime um valor.
 *   None -> "None", True -> "True", 1.0 -> "1.0", listas/dicts no formato Python.
 * Atenção: valores ausentes (variável não passada) imprimem "" — use
 * show(ctx.x) só quando a chave existir no contexto; senão, "".
 */
export function show(value) {
  if (value === undefined) return ''
  return pyRepr(value, true)
}

function pyRepr(value, top = false) {
  if (value === null) return 'None'
  if (value === true) return 'True'
  if (value === false) return 'False'
  if (typeof value === 'number') return pyNumber(value)
  if (typeof value === 'string') return top ? value : `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (Array.isArray(value)) return '[' + value.map((v) => pyRepr(v)).join(', ') + ']'
  if (typeof value === 'object') {
    return '{' + Object.entries(value).map(([k, v]) => `${pyRepr(k)}: ${pyRepr(v)}`).join(', ') + '}'
  }
  return String(value)
}

/**
 * Número como o Python imprime. O JSON não distingue 3 de 3.0; o back manda
 * floats inteiros (ex.: 150.0) como 150. Quando o template imprime um campo
 * que no banco é REAL/float, use showFloat() para manter o ".0".
 */
function pyNumber(n) {
  if (Number.isInteger(n)) return String(n)
  if (Number.isNaN(n)) return 'nan'
  return String(n)
}

/** {{ x }} de um valor que no Python é float (coluna REAL): 150 -> "150.0". */
export function showFloat(value) {
  if (value === null || value === undefined) return show(value)
  const n = Number(value)
  if (Number.isNaN(n)) return show(value)
  return Number.isInteger(n) ? n.toFixed(1) : String(n)
}

/** x|length */
export function length(value) {
  if (value === null || value === undefined) return 0
  if (typeof value === 'string' || Array.isArray(value)) return value.length
  if (typeof value === 'object') return Object.keys(value).length
  return 0
}

/**
 * Valor de uma linha do banco por posição (row[0] no template).
 * As linhas chegam como objetos {coluna: valor} na ordem das colunas.
 */
export function col(row, index) {
  if (Array.isArray(row)) return row[index]
  return row ? Object.values(row)[index] : undefined
}

/** {% for k, v in d.items() %} */
export function items(obj) {
  return obj ? Object.entries(obj) : []
}

/** x|tojson (como o Jinja: escapa <, >, &, ' para uso em HTML/JS). */
export function tojson(value) {
  return JSON.stringify(value ?? null)
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026').replace(/'/g, '\\u0027')
}
