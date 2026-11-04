// Partes comuns de vendas/vendas_form.html, vendas/vendas_form_pj.html e
// vendas/inclusao_form.html: o CSS da tela (visual novo, ver DESIGN.md), as funções dos <script>
// (idade, preço por idade, valor total, CEP, número da proposta, abas) e os
// blocos de formulário iguais nos três templates. Não é um template.
import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import AppLink from '../../components/AppLink.jsx'
import { apiFetch } from '../../lib/api.js'
import { show, truthy } from '../../lib/jinja.js'
import { urlFor } from '../../lib/urlFor.js'

export const FORM_CSS = `
.venda-form { max-width: 980px; margin: 0 auto; }
.venda-form .venda-form-header { padding-bottom: 0; }
.venda-form .venda-form-header .page-toolbar { padding-right: 0; margin-bottom: var(--space-3); }
.venda-form .venda-form-header .tabs { margin-bottom: 0; border-bottom: 0; }
.venda-form .tabs button i { color: var(--gray-400); }
.venda-form .tabs button.active i { color: var(--brand-700); }
.venda-form .form-section { display: none; }
.venda-form .form-section.active { display: block; }
.venda-form .section-title {
  display: flex; align-items: center; gap: var(--space-2);
  padding-bottom: var(--space-3); margin-bottom: var(--space-4);
  font-size: var(--text-md); border-bottom: 1px solid var(--border);
}
.venda-form .section-title i { color: var(--brand-700); }
.venda-form .form-actions {
  display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2);
  padding-top: var(--space-4); margin-top: var(--space-2); border-top: 1px solid var(--border);
}
.venda-form .corretor-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2) var(--space-4); margin-bottom: var(--space-3); }
.venda-form .corretor-row select { flex: 1 1 220px; margin: 0; }
.venda-form .check-label {
  display: inline-flex; align-items: center; gap: var(--space-2); margin: 0;
  font-weight: 400; color: var(--text-soft); cursor: pointer;
}
.venda-form .check-field { margin: var(--space-2) 0; }
.venda-form .input-group { display: flex; align-items: flex-start; gap: var(--space-2); }
.venda-form .input-group input { flex: 1; min-width: 0; }
.venda-form .input-group .btn { flex: 0 0 auto; }
.venda-form .dependente {
  padding: var(--space-4); margin-bottom: var(--space-4);
  background: var(--gray-50); border: 1px solid var(--border); border-radius: var(--radius);
}
.venda-form .dependente-actions { display: flex; justify-content: flex-end; }
.venda-form .sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
`

const $ = (id) => document.getElementById(id)

// ---------------------------------------------------------------------------
// Funções dos <script> (mesma lógica; os campos continuam sendo lidos/escritos
// pelo id, como no template)
// ---------------------------------------------------------------------------

/** calcularIdade de vendas_form / vendas_form_pj (new Date('AAAA-MM-DD')). */
export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return ''
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const m = hoje.getMonth() - nascimento.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

/**
 * calcularIdade de inclusao_form: o segundo <script> do template redefine a
 * função (data local a partir de 'AAAA-MM-DD'), e é essa que vale na página.
 */
