// vendas/inclusao_form.html
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import {
  calcularIdadeEBuscarPrecoTitular, calcularIdadeInclusao, CepField, CorretorOptions,
  DependentesSection, EstadoCivilOptions, FORM_CSS, FormHeader, NavButtons, ParentescoOptions,
  recalcularPrecos, SectionTitle, SexoOptions, useTabs, useTestarRotaPreco, VendaSection,
} from './_formShared.jsx'

export default function InclusaoForm() {
  useTestarRotaPreco()
  const ctx = useTemplateContext()
  // o template começa sem aba ativa e chama showTab(0) no DOMContentLoaded
  const tabs = useTabs()
  const dados = ctx.dados ?? {}
  const vendedor = truthy(ctx.vendedor) ? ctx.vendedor : []
  const corretora = truthy(ctx.corretora) ? ctx.corretora : []
  // nesta página vale o calcularIdade redefinido no segundo <script>
  const calcIdade = calcularIdadeInclusao

  return (
    <Base1Layout title="Vendas">
      <InlineStyle css={FORM_CSS} />

      <div className="venda-form">
        <FormHeader title="Formulário de Preenchimento de Inclusão" tabs={tabs}
          labels={['Contrato', 'Incluido', 'Dependente', 'Venda']} />
        <ApiForm action={urlFor('vendas.inclusao_form')} method="POST">
          {/* Seção de Responsável */}
          <div className={tabs.sectionClass(0)} id="section-responsavel">
            <div className="card">
              <SectionTitle icon="fa-file-signature">Informações do Responsável</SectionTitle>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numero_contrato">Contrato:</label>
                  <input type="text" id="numero_contrato" name="numero_contrato" defaultValue={show(dados.numero_contrato)} readOnly required />
                </div>
                <div className="form-group">
                  <label htmlFor="nome_responsavel">Nome do Responsável:</label>
                  <input type="text" id="nome_responsavel" name="nome_responsavel" defaultValue={show(dados.nome_responsavel)} readOnly required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cpf_responsavel">CPF/CNPJ do Responsável:</label>
                  <input type="text" id="cpf_responsavel" name="cpf_responsavel" defaultValue={show(ctx.cpf)} readOnly required />
                </div>
                <div className="form-group">
                  <label htmlFor="rg_responsavel">RG do Responsável:</label>
                  <input type="text" id="rg_responsavel" name="rg_responsavel" defaultValue={show(dados.rg)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="dt_nascimento_responsavel">Data de Nascimento:</label>
                  <input type="date" id="dt_nascimento_responsavel" name="dt_nascimento_responsavel" defaultValue={show(ctx.data_nascimento)} readOnly required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipo_contrato">Tipo de Contrato:</label>
                  <select id="tipo_contrato" name="tipo_contrato" required defaultValue="">
                    <option value="" disabled>Selecione</option>
                    <option value={show(ctx.tipo_contrato)}>{show(ctx.tipo_contrato)}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tipo_produto">Tipo de Produto:</label>
                  <select id="tipo_produto" name="tipo_produto" required defaultValue=""
                    onChange={(e) => recalcularPrecos(e.currentTarget.value, calcIdade)}>
                    <option value="" disabled>Selecione</option>
                    <option value={show(dados.tipo_produto)}>{show(dados.tipo_produto)}</option>
                  </select>
                </div>
                <div className="form-group">
                  {/* o template tem um "n" solto antes do rótulo: mantido, mas oculto */}
                  <span className="sr-only" aria-hidden="true">n</span>
                  <label htmlFor="corretor_resp">Corretor Responsável:</label>
                  <select id="corretor_resp" name="corretor_resp" required defaultValue="">
                    <CorretorOptions vendedor={vendedor} corretora={corretora} />
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="data_venda">Data da Venda:</label>
                  <input type="date" id="data_venda" name="data_venda" required />
                </div>
                <CepField label="Numero do CEP:" />
              </div>
              <div className="form-group">
                <label htmlFor="endereco_responsavel">Endereço:</label>
                <input type="text" id="endereco_responsavel" name="endereco_responsavel" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="celular_responsavel">Celular:</label>
                  <input type="text" id="celular_responsavel" name="celular_responsavel" defaultValue={show(dados.celular)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email_responsavel">Email:</label>
                  <input type="email" id="email_responsavel" name="email_responsavel" defaultValue={show(dados.email)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="estado_cv_responsavel">Estado Civil:</label>
                  <input type="estado_cv_responsavel" id="estado_cv_responsavel" name="estado_cv_responsavel" defaultValue={show(dados.estado_civil)} required />
                </div>
              </div>
              <NavButtons tabs={tabs} next={1} />
            </div>
          </div>
          {/* Seção de Titular */}
          <div className={tabs.sectionClass(1)} id="section-titular">
            <div className="card">
              <SectionTitle icon="fa-user-plus">Informações do Incluido</SectionTitle>
              <div className="form-group">
                <label htmlFor="nome_beneficiario">Nome do beneficiario incluido:</label>
                <input type="text" id="nome_beneficiario" name="nome_beneficiario" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cpf_beneficiario">CPF do beneficiario incluido:</label>
                  <input type="text" id="cpf_beneficiario" name="cpf_beneficiario" required />
                </div>
                <div className="form-group">
                  <label htmlFor="dt_nascimento_beneficiario">Data de Nascimento:</label>
                  <input type="date" id="dt_nascimento_beneficiario" name="dt_nascimento_beneficiario" required
                    onChange={() => calcularIdadeEBuscarPrecoTitular(calcIdade)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="idade_beneficiario">Idade:</label>
                  <input type="number" id="idade_beneficiario" name="idade_beneficiario" readOnly />
                </div>
                <div className="form-group">
                  <label htmlFor="valor_titular">Valor do plano:</label>
                  <input type="text" id="valor_titular" name="valor_titular" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="endereco_beneficiario">Endereço:</label>
                <input type="text" id="endereco_beneficiario" name="endereco_beneficiario" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="celular_titular">Celular:</label>
                  <input type="text" id="celular_titular" name="celular_titular" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email_titular">Email:</label>
                  <input type="email" id="email_titular" name="email_titular" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="grau_parentesco_titular">grau de Parentesco:</label>
                  <select name="grau_parentesco_titular" required defaultValue="">
                    <ParentescoOptions />
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="estado_cv_beneficiario">Estado Civil:</label>
                  <select id="estado_cv_beneficiario" name="estado_cv_beneficiario" required defaultValue="">
                    <EstadoCivilOptions />
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="sexo_beneficiario">Sexo:</label>
                  <select id="sexo_beneficiario" name="sexo_beneficiario" required defaultValue="">
                    <SexoOptions />
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome_mae_beneficiario">Nome da Mãe:</label>
                  <input type="text" id="nome_mae_beneficiario" name="nome_mae_beneficiario" required />
                </div>
                <div className="form-group">
                  <label htmlFor="nome_pai_beneficiario">Nome do Pai:</label>
                  <input type="text" id="nome_pai_beneficiario" name="nome_pai_beneficiario" />
                </div>
              </div>
              <NavButtons tabs={tabs} back={0} backLabel="voltar" next={2} />
            </div>
          </div>
          {/* Seção de Dependentes */}
          <DependentesSection tabs={tabs} calcIdade={calcIdade} />
          <VendaSection tabs={tabs} />
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
