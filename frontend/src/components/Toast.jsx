import { useEffect, useState } from 'react'
import { usePage } from '../lib/page.jsx'

/**
 * Mensagem de flash do back, no canto superior direito por 5 segundos.
 * Como no sistema antigo, mostra só a primeira mensagem. A cor segue a
 * categoria quando o back informa ('error'/'danger' em vermelho).
 */
export default function Toast() {
  const page = usePage()
  const flash = page?.flashes?.[0]
  const [visible, setVisible] = useState(Boolean(flash))

  useEffect(() => {
    setVisible(Boolean(flash))
    if (!flash) return undefined
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [flash, page])

  const isError = ['error', 'danger'].includes(flash?.category)
  return (
    <div className={'toast' + (isError ? ' error' : '')} role="status"
      style={{ display: visible ? 'flex' : 'none' }}>
      <i className={'fa-solid ' + (isError ? 'fa-circle-exclamation' : 'fa-circle-check')} aria-hidden="true" />
      <div id="flash-message">{flash?.message}</div>
    </div>
  )
}