export function calcularIdadeInclusao(dataNascimento) {
  if (!dataNascimento) return ''
  const hoje = new Date()
  const partes = dataNascimento.split('-')
  if (partes.length !== 3) return ''
  const nascimento = new Date(partes[0], partes[1] - 1, partes[2])
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const m = hoje.getMonth() - nascimento.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

export function calcularValorTotal() {
  let total = 0

  // Valor do titular
  const valorTitular = $('valor_titular').value
  if (valorTitular && valorTitular.includes('R$')) {
    const valorNumerico = parseFloat(valorTitular.replace('R$ ', '').replace(',', '.'))
    if (!isNaN(valorNumerico)) {
      total += valorNumerico
    }
  }

  // Valores dos dependentes
  document.querySelectorAll('.valor-dependente').forEach((campo) => {
    const valorDependente = campo.value
    if (valorDependente && valorDependente.includes('R$')) {
      const valorNumerico = parseFloat(valorDependente.replace('R$ ', '').replace(',', '.'))
      if (!isNaN(valorNumerico)) {
        total += valorNumerico
      }
    }
  })

  // Atualizar o campo de valor da venda
  $('valor_venda').value = total > 0 ? `R$ ${total.toFixed(2)}` : ''
  console.log('Valor total calculado:', total)
}

// Função para buscar preço usando POST
export async function buscarPreco(idade, plano) {
  console.log('Buscando preço para:', idade, plano)
  if (!idade || !plano) {
    return null
  }

  try {
    const response = await apiFetch(urlFor('vendas.preco_idade', { idade, plano }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Resposta status:', response.status)

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()
    console.log('Dados recebidos:', data)
    return data.preco !== undefined ? data.preco : null
  } catch (error) {
    console.error('Erro ao buscar preço:', error)
    return null
  }
}

// Função para debug - teste a rota (o template chama 1s depois de carregar)
export async function testarRotaPreco() {
  console.log('Testando rota de preço...')
  try {
    const response = await apiFetch(urlFor('vendas.preco_idade', { idade: 30, plano: 'Amacor Exclusivo II' }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Status:', response.status)
    const data = await response.json()
    console.log('Resposta:', data)
    return data
  } catch (error) {
    console.error('Erro no teste:', error)
  }
}

/** Teste automático quando a página carrega (setTimeout de 1s do template). */
export function useTestarRotaPreco() {
  useEffect(() => {
    console.log('Teste automático iniciado...')
    const timer = setTimeout(() => {
      testarRotaPreco()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])
}

// Função para calcular idade e buscar preço para o TITULAR
export async function calcularIdadeEBuscarPrecoTitular(calcIdade = calcularIdade) {
  console.log('Calculando idade titular...')
  const idade = calcIdade($('dt_nascimento_beneficiario').value)
  console.log('Idade titular:', idade)
  $('idade_beneficiario').value = idade

  const plano = $('tipo_produto').value
  console.log('Plano selecionado:', plano)

  if (!idade || !plano) return

  const preco = await buscarPreco(idade, plano)
  if (preco !== null) {
    $('valor_titular').value = `R$ ${parseFloat(preco).toFixed(2)}`
  } else {
    $('valor_titular').value = 'Preço não encontrado'
  }

  // Calcular valor total após atualizar o titular
  calcularValorTotal()
}

export async function calcularIdadeEBuscarPrecoDependente(campoData, calcIdade = calcularIdade) {
  console.log('Calculando idade dependente...')
  const dependenteDiv = campoData.closest('.dependente')
  const campoIdade = dependenteDiv.querySelector('.idade-dependente')
  const campoValor = dependenteDiv.querySelector('.valor-dependente')

  const idade = calcIdade(campoData.value)
  console.log('Idade dependente:', idade)
  campoIdade.value = idade

  const plano = $('tipo_produto').value
  console.log('Plano selecionado:', plano)

  if (!idade || !plano) {
    campoValor.value = ''
    return
  }

  const preco = await buscarPreco(idade, plano)
  if (preco !== null) {
    campoValor.value = `R$ ${parseFloat(preco).toFixed(2)}`
  } else {
    campoValor.value = 'Preço não encontrado'
  }

  // Calcular valor total após atualizar o dependente
  calcularValorTotal()
}

/** Listener de 'change' do #tipo_produto: recalcula titular e dependentes. */
export function recalcularPrecos(plano, calcIdade = calcularIdade) {
  console.log('Plano alterado para:', plano)
  // Recalcular preço do titular se já tiver idade
  const idadeTitular = $('idade_beneficiario').value
  if (idadeTitular) {
    calcularIdadeEBuscarPrecoTitular(calcIdade)
  }

  // Recalcular para dependentes
  document.querySelectorAll('.data-nascimento-dependente').forEach((campo) => {
    if (campo.value) {
      calcularIdadeEBuscarPrecoDependente(campo, calcIdade)
    }
  })
}

// Função para buscar CEP do responsável
export function buscarCepResponsavel() {
  const cepInput = $('cep_responsavel')
  const cep = cepInput.value.replace(/\D/g, '')
  if (cep.length === 8) {
    apiFetch(urlFor('vendas.buscar_endereco_cep'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cep: cep }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.erro) {
          $('endereco_responsavel').value =
            `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`.replace(/^, |, ,/g, '').trim()
        }
      })
  }
}

export async function buscarProximoNumeroProposta(corretor, tipoContrato) {
  if (!corretor || !tipoContrato) {
    $('numero_proposta').value = ''
    return
  }
  try {
    const params = new URLSearchParams({
      corretor: corretor,
      tipo_contrato: tipoContrato,
    })
    const url = `${urlFor('vendas.proximo_numero_proposta')}?${params.toString()}`
    const response = await apiFetch(url)
    if (!response.ok) {
      console.error('Erro HTTP ao buscar proposta:', response.status)
      return
    }
    const data = await response.json()
    console.log('Próximo número:', data)
    if (data.proximo_numero) {
      $('numero_proposta').value = data.proximo_numero
    }
  } catch (e) {
    console.error('Erro ao buscar próximo número de proposta:', e)
  }
}

export function toggleUsarSessaoCorretor() {
  const checkbox = $('usar_sessao_corretor')
  const select = $('corretor_resp')
  const tipoContrato = $('tipo_contrato').value
  if (checkbox && checkbox.checked) {
    const opcaoSessao = select.querySelector('[data-sessao="true"]')
    if (opcaoSessao) {
      select.value = opcaoSessao.value
      buscarProximoNumeroProposta(opcaoSessao.value, tipoContrato)
    }
  } else {
    select.value = ''
    $('numero_proposta').value = ''
  }
}

export function atualizarNumeroProposta() {
  const corretorSelect = $('corretor_resp')
  const tipoContratoSelect = $('tipo_contrato')
  if (!corretorSelect || !tipoContratoSelect) return
  buscarProximoNumeroProposta(corretorSelect.value, tipoContratoSelect.value)
}

/** Listener de 'change' do #corretor_resp. */
export function onCorretorChange(event) {
  const corretorSelect = event.currentTarget
  atualizarNumeroProposta()
  const checkbox = $('usar_sessao_corretor')
  if (checkbox) {
    const opcaoSessao = corretorSelect.querySelector('[data-sessao="true"]')
    checkbox.checked = !!(opcaoSessao && corretorSelect.value === opcaoSessao.value)
  }
}

export function copiarDadosResponsavelParaTitular() {
  const responsavelNome = $('nome_responsavel').value
  const responsavelCpf = $('cpf_responsavel').value
  const responsavelDtNascimento = $('dt_nascimento_responsavel').value
  const responsavelEndereco = $('endereco_responsavel').value
  const responsavelCelular = $('celular_responsavel').value
  const responsavelEmail = $('email_responsavel').value
  const estadoCivil = $('estado_cv_responsavel').value
  if ($('responsavel_igual_titular').checked) {
    $('nome_beneficiario').value = responsavelNome
    $('cpf_beneficiario').value = responsavelCpf
    $('dt_nascimento_beneficiario').value = responsavelDtNascimento
    $('endereco_beneficiario').value = responsavelEndereco
    $('celular_titular').value = responsavelCelular
    $('email_titular').value = responsavelEmail
    $('estado_cv_beneficiario').value = estadoCivil
  } else {
    $('nome_beneficiario').value = ''
    $('cpf_beneficiario').value = ''
    $('dt_nascimento_beneficiario').value = ''
    $('endereco_beneficiario').value = ''
    $('celular_titular').value = ''
    $('email_titular').value = ''
    $('estado_cv_beneficiario').value = ''
  }
}

// ---------------------------------------------------------------------------
// Abas (showTab / mostrarTodasAbas)
// ---------------------------------------------------------------------------

/**
 * showTab(i): só a seção i e a aba i ficam "active".
 * mostrarTodasAbas(): todas as seções ficam "active" (as abas não mudam);
 * é chamado no clique de "Salvar Contrato", antes da validação do navegador.
 */
export function useTabs() {
  const [state, setState] = useState({ index: 0, all: false })
  const showTab = useCallback((index) => setState({ index, all: false }), [])
  const mostrarTodasAbas = useCallback(() => {
    flushSync(() => setState((s) => ({ ...s, all: true })))
  }, [])
  const sectionClass = (i) => 'form-section' + (state.all || state.index === i ? ' active' : '')
  const tabClass = (i) => 'tab' + (state.index === i ? ' active' : '')
  return { showTab, mostrarTodasAbas, sectionClass, tabClass }
}

// ---------------------------------------------------------------------------
// Blocos de formulário
// ---------------------------------------------------------------------------

const TAB_ICONS = ['fa-file-signature', 'fa-user', 'fa-users', 'fa-cart-shopping']

/**
 * Cabeçalho do formulário: título, botão de fechar (o "X" do template fica
 * para leitores de tela) e as abas (.tabs do base.css).
 */
export function FormHeader({ title, tabs, labels }) {
  return (
    <div className="card venda-form-header">
      <div className="page-toolbar">
        <h1>{title}</h1>
        <AppLink className="close-btn" href={urlFor('auth.fechar')} title="Fechar">
          <i className="fa-solid fa-xmark" aria-hidden="true" /><span className="sr-only">X</span>
        </AppLink>
      </div>
      <div className="tabs" role="tablist">
        {labels.map((label, i) => (
          <button key={i} type="button" role="tab" className={tabs.tabClass(i)} onClick={() => tabs.showTab(i)}>
            <i className={'fa-solid ' + TAB_ICONS[i]} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Título de uma seção (cartão) do formulário, com ícone. */
export function SectionTitle({ icon, children }) {
  return (
    <h3 className="section-title"><i className={'fa-solid ' + icon} aria-hidden="true" /> {children}</h3>
  )
}

/** Botões "voltar" / "Proxima Aba" no rodapé da seção. */
export function NavButtons({ tabs, back, backLabel = 'Voltar', next }) {
  return (
    <div className="form-actions">
      {back !== undefined && (
        <button type="button" className="btn btn-secondary" onClick={() => tabs.showTab(back)}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {backLabel}
        </button>
      )}
      {next !== undefined && (
        <button type="button" className="btn" onClick={() => tabs.showTab(next)}>
          Proxima Aba <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/** Opções do estado civil (iguais nos três templates). */
export function EstadoCivilOptions() {
  return (
    <>
      <option value="" disabled>Selecione</option>
      <option value="solteiro">Solteiro</option>
      <option value="casado">Casado</option>
      <option value="viuvo">Viúvo</option>
      <option value="divorciado">Divorciado</option>
    </>
  )
}

/** Opções do sexo (iguais nos três templates). */
export function SexoOptions() {
  return (
    <>
      <option value="" disabled>Selecione</option>
      <option value="masculino">Masculino</option>
      <option value="feminino">Feminino</option>
      <option value="outro">Outro</option>
    </>
  )
}

/** Opções do grau de parentesco. */
export function ParentescoOptions() {
  return (
    <>
      <option value="" disabled>Selecione</option>
      <option value="filho(a)">Filho</option>
      <option value="conjuge">Cônjuge</option>
      <option value="pai">Pai</option>
      <option value="mae">Mãe</option>
      <option value="outro">Outro</option>
    </>
  )
}

/** O bloco que addDependente() inseria em #dependentes-container. */
function Dependente({ onRemove, calcIdade }) {
  return (
    <div className="dependente">
      <div className="form-row">
        <div className="form-group">
          <label>Nome do Dependente:</label>
          <input type="text" name="nome_dependente[]" required />
        </div>
        <div className="form-group">
          <label>CPF do Dependente:</label>
          <input type="text" name="cpf_dependente[]" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Data de Nascimento:</label>
          <input type="date" name="dt_nascimento_dependente[]" className="data-nascimento-dependente" required
            onChange={(e) => calcularIdadeEBuscarPrecoDependente(e.currentTarget, calcIdade)} />
        </div>
        <div className="form-group">
          <label>Idade:</label>
          <input type="number" name="idade_dependente[]" className="idade-dependente" readOnly />
        </div>
        <div className="form-group">
          <label>Valor do Dependente:</label>
          <input type="text" name="valor_dependente[]" className="valor-dependente" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Grau de Parentesco:</label>
          <select name="grau_parentesco_dependente[]" required defaultValue="">
            <ParentescoOptions />
          </select>
        </div>
        <div className="form-group">
          <label>Nome da mãe do Dependente:</label>
          <input type="text" name="mae_dependente[]" required />
        </div>
        <div className="form-group">
          <label htmlFor="dependente_sexo[]">Sexo:</label>
          <select id="dependente_sexo[]" name="dependente_sexo[]" required defaultValue="">
            <SexoOptions />
          </select>
        </div>
      </div>
      <div className="dependente-actions">
        <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>
          <i className="fa-solid fa-trash-can" aria-hidden="true" /> Remover Dependente
        </button>
      </div>
    </div>
  )
}

/** Seção "Informações dos Dependentes" (addDependente / removeDependente). */
export function DependentesSection({ tabs, calcIdade = calcularIdade }) {
  const [dependentes, setDependentes] = useState([])
  const nextId = useRef(1)
  const addDependente = () => {
    const id = nextId.current++
    setDependentes((d) => [...d, id])
  }
  const removeDependente = (id) => setDependentes((d) => d.filter((x) => x !== id))
  return (
    <div className={tabs.sectionClass(2)} id="section-dependentes">
      <div className="card">
        <SectionTitle icon="fa-users">Informações dos Dependentes</SectionTitle>
        <div id="dependentes-container">
          {dependentes.map((id) => (
            <Dependente key={id} calcIdade={calcIdade} onRemove={() => removeDependente(id)} />
          ))}
        </div>
        <button type="button" className="btn btn-secondary" onClick={addDependente}>
          <i className="fa-solid fa-user-plus" aria-hidden="true" /> Adicionar Dependente
        </button>
        <NavButtons tabs={tabs} back={1} next={3} />
      </div>
    </div>
  )
}

/** Seção de venda (valor, forma de pagamento, taxa de adesão, salvar). */
export function VendaSection({ tabs }) {
  return (
    <div className={tabs.sectionClass(3)} id="section-venda">
      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="valor_venda">Valor da venda:</label>
            <input type="text" id="valor_venda" name="valor_venda" />
          </div>

          <div className="form-group">
            <label htmlFor="forma_pagamento">Forma de pagamento da venda:</label>
            <select id="forma_pagamento" name="forma_pagamento" required defaultValue="">
              <option value="" disabled>Selecione</option>
              <option value="PIX">PIX</option>
              <option value="especie">Espécie</option>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="taxa_adesao">Com taxa de adesao?</label>
            <select id="taxa_adesao" name="taxa_adesao" required defaultValue="">
              <option value="" disabled>Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Nao</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => tabs.showTab(2)}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar
          </button>
          <button type="submit" className="btn" onClick={tabs.mostrarTodasAbas}>
            <i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Salvar Contrato
          </button>
        </div>
      </div>
    </div>
  )
}

/** Opções "Selecione" + vendedores + corretoras + Administrativo. */
export function CorretorOptions({ vendedor, corretora, usuarioSessao, marcarSessao }) {
  return (
    <>
      <option value="" disabled>Selecione</option>
      {vendedor.map((v, i) => (
        <option key={'v' + i} value={show(v.nome)}
          {...(marcarSessao && v.nome === usuarioSessao ? { 'data-sessao': 'true' } : {})}>
          {show(v.nome)}
        </option>
      ))}
      {corretora.map((c, i) => (
        <option key={'c' + i} value={show(c.nome_corretora)}>{show(c.nome_corretora)}</option>
      ))}
      <option value="administrativo">Administrativo</option>
    </>
  )
}

/**
 * Campo "Corretor Responsável" com a opção "Usar meu nome" (vendas_form e
 * vendas_form_pj).
 */
export function CorretorField({ vendedor, corretora, usuarioSessao }) {
  return (
    <div className="form-group">
      <label htmlFor="corretor_resp">Corretor Responsável:</label>
      <div className="corretor-row">
        <select id="corretor_resp" name="corretor_resp" required defaultValue="" onChange={onCorretorChange}>
          <CorretorOptions vendedor={vendedor} corretora={corretora} usuarioSessao={usuarioSessao} marcarSessao />
        </select>
        {truthy(usuarioSessao) && (
          <label className="check-label">
            <input type="checkbox" id="usar_sessao_corretor" onChange={toggleUsarSessaoCorretor} />
            Usar meu nome ({show(usuarioSessao)})
          </label>
        )}
      </div>
    </div>
  )
}

/** Seção do titular de vendas_form / vendas_form_pj (idênticas). */
export function TitularSection({ tabs }) {
  return (
    <div className={tabs.sectionClass(1)} id="section-titular">
      <div className="card">
        <SectionTitle icon="fa-user">Informações do Titular</SectionTitle>
        <div className="form-group">
          <label htmlFor="nome_beneficiario">Nome do Titular:</label>
          <input type="text" id="nome_beneficiario" name="nome_beneficiario" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cpf_beneficiario">CPF do Titular:</label>
            <input type="text" id="cpf_beneficiario" name="cpf_beneficiario" required />
          </div>
          <div className="form-group">
            <label htmlFor="rg_titular">RG do Titular:</label>
            <input type="text" id="rg_titular" name="rg_titular" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dt_nascimento_beneficiario">Data de Nascimento:</label>
            <input type="date" id="dt_nascimento_beneficiario" name="dt_nascimento_beneficiario" required
              onChange={() => calcularIdadeEBuscarPrecoTitular(calcularIdade)} />
          </div>
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
  )
}

/** Campo "Numero do CEP" / "CEP da empresa" com o botão de busca. */
export function CepField({ label }) {
  return (
    <div className="form-group">
      <label htmlFor="cep_responsavel">{label}</label>
      <div className="input-group">
        <input type="text" id="cep_responsavel" name="cep_responsavel" required onBlur={buscarCepResponsavel} />
        <button type="button" id="btn-buscar-cep" className="btn btn-secondary" title="Buscar endereço pelo CEP"
          aria-label="Buscar endereço pelo CEP" onClick={buscarCepResponsavel}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
