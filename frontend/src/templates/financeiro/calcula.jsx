// financeiro/calcula.html
import { useRef, useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.calcula-acordo { max-width: 640px; margin: 0 auto var(--space-4); }
.calcula-acordo .calcula-erro {
  padding: var(--space-3) var(--space-4);
  color: var(--danger-700);
  background: var(--danger-50);
  border-radius: var(--radius);
}
.calcula-acordo .calcula-adicionar { margin-bottom: var(--space-5); }
.calcula-acordo .calcula-resultado {
  margin-top: var(--space-6);
  padding: var(--space-4) var(--space-5);
  background: var(--brand-50);
  border: 1px solid var(--brand-100);
  border-radius: var(--radius);
}
.calcula-acordo .calcula-resultado p { margin: var(--space-1) 0; color: var(--text); }
`

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
      <InlineStyle css={css} />
      <div className="card divisoria3 calcula-acordo">
        <div className="page-toolbar">
          <h1><i className="fa-solid fa-calculator text-primary me-2" aria-hidden="true" />Calcular Acordo</h1>
        </div>
        {truthy(ctx.error) && (
          <p className="calcula-erro">{show(ctx.error)}</p>
        )}

        <ApiForm method="POST" action={urlFor('finan.calculo_acordo')} onSubmit={formatarCampos}>
          <div className="form-group">
            <label htmlFor="em_aberto">Mensalidades em Aberto:</label>
            <input type="text" id="em_aberto" name="em_aberto" required ref={emAbertoRef} />
          </div>

          <div id="mensalidades-container" className="form-row">
            {Array.from({ length: mensalidades.n }, (_, k) => (
              <div key={`${mensalidades.gen}-${k}`} className="form-group">
                <label>{`Valor da Mensalidade ${k + 1}: `}</label>
                <input type="text" name="valores_mensalidades" required />
              </div>
            ))}
          </div>

          <button className="btn btn-secondary botao calcula-adicionar" type="button" onClick={adicionarMensalidades}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Adicionar Mensalidades
          </button>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="desconto">Desconto (%):</label>
              <input type="text" id="desconto" name="desconto" defaultValue="0" step="0.01" />
            </div>
            <div className="form-group">
              <label htmlFor="parcelas">Parcelas:</label>
              <input type="text" id="parcelas" name="parcelas" defaultValue="1" min="1" max="8" />
            </div>
          </div>

          <button className="btn botao" type="submit"><i className="fa-solid fa-equals" aria-hidden="true" /> Calcular</button>
        </ApiForm>

        {truthy(ctx.valor_total) && (
          <div className="calcula-resultado">
            <h2>Resultado</h2>
            <p>Valor Total: R$ {showFloat(ctx.valor_total)}</p>
            <p>Valor com Desconto: R$ {showFloat(ctx.valor_com_desconto)}</p>
            <p>Parcelas: {show(ctx.parcelas)}</p>
            <p>Valor por Parcela: R$ {showFloat(ctx.valor_parcela)}</p>
          </div>
        )}
      </div>
    </Base1Layout>
  )
}
