// generic/index.html (renderizado como 'index.html')
import AppLink from '../components/AppLink.jsx'
import Base1Layout from '../layouts/Base1Layout.jsx'
import { show } from '../lib/jinja.js'
import { useTemplateContext } from '../lib/page.jsx'
import { urlFor } from '../lib/urlFor.js'

export default function Index() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Bem-vindo">
      <div className="Bem-vindo">
        <h1>Bem-vindo, {show(ctx.usuario_nome)}!</h1>
        <p>Selecione uma das opções abaixo para navegar.</p>
      </div>
      <div className="container-cards">
        <AppLink className="btn" href={urlFor('vendas.home')}>Vendas</AppLink> <br />
        <AppLink className="btn" href={urlFor('cad.home')}>Cadastro/Adm</AppLink>
        <AppLink className="btn" href={urlFor('finan.home')}>Cobrança/Financeiro</AppLink>
      </div>
    </Base1Layout>
  )
}
