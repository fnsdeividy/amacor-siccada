// vendas/tipo_venda.html
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLink from '../../components/AppLink.jsx'
import Loader from '../../components/Loader.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const CSS = `
.tipo-venda { max-width: 560px; margin: 0 auto; }
.tipo-venda .card { padding: var(--space-6); }
.tipo-venda .tipo-venda-pergunta { font-weight: 400; color: var(--text-soft); margin-bottom: var(--space-5); }
.tipo-venda .tipo-venda-opcoes { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-3); }
.tipo-venda .tipo-venda-opcoes .btn { min-height: 64px; }
.tipo-venda .tipo-venda-opcoes .btn i { color: var(--brand-700); }
`

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
      <InlineStyle css={CSS} />
      <div className="tipo-venda">
        <div className="card">
          <div className="close-btn-container">
            <AppLink href={urlFor('auth.fechar')} className="close-btn" title="Fechar" aria-label="Fechar">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </AppLink>
          </div>

          <h1>Nova venda</h1>
          <h3 className="tipo-venda-pergunta">Qual o tipo de contrato desta venda?</h3>
          <div className="tipo-venda-opcoes">
            <AppLink id="gerar-proposta-btn" className="btn btn-secondary btn-lg" href={pf} onClick={onClickPf}>
              <i className="fa-solid fa-user" aria-hidden="true" /> <strong>Pessoa Física</strong>
            </AppLink>
            <AppLink id="gerar-proposta-btn" className="btn btn-secondary btn-lg" href={pj}>
              <i className="fa-solid fa-building" aria-hidden="true" /> <strong>Pessoa Juridica</strong>
            </AppLink>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
