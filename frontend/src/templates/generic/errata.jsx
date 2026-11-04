// generic/errata.html
import { useNavigate } from 'react-router-dom'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { useBodyClass } from '../../lib/useBodyClass.js'

const css = `
.errata { max-width: 560px; margin: var(--space-8) auto; text-align: center; padding: var(--space-8) var(--space-6); }
.errata .errata-icon { font-size: 40px; color: var(--danger-600); margin-bottom: var(--space-4); }
.errata h3 { font-weight: 400; color: var(--text-soft); margin: 0; }
`

export default function Errata() {
  // <body class="body"> dentro do bloco: o navegador passava a classe ao <body>
  useBodyClass('body')
  const navigate = useNavigate()

  function goBack() {
    // document.referrer não muda numa SPA: usa o histórico do próprio app
    if (window.history.state && window.history.state.idx > 0) {
      // Voltar para a página anterior
      navigate(-1)
    } else {
      // Redirecionar para a home se não houver página anterior
      navigate('/')
    }
  }

  return (
    <Base1Layout title="Bem-vindo">
      <InlineStyle css={css} />
      <div className="card errata">
        <i className="fa-solid fa-lock errata-icon" aria-hidden="true" />
        <h1>Não autorizado</h1>
        <h3>Você não possui autorização para acessar essa página, por favor <a href="javascript:void(0);" onClick={(e) => { e.preventDefault(); goBack() }}><strong>retorne.</strong></a></h3>
      </div>
    </Base1Layout>
  )
}
