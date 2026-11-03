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
      <div className="container">
        {/* Botão de fechar */}
        <div className="divisoria2">
          <div className="close-btn-container">
            <a className="close-btn" href="#" onClick={goBack}>{'<<'}</a>
          </div>
          <h1>Proposta {show(ctx.proposta)}</h1>
          <h3 hidden>id: {id}</h3>

          <div>
            <h2>Adicionar numero de contrato à proposta</h2>
          </div>

          <ApiForm id="adicionar_cnt" method="POST" action={urlFor('cad.gravar_alteracao', { proposta: ctx.proposta })}
            onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
            <label htmlFor="status">atribuir contrato:</label>
            <input type="text" id="status" name="status" placeholder="digite o número do contrato" required />
            <input type="hidden" name="info" value="numero_contrato" />
            <button className="btn" type="submit">alterar</button>
          </ApiForm>
        </div>
      </div>
    </Base1Layout>
  )
}
