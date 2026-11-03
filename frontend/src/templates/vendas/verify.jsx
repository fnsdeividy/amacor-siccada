// vendas/verify.html (a rota também renderiza 'vendas/verify.hTml')
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function Verify() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Vendas">
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <AppLink className="close-btn" href={urlFor('auth.fechar')}>X</AppLink>
          </div>
          <h1>Consulta de CPF</h1>
          {/* <form method="POST"> sem action: envia para a própria rota (vendas.cpf) */}
          <ApiForm action={urlFor('vendas.cpf')} method="POST" className="cpf-form">
            <label htmlFor="cpf">Digite o CPF:</label>
            <input type="text" id="cpf" name="cpf" required placeholder="00000000000" />
            <label htmlFor="tipo">buscando por:</label>
            <select className="selceionador" id="tipo" name="tipo" required defaultValue="beneficiario">
              <option value="beneficiario">Beneficiarios</option>
              <option value="responsavel">Responsável</option>
            </select>

            <button className="btn" type="submit">Buscar</button>
          </ApiForm>

          {truthy(ctx.error) && (
            <div className="error">{show(ctx.error)}</div>
          )}
        </div>
      </div>
    </Base1Layout>
  )
}
