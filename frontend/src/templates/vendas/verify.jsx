// vendas/verify.html (a rota também renderiza 'vendas/verify.hTml')
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const CSS = `
.verify-cpf { max-width: 640px; margin: 0 auto; }
.verify-cpf .card { padding: var(--space-6); }
.verify-cpf .page-toolbar h1 { display: flex; align-items: center; gap: var(--space-2); }
.verify-cpf .page-toolbar h1 i { color: var(--brand-700); }
.verify-cpf .acoes { display: flex; justify-content: flex-end; margin-top: var(--space-2); }
.verify-cpf .error {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-4); margin-top: var(--space-4);
  color: var(--danger-700); background: var(--danger-50);
  border: 1px solid var(--border); border-radius: var(--radius);
}
`

export default function Verify() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Vendas">
      <InlineStyle css={CSS} />
      <div className="verify-cpf">
        <div className="card">
          <div className="close-btn-container">
            <AppLink className="close-btn" href={urlFor('auth.fechar')} title="Fechar" aria-label="Fechar">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </AppLink>
          </div>
          <div className="page-toolbar">
            <h1><i className="fa-solid fa-id-card" aria-hidden="true" /> Consulta de CPF</h1>
          </div>
          {/* <form method="POST"> sem action: envia para a própria rota (vendas.cpf) */}
          <ApiForm action={urlFor('vendas.cpf')} method="POST" className="cpf-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cpf">Digite o CPF:</label>
                <input type="text" id="cpf" name="cpf" required placeholder="00000000000" />
              </div>
              <div className="form-group">
                <label htmlFor="tipo">buscando por:</label>
                <select className="selceionador" id="tipo" name="tipo" required defaultValue="beneficiario">
                  <option value="beneficiario">Beneficiarios</option>
                  <option value="responsavel">Responsável</option>
                </select>
              </div>
            </div>

            <div className="acoes">
              <button className="btn" type="submit">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar
              </button>
            </div>
          </ApiForm>

          {truthy(ctx.error) && (
            <div className="error">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
              <span>{show(ctx.error)}</span>
            </div>
          )}
        </div>
      </div>
    </Base1Layout>
  )
}
