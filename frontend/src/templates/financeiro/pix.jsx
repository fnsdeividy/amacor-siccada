// financeiro/pix.html
// (o <style> do template ficava fora dos blocos e por isso nunca era renderizado)
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.pix-lancamento { max-width: 720px; margin: 0 auto; }
.pix-lancamento .payment-form > .form-row { margin-bottom: 0; }
.pix-lancamento .pix-acoes {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
`

export default function Pix() {
  return (
    <Base1Layout title="Lançamento de Pagamento">
      <InlineStyle css={css} />
      <div className="container">
        <div className="card divisoria2 pix-lancamento">

          <div className="close-btn-container">
            <AppLink href={urlFor('auth.fechar')} className="close-btn" title="Fechar" aria-label="Fechar"><i className="fa-solid fa-xmark" aria-hidden="true" /></AppLink>
          </div>
          <div className="page-toolbar">
            <h1>Lançamento de Pagamento</h1>
          </div>
          <ApiForm method="POST" action={urlFor('finan.pix')} className="payment-form">
            <div className="form-group">
              <label htmlFor="ncontrato">Contrato:</label>
              <input type="text" id="ncontrato" name="ncontrato" required />
            </div>

            <div className="form-group">
              <label htmlFor="nresponsavel">Responsável:</label>
              <input type="text" id="nresponsavel" name="nresponsavel" required />
            </div>

            <div className="form-group">
              <label htmlFor="valor">Valor:</label>
              <input type="number" step="0.01" id="valor" name="valor" required />
            </div>

            <div className="form-group">
              <label htmlFor="data_pagamento">Data de pagamento:</label>
              <input type="date" id="data_pagamento" name="data_pagamento" required />
            </div>

            {/* no template este form-group não era fechado: o resto do formulário fica dentro dele */}
            <div className="form-group">
              <label htmlFor="data_vencimento">Data de vencimento:</label>
              <input type="date" id="data_vencimento" name="data_vencimento" required />

              <div className="form-group">
                <label htmlFor="descricao">Descrição do pagamento:</label>
                <input type="text" id="descricao" name="descricao" />
              </div>

              <div className="form-group">
                <label htmlFor="tipo_lancamento">Tipo de lançamento:</label>
                <select id="tipo_lancamento" name="tipo_lancamento" required>
                  <option value="mensalidade">pagamento de mensalidade</option>
                  <option value="adesao">pagamento de adesão</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="metodo_pg">Método de pagamento:</label>
                <select id="metodo_pg" name="metodo_pg" required>
                  <option value="PIX">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="cartao de credito">Carão de Crédito</option>
                  <option value="cartao de debito">Débito</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status de pagamento:</label>
                <select id="status" name="status" required>
                  <option value="efetuado">Efetuado</option>
                </select>
              </div>

              <div className="pix-acoes">
                <button className="btn" type="submit"><i className="fa-solid fa-check" aria-hidden="true" /> Cadastrar</button>
              </div>
            </div>
          </ApiForm>
        </div>
      </div>
    </Base1Layout>
  )
}
