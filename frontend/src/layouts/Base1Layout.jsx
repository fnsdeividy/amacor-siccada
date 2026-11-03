import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLink from '../components/AppLink.jsx'
import FlashMessage, { alertCss } from '../components/FlashMessage.jsx'
import { apiFetch } from '../lib/api.js'
import { usePage } from '../lib/page.jsx'
import { urlFor } from '../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../lib/useStylesheet.jsx'

const DEFAULT_BACKGROUND = '/static/image/726999-windows-xp-desktop-backgrounds-1920x1200-for-4k-monitor.jpg'

function applyBackground(url) {
  const img = new Image()
  img.src = url
  img.onload = () => {
    const s = document.body.style
    s.backgroundImage = `url('${url}')`
    s.backgroundRepeat = 'no-repeat'
    s.backgroundAttachment = 'fixed'
    s.backgroundSize = 'cover'
    s.backgroundPosition = 'center'
  }
}

function ProfileModal({ open, onClose, session }) {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)

  useEffect(() => {
    if (!open) return
    apiFetch('/generic/api/user/profile-photo')
      .then((r) => r.json())
      .then((data) => setPhoto(data.foto_url ? encodeURI(data.foto_url) : null))
      .catch(() => setPhoto(null))
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const nome = session.user_nome
  const classe = session.classe_usuario
  const tipo = session.tipo_usuario
  return (
    <div className={'profile-modal' + (open ? ' active' : '')} id="profileModal"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="profile-content">
        <div className="profile-header">
          <button className="profile-close" id="closeProfileModal" onClick={onClose}>✖</button>
          <div className="profile-header-actions">
            <button className="personalize-bg-btn" onClick={() => navigate(urlFor('generic.escolher_wllpp'))} title="Personalizar papel de parede">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
              </svg>
            </button>
          </div>
          <div className="profile-avatar">
            <div className="avatar-circle">
              <div id="avatar-container">
                {photo ? (
                  <img src={photo} alt="Foto de perfil" className="avatar-image" onError={() => setPhoto(null)} />
                ) : (
                  <span className="avatar-initial" id="avatar-initial" style={{ display: 'flex' }}>
                    {nome ? nome[0] : 'U'}
                  </span>
                )}
              </div>
            </div>
            <button className="edit-avatar-btn" onClick={() => navigate(urlFor('generic.render_definir_perfil'))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
              </svg>
            </button>
          </div>
          <h2 className="profile-name">{nome || 'Usuário'}</h2>
          <div className="profile-badge">{classe ?? 'Usuário'}</div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Nome:</span>
            <span className="detail-value">{nome || 'Não informado'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Tipo:</span>
            <span className="detail-value">{tipo ?? 'Não informado'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Categoria:</span>
            <span className="detail-value">{classe ?? 'Não informada'}</span>
          </div>
        </div>

        <div className="profile-actions">
          <AppLink className="profile-btn primary" href={urlFor('auth.mudar_senha')}>
            <span className="profile-icon">🔒</span>
            Alterar senha
          </AppLink>
          {classe === 'supervisor' && (
            <>
              <AppLink className="profile-btn secondary" href={urlFor('auth.cadastrar')}>
                <span className="profile-icon">👤</span>
                Adicionar usuário
              </AppLink>
              {(tipo === 'financeiro' || tipo === 'vendas') && (
                <AppLink className="profile-btn secondary" href={urlFor('auth.cadastrar_corretora')}>
                  <span className="profile-icon">🏢</span>
                  Cadastrar Corretoras
                </AppLink>
              )}
            </>
          )}
          <button className="logout-btn" onClick={() => navigate(urlFor('auth.logoff'))}>Sair</button>
        </div>
      </div>
    </div>
  )
}

const SUBMENUS = [
  ['vendas-submenu', 'Comercial 📋 ', [
    [urlFor('vendas.render_tipo_venda'), 'Nova venda'],
    [urlFor('vendas.informar_cnt'), 'Inclusão de beneficiario'],
    ['https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp', 'Verificar CPF na Receita', true],
    ['https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp', 'Verificar CNPJ na Receita', true],
    [urlFor('vendas.cpf'), 'Verificar elegibilidade de CPF'],
    [urlFor('auth.redir_atent'), 'Acompanhamento de Contratos'],
  ]],
  ['cadastro-submenu', 'Cadastro 📄', [
    [urlFor('doc_gen.render_gerar_kit'), 'gerar kit'],
    [urlFor('cad.acompanhar_cnt', { lista: 'todos', filtro: 'sim' }), 'filtrar contratos'],
    [urlFor('pdfgen.create_card'), 'criar carteirinha'],
    [urlFor('doc_gen.render_cpt'), 'Formatar aditivo de CPT'],
    [urlFor('cad.exibir_credenciadas'), 'Editar credenciadas'],
    [urlFor('cad.d3_beneficiarios'), 'Relatorio D3'],
    [urlFor('cad.render_menu_manutencao_beneficiarios'), 'manutenção de beneficiários'],
  ]],
  ['gerencial-submenu', 'Gerencial 👨‍💼', [
    [urlFor('gerencial.processar_csv_form'), 'gerar relatorio'],
    [urlFor('cad.form_atualizar_data'), 'atualizar banco '],
    [urlFor('gerencial.render_relatorio_concessionarias'), 'Vendas de Concessionarias'],
  ]],
  ['autorizacao-submenu', 'Autorização 👨‍💼', [
    [urlFor('amatiss.home'), 'Autorizador Amatiss'],
    [urlFor('amatiss.render_aut_cpx'), 'Autorizações de Alta Complexidade'],
  ]],
  ['financeiro-submenu', 'Financeiro 💰', [
    [urlFor('finan.pix'), 'Lançar Pagamento'],
    [urlFor('finan.tab', { status: 'efetuado' }), 'Conferencia de pagamento'],
    [urlFor('doc_gen.processar_csv_form'), 'gerar prevencimento'],
    [urlFor('finan.render_cancelamento_boletos'), 'relatorio de boletos'],
  ]],
  ['enfermagem-submenu', 'Enfermagem 👩🏻‍⚕️', [
    [urlFor('enfermagem.declaracao'), 'lançar entrevista'],
  ]],
]

/**
 * Layout generic/base1.html: barra superior, menu lateral de setores,
 * modal de perfil, papel de parede do usuário e alerta de flash.
 * O título vem do {% block title %} de cada template (padrão "Inicial").
 */
export default function Base1Layout({ title = 'Inicial', children }) {
  useStylesheet('/static/css/estilos.css')
  const page = usePage()
  const session = page?.session ?? {}
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [submenus, setSubmenus] = useState({})
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    try {
      const cached = localStorage.getItem('userBackground')
      if (cached) applyBackground(cached)
    } catch { /* sem localStorage */ }
    apiFetch('/generic/api/user/background')
      .then((r) => r.json())
      .then((data) => {
        if (data.background_url) {
          try { localStorage.setItem('userBackground', data.background_url) } catch { /* ignora */ }
          applyBackground(data.background_url)
        }
      })
      .catch(() => applyBackground(DEFAULT_BACKGROUND))
  }, [])

  const toggleSubmenu = (id) => (e) => {
    e.preventDefault()
    setSubmenus((s) => ({ ...s, [id]: !s[id] }))
  }

  return (
    <>
      <InlineStyle css={alertCss} />
      <FlashMessage />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} session={session} />

      <nav className="navbar">
        <button className="menu-toggle" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
        <span className="menu-title">SICCADA: {title}</span>
        <div className="user-info">
          <span className="user-profile-link" onClick={() => setProfileOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="2" fill="#fff" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#fff" strokeWidth="2" fill="none" />
            </svg>
            {session.user_nome}
          </span>
        </div>
      </nav>

      <div className={'sidebar' + (sidebarOpen ? ' active' : '')} id="sidebar">
        <button className="close-btn" onClick={() => setSidebarOpen((v) => !v)}>✖</button>
        <h1>Setores</h1>
        {SUBMENUS.map(([id, label, links]) => (
          <div key={id} style={{ display: 'contents' }}>
            <a href="#" onClick={toggleSubmenu(id)}>{label}</a>
            <div className={'submenu' + (submenus[id] ? ' show' : '')} id={id}>
              {links.map(([href, text, external]) => (
                <AppLink key={href} href={href} {...(external ? { target: '_blank' } : {})}>{text}</AppLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="content" id="content">
        {children}
      </div>
    </>
  )
}
