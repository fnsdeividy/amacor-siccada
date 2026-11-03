// cadastro/manutencao_beneficiarios.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

export default function ManutencaoBeneficiarios() {
  useStylesheet('/static/css/tabpix.css')
  const { buscar, resultados } = useTemplateContext()
  return (
    <Base1Layout title="Manutenção de Beneficiários">
      <div className="container-tab-pix">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('auth.fechar')}>✖</AppLink>
        </div>

        <h1 className="table-title-tab-pix">Manutenção de Beneficiários</h1>

        <ApiForm key={show(buscar)} method="post" action={urlFor('cad.render_menu_manutencao_beneficiarios')} className="filter-tab-pix" style={{ gap: '12px', alignItems: 'center' }}>
          <input type="text" name="buscar" defaultValue={truthy(buscar) ? show(buscar) : ''} placeholder="Buscar por nome, CPF, contrato ou carteirinha" style={{ minWidth: '320px' }} />
          <button className="btn" type="submit">Buscar</button>
        </ApiForm>

        {resultados !== null && resultados !== undefined && (
          truthy(resultados) ? (
            <div className="table-container-tab-pix">
              <table className="table-tab-pix">
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
                  {resultados.map((row, i) => (
                    <tr key={i}>
                      <td>{show(row.sCodigoUSR)}</td>
                      <td>{show(row.sNumeroCNT)}</td>
                      <td>{show(row.sNomeUSR)}</td>
                      <td>{show(row.sCpfUSR)}</td>
                      <td>{show(row.sNomeResp)}</td>
                      <td>
                        {truthy(row.dExclusaoUSR) ? 'Cancelado' : row.suspenso === 1 ? 'Suspenso' : 'Ativo'}
                      </td>
                      <td>
                        <AppLink className="btn" href={urlFor('cad.detalhes_beneficiario', { codigo_usr: row.sCodigoUSR })}>Detalhes</AppLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>Nenhum beneficiário encontrado.</p>
          )
        )}
      </div>
    </Base1Layout>
  )
}
