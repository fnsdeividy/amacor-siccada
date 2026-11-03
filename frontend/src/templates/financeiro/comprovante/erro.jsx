// financeiro/comprovante/erro.html
import AppLink from '../../../components/AppLink.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'

export default function Erro() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Bem-vindo">
      <br /><br /><br />

      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <AppLink className="close-btn" href={urlFor('finan.tab')}>{'<'}</AppLink>
          </div>
          <h1>Nenhum comprovante registrato</h1>
          <h3>Sem registro de comprovante, deseja <AppLink href={urlFor('finan.render_form_post', { pagamento_id: ctx.pagamento_id })}><strong>adicionar?</strong></AppLink></h3>
        </div>
      </div>
    </Base1Layout>
  )
}
