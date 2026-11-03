import { forwardRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSubmit } from '../lib/page.jsx'

/**
 * Substitui o <form action="{{ url_for(...) }}" method="POST"> dos templates.
 * Envia os campos para a mesma rota do back (em modo API) e aplica a resposta.
 *
 *  - method GET: navega para action?campos (como o navegador faria);
 *  - method POST: envia FormData (inclusive arquivos) e segue o resultado.
 *
 * onSubmit continua funcionando: se chamar event.preventDefault(), o envio
 * não acontece (igual aos scripts dos templates que validavam antes).
 */
const ApiForm = forwardRef(function ApiForm({ action, method = 'GET', onSubmit, onResult, children, ...props }, ref) {
  const submit = useSubmit()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(event) {
    if (onSubmit) onSubmit(event)
    if (event.defaultPrevented) return
    event.preventDefault()
    const form = event.currentTarget
    const target = action || location.pathname + location.search
    const data = new FormData(form)
    // o botão clicado também é enviado, como num submit normal
    const submitter = event.nativeEvent?.submitter
    if (submitter && submitter.name) data.append(submitter.name, submitter.value)

    if (method.toUpperCase() === 'GET') {
      const params = new URLSearchParams()
      for (const [k, v] of data.entries()) if (typeof v === 'string') params.append(k, v)
      const base = target.split('?')[0]
      const qs = params.toString()
      navigate(qs ? `${base}?${qs}` : base)
      return
    }
    const result = await submit(target, { method: 'POST', body: data })
    if (onResult) onResult(result)
  }

  return (
    <form ref={ref} action={action} method={method} onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  )
})

export default ApiForm
