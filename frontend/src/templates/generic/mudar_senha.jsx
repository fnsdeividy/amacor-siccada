// generic/mudar_senha.html (página própria, sem layout)
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import { useBodyClass } from '../../lib/useBodyClass.js'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

export default function MudarSenha() {
  useStylesheet('/static/css/estilos_login.css')
  useBodyClass('login-body')
  return (
    <div className="divisoria">
      <AppLink className="voltar" href={urlFor('auth.login')}>voltar</AppLink>
      <h1>Alteração de senha</h1><br /><br />
      <ApiForm action={urlFor('auth.mudar_senha')} method="POST">
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required /><br /><br />

        <label htmlFor="novasenha">Digite a nova senha:</label>
        <input type="password" id="novasenha" name="novasenha" /><br /><br />
        <br />
        <input className="envia2" type="submit" defaultValue="Cadastrar" />
      </ApiForm>
    </div>
  )
}
