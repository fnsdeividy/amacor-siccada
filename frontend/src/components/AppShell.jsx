import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { usePage } from '../lib/page.jsx'
import { urlFor } from '../lib/urlFor.js'
import AppLink from './AppLink.jsx'
import { LOGO } from './Loader.jsx'
import Toast from './Toast.jsx'


/**
 * Moldura de todas as telas internas: menu lateral fixo (some em telas
 * pequenas), cabeçalho com o título da tela e menu do usuário, e avisos.
 *
 * menu: [{ id, label, icon, links: [{ href, label, external }] }]
 */
export default function AppShell({ title, menu, children }) {
  const page = usePage()
  const session = page?.session ?? {}
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const current = location.pathname + location.search

  // abre o grupo do menu que contém a tela atual
  const [openGroups, setOpenGroups] = useState(() => {
    const found = menu.find((g) => g.links.some((l) => l.href.split('?')[0] === location.pathname))
    return found ? { [found.id]: true } : {}
  })

  useEffect(() => { setSidebarOpen(false) }, [location.pathname, location.search])

  return (
    <div className={'app-shell' + (sidebarOpen ? ' sidebar-open' : '')}>
      <aside className="app-sidebar" data-chrome="">
        <AppLink className="app-brand" href={urlFor('auth.login_redir')}>
          <svg viewBox="0 0 300 300" fill="none" stroke="#ffffff" strokeWidth="14" aria-hidden="true">
            <path d={LOGO} />
          </svg>
          <span className="app-brand-name">
            SICCADA
            <span className="app-brand-sub">Amacor Saúde</span>
          </span>
        </AppLink>

        <nav className="app-nav" aria-label="Menu principal">
          {menu.map((group) => (
            <div key={group.id} className={'app-nav-group' + (openGroups[group.id] ? ' open' : '')}>
              <button type="button" className="app-nav-toggle"
                aria-expanded={Boolean(openGroups[group.id])}
                onClick={() => setOpenGroups((s) => ({ ...s, [group.id]: !s[group.id] }))}>
                <i className={'app-nav-icon fa-solid ' + group.icon} aria-hidden="true" />
                {group.label}
                <i className="app-nav-caret fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
              <div className="app-nav-links">
                {group.links.map((link) => (
                  link.external ? (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                    </a>
                  ) : (
                    <AppLink key={link.href + link.label} href={link.href}
                      className={link.href === current ? 'active' : undefined}>
                      {link.label}
                    </AppLink>
                  )
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="app-sidebar-footer">Sistema interno · Amacor</div>
      </aside>
      <div className="app-backdrop" onClick={() => setSidebarOpen(false)} />

      <div className="app-main">
        <header className="app-header" data-chrome="">
          <button type="button" className="icon-btn app-menu-button" aria-label="Abrir menu"
            onClick={() => setSidebarOpen((v) => !v)}>
            <i className="fa-solid fa-bars" aria-hidden="true" />
          </button>
          <h1 className="app-header-title">{title}</h1>
          <div className="app-header-spacer" />
          <UserMenu session={session} />
        </header>
        <Toast />
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}

function UserMenu({ session }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [photo, setPhoto] = useState(null)
  const ref = useRef(null)
  const nome = session.user_nome || 'Usuário'
  const classe = session.classe_usuario
  const tipo = session.tipo_usuario

  useEffect(() => {
    if (!open) return undefined
    apiFetch('/generic/api/user/profile-photo')
      .then((r) => r.json())
      .then((data) => setPhoto(data.foto_url ? encodeURI(data.foto_url) : null))
      .catch(() => setPhoto(null))
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (href) => { setOpen(false); navigate(href) }
  const inicial = nome[0]?.toUpperCase() ?? 'U'

  return (
    <div className="user-menu" ref={ref}>
      <button type="button" className="user-menu-button" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((v) => !v)}>
        <span className="avatar">{inicial}</span>
        <span>{nome}</span>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: 'var(--gray-400)' }} aria-hidden="true" />
      </button>
      {open && (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-head">
            <span className="avatar avatar-lg">
              {photo ? <img src={photo} alt="" onError={() => setPhoto(null)} /> : inicial}
            </span>
            <div>
              <div className="user-menu-name">{nome}</div>
              <div className="user-menu-role">{[tipo, classe].filter(Boolean).join(' · ') || 'Usuário'}</div>
            </div>
          </div>
          <div className="user-menu-items">
            <button type="button" onClick={() => go(urlFor('generic.render_definir_perfil'))}>
              <i className="fa-solid fa-camera" aria-hidden="true" /> Foto de perfil
            </button>
            <button type="button" onClick={() => go(urlFor('auth.mudar_senha'))}>
              <i className="fa-solid fa-key" aria-hidden="true" /> Alterar senha
            </button>
            {classe === 'supervisor' && (
              <>
                <button type="button" onClick={() => go(urlFor('auth.cadastrar'))}>
                  <i className="fa-solid fa-user-plus" aria-hidden="true" /> Adicionar usuário
                </button>
                {(tipo === 'financeiro' || tipo === 'vendas') && (
                  <button type="button" onClick={() => go(urlFor('auth.cadastrar_corretora'))}>
                    <i className="fa-solid fa-building" aria-hidden="true" /> Cadastrar corretoras
                  </button>
                )}
              </>
            )}
            <div className="user-menu-sep" />
            <button type="button" className="danger" onClick={() => go(urlFor('auth.logoff'))}>
              <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" /> Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
