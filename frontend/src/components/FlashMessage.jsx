import { useEffect, useState } from 'react'
import { usePage } from '../lib/page.jsx'

/**
 * O alerta dos layouts: mostra a primeira mensagem de flash por 5 segundos.
 * Os templates usavam get_flashed_messages() sem categoria, então a cor é
 * sempre a padrão (verde), como antes.
 */
export default function FlashMessage({ zIndex = 1400 }) {
  const page = usePage()
  const first = page?.flashes?.[0]?.message
  const [visible, setVisible] = useState(Boolean(first))

  useEffect(() => {
    setVisible(Boolean(first))
    if (!first) return undefined
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [first, page])

  return (
    <div id="flash-message" className="alert" style={{ display: visible ? 'block' : 'none', zIndex }}>
      {first}
    </div>
  )
}

/** Estilos .alert que os layouts tinham inline. */
export const alertCss = `
.alert {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  padding: 15px; background-color: #4caf50; color: white; border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1400; display: none;
  font-size: 16px; text-align: center; width: 80%; max-width: 400px; transition: 0.5s;
}
.alert.error { background-color: #f44336; }
.alert.warning { background-color: #ff9800; }
.alert.info { background-color: #2196f3; }
`
