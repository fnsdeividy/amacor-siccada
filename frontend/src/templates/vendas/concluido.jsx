// vendas/concluido.html
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLink from '../../components/AppLink.jsx'
import Loader from '../../components/Loader.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const CSS = `
.concluido { max-width: 520px; margin: 0 auto; padding: var(--space-4) 0; text-align: center; }
.concluido .concluido-icone {
  display: inline-flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; margin-bottom: var(--space-4);
  font-size: var(--text-xl); color: var(--success-700); background: var(--success-50); border-radius: 999px;
}
.concluido .concluido-pergunta { font-weight: 400; color: var(--text-soft); margin-bottom: var(--space-6); }
`

export default function Concluido() {
  const ctx = useTemplateContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const href = urlFor('doc_gen.gerar_proposta', { proposta: ctx.proposta, tipo_contrato: ctx.tipo_contrato })

  // o script mostra o loader no clique e navega 150 ms depois
  function onClick(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => navigate(href), 150)
  }

  return (
    <WindowLayout title="Gerar Proposta">
      <InlineStyle css={CSS} />
      {loading && <Loader />}
      <div className="concluido">
        <div className="concluido-icone"><i className="fa-solid fa-file-circle-check" aria-hidden="true" /></div>
        <h1>Geração de documento</h1>
        <h3 className="concluido-pergunta">Deseja gerar documento de proposta a partir do Siccada?</h3>
        <AppLink id="gerar-proposta-btn" className="btn btn-lg" href={href} onClick={onClick}>
          <i className="fa-solid fa-file-pdf" aria-hidden="true" /> <strong>Gerar proposta</strong>
        </AppLink>
      </div>
    </WindowLayout>
  )
}
