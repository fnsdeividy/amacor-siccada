import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLink from '../components/AppLink.jsx'
import FlashMessage, { alertCss } from '../components/FlashMessage.jsx'
import { usePage } from '../lib/page.jsx'
import { urlFor } from '../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../lib/useStylesheet.jsx'

/**
 * Layout generic/base.html (o mais antigo): barra "Função Atual", menu
 * lateral próprio e alerta de flash. O título vem do {% block title %}
 * (padrão "Sistema").
 */
export default function BaseLayout({ title = 'Sistema', children }) {
  useStylesheet('/static/css/estilos.css')
  const { session = {} } = usePage() ?? {}
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [submenus, setSubmenus] = useState({})
  const toggleSubmenu = (id) => (e) => {
    e.preventDefault()
    setSubmenus((s) => ({ ...s, [id]: !s[id] }))
  }
  const sub = (id) => 'submenu' + (submenus[id] ? ' show' : '')

  return (
    <>
      <InlineStyle css={alertCss} />
      <FlashMessage />
      <nav className="navbar">
        <button className="menu-toggle" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
        <span className="menu-title">Função Atual: {title}</span>
        <div className="user-info">
          <span className="user-name"><AppLink href={urlFor('generic.profile')}>Usuário:</AppLink>{session.user_nome}</span>
        </div>
      </nav>

      <div className={'sidebar' + (sidebarOpen ? ' active' : '')} id="sidebar">
        <button className="close-btn" onClick={() => setSidebarOpen((v) => !v)}>✖</button>
        <h2></h2>

        <a href="#" onClick={toggleSubmenu('vendas-submenu')}>Vendas</a>
        <div className={sub('vendas-submenu')} id="vendas-submenu">
          <AppLink href={urlFor('vendas.nova_venda')}>Nova venda</AppLink>
          <a href="https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp" target="_blank">Verificar CPF na Receita</a>
          <a href="https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp" target="_blank">Verificar CNPJ na Receita</a>
          <AppLink href={urlFor('vendas.cpf')}>Verificar elegibilidade de CPF</AppLink>
          <AppLink href={urlFor('auth.redir_atent')}>Acompanhamento de Contratos</AppLink>
        </div>

        <a href="#" onClick={toggleSubmenu('cadastro-submenu')}>Cadastro/Adm</a>
        <div className={sub('cadastro-submenu')} id="cadastro-submenu">
          <AppLink href={urlFor('doc_gen.gerar_documentos')}>gerar kit</AppLink>
          <AppLink href={urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' })}>Contratos finalizados</AppLink>
        </div>

        <a href="#" onClick={toggleSubmenu('financeiro-submenu')}>Cobrança/Financeiro</a>
        <div className={sub('financeiro-submenu')} id="financeiro-submenu">
          <AppLink href={urlFor('finan.pix')}>Lançar Pagamento</AppLink>
          <AppLink href={urlFor('finan.tab')}>Conferencia de pagamento</AppLink>
          <AppLink href={urlFor('doc_gen.processar_csv_form')}>gerar prevencimento</AppLink>
        </div>
        <button className="logout-btn" onClick={() => navigate(urlFor('auth.logoff'))}>Sair</button>
      </div>

      {children}
    </>
  )
}
