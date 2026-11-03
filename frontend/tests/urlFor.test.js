// urlFor (src/lib/urlFor.js) contra o url_for real do Flask, para todos os
// endpoints, com e sem parâmetros extras (urlfor-fixtures.json).
import { expect, it } from 'vitest'
import casos from './urlfor-fixtures.json'
import { urlFor } from '../src/lib/urlFor.js'

it.each(casos)('%s %j', (endpoint, params, esperado) => {
  expect(urlFor(endpoint, params)).toBe(esperado)
})
