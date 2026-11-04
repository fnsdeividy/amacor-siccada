// generic/render_definir_perfil.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { urlFor } from '../../lib/urlFor.js'

const css = `
.definir-perfil { max-width: 560px; }
.definir-perfil h1 { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-2); }
.definir-perfil .definir-perfil-nome { color: var(--brand-700); }
`

export default function RenderDefinirPerfil() {
  const ctx = useTemplateContext()
  return (
    <WindowLayout title="Gerar Proposta">
      <InlineStyle css={css} />
      <div className="definir-perfil">
        <h1>
          Definir uma nova foto de perfil para: <span className="definir-perfil-nome"><strong>{show(ctx.nome_usuario)}</strong></span>
        </h1>
        <p>Selecione a mída para ser sua nova foto de perfil</p>
        <ApiForm action={urlFor('generic.definir_perfil')} method="POST" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="arquivos">Selecione o documento para upload:</label>
            <input type="file" name="arquivos" id="arquivos" required />
          </div>
          <button className="btn" type="submit"><i className="fa-solid fa-upload" aria-hidden="true" /> Enviar</button>
        </ApiForm>
      </div>
    </WindowLayout>
  )
}
