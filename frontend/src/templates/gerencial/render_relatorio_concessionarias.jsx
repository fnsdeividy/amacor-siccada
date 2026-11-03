// gerencial/render_relatorio_concessionarias.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function RenderRelatorioConcessionarias() {
  const ctx = useTemplateContext()
  return (
    <WindowLayout title="Gerar Proposta">
      <h1>
        Filtragem de Corretora
      </h1>
      <p>Deixe vazio para não filtrar</p>
      <br /><br />

      <ApiForm method="POST" action={urlFor('gerencial.render_relatorio_concessionarias')}>
        <label htmlFor="data_ref">Data de Início:</label>
        <input type="date" id="data_ref" name="data_ref" />

        <label htmlFor="corretora">Corretora Responsável</label>
        <select name="corretora" id="corretora" defaultValue="">
          <option value="" disabled>selecione</option>
          {truthy(ctx.corretora_ext) && ctx.corretora_ext.map((c, i) => (
            <option key={i} value={show(c.nome_corretora)}>{show(c.nome_corretora)}</option>
          ))}
        </select>
        <br /><br />
        <input type="submit" value="Gerar Relatório" className="btn" />
      </ApiForm>
    </WindowLayout>
  )
}
