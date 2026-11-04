// gerencial/render_relatorio_concessionarias.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from '../geradores/estilo.js'

export default function RenderRelatorioConcessionarias() {
  const ctx = useTemplateContext()
  return (
    <WindowLayout title="Gerar Proposta">
      <InlineStyle css={cssGerador} />
      <div className="gerador">
        <span className="gerador-icone"><i className="fa-solid fa-filter" aria-hidden="true" /></span>
        <h1>
          Filtragem de Corretora
        </h1>
        <p className="gerador-texto">Deixe vazio para não filtrar</p>

        <ApiForm method="POST" action={urlFor('gerencial.render_relatorio_concessionarias')}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="data_ref">Data de Início:</label>
              <input type="date" id="data_ref" name="data_ref" />
            </div>

            <div className="form-group">
              <label htmlFor="corretora">Corretora Responsável</label>
              <select name="corretora" id="corretora" defaultValue="">
                <option value="" disabled>selecione</option>
                {truthy(ctx.corretora_ext) && ctx.corretora_ext.map((c, i) => (
                  <option key={i} value={show(c.nome_corretora)}>{show(c.nome_corretora)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="gerador-acoes">
            <input type="submit" value="Gerar Relatório" className="btn" />
          </div>
        </ApiForm>
      </div>
    </WindowLayout>
  )
}
