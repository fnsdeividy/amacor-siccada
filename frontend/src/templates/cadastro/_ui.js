import { createElement } from 'react'

// Escondido na tela, mas presente no HTML (e lido por leitores de tela).
const OCULTO = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

/**
 * Símbolo de texto do sistema antigo (<<, ←, →, ✕, +) que no visual novo
 * virou ícone: o texto continua no HTML, só não aparece.
 */
export function Oculto({ children }) {
  return createElement('span', { style: OCULTO }, children)
}
