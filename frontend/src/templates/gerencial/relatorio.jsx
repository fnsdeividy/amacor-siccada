// gerencial/relatorio.html
import AppLink from '../../components/AppLink.jsx'
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function Relatorio() {
  const ctx = useTemplateContext()
  const dados = ctx.dados ?? []
  return (
    <Base1Layout title="Tabela de Pagamentos">
      <div className="container-tab-pix">

        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('auth.fechar')} title="Fechar" aria-label="Fechar"><i className="fa-solid fa-xmark" aria-hidden="true" /></AppLink>
        </div>

        <div className="page-toolbar">
          <h1 className="table-title-tab-pix">Tabela de Pagamentos</h1>
          <div className="page-toolbar-actions">
            <ApiForm className="filter-tab-pix" method="POST">
              <AppLink download href={urlFor('gerencial.download_relatorio')} className="btn-tab-pix">
                <i className="fa-solid fa-file-arrow-down" aria-hidden="true" /> Exportar CSV
              </AppLink>
            </ApiForm>
          </div>
        </div>

        <div className="table-container-tab-pix">
          <table>
            <thead>
              <tr>
                <th>Ações</th>
                <th>Proposta</th>
                <th>numero de contrato</th>
                <th>Responsável</th>
                <th>Valor da venda</th>
                <th>taxa de inscrição</th>
                <th>ISS</th>
                <th>Vidas cadastradas</th>
                <th>Valor de mensalidade</th>
                <th>Data da venda</th>
                <th>tipo de plano</th>
                <th>Status</th>
                <th>corretor</th>
                <th>Tipo de Lançamento</th>
                <th>Corretor</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item, i) => (
                <tr key={i}>
                  <td>
                    <AppLink className="btn-tab-pix" href={urlFor('cad.detalhes_cnt', { proposta: item.numero_proposta, contrato: item.numero_contrato, id: item.id })}>Detalhes</AppLink>
                  </td>
                  <td>{show(item.numero_proposta)}</td>
                  <td>{show(item.numero_contrato)}</td>
                  <td>{show(item.nome_responsavel)}</td>
                  <td>{showFloat(item.valor_venda)}</td>
                  <td>{showFloat(item.taxa_inscricao)}</td>
                  <td>{showFloat(item.iss)}</td>
                  <td>{show(item.vidas)}</td>
                  <td>{showFloat(item.valor_tabela)}</td>
                  <td>{show(item.dt_cadastro)}</td>
                  <td>{show(item.tipo_contrato)}</td>
                  <td>{show(item.status)}</td>
                  <td>{show(item.corretor_resp)}</td>
                  <td>{truthy(item.tipo_pagamento) ? show(item.tipo_pagamento) : 'Não especificado'}</td>
                  <td>{show(item.digitador)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="action-buttons-tab-pix">
          <AppLink download href={urlFor('gerencial.download_relatorio')} className="btn-tab-pix btn-secondary">
            <i className="fa-solid fa-file-arrow-down" aria-hidden="true" /> Exportar CSV
          </AppLink>
        </div>
      </div>
    </Base1Layout>
  )
}
