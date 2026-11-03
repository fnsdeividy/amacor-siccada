// financeiro/return.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useBodyClass } from '../../lib/useBodyClass.js'
import { urlFor } from '../../lib/urlFor.js'

export default function Return() {
  // o <body class="body"> dentro do bloco passava a classe para o <body> da página
  useBodyClass('body')
  return (
    <Base1Layout title="Bem-vindo">
      <br /><br /><br />
      <h1>Pagamento registrado</h1>
      <h3>Pagamento registrado no banco de dados, <AppLink href={urlFor('generic.home')}><strong>retorne a pagina inicial.</strong></AppLink></h3>
    </Base1Layout>
  )
}
