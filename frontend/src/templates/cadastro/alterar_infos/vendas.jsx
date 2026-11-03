// cadastro/alterar_infos/vendas.html
import ApiForm from '../../../components/ApiForm.jsx'
import AppLink from '../../../components/AppLink.jsx'
import Base1Layout from '../../../layouts/Base1Layout.jsx'
import { show, showFloat } from '../../../lib/jinja.js'
import { useTemplateContext } from '../../../lib/page.jsx'
import { urlFor } from '../../../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../../../lib/useStylesheet.jsx'
import { pos } from '../_colunas.js'

const css = `
    h1{
        color: white
    }
`

export default function AlterarVendas() {
  useStylesheet('/static/css/tabpix.css')
  const ctx = useTemplateContext()
  const d = (i) => pos(ctx.dados, 'venda', i)
  const produto = ['Amacor Exclusivo 1', 'Amacor Exclusivo 2'].includes(d(4)) ? d(4) : undefined
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
          <br />
          <label>Numero do Contrato:</label>
          <input type="text" name="numero_contrato" defaultValue={show(d(13))} />
          <input type="hidden" name="tipo" value="venda" />
          <label>Data da venda:</label>
          <input type="date" name="data_venda" defaultValue={show(d(2))} />
          <br />
          <label>tipo de contrato:</label>
          <select name="tipo_contrato" id="tipo_contrato">
            <option value={show(d(3))}>{show(d(3))}</option>
            <option value="individual">Individual</option>
            <option value="empresarial">empresarial</option>
          </select>
          <br />
          <label>produto:</label>
          <select name="tipo_produto" id="tipo_produto" defaultValue={produto}>
            <option value="Amacor Exclusivo 1">AMACOR EXCLUSIVO 1</option>
            <option value="Amacor Exclusivo 2">AMACOR EXCLUSIVO 2</option>
          </select>
          <br />
          <label>Corretor:</label>
          <input type="text" name="corretor_resp" defaultValue={show(d(5))} readOnly />
          <br />
          <label>Valor total da venda:</label>
          <input type="text" name="valor_venda" defaultValue={showFloat(d(8))} />
          <br />
          <label>Valor da tabela:</label>
          <input type="text" name="valor_tabela" defaultValue={showFloat(d(12))} />
          <label>Vidas:</label>
          <input type="text" name="vidas" defaultValue={show(d(15))} readOnly />
          <br />
          <label>Responsavel pelo contrato:</label>
          <input type="text" name="nome_responsavel" defaultValue={show(d(18))} />
          <br />
          <label>Documentos enviados?</label>
          <input type="text" name="envio_documento" defaultValue={d(19) === 0 ? 'Não' : 'sim'} readOnly />
          <button type="submit">Salvar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
