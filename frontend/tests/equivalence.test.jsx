/**
 * Equivalência entre o sistema antigo (HTML do Flask) e o front React.
 *
 * Para cada snapshot capturado do back (HTML que o Flask gerou + JSON do
 * modo API para a mesma rota e usuário), renderiza o componente React do
 * template com os mesmos dados e compara:
 *   - o texto visível (palavras e símbolos, ignorando espaços);
 *   - os campos de formulário (name, tipo, valor, marcado).
 *
 * Os snapshots têm dados reais e ficam fora do git. Para gerar:
 *   .cmp/capture.py (veja frontend/README.md). Sem snapshots, o teste é pulado.
 *
 *   SNAPSHOT_DIR=../.cmp/snapshots npx vitest run tests/equivalence.test.jsx
 *   ONLY=cadastro/home npx vitest run ...   (só um template)
 */
import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PageContext } from '../src/lib/page.jsx'

const SNAPSHOT_DIR = process.env.SNAPSHOT_DIR || path.resolve(__dirname, '../../.cmp/snapshots')
const ONLY = process.env.ONLY
const modules = import.meta.glob('../src/templates/**/*.jsx', { eager: true })

function loadSnapshots() {
  if (!fs.existsSync(SNAPSHOT_DIR)) return []
  const out = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.json')) out.push(full)
    }
  }
  walk(SNAPSHOT_DIR)
  return out.map((file) => ({ file, ...JSON.parse(fs.readFileSync(file, 'utf8')) }))
    .filter((s) => !ONLY || s.api.template.trim().replace(/\.html$/i, '') === ONLY)
}

function parse(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, style, noscript, template').forEach((el) => el.remove())
  return doc
}

const TOKEN = /[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu

export function textTokens(doc) {
  // texto de cada nó separado: no JSX não há as quebras de linha do HTML
  // entre elementos, então o textContent colaria palavras vizinhas
  if (!doc.body) return []
  const walker = doc.createTreeWalker(doc.body, 4 /* NodeFilter.SHOW_TEXT */)
  const parts = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) parts.push(node.nodeValue)
  return parts.join(' ').match(TOKEN) ?? []
}

export function formFields(doc) {
  return [...doc.querySelectorAll('input, select, textarea')].map((el) => {
    const type = (el.getAttribute('type') || el.tagName).toLowerCase()
    let value
    if (el.tagName === 'SELECT') {
      const selected = el.querySelector('option[selected]') || el.querySelector('option')
      value = selected ? (selected.getAttribute('value') ?? selected.textContent.trim()) : ''
    } else if (el.tagName === 'TEXTAREA') value = el.textContent
    else value = el.getAttribute('value') ?? ''
    const checked = ['checkbox', 'radio'].includes(type) ? (el.hasAttribute('checked') ? ' [x]' : ' [ ]') : ''
    return `${el.getAttribute('name') ?? ''}|${type}|${value}${checked}`
  })
}

function diff(expected, actual) {
  const count = new Map()
  for (const t of actual) count.set(t, (count.get(t) || 0) + 1)
  const missing = []
  for (const t of expected) {
    const n = count.get(t) || 0
    if (n > 0) count.set(t, n - 1)
    else missing.push(t)
  }
  const extra = [...count.entries()].flatMap(([t, n]) => Array(n).fill(t))
  return { missing, extra }
}

export function renderTemplate(snapshot) {
  const name = snapshot.api.template.trim().replace(/\.html$/i, '')
  const mod = modules[`../src/templates/${name}.jsx`]
  if (!mod) return null
  const Component = mod.default
  const value = {
    template: snapshot.api.template,
    context: snapshot.api.context ?? {},
    session: snapshot.api.session ?? {},
    flashes: snapshot.api.flashes ?? [],
    show: () => {},
  }
  const [pathname, search = ''] = snapshot.route.split('?')
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[pathname + (search ? '?' + search : '')]}>
      <PageContext.Provider value={value}>
        <Component />
      </PageContext.Provider>
    </MemoryRouter>,
  )
}

const snapshots = loadSnapshots()
const report = []

describe.skipIf(snapshots.length === 0)('equivalência com o HTML do Flask', () => {
  for (const snap of snapshots) {
    const label = `${snap.api.template.trim()}  ${snap.route}  (usuário ${snap.user})`
    it(label, () => {
      const html = renderTemplate(snap)
      expect(html, `componente src/templates/${snap.api.template.trim().replace(/\.html$/, '.jsx')} não existe`).not.toBeNull()
      const flask = parse(snap.html)
      const react = parse(html)
      // o alerta de flash: no Flask o texto é posto por script depois de
      // carregar (por isso não está no HTML); no React já vem renderizado.
      // Compara à parte: deve mostrar a primeira mensagem, como o script.
      const reactFlash = react.querySelector('#flash-message')
      if (reactFlash && flask.querySelector('#flash-message')) {
        const first = snap.api.flashes?.[0]?.message ?? ''
        expect(reactFlash.textContent, 'texto do alerta de flash').toBe(first)
        reactFlash.textContent = ''
      }
      const text = diff(textTokens(flask), textTokens(react))
      const fields = diff(formFields(flask), formFields(react))
      report.push({ template: snap.api.template.trim(), route: snap.route, user: snap.user,
        text, fields })
      const msg = [
        text.missing.length && `texto faltando: ${text.missing.slice(0, 40).join(' ')}`,
        text.extra.length && `texto sobrando: ${text.extra.slice(0, 40).join(' ')}`,
        fields.missing.length && `campos faltando: ${fields.missing.slice(0, 10).join(' ; ')}`,
        fields.extra.length && `campos sobrando: ${fields.extra.slice(0, 10).join(' ; ')}`,
      ].filter(Boolean).join('\n')
      expect(text.missing.length + text.extra.length + fields.missing.length + fields.extra.length, msg).toBe(0)
    })
  }
})
