// cadastro/alterar_infos/dependentes.html
import ApiForm from '../../../components/ApiForm.jsx'
import AppLink from '../../../components/AppLink.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { show } from '../../../lib/jinja.js'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../../../lib/useStylesheet.jsx'
import { pos } from '../_colunas.js'

const css = `
    h1{
        color: white
    }
`

const GRAUS = ['filho(a)', 'conjuge', 'pai', 'mae', 'outro']

export default function AlterarDependentes() {
  useStylesheet('/static/css/tabpix.css')
  const ctx = useTemplateContext()
  const d = (i) => pos(ctx.dados, 'dependentes', i)
  // o template compara o grau de parentesco com dados[8] (coluna sexo), como no original
  const grau = GRAUS.includes(d(8)) ? d(8) : undefined
  return (
    <Base1Layout title="Alterar dependente">
      <InlineStyle css={css} />
      <div className="container-tab-pix">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('cad.alterar_proposta', { proposta: ctx.proposta })}>{'<<'}</AppLink>
        </div>

        <h1>Alterar dependente #{show(d(1))}</h1>
        <ApiForm action={urlFor('cad.alterar_infos')} method="post">

          <label>Proposta:</label>
          <input type="text" name="numero_proposta" defaultValue={show(d(1))} readOnly />

          <input type="hidden" name="tipo" value="depenn" />
          <br />
          <label>nome do dependente:</label>
          <input type="text" name="nome" defaultValue={show(d(2))} />
          <br />
          <label>CPF do dependente:</label>
          <input type="text" name="cpf" defaultValue={show(d(3))} />
          <br />
          <label>data de nascimento do dependente:</label>
          <input type="text" name="data_nascimento" defaultValue={show(d(4))} />
          <label>Grau de parentesco:</label>
          <select name="grau_parentesco" id="grau_parentesco" defaultValue={grau}>
            <option value="filho(a)">FIlho(a)</option>
            <option value="conjuge">conjuge</option>
            <option value="pai">Pai</option>
            <option value="mae">Mãe</option>
            <option value="outro">Outro</option>
          </select>
          <br />
          <label>CPF do Titular:</label>
          <input type="text" name="cpf_titular" defaultValue={show(d(6))} />
          <br />
          <label>Nome da mãe:</label>
          <input type="text" name="nome_mae" defaultValue={show(d(7))} />
          <br />
          <button type="submit">Salvar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
