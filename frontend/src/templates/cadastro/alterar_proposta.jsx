// cadastro/alterar_proposta.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

export default function AlterarProposta() {
  useStylesheet('/static/css/tabpix.css')
  const { proposta } = useTemplateContext()
  return (
    <Base1Layout title="Editar Contrato">
      <div className="container-tab-pix">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('cad.detalhes_cnt', { proposta })}>{'<'}</AppLink>
        </div>

        <h1 className="table-title-tab-pix">Editar Contrato</h1>
        <AppLink id="btn_vendas" className="btn" href={urlFor('cad.alterar_infos_proposta', { proposta, tp_alt: 'venda' })}>alterar vendas</AppLink>
        <label htmlFor="btn_vendas">Para realizar alterações em dados da venda(valores, data, etc)</label>
        <br />
        <AppLink id="btn_resp" className="btn" href={urlFor('cad.alterar_infos_proposta', { proposta, tp_alt: 'respp' })}>alterar responsavel</AppLink>
        <label htmlFor="btn_resp">Para realizar alterações em dados do responsavel (nome, cpf, cnpj, etc)</label>
        <br />
        <AppLink id="btn_tilt" className="btn" href={urlFor('cad.alterar_infos_proposta', { proposta, tp_alt: 'titular' })}>alterar titular</AppLink>
        <label htmlFor="btn_tilt">Para realizar alterações em dados do titular (nome, cpf, etc)</label>
        <br />
        <AppLink className="btn" href={urlFor('cad.alterar_infos_proposta', { proposta, tp_alt: 'depenn' })}>alterar dependentes</AppLink>
        <label htmlFor="btn_tilt">Para realizar alterações em dados do dependente (nome, cpf, etc)</label>
        <br /><br />
        <AppLink className="btn" href={urlFor('cad.excluir_proposta', { proposta, tp_alt: 'cancelar' })}>Cancelar venda</AppLink>
        <label htmlFor="btn_tilt">Para cancelar a venda, mantendo os dados para futuras consultas</label>
        <br />
        <AppLink className="btn" href={urlFor('cad.excluir_proposta', { proposta, tp_alt: 'excluir' })}>Excluir proposta</AppLink>
        <label htmlFor="btn_tilt">Para excluir completamente a proposta e todos os dados associados</label>
        <br /><br />
      </div>
    </Base1Layout>
  )
}
