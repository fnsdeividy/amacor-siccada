// vendas/vendas_form_pj.html
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import {
  CepField, CorretorField, DependentesSection, FORM_CSS, FormHeader, NavButtons, SectionTitle,
  atualizarNumeroProposta, recalcularPrecos, TitularSection, useTabs, useTestarRotaPreco, VendaSection,
} from './_formShared.jsx'

export default function VendasFormPj() {
  useTestarRotaPreco()
  const ctx = useTemplateContext()
  const tabs = useTabs()
  const vendedor = truthy(ctx.vendedor) ? ctx.vendedor : []
  const corretora = truthy(ctx.corretora) ? ctx.corretora : []
  const planos = truthy(ctx.planos) ? ctx.planos : []

  return (
    <Base1Layout title="Vendas">
      <InlineStyle css={FORM_CSS} />

      <div className="venda-form">
        <FormHeader title="Formulário de Preenchimento de Contrato" tabs={tabs}
          labels={['Contrato', 'Titular', 'Dependente', 'Venda']} />
        <ApiForm action={urlFor('vendas.venda_form_pj')} method="POST">
          {/* Seção de Responsável */}
          <div className={tabs.sectionClass(0)} id="section-responsavel">
            <div className="card">
              <SectionTitle icon="fa-building">Informações do Responsável</SectionTitle>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipo_contrato">Tipo de Contrato:</label>
                  <select id="tipo_contrato" name="tipo_contrato" required defaultValue=""
                    onChange={atualizarNumeroProposta}>
                    <option value="" disabled>Selecione</option>
                    <option value="individual">Individual</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                </div>
                <CorretorField vendedor={vendedor} corretora={corretora} usuarioSessao={ctx.usuario_sessao} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipo_produto">Tipo de Produto:</label>
                  <select id="tipo_produto" name="tipo_produto" required defaultValue=""
                    onChange={(e) => {
                      atualizarNumeroProposta()
                      recalcularPrecos(e.currentTarget.value)
                    }}>
                    <option value="" disabled>Selecione</option>
                    {planos.map((p, i) => (
                      <option key={i} value={show(p.nome_plano)}>{show(p.nome_plano)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="numero_proposta">Número da Proposta:</label>
                  <input type="text" id="numero_proposta" name="numero_proposta" required placeholder="Preenchido automaticamente ao selecionar o corretor" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome_responsavel">Nome da empresa:</label>
                  <input type="text" id="nome_responsavel" name="nome_responsavel" required />
                </div>
                <div className="form-group">
                  <label htmlFor="cnpj_responsavel">CNPJ do Responsável:</label>
                  <input type="text" id="cnpj_responsavel," name="cnpj_responsavel" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome_socio">Nome do Socio da empresa:</label>
                  <input type="text" id="nome_socio" name="nome_socio" required />
                </div>
                <div className="form-group">
                  <label htmlFor="cpf_socio">CPF do Socio da empresa:</label>
                  <input type="text" id="cpf_socio" name="cpf_socio" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dt_nascimento_responsavel">Fundação da empresa:</label>
                  <input type="date" id="dt_nascimento_responsavel" name="dt_nascimento_responsavel" required />
                </div>
                <div className="form-group">
                  <label htmlFor="data_venda">Data da Venda:</label>
                  <input type="date" id="data_venda" name="data_venda" required />
                </div>
              </div>

              <CepField label="CEP da empresa:" />
              <div className="form-group">
                <label htmlFor="endereco_responsavel">Endereço:</label>
                <input type="text" id="endereco_responsavel" name="endereco_responsavel" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="celular_responsavel">Celular:</label>
                  <input type="text" id="celular_responsavel" name="celular_responsavel" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email_responsavel">Email:</label>
                  <input type="email" id="email_responsavel" name="email_responsavel" required />
                </div>
                <div className="form-group">
                  <label htmlFor="estado_cv_responsavel">Estado Civil:</label>
                  <input type="text" id="estado_cv_responsavel" name="estado_cv_responsavel" defaultValue="empresarial" readOnly />
                </div>
              </div>
              <NavButtons tabs={tabs} next={1} />
            </div>
          </div>
          {/* Seção de Titular */}
          <TitularSection tabs={tabs} />
          {/* Seção de Dependentes */}
          <DependentesSection tabs={tabs} />

          <VendaSection tabs={tabs} />
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
