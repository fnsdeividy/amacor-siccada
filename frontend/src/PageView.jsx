import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Loader from './components/Loader.jsx'
import { apiRequest, toAppPath } from './lib/api.js'
import { PageContext } from './lib/page.jsx'
import { componentFor } from './templates/registry.js'

/**
 * Carrega a URL atual do back (/api + caminho) e mostra o resultado:
 * o componente do template devolvido, um redirect, um HTML solto ou erro.
 * É o equivalente a o navegador abrir a página no sistema antigo.
 */
export default function PageView() {
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const path = location.pathname + location.search

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiRequest(path).then((res) => {
      if (cancelled) return
      if (res.type === 'redirect') {
        const target = toAppPath(res.location)
        if (target === null) window.location.href = res.location
        else navigate(target, { replace: true })
        return
      }
      if (res.type === 'file') {
        // URL de download aberta direto: volta para a página anterior
        navigate(-1)
        return
      }
      setResult(res)
      setLoading(false)
      window.scrollTo(0, 0)
    }).catch((err) => {
      if (cancelled) return
      setResult({ type: 'error', status: 0, message: String(err), flashes: [] })
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [path, navigate])

  // POST que devolve página: mostra no lugar, sem mudar a URL
  const show = useCallback((res) => setResult(res), [])

  const value = useMemo(() => result && ({
    template: result.template,
    context: result.context ?? {},
    session: result.session ?? {},
    flashes: result.flashes ?? [],
    show,
  }), [result, show])

  if (!result) return <Loader />

  return (
    <PageContext.Provider value={value}>
      {loading && <Loader overlay />}
      <PageBody result={result} />
    </PageContext.Provider>
  )
}

function PageBody({ result }) {
  if (result.type === 'page') {
    const Component = componentFor(result.template)
    if (!Component) {
      return <ErrorBox title="Tela ainda não portada" detail={`Template ${result.template}`} />
    }
    return (
      <Suspense fallback={<Loader />}>
        <Component />
      </Suspense>
    )
  }
  if (result.type === 'html') {
    return <div dangerouslySetInnerHTML={{ __html: result.html }} />
  }
  if (result.type === 'json') {
    return <pre>{JSON.stringify(result.data, null, 2)}</pre>
  }
  return <ErrorBox title={result.status === 404 ? 'Página não encontrada' : 'Erro no servidor'}
    detail={result.message || `Código ${result.status}`} />
}

function ErrorBox({ title, detail }) {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>{title}</h1>
      <p>{detail}</p>
    </div>
  )
}
