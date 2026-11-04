// cadastro/adicionar_cnt.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import Loader from '../../components/Loader.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useGoBack } from './_goBack.js'

// A rota passa id=id sem definir a variável: o template recebe a função
// embutida id() do Python e imprime "<built-in function id>" (h3 oculto).
const ID_BUILTIN = '<built-in function id>'

export default function AdicionarCnt() {
  const ctx = useTemplateContext()
  const goBack = useGoBack()
  const [loading, setLoading] = useState(false)
  const id = ctx.id === null || ctx.id === undefined ? ID_BUILTIN : show(ctx.id)

  return (
    <Base1Layout title="Alterar Cadastro">
      {loading && <Loader />}
      <title>Document</title>
      <div className="divisoria">
        <div className="close-btn-container">
          <a className="close-btn" href="#" onClick={goBack} title="Voltar" aria-label="Voltar">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </a>
        </div>
        <h1>Proposta {show(ctx.proposta)}</h1>
        <h3 hidden>id: {id}</h3>

        <h2 className="text-muted" style={{ fontWeight: 500 }}>Adicionar numero de contrato à proposta</h2>

        <ApiForm id="adicionar_cnt" method="POST" action={urlFor('cad.gravar_alteracao', { proposta: ctx.proposta })}
          onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
          <div className="form-group">
            <label htmlFor="status">atribuir contrato:</label>
            <input type="text" id="status" name="status" placeholder="digite o número do contrato" required />
          </div>
          <input type="hidden" name="info" value="numero_contrato" />
          <button className="btn" type="submit"><i className="fa-solid fa-check" aria-hidden="true" /> alterar</button>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
