// Os filtros Jinja do back (backend/app/__init__.py), com o mesmo resultado.

/** |format_currency_br: 1234.5 -> "1.234,50" (inválido -> "0,00"). */
export function formatCurrencyBr(value) {
  const n = Number(value ?? 0)
  if (value === '' || Number.isNaN(n)) return '0,00'
  const fixed = Math.abs(n).toFixed(2)
  const [int, dec] = fixed.split('.')
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return (n < 0 || Object.is(n, -0) ? '-' : '') + withSep + ',' + dec
}

/** |format_date_br: "2024-03-15" -> "15/03/2024" (inválido -> ""). */
export function formatDateBr(value) {
  if (!value) return ''
  const s = String(value)
  // strptime("%Y-%m-%d") aceita mês/dia com 1 dígito
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s)
  if (m) {
    // como o strptime: data inexistente (ex.: 30/02) é inválida
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
    if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return ''
    return `${m[3].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[1]}`
  }
  // datas vindas do back como ISO completo (datetime)
  const iso = /^(\d{4})-(\d{2})-(\d{2})T/.exec(s)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  return ''
}

/** |format_date_iso: "15/03/2024" ou "2024-03-15 10:00" -> "2024-03-15". */
export function formatDateIso(value) {
  if (!value) return ''
  const s = String(value).trim()
  if (s.includes('-') && s.split('-')[0].length === 4) return s.split(/[ T]/)[0]
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return ''
}

/** Equivalente ao |round(n) do Jinja. */
export function round(value, digits = 0) {
  const f = 10 ** digits
  return Math.round(Number(value) * f) / f
}

/** Como o Jinja imprime um valor: None vira "None", True vira "True". */
export function jinja(value) {
  if (value === null || value === undefined) return 'None'
  if (value === true) return 'True'
  if (value === false) return 'False'
  return String(value)
}
