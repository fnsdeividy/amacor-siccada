// Os filtros JS (src/lib/format.js) contra a saída real dos filtros Jinja do
// back. filters-fixtures.json foi gerado executando os filtros do Flask.
import { describe, expect, it } from 'vitest'
import fixtures from './filters-fixtures.json'
import { formatCurrencyBr, formatDateBr, formatDateIso } from '../src/lib/format.js'

// Casos em que não dá (ou não faz sentido) reproduzir o Python:
//  - format_date_br(None) quebra a página no Flask (AttributeError → erro 500);
//  - texto com "T" só chega do back quando era um datetime, que o Python
//    formata normalmente; um texto literal com "T" não aparece no banco.
const IGNORAR = new Set(['date_br:null', 'date_iso:2024-03-15T10:00:00'])

const casos = [
  ['currency', formatCurrencyBr],
  ['date_br', formatDateBr],
  ['date_iso', formatDateIso],
]

for (const [nome, fn] of casos) {
  describe(nome, () => {
    for (const [entrada, esperado] of fixtures[nome]) {
      const chave = `${nome}:${entrada}`
      it.skipIf(IGNORAR.has(chave))(`${JSON.stringify(entrada)} -> ${JSON.stringify(esperado)}`, () => {
        expect(fn(entrada)).toBe(esperado)
      })
    }
  })
}
