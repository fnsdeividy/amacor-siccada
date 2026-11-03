import { useEffect } from 'react'

/**
 * <title> das telas de enfermagem que não usam layout (o template era um
 * documento HTML completo). Restaura o título anterior ao sair da tela.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => { document.title = previous }
  }, [title])
}

/** Atributo de um objeto como o Jinja imprime ({{ obj.x }} com obj None -> ""). */
export function campo(obj, key) {
  if (obj === null || obj === undefined) return undefined
  return obj[key]
}
