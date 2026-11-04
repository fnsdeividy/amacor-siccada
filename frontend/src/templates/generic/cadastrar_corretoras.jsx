// generic/cadastrar_corretoras.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useBodyClass } from '../../lib/useBodyClass.js'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.cadastro-corretora { max-width: 640px; }
.cadastro-corretora .corretora-secao {
  display: block;
  margin: var(--space-3) 0 var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.cadastro-corretora .corretora-check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.cadastro-corretora .corretora-check label { margin: 0; }
.cadastro-corretora .corretora-acoes {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
`

export default function CadastrarCorretoras() {
  // o bloco trazia um documento inteiro; o <body class="body"> passava a
  // classe para o <body> da página
  useBodyClass('body')
  const [vitalicia, setVitalicia] = useState(false)

  return (
    <Base1Layout title="Bem-vindo">
      <title>cadastro</title>
      <InlineStyle css={css} />
      <div className="divisoria5 cadastro-corretora">
        <div className="close-btn-container">
          <AppLink href={urlFor('auth.fechar')} className="close-btn" title="Fechar" aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </AppLink>
        </div>

        <div className="page-toolbar">
          <h1><i className="fa-solid fa-building text-primary me-2" aria-hidden="true" />Cadastro de Corretora</h1>
        </div>
        <ApiForm action={urlFor('auth.cadastrar_corretora')} method="POST">

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome da Corretora:</label>
              <input type="text" id="nome" name="nome" required />
            </div>

            <div className="form-group">
              <label htmlFor="cnpj">CNPJ:</label>
              <input type="text" id="cnpj" name="cnpj" required />
            </div>
          </div>

          <div>
            <label className="corretora-secao" htmlFor="taxa_corretora">Taxas da corretora:</label>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="taxa1">Primeira taxa:</label>
                <input type="number" id="taxa1" name="taxa1" required />
              </div>
              <div className="form-group">
                <label htmlFor="taxa2">Segunda taxa:</label>
                <input type="number" id="taxa2" name="taxa2" required />
              </div>
              <div className="form-group">
                <label htmlFor="taxa3">Terceira taxa:</label>
                <input type="number" id="taxa3" name="taxa3" required />
              </div>
            </div>

            <div className="corretora-check">
              <input type="checkbox" id="vitalicia" name="vitalicia" onChange={(e) => setVitalicia(e.target.checked)} />
              <label htmlFor="vitalicia">Mensalidade vitalícia?</label>
            </div>

            {/* Campos adicionais ocultos */}
            <div id="taxas-adicionais" className="form-group" style={{ display: vitalicia ? 'flex' : 'none' }}>
              <label htmlFor="taxa4">Taxa vitalicia:</label>
              <input type="number" id="taxa4" name="taxa4" />
            </div>

            <div className="corretora-acoes">
              <input className="btn envia" type="submit" value="Cadastrar" />
            </div>
          </div>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
