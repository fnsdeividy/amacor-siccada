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

export default function GerarKit() {
  const ctx = useTemplateContext()
  // dados pode ser None: dados.x vira Undefined no Jinja e imprime ""
  const dados = ctx.dados ?? {}
  const [loading, setLoading] = useState(false)
  return (
    <Base1Layout title="Gerar Kit">
      {loading && <Loader />}
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <AppLink href={urlFor('auth.fechar')} className="close-btn">✖</AppLink>
          </div>
          <h1>Gerar Kit</h1>
          <h2>Gerando Kit para o contrato: {show(dados.numero_contrato)}</h2>
          <div>
            {/* action sem parâmetros, como url_for('doc_gen.gerar_documentos') */}
            <ApiForm id="form-gerar-kit" action={urlFor('doc_gen.gerar_documentos')} method="POST"
              onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
              <label htmlFor="numero_contrato">Número do Contrato:</label>
              <input type="text" id="numero_contrato" name="numero_contrato" defaultValue={show(dados.numero_contrato)} required />
              <label htmlFor="nome_responsavel">Nome do Responsável:</label>
              <input type="text" id="nome_responsavel" name="nome_responsavel" defaultValue={show(dados.nome_responsavel)} required />
              <label htmlFor="plano_nome">Nome do plano</label>
              <select id="plano_nome" name="plano_nome" required>
                <option value={show(dados.tipo_produto)}>{show(dados.tipo_produto)}</option>

                <option value="Amacor Exclusivo I">AMACOR EXCLUSIVO I</option>
                <option value="Amacor Exclusivo II">AMACOR EXCLUSIVO II</option>
                <option value="AMACOR EXCLUSIVO II EMPRESARIAL">Exclusivo II Empresarial</option>
                <option value="AMACOR CLASSICO EMPRESARIAL">Classico Empresarial</option>
              </select>
              <br />
              <label htmlFor="data_contrato">Data do Contrato:</label>
              <input type="date" name="data_venda" defaultValue={formatDateIso(dados.data_venda)} required />
              <br />
              <br />
              <br />
              <button className="btn" type="submit">Gerar Documento</button>
            </ApiForm>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
