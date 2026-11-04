// geradores/gerar_kit.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Loader from '../../components/Loader.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { formatDateIso } from '../../lib/format.js'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from './estilo.js'

export default function GerarKit() {
  const ctx = useTemplateContext()
  // dados pode ser None: dados.x vira Undefined no Jinja e imprime ""
  const dados = ctx.dados ?? {}
  const [loading, setLoading] = useState(false)
  return (
    <Base1Layout title="Gerar Kit">
      {loading && <Loader />}
      <InlineStyle css={cssGerador} />
      <div className="card gerador">
        <div className="close-btn-container">
          <AppLink href={urlFor('auth.fechar')} className="close-btn" title="Fechar" aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </AppLink>
        </div>
        <span className="gerador-icone"><i className="fa-solid fa-box-archive" aria-hidden="true" /></span>
        <h1>Gerar Kit</h1>
        <h3>Gerando Kit para o contrato: {show(dados.numero_contrato)}</h3>
        {/* action sem parâmetros, como url_for('doc_gen.gerar_documentos') */}
        <ApiForm id="form-gerar-kit" action={urlFor('doc_gen.gerar_documentos')} method="POST"
          onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numero_contrato">Número do Contrato:</label>
              <input type="text" id="numero_contrato" name="numero_contrato" defaultValue={show(dados.numero_contrato)} required />
            </div>
            <div className="form-group">
              <label htmlFor="nome_responsavel">Nome do Responsável:</label>
              <input type="text" id="nome_responsavel" name="nome_responsavel" defaultValue={show(dados.nome_responsavel)} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="plano_nome">Nome do plano</label>
            <select id="plano_nome" name="plano_nome" required>
              <option value={show(dados.tipo_produto)}>{show(dados.tipo_produto)}</option>

              <option value="Amacor Exclusivo I">AMACOR EXCLUSIVO I</option>
              <option value="Amacor Exclusivo II">AMACOR EXCLUSIVO II</option>
              <option value="AMACOR EXCLUSIVO II EMPRESARIAL">Exclusivo II Empresarial</option>
              <option value="AMACOR CLASSICO EMPRESARIAL">Classico Empresarial</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="data_contrato">Data do Contrato:</label>
            <input type="date" name="data_venda" defaultValue={formatDateIso(dados.data_venda)} required />
          </div>
          <div className="gerador-acoes">
            <button className="btn" type="submit">
              <i className="fa-solid fa-file-circle-plus" aria-hidden="true" /> Gerar Documento
            </button>
          </div>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
