// cadastro/alterar_infos/titulares.html
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
const SEXOS = ['masculino', 'feminino']

export default function AlterarTitulares() {
  useStylesheet('/static/css/tabpix.css')
  const ctx = useTemplateContext()
  const d = (i) => pos(ctx.dados, 'titulares', i)
  // o template compara o estado civil com dados[8] (que é o email), como no original
  const estadoCivil = ESTADOS.includes(d(8)) ? d(8) : undefined
  const sexo = SEXOS.includes(d(12)) ? d(12) : undefined
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

          <input type="hidden" name="tipo" value="titular" />
          <br />
          <label>nome do titular:</label>
          <input type="text" name="nome" defaultValue={show(d(2))} />
          <br />
          <label>CPF do Titular:</label>
          <input type="text" name="cpf" defaultValue={show(d(3))} />
          <br />
          <label>data de nascimento do responsavel:</label>
          <input type="text" name="data_nascimento" defaultValue={show(d(4))} />
          <br />
          <label>idade:</label>
          <input type="text" name="idade" defaultValue={show(d(5))} />
          <label>CEP:</label>
          <input type="text" name="cep" defaultValue={show(d(6))} />
          <br />
          <label>Celular:</label>
          <input type="text" name="celular" defaultValue={show(d(7))} />
          <br />
          <label>email:</label>
          <input type="text" name="email" defaultValue={show(d(8))} />
          <br />
          <label>estado civil:</label>
          <select name="estado_civil" id="estado_civil" defaultValue={estadoCivil}>
            <option value="solteiro">Solteiro</option>
            <option value="casado">Casado</option>
            <option value="viuvo">Viuvo</option>
            <option value="divorciado">Divorciado</option>
          </select>
          <br />
          <label>nome da mãe:</label>
          <input type="text" name="nome_mae" defaultValue={show(d(10))} />
          <br />
          <label>nome do pai:</label>
          <input type="text" name="nome_pai" defaultValue={show(d(11))} />
          <br />
          <label>sexo:</label>
          <select name="sexo" id="sexo" defaultValue={sexo}>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
          <br />
          <br /><label>Nuwmero de RG:</label>
          <input type="text" name="numero_rg" defaultValue={show(d(13))} />
          <br />
          <label>profissão:</label>
          <input type="text" name="profissao" defaultValue={show(d(14))} />
          <br />

          <button type="submit">Salvar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
