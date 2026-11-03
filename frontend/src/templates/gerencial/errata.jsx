// gerencial/errata.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useBodyClass } from '../../lib/useBodyClass.js'

export default function Errata() {
  // o <body class="body"> dentro do conteúdo: o navegador aplicava a classe ao body
  useBodyClass('body')
  return (
    <Base1Layout title="Banco desatualizado">
      <br /><br />
      <h1>Atualização pendente</h1>
      <h3>O banco de dados do Siccada não foi atualizado, solicite ao setor de cadastro que atualize o banco.</h3>
      <AppLink className="btn" href={urlFor('auth.fechar')}> voltar</AppLink>
    </Base1Layout>
  )
}
