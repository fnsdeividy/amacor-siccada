// vendas/tipo_venda.html
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLink from '../../components/AppLink.jsx'
import Loader from '../../components/Loader.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function TipoVenda() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  // proposta e tipo_contrato não existem no contexto: o url_for do Flask gera
  // "?proposta=&tipo_contrato=" (variáveis indefinidas viram texto vazio)
  const pf = urlFor('vendas.nova_venda', { proposta: '', tipo_contrato: '' })
  const pj = urlFor('vendas.nova_venda_pj', { proposta: '', tipo_contrato: '' })

  // o script usa getElementById('gerar-proposta-btn'): só o primeiro link
  // (Pessoa Física) mostra o loader e navega 150 ms depois
  function onClickPf(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => navigate(pf), 150)
  }

  return (
    <Base1Layout title="Iniciar nova venda">
      {loading && <Loader />}
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <AppLink href={urlFor('auth.fechar')} className="close-btn">✖</AppLink>
          </div>

          <h1>Nova venda</h1>
          <h3>Qual o tipo de contrato desta venda?</h3>
          <br />
          <AppLink id="gerar-proposta-btn" className="btn" href={pf} onClick={onClickPf}>
            <strong>Pessoa Física</strong>
          </AppLink>
          <AppLink id="gerar-proposta-btn" className="btn" href={pj}>
            <strong>Pessoa Juridica</strong>
          </AppLink>
        </div>
      </div>
    </Base1Layout>
  )
}
