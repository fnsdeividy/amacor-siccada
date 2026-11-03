// generic/profile.html (renderizado como 'profile.html')
import AppLink from '../components/AppLink.jsx'
import Base1Layout from '../layouts/Base1Layout.jsx'
import { show, truthy } from '../lib/jinja.js'
import { useTemplateContext } from '../lib/page.jsx'
import { urlFor } from '../lib/urlFor.js'
import { InlineStyle } from '../lib/useStylesheet.jsx'

const css = `
.profile-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 20px;
    
}

.profile-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 480px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.profile-header {
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    color: white;
    padding: 30px 20px;
    text-align: center;
    position: relative;
}

.profile-avatar {
    margin-bottom: 15px;
}

.avatar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 3px solid rgba(255, 255, 255, 0.3);
}

.avatar-initial {
    font-size: 32px;
    font-weight: bold;
}

.profile-name {
    margin: 10px 0 5px;
    font-size: 24px;
    font-weight: 600;
}

.profile-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
}

.profile-details {
    padding: 25px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 500;
    color: #555;
}

.detail-value {
    color: #333;
    font-weight: 600;
}

.profile-actions {
    padding: 0 25px 25px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    gap: 8px;
}

.action-btn.primary {
    background-color: #4a6cf7;
    color: white;
}

.action-btn.primary:hover {
    background-color: #3a5ce5;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(74, 108, 247, 0.3);
}

.action-btn.secondary {
    background-color: #f0f4ff;
    color: #4a6cf7;
    border: 1px solid #d0dcff;
}

.action-btn.secondary:hover {
    background-color: #e1e9ff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(74, 108, 247, 0.15);
}

/* Ícones simples usando CSS */
.icon-lock::before {
    content: "🔒";
}

.icon-user-plus::before {
    content: "👤";
}

.icon-building::before {
    content: "🏢";
}

/* Responsividade */
@media (max-width: 576px) {
    .profile-container {
        padding: 10px;
    }
    
    .profile-card {
        max-width: 100%;
    }
    
    .profile-header {
        padding: 25px 15px;
    }
    
    .profile-details, .profile-actions {
        padding: 20px 15px;
    }
}
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
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <span className="avatar-initial">{truthy(nome) ? show(nome[0]) : 'U'}</span>
              </div>
            </div>
            <h1 className="profile-name">{or(nome, 'Usuário')}</h1>
            <div className="profile-badge">{or(ctx.classe_usuario, 'Usuário')}</div>
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
            <AppLink className="action-btn primary" href={urlFor('auth.mudar_senha')}>
              <i className="icon-lock"></i>
              Alterar senha
            </AppLink>

            {ctx.classe_usuario === 'supervisor' && (
              <>
                <AppLink className="action-btn secondary" href={urlFor('auth.cadastrar')}>
                  <i className="icon-user-plus"></i>
                  Adicionar usuário
                </AppLink>

                {ctx.tipo_usuario === 'vendas' && (
                  <AppLink className="action-btn secondary" href={urlFor('auth.cadastrar_corretora')}>
                    <i className="icon-building"></i>
                    Cadastrar Corretoras
                  </AppLink>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <InlineStyle css={css} />
    </Base1Layout>
  )
}
