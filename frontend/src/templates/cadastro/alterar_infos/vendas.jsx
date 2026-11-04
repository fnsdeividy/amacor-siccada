// cadastro/alterar_infos/vendas.html
import ApiForm from '../../../components/ApiForm.jsx'
import AppLink from '../../../components/AppLink.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { show, showFloat } from '../../../lib/jinja.js'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'
import { pos } from '../_colunas.js'
import { Oculto } from '../_ui.js'

export default function AlterarVendas() {
  const ctx = useTemplateContext()
  const d = (i) => pos(ctx.dados, 'venda', i)
  const produto = ['Amacor Exclusivo 1', 'Amacor Exclusivo 2'].includes(d(4)) ? d(4) : undefined
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
          <input type="hidden" name="tipo" value="venda" />
          <div className="form-row">
            <div className="form-group">
              <label>Proposta:</label>
              <input type="text" name="numero_proposta" defaultValue={show(d(1))} readOnly />
            </div>
            <div className="form-group">
              <label>Numero do Contrato:</label>
              <input type="text" name="numero_contrato" defaultValue={show(d(13))} />
            </div>
            <div className="form-group">
              <label>Data da venda:</label>
              <input type="date" name="data_venda" defaultValue={show(d(2))} />
            </div>
            <div className="form-group">
              <label>tipo de contrato:</label>
              <select name="tipo_contrato" id="tipo_contrato">
                <option value={show(d(3))}>{show(d(3))}</option>
                <option value="individual">Individual</option>
                <option value="empresarial">empresarial</option>
              </select>
            </div>
            <div className="form-group">
              <label>produto:</label>
              <select name="tipo_produto" id="tipo_produto" defaultValue={produto}>
                <option value="Amacor Exclusivo 1">AMACOR EXCLUSIVO 1</option>
                <option value="Amacor Exclusivo 2">AMACOR EXCLUSIVO 2</option>
              </select>
            </div>
            <div className="form-group">
              <label>Corretor:</label>
              <input type="text" name="corretor_resp" defaultValue={show(d(5))} readOnly />
            </div>
            <div className="form-group">
              <label>Valor total da venda:</label>
              <input type="text" name="valor_venda" defaultValue={showFloat(d(8))} />
            </div>
            <div className="form-group">
              <label>Valor da tabela:</label>
              <input type="text" name="valor_tabela" defaultValue={showFloat(d(12))} />
            </div>
            <div className="form-group">
              <label>Vidas:</label>
              <input type="text" name="vidas" defaultValue={show(d(15))} readOnly />
            </div>
            <div className="form-group">
              <label>Responsavel pelo contrato:</label>
              <input type="text" name="nome_responsavel" defaultValue={show(d(18))} />
            </div>
            <div className="form-group">
              <label>Documentos enviados?</label>
              <input type="text" name="envio_documento" defaultValue={d(19) === 0 ? 'Não' : 'sim'} readOnly />
            </div>
          </div>
          <button type="submit" className="btn"><i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Salvar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
