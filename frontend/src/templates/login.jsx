// generic/login.html
import { useState } from 'react'
import ApiForm from '../components/ApiForm.jsx'
import AppLink from '../components/AppLink.jsx'
import { LOGO } from '../components/Loader.jsx'
import Toast from '../components/Toast.jsx'
import { urlFor } from '../lib/urlFor.js'

export default function Login() {
  const [sending, setSending] = useState(false)

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
          <h1>Siccada</h1>
          <h2>Login</h2>
          <ApiForm action={urlFor('auth.login')} method="POST" onSubmit={() => setSending(true)}
            onResult={() => setSending(false)}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" required autoComplete="username" />
            </div>
            <div className="form-group">
              <label htmlFor="senha">Senha:</label>
              <input type="password" id="senha" name="senha" required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-lg auth-submit" id="login-btn" disabled={sending}>
              {sending && <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />}
              Entrar
            </button>
          </ApiForm>
          <div className="auth-footer">
            <AppLink href={urlFor('auth.esqueci_senha')}>Esqueci minha senha</AppLink>
          </div>
        </div>
      </main>
    </div>
  )
}
