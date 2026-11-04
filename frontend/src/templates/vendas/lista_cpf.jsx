// vendas/lista_cpf.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { col, show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

/** row['coluna'] de uma linha do banco: como o db.Row, sem diferenciar maiúsculas. */
function getCol(row, name) {
  if (!row) return undefined
  const key = Object.keys(row).find((k) => k.toLowerCase() === name.toLowerCase())
  return key === undefined ? undefined : row[key]
}

/** 'ativo' if valor == None else valor */
const ativoOu = (v) => (v === null || v === undefined ? 'ativo' : show(v))

export default function ListaCpf() {
  const ctx = useTemplateContext()
  const result = ctx.result
  return (
    <Base1Layout title="resultado de busca">
      <div className="container-tab-pix">
        {/* Botão de fechar */}
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('auth.fechar')} title="Fechar" aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </AppLink>
        </div>

        {/* Título da tabela */}
        <div className="page-toolbar">
          <h1 className="table-title-tab-pix">Retorno de pesquisa</h1>
        </div>
        {/* sem resultado o {% if %} do template corta a tabela inteira */}
        {truthy(result) && (
          <div className="table-container-tab-pix">
            <table className="table-tab-pix">
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Responsável</th>
                  <th>Nome do Beneficiario</th>
                  <th>CPF do Beneficiario</th>
                  <th>Data de cancelamento</th>
                  <th>Motivo de cancelamento</th>
                </tr>
              </thead>
              <tbody>
                {result.map((row, i) => (
                  <tr key={i}>
                    <td>{show(col(row, 4))}</td>
                    <td>{show(col(row, 2))}</td>
                    <td>{show(getCol(row, 'sNomeUSR'))}</td>
                    <td>{show(getCol(row, 'ScpfUSR'))}</td>
                    <td>{ativoOu(col(row, 27))}</td>
                    <td>
                      <AppLink className="badge" href={urlFor('vendas.saldos', { contrato: col(row, 4) })}>{ativoOu(col(row, 25))}</AppLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Base1Layout>
  )
}
