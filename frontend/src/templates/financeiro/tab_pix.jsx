// financeiro/tab_pix.html
// Links de comprovante e CSV: a rota devolve arquivo OU página/redirect, por isso
// são links normais do app (o front baixa o arquivo ou mostra a resposta).
import { useSearchParams } from 'react-router-dom'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { col, show, showFloat } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

function statusClass(status) {
  if (status === 'baixado') return 'status-green'
  if (status === 'cancelado') return 'status-red'
  return 'status-yellow'
}

export default function TabPix() {
  useStylesheet('/static/css/tabpix.css')
  const ctx = useTemplateContext()
  const [searchParams] = useSearchParams()
  // o script atualizava o href do botão com o status da URL
  const filtroStatus = searchParams.get('status') || 'todos'

  return (
    <Base1Layout title="Tabela de Pagamentos">
      <div className="container-tab-pix">
        {/* Botão de fechar */}
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('auth.login_redir')}>✖</AppLink>
        </div>

        {/* Título da tabela */}
        <h1 className="table-title-tab-pix">Tabela de Pagamentos</h1>

        <ApiForm className="filter-tab-pix" method="POST">
          <AppLink className="btn-tab-pix" href={urlFor('finan.definir')}>Filtrar tabela</AppLink>
        </ApiForm>
        <ApiForm method="get" action={urlFor('finan.tab')} style={{ display: 'flex', gap: '8px', background: '#23272f00', padding: '12px 24px', borderRadius: '8px' }}>
          <input type="text" name="buscar" placeholder="Buscar por Contrato" defaultValue={searchParams.get('buscar') ?? ''}
            style={{ padding: '8px 12px', border: '1px solid #bbb', borderRadius: '4px', minWidth: '220px', fontSize: '15px', background: '#fff', color: '#222' }} />
          <button className="btn" type="submit">Buscar</button>
        </ApiForm>

        {/* Tabela de pagamentos */}
        <div className="table-container-tab-pix">
          <table className="table-tab-pix">
            <thead>
              <tr>
                <th>ID</th>
                <th>Contrato</th>
                <th>Responsável</th>
                <th>Valor</th>
                <th>Data de Pagamento</th>
                <th>Método</th>
                <th>Data de vencimento</th>
                <th>Status</th>
                <th>Descrição</th>
                <th>Tipo de Lançamento</th>
                <th>Atendente</th>

              </tr>
            </thead>
            <tbody>
              {(ctx.pagamentos ?? []).map((pagamento, i) => (
                <tr key={i}>
                  <td>{show(col(pagamento, 0))}</td>
                  <td>{show(col(pagamento, 2))}</td>
                  <td>{show(col(pagamento, 3))}</td>
                  <td>
                    <AppLink className={col(pagamento, 13) === 1 ? 'status-enviado' : 'status-pendente-btn '}
                      href={urlFor('finan.comprovante', { pagamento_id: col(pagamento, 0) })}>
                      {showFloat(col(pagamento, 4))}
                    </AppLink>
                  </td>
                  <td>{show(col(pagamento, 5))}</td>
                  <td>{show(col(pagamento, 6))}</td>
                  <td>{show(col(pagamento, 10))}</td>
                  <td>
                    <AppLink className={statusClass(col(pagamento, 8))}
                      href={urlFor('finan.alt_page', { pagamento_id: col(pagamento, 0), status: col(pagamento, 8) })}>
                      {show(col(pagamento, 8))}
                    </AppLink>
                  </td>
                  <td>{show(col(pagamento, 7))}</td>
                  <td>{show(col(pagamento, 11))}</td>
                  <td>{show(col(pagamento, 9))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="action-buttons-tab-pix">
        <AppLink id="export_csv" className="btn-tab-pix" href={urlFor('finan.exportar_csv', { status: filtroStatus })}>Exportar CSV</AppLink>

      </div>
    </Base1Layout>
  )
}
