// vendas/concluido.html
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLink from '../../components/AppLink.jsx'
import Loader from '../../components/Loader.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

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
      {loading && <Loader />}
      <h1>Geração de documento</h1>
      <h3>Deseja gerar documento de proposta a partir do Siccada?</h3>
      <br />
      <AppLink id="gerar-proposta-btn" className="btn" href={href} onClick={onClick}>
        <strong>Gerar proposta</strong>
      </AppLink>
    </WindowLayout>
  )
}
