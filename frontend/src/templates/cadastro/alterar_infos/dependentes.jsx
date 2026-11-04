// cadastro/alterar_infos/dependentes.html
import ApiForm from '../../../components/ApiForm.jsx'
import AppLink from '../../../components/AppLink.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { show } from '../../../lib/jinja.js'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'
import { pos } from '../_colunas.js'
import { Oculto } from '../_ui.js'

const GRAUS = ['filho(a)', 'conjuge', 'pai', 'mae', 'outro']

export default function AlterarDependentes() {
  const ctx = useTemplateContext()
  const d = (i) => pos(ctx.dados, 'dependentes', i)
  // o template compara o grau de parentesco com dados[8] (coluna sexo), como no original
  const grau = GRAUS.includes(d(8)) ? d(8) : undefined
  return (
    <Base1Layout title="Alterar dependente">
      <div className="card">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('cad.alterar_proposta', { proposta: ctx.proposta })} title="Voltar" aria-label="Voltar">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /><Oculto>{'<<'}</Oculto>
          </AppLink>
        </div>

        <div className="page-toolbar">
          <h1>Alterar dependente #{show(d(1))}</h1>
        </div>
        <ApiForm action={urlFor('cad.alterar_infos')} method="post">
          <input type="hidden" name="tipo" value="depenn" />
          <div className="form-row">
            <div className="form-group">
              <label>Proposta:</label>
              <input type="text" name="numero_proposta" defaultValue={show(d(1))} readOnly />
            </div>
            <div className="form-group">
              <label>nome do dependente:</label>
              <input type="text" name="nome" defaultValue={show(d(2))} />
            </div>
            <div className="form-group">
              <label>CPF do dependente:</label>
              <input type="text" name="cpf" defaultValue={show(d(3))} />
            </div>
            <div className="form-group">
              <label>data de nascimento do dependente:</label>
              <input type="text" name="data_nascimento" defaultValue={show(d(4))} />
            </div>
            <div className="form-group">
              <label>Grau de parentesco:</label>
              <select name="grau_parentesco" id="grau_parentesco" defaultValue={grau}>
                <option value="filho(a)">FIlho(a)</option>
                <option value="conjuge">conjuge</option>
                <option value="pai">Pai</option>
                <option value="mae">Mãe</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label>CPF do Titular:</label>
              <input type="text" name="cpf_titular" defaultValue={show(d(6))} />
            </div>
            <div className="form-group">
              <label>Nome da mãe:</label>
              <input type="text" name="nome_mae" defaultValue={show(d(7))} />
            </div>
          </div>
          <button type="submit" className="btn"><i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Salvar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
