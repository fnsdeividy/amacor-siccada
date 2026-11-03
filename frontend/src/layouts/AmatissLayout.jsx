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
  ['auditoria-submenu', 'Auditoria 📋 ', [
    [urlFor('vendas.render_tipo_venda'), 'Auditoria app'],
    [urlFor('amatiss.render_aut_cpx'), 'Alta complexidade'],
    [urlFor('vendas.informar_cnt'), 'Manutenção de beneficiarios'],
  ]],
  ['manutencao-submenu', 'gerir usuarios 👥 ', [
    [urlFor('vendas.render_tipo_venda'), 'administrar acesso ao app'],
  ]],
  ['gerencial-submenu', 'Gerencial 👨‍💼', [
    [urlFor('gerencial.processar_csv_form'), 'gerar relatorio'],
    [urlFor('cad.form_atualizar_data'), 'atualizar tabela '],
    [urlFor('cad.exibir_credenciadas'), 'Editar credenciadas'],
  ]],
]

const loaderCss = `
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10% {
    transform: scale(1.15);
  }
  20% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.12);
  }
  40% {
    transform: scale(1);
  }
}
`

/**
 * Layout generic/base_amatiss.html: igual ao base1 (barra superior, modal de
 * perfil, papel de parede, alerta de flash), mas com o menu lateral
 * "autorização". O loader de tela cheia sumia no window.load; aqui a página
 * já está carregada quando o componente aparece, então ele não é renderizado.
 */
export default function AmatissLayout({ title = 'Inicial', children }) {
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
        <h1>autorização</h1>
        {SUBMENUS.map(([id, label, links]) => (
          <div key={id} style={{ display: 'contents' }}>
            <a href="#" onClick={toggleSubmenu(id)}>{label}</a>
            <div className={'submenu' + (submenus[id] ? ' show' : '')} id={id}>
              {links.map(([href, text], i) => (
                <AppLink key={i} href={href}>{text}</AppLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="content" id="content">
        {children}
      </div>
      <InlineStyle css={loaderCss} />
    </>
  )
}
