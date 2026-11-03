// vendas/vendassaldo.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { col, show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function VendasSaldo() {
  const ctx = useTemplateContext()
  const result = ctx.result
  // o template tem "<br><br\n<body class="body">": o segundo <br> fica com class="body"
  return (
    <Base1Layout title="Vendas">
      <br /><br className="body" />
      <div className="divisoria4">
        <h1>Resultado da Consulta</h1>

        {truthy(result) ? (
          <div className="result">
            <p><strong>Nome Responsável:</strong> {show(col(result, 1))}</p>
            <p><strong>Numero do Contrato:</strong> {show(col(result, 0))}</p>
            <p><strong>Parcelas em aberto:</strong> {show(col(result, 2))}</p>
            <p><strong>Valor Total:</strong> {show(col(result, 4))}</p>
          </div>
        ) : (
          <>
            <p className="prince">Registro Financeiro não encontrado.</p>
            <p>Não foi possível encontrar os dados para o contrato especificado, talvez a informação seja muito antiga.</p>
          </>
        )}

        <AppLink href={urlFor('vendas.cpf')} className="btn">Voltar</AppLink>
      </div>
    </Base1Layout>
  )
}
