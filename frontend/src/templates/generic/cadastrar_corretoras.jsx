// generic/cadastrar_corretoras.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useBodyClass } from '../../lib/useBodyClass.js'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

export default function CadastrarCorretoras() {
  // o bloco trazia um documento inteiro: o <link> valia e o <body class="body">
  // passava a classe para o <body> da página
  useStylesheet('/static/css/estilos_login.css')
  useBodyClass('body')
  const [vitalicia, setVitalicia] = useState(false)

  return (
    <Base1Layout title="Bem-vindo">
      <title>cadastro</title>
      <div className="divisoria5">
        <div className="close-btn-container">
          <AppLink href={urlFor('auth.fechar')} className="close-btn">✖</AppLink>
        </div>

        <h1>Cadastro de Corretora</h1><br /><br />
        <ApiForm action={urlFor('auth.cadastrar_corretora')} method="POST">

          <label htmlFor="nome">Nome da Corretora:</label>
          <input type="text" id="nome" name="nome" required /><br /><br />

          <label htmlFor="cnpj">CNPJ:</label>
          <input type="text" id="cnpj" name="cnpj" required /><br /><br />
          {/* o <div> abaixo não era fechado no original; o navegador o fechava no </form> */}
          <div>
            <label htmlFor="taxa_corretora">Taxas da corretora:</label>
            <label htmlFor="taxa1">Primeira taxa:</label>
            <input type="number" id="taxa1" name="taxa1" required /><br /><br />
            <label htmlFor="taxa2">Segunda taxa:</label>
            <input type="number" id="taxa2" name="taxa2" required /><br /><br />
            <label htmlFor="taxa3">Terceira taxa:</label>
            <input type="number" id="taxa3" name="taxa3" required /><br /><br />
            <label htmlFor="vitalicia">Mensalidade vitalícia?</label>
            <input type="checkbox" id="vitalicia" name="vitalicia" onChange={(e) => setVitalicia(e.target.checked)} />

            {/* Campos adicionais ocultos */}
            <div id="taxas-adicionais" style={{ display: vitalicia ? 'block' : 'none' }}>
              <label htmlFor="taxa4">Taxa vitalicia:</label>
              <input type="number" id="taxa4" name="taxa4" /><br />
            </div>
            <br />

            <input className="envia" type="submit" defaultValue="Cadastrar" />
          </div>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
