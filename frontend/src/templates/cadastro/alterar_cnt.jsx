// cadastro/alterar_cnt.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import Loader from '../../components/Loader.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useGoBack } from './_goBack.js'

// No template, <label>informação adicional</label> e o <input complemento>
// estão dentro do <select>. O navegador ignora o <label> (o texto fica no
// <select>, invisível) e fecha o <select> antes do <input>, que aparece logo
// depois dele. Aqui a estrutura já é a que o navegador montava.
const ROTULO = 'informação adicional'

function Complemento() {
  return <input type="text" id="complemento" name="complemento" placeholder="complemento de fase (opcional)" />
}

export default function AlterarCnt() {
  const ctx = useTemplateContext()
  const goBack = useGoBack()
  const [loading, setLoading] = useState(false)
  const { area, classe_usuario: classe, last_resp: lastResp } = ctx

  let opcoes
  let complemento = false
  if (area === 'administrativo' || (area === 'dev' && classe === 'supervisor') || classe === 'dev') {
    complemento = true
    opcoes = (
      <>
        <option value="Enviado ao cadastro">Enviar para cadastro</option>
        <option value="entrevista online enviada">entrevista online enviada</option>
        <option value="enviado para financeiro">Enviar para financeiro</option>
        <option value="analise de declaração">Enviar para analise</option>
        <option value="nota emitida">nota emitida</option>
        <option value="analise de declaração">enviado para confexão de kit</option>
        <option value="entrevista agendada">entrevista Agendada</option>
        <option value="geração de kit">gerar kit</option>
        <option value="contrato finalizado">contrato finalizado</option>
        <option value="em pendencia">pendencia</option>
        <option value="kit enviado">kit enviado</option>
        {ROTULO}
      </>
    )
  } else if (classe === 'supervisor') {
    opcoes = (
      <>
        <option value="Enviado ao cadastro">Enviar para cadastro</option>
        <option value="entrevista online enviada">entrevista online enviada</option>
        <option value="enviado para financeiro">Enviar para financeiro</option>
        <option value="analise de declaração">Enviar para analise</option>
        <option value="nota emitida">nota emitida</option>
        <option value="entrevista agendada">entrevista Agendada</option>
        <option value="geração de kit">gerar kit</option>
        <option value="kit enviado">kit enviado</option>
        <option value="contrato finalizado">contrato finalizado</option>
      </>
    )
  } else if (area === 'cadastro') {
    complemento = true
    opcoes = (
      <>
        <option value="Enviado ao cadastro">Enviar para cadastro</option>
        <option value="entrevista online enviada">entrevista online enviada</option>
        <option value="enviado para financeiro">Enviar para financeiro</option>
        <option value="analise de declaração">Enviar para analise</option>
        {ROTULO}
      </>
    )
  } else if (area === 'financeiro') {
    opcoes = (
      <>
        <option value="nota emitida">nota emitida</option>
        <option value="analise de declaração">analise de declaração</option>
      </>
    )
  } else if (area === 'administrativo') {
    // inalcançável (a primeira condição já cobre 'administrativo'), mantido como no template
    complemento = true
    opcoes = (
      <>
        <option value="Enviado ao cadastro">Enviar para cadastro</option>
        <option value="entrevista agendada">entrevista Agendada</option>
        <option value="geração de kit">gerar kit</option>
        <option value="kit enviado">kit enviado</option>
        {lastResp === 'administrativo' && <option value="contrato finalizado">contrato finalizado</option>}
        {ROTULO}
      </>
    )
  } else {
    opcoes = <option value="status indefinido">Status indefinido</option>
  }

  return (
    <Base1Layout title="Alterar Situação de contrato">
      {loading && <Loader />}
      <title>Document</title>
      <div className="container">
        {/* Botão de fechar */}
        <div className="divisoria2">
          <div className="close-btn-container">
            <a className="close-btn" href="#" onClick={goBack}>{'<'}</a>
          </div>
          <h1>Proposta: {show(ctx.proposta)}</h1>
          <h3>contrato: {show(ctx.contrato)}</h3>
          <h3 hidden>id: {show(ctx.id)}</h3>
          <p>Área: {show(area)}</p>
          <p hidden>ultimo responsavel:{show(lastResp)}</p>

          <br />
          <div>
            <h2>mudar situação do contrato para:</h2>
          </div>

          <div className="form-field">
            <ApiForm id="form-alterar-cnt" method="POST" action={urlFor('cad.gravar_alteracao', { proposta: ctx.proposta })}
              onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
              <label htmlFor="status"></label>
              <select id="status" name="status" required defaultValue="">
                <option value="" disabled>selecione</option>
                {opcoes}
              </select>
              {complemento && <Complemento />}
              <input type="hidden" name="info" value="status" />
              <br /><br />
              <button className="btn" id="botao" type="submit">alterar</button>
            </ApiForm>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
