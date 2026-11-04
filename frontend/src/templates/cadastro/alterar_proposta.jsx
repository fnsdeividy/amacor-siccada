// cadastro/alterar_proposta.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { Oculto } from './_ui.js'

const css = `
.cad-alt-proposta .cad-alt-grupo { margin-bottom: var(--space-6); }
.cad-alt-proposta .cad-alt-grupo:last-child { margin-bottom: 0; }
.cad-alt-proposta .cad-alt-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
}
.cad-alt-proposta .cad-alt-item:last-child { border-bottom: 0; }
.cad-alt-proposta .cad-alt-item .btn { min-width: 220px; justify-content: flex-start; }
.cad-alt-proposta .cad-alt-item label {
  flex: 1 1 260px;
  margin: 0;
  font-weight: 400;
  color: var(--text-soft);
}
`

export default function AlterarProposta() {
  const { proposta } = useTemplateContext()
  return (
    <Base1Layout title="Editar Contrato">
      <InlineStyle css={css} />
      <div className="card cad-alt-proposta">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('cad.detalhes_cnt', { proposta })} title="Voltar" aria-label="Voltar">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /><Oculto>{'<'}</Oculto>
          </AppLink>
        </div>

        <div className="page-toolbar">
          <h1 className="table-title-tab-pix">Editar Contrato</h1>
        </div>

        <div className="cad-alt-grupo">
          <div className="cad-alt-item">
            <AppLink id="btn_vendas" className="btn btn-secondary" href={urlFor('cad.alterar_infos_proposta', { proposta, tp_alt: 'venda' })}>
              <i className="fa-solid fa-file-invoice-dollar" aria-hidden="true" /> alterar vendas
            </AppLink>
            <label htmlFor="btn_vendas">Para realizar alterações em dados da venda(valores, data, etc)</label>
          </div>
          <div className="cad-alt-item">
            <AppLink id="btn_resp" className="btn btn-secondary" href={urlFor('cad.alterar_infos_proposta', { proposta, tp_alt: 'respp' })}>
              <i className="fa-solid fa-user-tie" aria-hidden="true" /> alterar responsavel
            </AppLink>
            <label htmlFor="btn_resp">Para realizar alterações em dados do responsavel (nome, cpf, cnpj, etc)</label>
          </div>
          <div className="cad-alt-item">
            <AppLink id="btn_tilt" className="btn btn-secondary" href={urlFor('cad.alterar_infos_proposta', { proposta, tp_alt: 'titular' })}>
              <i className="fa-solid fa-user" aria-hidden="true" /> alterar titular
            </AppLink>
            <label htmlFor="btn_tilt">Para realizar alterações em dados do titular (nome, cpf, etc)</label>
          </div>
          <div className="cad-alt-item">
            <AppLink className="btn btn-secondary" href={urlFor('cad.alterar_infos_proposta', { proposta, tp_alt: 'depenn' })}>
              <i className="fa-solid fa-users" aria-hidden="true" /> alterar dependentes
            </AppLink>
            <label htmlFor="btn_tilt">Para realizar alterações em dados do dependente (nome, cpf, etc)</label>
          </div>
        </div>

        <div className="cad-alt-grupo">
          <div className="cad-alt-item">
            <AppLink className="btn btn-secondary" href={urlFor('cad.excluir_proposta', { proposta, tp_alt: 'cancelar' })}>
              <i className="fa-solid fa-ban" aria-hidden="true" /> Cancelar venda
            </AppLink>
            <label htmlFor="btn_tilt">Para cancelar a venda, mantendo os dados para futuras consultas</label>
          </div>
          <div className="cad-alt-item">
            <AppLink className="btn btn-danger" href={urlFor('cad.excluir_proposta', { proposta, tp_alt: 'excluir' })}>
              <i className="fa-solid fa-trash" aria-hidden="true" /> Excluir proposta
            </AppLink>
            <label htmlFor="btn_tilt">Para excluir completamente a proposta e todos os dados associados</label>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
