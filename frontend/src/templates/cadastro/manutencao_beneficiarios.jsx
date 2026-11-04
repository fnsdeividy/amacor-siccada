// cadastro/manutencao_beneficiarios.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.cad-manut .search-bar-wrapper input { flex: 1 1 320px; max-width: 480px; }
.cad-manut .cad-vazio { text-align: center; margin: var(--space-5) 0; color: var(--text-muted); }
`

function statusBeneficiario(row) {
  if (truthy(row.dExclusaoUSR)) return ['status-red', 'Cancelado']
  if (row.suspenso === 1) return ['status-yellow', 'Suspenso']
  return ['status-green', 'Ativo']
}

export default function ManutencaoBeneficiarios() {
  const { buscar, resultados } = useTemplateContext()
  return (
    <Base1Layout title="Manutenção de Beneficiários">
      <InlineStyle css={css} />
      <div className="card cad-manut">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('auth.fechar')} title="Fechar" aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </AppLink>
        </div>

        <div className="page-toolbar">
          <h1 className="table-title-tab-pix">Manutenção de Beneficiários</h1>
        </div>

        <ApiForm key={show(buscar)} method="post" action={urlFor('cad.render_menu_manutencao_beneficiarios')} className="search-bar-wrapper">
          <input type="text" name="buscar" defaultValue={truthy(buscar) ? show(buscar) : ''} placeholder="Buscar por nome, CPF, contrato ou carteirinha" />
          <button className="btn" type="submit"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar</button>
        </ApiForm>

        {resultados !== null && resultados !== undefined && (
          truthy(resultados) ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Carteirinha</th>
                    <th>Contrato</th>
                    <th>Beneficiário</th>
                    <th>CPF</th>
                    <th>Responsável</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((row, i) => {
                    const [classe, rotulo] = statusBeneficiario(row)
                    return (
                      <tr key={i}>
                        <td>{show(row.sCodigoUSR)}</td>
                        <td>{show(row.sNumeroCNT)}</td>
                        <td>{show(row.sNomeUSR)}</td>
                        <td>{show(row.sCpfUSR)}</td>
                        <td>{show(row.sNomeResp)}</td>
                        <td><span className={classe}>{rotulo}</span></td>
                        <td>
                          <AppLink className="btn btn-secondary btn-sm" href={urlFor('cad.detalhes_beneficiario', { codigo_usr: row.sCodigoUSR })}>Detalhes</AppLink>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="cad-vazio">Nenhum beneficiário encontrado.</p>
          )
        )}
      </div>
    </Base1Layout>
  )
}
