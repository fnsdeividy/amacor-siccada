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
      <div className="card Bem-vindo">
        <h1>Bem-vindo, {show(ctx.usuario_nome)}!</h1>
        <p className="mb-0">Selecione uma das opções abaixo para navegar.</p>
      </div>
      <div className="quick-actions-grid container-cards">
        <AppLink className="quick-action-card" href={urlFor('vendas.home')}>
          <i className="fa-solid fa-handshake fa-lg text-primary" aria-hidden="true" />
          <strong>Vendas</strong>
        </AppLink>
        <AppLink className="quick-action-card" href={urlFor('cad.home')}>
          <i className="fa-solid fa-address-card fa-lg text-primary" aria-hidden="true" />
          <strong>Cadastro/Adm</strong>
        </AppLink>
        <AppLink className="quick-action-card" href={urlFor('finan.home')}>
          <i className="fa-solid fa-sack-dollar fa-lg text-primary" aria-hidden="true" />
          <strong>Cobrança/Financeiro</strong>
        </AppLink>
      </div>
    </Base1Layout>
  )
}
