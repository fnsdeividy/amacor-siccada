// financeiro/relatorio_boletos_cancelados.html
// O <script> do template procurava #export_csv, que não existe nesta tela
// (dava erro e não fazia nada); por isso não foi portado.
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { col, show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function RelatorioBoletosCancelados() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Tabela de dados">
      <div className="container-tab-pix">
        {/* Botão de fechar */}
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('auth.login_redir')} title="Fechar" aria-label="Fechar"><i className="fa-solid fa-xmark" aria-hidden="true" /></AppLink>
        </div>

        {/* Título da tabela */}
        <div className="page-toolbar">
          <h1 className="table-title-tab-pix">Boletos para cancelamento</h1>
        </div>

        {/* Tabela de pagamentos */}
        <div className="table-container-tab-pix">
          <table className="table-tab-pix">
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Responsável</th>
                <th>Matricula</th>
                <th>Data de Exclusão</th>
                <th>Motivo de Exclusão</th>
                <th>Pagamento</th>

              </tr>
            </thead>
            <tbody>
              {(ctx.dados ?? []).map((dado, i) => (
                <tr key={i}>
                  <td>{show(col(dado, 0))}</td>
                  <td>{show(col(dado, 2))}</td>
                  <td>{show(col(dado, 1))}</td>
                  <td>{show(col(dado, 7))}</td>
                  <td>{show(col(dado, 8))}</td>
                  <td>
                    <AppLink className={col(dado, 9) === 1 ? 'status-enviado' : 'status-pendente-btn '}
                      href={urlFor('finan.cancelar_boleto', { data_inicial: ctx.data_inicial, data_final: ctx.data_final, numero_contrato: col(dado, 0) })}>
                      {col(dado, 9) === 0 ? 'Cancelar' : 'Cancelado'}
                    </AppLink>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Base1Layout>
  )
}
