import { urlFor } from '../lib/urlFor.js'

// Menus laterais. Os links são os mesmos dos layouts do sistema antigo
// (base1.html, base.html e base_amatiss.html); só os rótulos foram limpos.

const RECEITA_CPF = 'https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp'
const RECEITA_CNPJ = 'https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp'

/** base1.html / window.html: o menu de setores, usado na maioria das telas. */
export function menuPrincipal() {
  return [
    { id: 'comercial', label: 'Comercial', icon: 'fa-briefcase', links: [
      { href: urlFor('vendas.render_tipo_venda'), label: 'Nova venda' },
      { href: urlFor('vendas.informar_cnt'), label: 'Inclusão de beneficiário' },
      { href: urlFor('vendas.cpf'), label: 'Elegibilidade de CPF' },
      { href: urlFor('auth.redir_atent'), label: 'Acompanhamento de contratos' },
      { href: RECEITA_CPF, label: 'CPF na Receita', external: true },
      { href: RECEITA_CNPJ, label: 'CNPJ na Receita', external: true },
    ] },
    { id: 'cadastro', label: 'Cadastro', icon: 'fa-id-card', links: [
      { href: urlFor('doc_gen.render_gerar_kit'), label: 'Gerar kit' },
      { href: urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' }), label: 'Filtrar contratos' },
      { href: urlFor('pdfgen.create_card'), label: 'Criar carteirinha' },
      { href: urlFor('doc_gen.render_cpt'), label: 'Aditivo de CPT' },
      { href: urlFor('cad.exibir_credenciadas'), label: 'Credenciadas' },
      { href: urlFor('cad.d3_beneficiarios'), label: 'Relatório D3' },
      { href: urlFor('cad.render_menu_manutencao_beneficiarios'), label: 'Manutenção de beneficiários' },
    ] },
    { id: 'gerencial', label: 'Gerencial', icon: 'fa-chart-line', links: [
      { href: urlFor('gerencial.processar_csv_form'), label: 'Gerar relatório' },
      { href: urlFor('cad.form_atualizar_data'), label: 'Atualizar banco' },
      { href: urlFor('gerencial.render_relatorio_concessionarias'), label: 'Vendas de concessionárias' },
    ] },
    { id: 'autorizacao', label: 'Autorização', icon: 'fa-file-circle-check', links: [
      { href: urlFor('amatiss.home'), label: 'Autorizador Amatiss' },
      { href: urlFor('amatiss.render_aut_cpx'), label: 'Alta complexidade' },
    ] },
    { id: 'financeiro', label: 'Financeiro', icon: 'fa-wallet', links: [
      { href: urlFor('finan.pix'), label: 'Lançar pagamento' },
      { href: urlFor('finan.tab', { status: 'efetuado' }), label: 'Conferência de pagamentos' },
      { href: urlFor('doc_gen.processar_csv_form'), label: 'Gerar pré-vencimento' },
      { href: urlFor('finan.render_cancelamento_boletos'), label: 'Relatório de boletos' },
    ] },
    { id: 'enfermagem', label: 'Enfermagem', icon: 'fa-user-nurse', links: [
      { href: urlFor('enfermagem.declaracao'), label: 'Lançar entrevista' },
    ] },
  ]
}

/** base.html (layout mais antigo). */
export function menuBase() {
  return [
    { id: 'vendas', label: 'Vendas', icon: 'fa-briefcase', links: [
      { href: urlFor('vendas.nova_venda'), label: 'Nova venda' },
      { href: urlFor('vendas.cpf'), label: 'Elegibilidade de CPF' },
      { href: urlFor('auth.redir_atent'), label: 'Acompanhamento de contratos' },
      { href: RECEITA_CPF, label: 'CPF na Receita', external: true },
      { href: RECEITA_CNPJ, label: 'CNPJ na Receita', external: true },
    ] },
    { id: 'cadastro', label: 'Cadastro / Adm', icon: 'fa-id-card', links: [
      { href: urlFor('doc_gen.gerar_documentos'), label: 'Gerar kit' },
      { href: urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' }), label: 'Contratos finalizados' },
    ] },
    { id: 'financeiro', label: 'Cobrança / Financeiro', icon: 'fa-wallet', links: [
      { href: urlFor('finan.pix'), label: 'Lançar pagamento' },
      { href: urlFor('finan.tab'), label: 'Conferência de pagamentos' },
      { href: urlFor('doc_gen.processar_csv_form'), label: 'Gerar pré-vencimento' },
    ] },
  ]
}

/** base_amatiss.html: área de autorização. */
export function menuAutorizacao() {
  return [
    { id: 'auditoria', label: 'Auditoria', icon: 'fa-clipboard-check', links: [
      { href: urlFor('vendas.render_tipo_venda'), label: 'Auditoria app' },
      { href: urlFor('amatiss.render_aut_cpx'), label: 'Alta complexidade' },
      { href: urlFor('vendas.informar_cnt'), label: 'Manutenção de beneficiários' },
    ] },
    { id: 'usuarios', label: 'Usuários', icon: 'fa-users', links: [
      { href: urlFor('vendas.render_tipo_venda'), label: 'Acesso ao app' },
    ] },
    { id: 'gerencial', label: 'Gerencial', icon: 'fa-chart-line', links: [
      { href: urlFor('gerencial.processar_csv_form'), label: 'Gerar relatório' },
      { href: urlFor('cad.form_atualizar_data'), label: 'Atualizar tabela' },
      { href: urlFor('cad.exibir_credenciadas'), label: 'Credenciadas' },
    ] },
  ]
}
