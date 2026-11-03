import { useEffect } from 'react'

/**
 * Carrega um CSS de /static (o mesmo arquivo que o template usava) enquanto
 * o componente estiver na tela.
 */
export function useStylesheet(href) {
  useEffect(() => {
    if (!href) return undefined
    let link = document.querySelector(`link[data-siccada="${href}"]`)
    if (!link) {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.dataset.siccada = href
      link.dataset.users = '0'
      document.head.appendChild(link)
    }
    link.dataset.users = String(Number(link.dataset.users) + 1)
    return () => {
      const users = Number(link.dataset.users) - 1
      link.dataset.users = String(users)
      if (users <= 0) link.remove()
    }
  }, [href])
}

/** <style> inline dos templates. */
export function InlineStyle({ css }) {
  return <style>{css}</style>
}
