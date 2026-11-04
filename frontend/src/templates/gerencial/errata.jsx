// gerencial/errata.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useBodyClass } from '../../lib/useBodyClass.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssGerador } from '../geradores/estilo.js'

export default function Errata() {
  // o <body class="body"> dentro do conteúdo: o navegador aplicava a classe ao body
  useBodyClass('body')
  return (
    <Base1Layout title="Banco desatualizado">
      <InlineStyle css={cssGerador} />
      <div className="card gerador">
        <span className="gerador-icone alerta"><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /></span>
        <h1>Atualização pendente</h1>
        <h3>O banco de dados do Siccada não foi atualizado, solicite ao setor de cadastro que atualize o banco.</h3>
        <div className="gerador-acoes">
          <AppLink className="btn btn-secondary" href={urlFor('auth.fechar')}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> voltar
          </AppLink>
        </div>
      </div>
    </Base1Layout>
  )
}
