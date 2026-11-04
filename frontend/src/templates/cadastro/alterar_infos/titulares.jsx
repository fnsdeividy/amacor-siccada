// cadastro/alterar_infos/titulares.html
import ApiForm from '../../../components/ApiForm.jsx'
import AppLink from '../../../components/AppLink.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { show } from '../../../lib/jinja.js'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'
import { pos } from '../_colunas.js'
import { Oculto } from '../_ui.js'

const ESTADOS = ['solteiro', 'casado', 'viuvo', 'divorciado']
const SEXOS = ['masculino', 'feminino']

export default function AlterarTitulares() {
  const ctx = useTemplateContext()
  const d = (i) => pos(ctx.dados, 'titulares', i)
  // o template compara o estado civil com dados[8] (que é o email), como no original
  const estadoCivil = ESTADOS.includes(d(8)) ? d(8) : undefined
  const sexo = SEXOS.includes(d(12)) ? d(12) : undefined
  return (
    <Base1Layout title="Alterar venda">
      <div className="card">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('cad.alterar_proposta', { proposta: ctx.proposta })} title="Voltar" aria-label="Voltar">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /><Oculto>{'<<'}</Oculto>
          </AppLink>
        </div>

        <div className="page-toolbar">
          <h1>Alterar Venda #{show(d(1))}</h1>
        </div>
        <ApiForm action={urlFor('cad.alterar_infos')} method="post">
          <input type="hidden" name="tipo" value="titular" />
          <div className="form-row">
            <div className="form-group">
              <label>Proposta:</label>
              <input type="text" name="numero_proposta" defaultValue={show(d(1))} readOnly />
            </div>
            <div className="form-group">
              <label>nome do titular:</label>
              <input type="text" name="nome" defaultValue={show(d(2))} />
            </div>
            <div className="form-group">
              <label>CPF do Titular:</label>
              <input type="text" name="cpf" defaultValue={show(d(3))} />
            </div>
            <div className="form-group">
              <label>data de nascimento do responsavel:</label>
              <input type="text" name="data_nascimento" defaultValue={show(d(4))} />
            </div>
            <div className="form-group">
              <label>idade:</label>
              <input type="text" name="idade" defaultValue={show(d(5))} />
            </div>
            <div className="form-group">
              <label>CEP:</label>
              <input type="text" name="cep" defaultValue={show(d(6))} />
            </div>
            <div className="form-group">
              <label>Celular:</label>
              <input type="text" name="celular" defaultValue={show(d(7))} />
            </div>
            <div className="form-group">
              <label>email:</label>
              <input type="text" name="email" defaultValue={show(d(8))} />
            </div>
            <div className="form-group">
              <label>estado civil:</label>
              <select name="estado_civil" id="estado_civil" defaultValue={estadoCivil}>
                <option value="solteiro">Solteiro</option>
                <option value="casado">Casado</option>
                <option value="viuvo">Viuvo</option>
                <option value="divorciado">Divorciado</option>
              </select>
            </div>
            <div className="form-group">
              <label>nome da mãe:</label>
              <input type="text" name="nome_mae" defaultValue={show(d(10))} />
            </div>
            <div className="form-group">
              <label>nome do pai:</label>
              <input type="text" name="nome_pai" defaultValue={show(d(11))} />
            </div>
            <div className="form-group">
              <label>sexo:</label>
              <select name="sexo" id="sexo" defaultValue={sexo}>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nuwmero de RG:</label>
              <input type="text" name="numero_rg" defaultValue={show(d(13))} />
            </div>
            <div className="form-group">
              <label>profissão:</label>
              <input type="text" name="profissao" defaultValue={show(d(14))} />
            </div>
          </div>
          <button type="submit" className="btn"><i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Salvar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
