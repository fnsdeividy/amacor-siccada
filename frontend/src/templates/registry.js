import { lazy } from 'react'

// Cada template do back tem um componente React com o mesmo caminho:
//   'cadastro/home.html' -> src/templates/cadastro/home.jsx
//   'login.html'         -> src/templates/login.jsx
// O nome é o que o back informa em { type: 'page', template }.
const modules = import.meta.glob('./**/*.jsx')

const cache = new Map()

export function templateModulePath(templateName) {
  return './' + templateName.trim().replace(/\.html$/i, '.jsx')
}

export function hasTemplate(templateName) {
  return templateModulePath(templateName) in modules
}

/** Componente React (lazy) para um template do back, ou null. */
export function componentFor(templateName) {
  const path = templateModulePath(templateName)
  if (!(path in modules)) return null
  if (!cache.has(path)) cache.set(path, lazy(modules[path]))
  return cache.get(path)
}
