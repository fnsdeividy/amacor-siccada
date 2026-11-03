// cadastro/alterar_infos/responsavel.html
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

const ESTADOS = ['solteiro', 'casado', 'viuvo', 'divorciado']

export default function AlterarResponsavel() {
  useStylesheet('/static/css/tabpix.css')
  const ctx = useTemplateContext()
  const d = (i) => pos(ctx.dados, 'responsavel', i)
  const estadoCivil = ESTADOS.includes(d(8)) ? d(8) : undefined
  return (
    <Base1Layout title="Alterar venda">
      <InlineStyle css={css} />
      <div className="container-tab-pix">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('cad.alterar_proposta', { proposta: ctx.proposta })}>{'<<'}</AppLink>
        </div>

        <h1>Alterar Venda #{show(d(1))}</h1>
        <ApiForm action={urlFor('cad.alterar_infos')} method="post">

          <label>Proposta:</label>
          <input type="text" name="numero_proposta" defaultValue={show(d(1))} readOnly />

          <input type="hidden" name="tipo" value="respp" />
          <br />
          <label>nome do responsavel:</label>
          <input type="text" name="nome" defaultValue={show(d(2))} />
          <br />
          <label>CPF do responsavel:</label>
          <input type="text" name="cpf" defaultValue={show(d(3))} />
          <br />
          <label>data de nascimento do responsavel:</label>
          <input type="text" name="data_nascimento" defaultValue={show(d(4))} />
          <label>CEP:</label>
          <input type="text" name="cep" defaultValue={show(d(5))} />
          <br />
          <label>Celular:</label>
          <input type="text" name="celular" defaultValue={show(d(6))} />
          <br />
          <label>email:</label>
          <input type="text" name="email" defaultValue={show(d(7))} />
          <br />
          <label>estado civil:</label>
          <select name="estado_civil" id="estado_civil" defaultValue={estadoCivil}>
            <option value="solteiro">Solteiro</option>
            <option value="casado">Casado</option>
            <option value="viuvo">Viuvo</option>
            <option value="divorciado">Divorciado</option>
          </select>
          <br />
          <button type="submit">Salvar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
