// generic/profile.html (renderizado como 'profile.html')
import AppLink from '../components/AppLink.jsx'
import Base1Layout from '../layouts/Base1Layout.jsx'
import { show, truthy } from '../lib/jinja.js'
import { useTemplateContext } from '../lib/page.jsx'
import { urlFor } from '../lib/urlFor.js'
import { InlineStyle } from '../lib/useStylesheet.jsx'

const css = `
.profile-container { display: flex; justify-content: center; padding: var(--space-6) 0; }
.profile-card { width: 100%; max-width: 480px; padding: 0; overflow: hidden; }
.profile-card .profile-header {
  padding: var(--space-8) var(--space-6) var(--space-6);
  text-align: center;
  border-bottom: 1px solid var(--border);
}
.profile-card .profile-avatar { margin-bottom: var(--space-3); }
.profile-card .avatar-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  color: var(--white);
  background: var(--brand-900);
}
.profile-card .avatar-initial { font-size: var(--text-2xl); font-weight: 600; }
.profile-card .profile-name { margin: 0 0 var(--space-2); font-size: var(--text-xl); }
.profile-card .profile-badge { text-transform: capitalize; background: var(--brand-50); color: var(--brand-700); }
.profile-card .profile-details { padding: var(--space-3) var(--space-6); }
.profile-card .profile-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--border);
  background: var(--gray-50);
}
.profile-card .profile-actions .btn { width: 100%; }
`

/** {{ x or 'padrão' }} */
function or(value, fallback) {
  return truthy(value) ? show(value) : fallback
}

export default function Profile() {
  const ctx = useTemplateContext()
  const nome = ctx.usuario_nome
  return (
    <Base1Layout title="Perfil">
      <InlineStyle css={css} />
      <div className="profile-container">
        <div className="card profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <span className="avatar-initial">{truthy(nome) ? show(nome[0]) : 'U'}</span>
              </div>
            </div>
            <h1 className="profile-name">{or(nome, 'Usuário')}</h1>
            <div className="badge profile-badge">{or(ctx.classe_usuario, 'Usuário')}</div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Nome:</span>
              <span className="detail-value">{or(nome, 'Não informado')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tipo:</span>
              <span className="detail-value">{or(ctx.tipo_usuario, 'Não informado')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Categoria:</span>
              <span className="detail-value">{or(ctx.classe_usuario, 'Não informada')}</span>
            </div>
          </div>

          <div className="profile-actions">
            <AppLink className="btn action-btn primary" href={urlFor('auth.mudar_senha')}>
              <i className="fa-solid fa-lock" aria-hidden="true"></i>
              Alterar senha
            </AppLink>

            {ctx.classe_usuario === 'supervisor' && (
              <>
                <AppLink className="btn btn-secondary action-btn" href={urlFor('auth.cadastrar')}>
                  <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
                  Adicionar usuário
                </AppLink>

                {ctx.tipo_usuario === 'vendas' && (
                  <AppLink className="btn btn-secondary action-btn" href={urlFor('auth.cadastrar_corretora')}>
                    <i className="fa-solid fa-building" aria-hidden="true"></i>
                    Cadastrar Corretoras
                  </AppLink>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
