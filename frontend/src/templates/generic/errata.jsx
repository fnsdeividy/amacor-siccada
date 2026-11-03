// generic/errata.html
import { useNavigate } from 'react-router-dom'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useBodyClass } from '../../lib/useBodyClass.js'

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
      <br /><br />
      <h1>Não autorizado</h1>
      <h3>Você não possui autorização para acessar essa página, por favor <a href="javascript:void(0);" onClick={(e) => { e.preventDefault(); goBack() }}><strong>retorne.</strong></a></h3>
    </Base1Layout>
  )
}
