// vendas/vendas_form.html
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import {
  CepField, copiarDadosResponsavelParaTitular, CorretorField, DependentesSection, EstadoCivilOptions,
  FORM_CSS, FormHeader, NavButtons, SectionTitle, atualizarNumeroProposta, recalcularPrecos,
  TitularSection, useTabs, useTestarRotaPreco, VendaSection,
} from './_formShared.jsx'

export default function VendasForm() {
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
        <FormHeader title="Formulário de Preenchimento de Adesao" tabs={tabs}
          labels={['Contrato', 'Titular', 'Dependente', 'Venda']} />
        <ApiForm action={urlFor('vendas.venda_form')} method="POST">
          {/* Seção de Contrato */}
          <div className={tabs.sectionClass(0)} id="section-responsavel">
            <div className="card">
              <SectionTitle icon="fa-file-signature">Informações do Contrato</SectionTitle>

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
                    onChange={(e) => recalcularPrecos(e.currentTarget.value)}>
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

              <div className="form-group">
                <label htmlFor="nome_responsavel">Nome do Responsável:</label>
                <input type="text" id="nome_responsavel" name="nome_responsavel" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cpf_responsavel">CPF/CNPJ do Responsável:</label>
                  <input type="text" id="cpf_responsavel" name="cpf_responsavel" required />
                </div>
                <div className="form-group">
                  <label htmlFor="rg_responsavel">RG do Responsável:</label>
                  <input type="text" id="rg_responsavel" name="rg_responsavel" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dt_nascimento_responsavel">Data de Nascimento:</label>
                  <input type="date" id="dt_nascimento_responsavel" name="dt_nascimento_responsavel" required />
                </div>
                <div className="form-group">
                  <label htmlFor="data_venda">Data da Venda:</label>
                  <input type="date" id="data_venda" name="data_venda" required />
                </div>
              </div>

              <CepField label="Numero do CEP:" />
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
                  <select id="estado_cv_responsavel" name="estado_cv_responsavel" required defaultValue="">
                    <EstadoCivilOptions />
                  </select>
                </div>
              </div>
              <div className="check-field">
                <label className="check-label">
                  <input type="checkbox" id="responsavel_igual_titular" onClick={copiarDadosResponsavelParaTitular} /> Responsável é o Titular
                </label>
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
