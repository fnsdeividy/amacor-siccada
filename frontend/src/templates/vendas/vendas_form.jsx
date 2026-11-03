// vendas/vendas_form.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../../lib/useStylesheet.jsx'
import {
  CepField, copiarDadosResponsavelParaTitular, CorretorOptions, DependentesSection, FORM_CSS,
  atualizarNumeroProposta, onCorretorChange, recalcularPrecos, TitularSection,
  toggleUsarSessaoCorretor, useTabs, useTestarRotaPreco, VendaSection,
} from './_formShared.jsx'

export default function VendasForm() {
  useStylesheet('/static/css/estilos.css')
  useStylesheet('/static/css/sidebar.css')
  useTestarRotaPreco()
  const ctx = useTemplateContext()
  const tabs = useTabs()
  const vendedor = truthy(ctx.vendedor) ? ctx.vendedor : []
  const corretora = truthy(ctx.corretora) ? ctx.corretora : []
  const planos = truthy(ctx.planos) ? ctx.planos : []

  return (
    <Base1Layout title="Vendas">
      <InlineStyle css={FORM_CSS} />

      <div className="table-container">
        <div className="form-container">
          <div>
            <AppLink className="close-btn" href={urlFor('auth.fechar')}>X</AppLink>
          </div>
          <h1>Formulário de Preenchimento de Adesao</h1>
          <div className="tabs">
            <div className={tabs.tabClass(0)} onClick={() => tabs.showTab(0)}>Contrato   </div>
            <div className={tabs.tabClass(1)} onClick={() => tabs.showTab(1)}>Titular</div>
            <div className={tabs.tabClass(2)} onClick={() => tabs.showTab(2)}>Dependente</div>
            <div className={tabs.tabClass(3)} onClick={() => tabs.showTab(3)}>Venda</div>
          </div>
          <ApiForm action={urlFor('vendas.venda_form')} method="POST">
            {/* Seção de Contrato */}
            <div className={tabs.sectionClass(0)} id="section-responsavel">
              <div className="card">
                <h3>Informações do Contrato</h3>

                <div className="form-field">
                  <label htmlFor="tipo_contrato">Tipo de Contrato:</label>
                  <select id="tipo_contrato" name="tipo_contrato" required defaultValue=""
                    onChange={atualizarNumeroProposta}>
                    <option value="" disabled>Selecione</option>
                    <option value="individual">Individual</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="corretor_resp">Corretor Responsável:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <select id="corretor_resp" name="corretor_resp" required style={{ flex: 1 }} defaultValue=""
                      onChange={onCorretorChange}>
                      <CorretorOptions vendedor={vendedor} corretora={corretora}
                        usuarioSessao={ctx.usuario_sessao} marcarSessao />
                    </select>
                    {truthy(ctx.usuario_sessao) && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                        <input type="checkbox" id="usar_sessao_corretor" onChange={toggleUsarSessaoCorretor} />
                        Usar meu nome ({show(ctx.usuario_sessao)})
                      </label>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="tipo_produto">Tipo de Produto:</label>
                  <select id="tipo_produto" name="tipo_produto" required defaultValue=""
                    onChange={(e) => recalcularPrecos(e.currentTarget.value)}>
                    <option value="" disabled>Selecione</option>
                    {planos.map((p, i) => (
                      <option key={i} value={show(p.nome_plano)}>{show(p.nome_plano)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="numero_proposta">Número da Proposta:</label>
                  <input type="text" id="numero_proposta" name="numero_proposta" required placeholder="Preenchido automaticamente ao selecionar o corretor" />
                </div>

                <div className="form-field">
                  <label htmlFor="nome_responsavel">Nome do Responsável:</label>
                  <input type="text" id="nome_responsavel" name="nome_responsavel" required />
                </div>
                <div className="form-field">
                  <label htmlFor="cpf_responsavel">CPF/CNPJ do Responsável:</label>
                  <input type="text" id="cpf_responsavel" name="cpf_responsavel" required />
                </div>
                <div className="form-field">
                  <label htmlFor="rg_responsavel">RG do Responsável:</label>
                  <input type="text" id="rg_responsavel" name="rg_responsavel" required />
                </div>
                <div className="form-field">
                  <label htmlFor="dt_nascimento_responsavel">Data de Nascimento:</label>
                  <input type="date" id="dt_nascimento_responsavel" name="dt_nascimento_responsavel" required />
                </div>

                <div className="form-field">
                  <label htmlFor="data_venda">Data da Venda:</label>
                  <input type="date" id="data_venda" name="data_venda" required />
                </div>

                <CepField label="Numero do CEP:" />
                <div className="form-field">
                  <label htmlFor="endereco_responsavel">Endereço:</label>
                  <input type="text" id="endereco_responsavel" name="endereco_responsavel" required />
                </div>
                <div className="form-field">
                  <label htmlFor="celular_responsavel">Celular:</label>
                  <input type="text" id="celular_responsavel" name="celular_responsavel" required />
                </div>
                <div className="form-field">
                  <label htmlFor="email_responsavel">Email:</label>
                  <input type="email" id="email_responsavel" name="email_responsavel" required />
                </div>
                <div className="form-field">
                  <label htmlFor="estado_cv_responsavel">Estado Civil:</label>
                  <select id="estado_cv_responsavel" name="estado_cv_responsavel" required defaultValue="">
                    <option value="" disabled>Selecione</option>
                    <option value="solteiro">Solteiro</option>
                    <option value="casado">Casado</option>
                    <option value="viuvo">Viúvo</option>
                    <option value="divorciado">Divorciado</option>
                  </select>
                </div>
                <div className="form-field">
                  <input type="checkbox" id="responsavel_igual_titular" onClick={copiarDadosResponsavelParaTitular} /> Responsável é o Titular
                </div>
              </div>
              <div className="nav-buttons">
                <button type="button" onClick={() => tabs.showTab(1)}>Proxima Aba</button>
              </div>
            </div>
            {/* Seção de Titular */}
            <TitularSection tabs={tabs} />
            {/* Seção de Dependentes */}
            <DependentesSection tabs={tabs} />

            <VendaSection tabs={tabs} />
          </ApiForm>
        </div>
      </div>
    </Base1Layout>
  )
}
