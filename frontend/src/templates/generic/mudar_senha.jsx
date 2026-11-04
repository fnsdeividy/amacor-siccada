// generic/mudar_senha.html (página própria, sem layout)
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import { LOGO } from '../../components/Loader.jsx'
import Toast from '../../components/Toast.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function MudarSenha() {
  return (
    <div className="auth-page">
      <Toast />
      <aside className="auth-brand" data-chrome="">
        <svg viewBox="0 0 300 300" fill="none" stroke="#ffffff" strokeWidth="8" aria-hidden="true">
          <path d={LOGO} />
        </svg>
        <div>
          <div className="auth-brand-title">SICCADA</div>
          <div className="auth-brand-sub">Sistema de gestão de contratos · Amacor Saúde</div>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <h1>Alteração de senha</h1>
          <ApiForm action={urlFor('auth.mudar_senha')} method="POST">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" required autoComplete="username" />
            </div>
            <div className="form-group">
              <label htmlFor="novasenha">Digite a nova senha:</label>
              <input type="password" id="novasenha" name="novasenha" autoComplete="new-password" />
            </div>
            <input className="btn btn-lg auth-submit envia2" type="submit" value="Cadastrar" />
          </ApiForm>
          <div className="auth-footer">
            <AppLink className="voltar-link" href={urlFor('auth.login')}>
              <i className="fa-solid fa-arrow-left me-1" aria-hidden="true" />voltar
            </AppLink>
          </div>
        </div>
      </main>
    </div>
  )
}
