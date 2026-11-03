// generic/esqueci_senha.html (página própria, sem layout)
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import { useBodyClass } from '../../lib/useBodyClass.js'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

export default function EsqueciSenha() {
  useStylesheet('/static/css/estilos_login.css')
  useBodyClass('login-body')
  return (
    <div className="divisoria">
      <AppLink className="voltar" href={urlFor('auth.login')}>voltar</AppLink>
      <h1>Alteração de senha</h1><br /><br />
      <ApiForm action={urlFor('auth.esqueci_senha')} method="POST">
        <label htmlFor="email">informe o email para contato:</label>
        <input type="email" id="email" name="email" required /><br /><br />
        <input className="envia2" type="submit" defaultValue="Enviar" />
      </ApiForm>
    </div>
  )
}
