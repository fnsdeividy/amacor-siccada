// generic/login.html
import { useState } from 'react'
import ApiForm from '../components/ApiForm.jsx'
import AppLink from '../components/AppLink.jsx'
import FlashMessage from '../components/FlashMessage.jsx'
import { urlFor } from '../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../lib/useStylesheet.jsx'
import { useBodyClass } from '../lib/useBodyClass.js'

const css = `
.alert {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  padding: 15px; background-color: #4caf50; color: white; border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 1000; display: none;
  font-size: 16px; text-align: center; width: 80%; max-width: 400px;
}
.alert.error { background-color: #f44336; }
.alert.warning { background-color: #ff9800; }
.alert.info { background-color: #2196f3; }
`

export default function Login() {
  useStylesheet('/static/css/estilos_login.css')
  useBodyClass('login-body')
  const [sending, setSending] = useState(false)

  return (
    <>
      <InlineStyle css={css} />
      <FlashMessage zIndex={1000} />
      <div className="divisoria">
        <h1>Siccada</h1>
        <h2>Login</h2>
        <ApiForm action={urlFor('auth.login')} method="POST" onSubmit={() => setSending(true)}
          onResult={() => setSending(false)}>
          <br /><label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required /><br /><br />
          <label htmlFor="senha">Senha:</label>
          <input type="password" id="senha" name="senha" required /><br /><br />
          <button type="submit" className={'envia' + (sending ? ' sending' : '')} id="login-btn">Entrar</button>
        </ApiForm>
        <br /><br />
        <AppLink href={urlFor('auth.esqueci_senha')}>Esqueci minha senha</AppLink>
      </div>
    </>
  )
}
