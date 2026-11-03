// generic/render_definir_perfil.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function RenderDefinirPerfil() {
  const ctx = useTemplateContext()
  // o original não fechava as <div> dentro do <h1>; o navegador as fechava no </h1>
  return (
    <WindowLayout title="Gerar Proposta">
      <h1>
        Definir uma nova foto de perfil para:   <div style={{ color: 'rgb(47, 130, 141)' }}><strong>{show(ctx.nome_usuario)}</strong><div></div></div>
      </h1>
      <p>Selecione a mída para ser sua nova foto de perfil</p>
      <br /><br />
      <ApiForm action={urlFor('generic.definir_perfil')} method="POST" encType="multipart/form-data">
        <label htmlFor="arquivos">Selecione o documento para upload:</label>
        <input type="file" name="arquivos" id="arquivos" required /><br /><br />
        <button className="btn" type="submit">Enviar</button>
      </ApiForm>
    </WindowLayout>
  )
}
