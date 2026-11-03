// financeiro/calcula.html
import { useRef, useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function Calcula() {
  const ctx = useTemplateContext()
  const emAbertoRef = useRef(null)
  // adicionarMensalidades(): recria os campos (gen força campos novos e vazios)
  const [mensalidades, setMensalidades] = useState({ n: 0, gen: 0 })

  function adicionarMensalidades() {
    const emAberto = emAbertoRef.current.value
    let n = 0
    for (let i = 1; i <= emAberto; i++) n = i
    setMensalidades((m) => ({ n, gen: m.gen + 1 }))
  }

  function formatarCampos(event) {
    // Converte todos os campos numéricos com vírgula para ponto
    const campos = event.currentTarget.querySelectorAll('input[type="text"]')
    campos.forEach((campo) => {
      campo.value = campo.value.replace(',', '.')
    })
  }

  return (
    <Base1Layout title="Gerador de carteirinhas">
      <div className="divisoria3">
        <h1>Calcular Acordo</h1>
        {truthy(ctx.error) && (
          <p style={{ color: 'red' }}>{show(ctx.error)}</p>
        )}

        <ApiForm method="POST" action={urlFor('finan.calculo_acordo')} onSubmit={formatarCampos}>
          <label htmlFor="em_aberto">Mensalidades em Aberto:</label>
          <input type="text" id="em_aberto" name="em_aberto" required ref={emAbertoRef} /><br /><br />

          <div id="mensalidades-container">
            {Array.from({ length: mensalidades.n }, (_, k) => (
              <span key={`${mensalidades.gen}-${k}`} style={{ display: 'contents' }}>
                <label>{`Valor da Mensalidade ${k + 1}: `}</label>
                <input type="text" name="valores_mensalidades" required />
                <br />
              </span>
            ))}
          </div>

          <button className="botao" type="button" onClick={adicionarMensalidades}>Adicionar Mensalidades</button><br /><br />

          <label htmlFor="desconto">Desconto (%):</label>
          <input type="text" id="desconto" name="desconto" defaultValue="0" step="0.01" /><br /><br />

          <label htmlFor="parcelas">Parcelas:</label>
          <input type="text" id="parcelas" name="parcelas" defaultValue="1" min="1" max="8" /><br /><br />

          <button className="botao" type="submit">Calcular</button>
        </ApiForm>

        {truthy(ctx.valor_total) && (
          <>
            <h2>Resultado</h2>
            <p>Valor Total: R$ {showFloat(ctx.valor_total)}</p>
            <p>Valor com Desconto: R$ {showFloat(ctx.valor_com_desconto)}</p>
            <p>Parcelas: {show(ctx.parcelas)}</p>
            <p>Valor por Parcela: R$ {showFloat(ctx.valor_parcela)}</p>
          </>
        )}
      </div>
    </Base1Layout>
  )
}
