// cadastro/acompanhar_cnt.html
import { useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { formatDateBr } from '../../lib/format.js'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../../lib/useStylesheet.jsx'
import { pos } from './_colunas.js'

const css = `
        .btn-home {
    position: center;
    background: linear-gradient(145deg, #1a2a6c, #36a2eb);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    box-shadow: 0 4px 8px rgba(0,0,0,0.25);
    transition: all 0.3s ease;
}

.btn-home:hover {
    transform: translateY(-2px);
    background: linear-gradient(145deg, #1a2a6c, #36a2eb);
    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}
        /* Seus estilos permanecem os mesmos */
        p {
            position: center;
            font-family: Arial, sans-serif;
            color: #ebebeb;
        }
        .cards-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-start; /* Garante que cada cartão mantenha sua própria altura */
        gap: 20px;
        padding: 20px;
        margin-top: 30px;
    }

    .card {
        width: 280px;
        border: 1px solid #f8f8f8bd;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        background: rgba(255, 238, 201, 0.493);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        overflow: hidden;
        margin-bottom: 20px;
        transition: transform 0.3s ease;
    }

    .card-atrasado {
        width: 280px;
        border: 1px solid rgba(255, 126, 126, 0.493);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        background: rgba(255, 126, 126, 0.493);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        overflow: hidden;

        margin-bottom: 20px;
        transition: transform 0.3s ease;
    }
    .card-atrasado:hover {
        transform: scale(1.02);
    }

    .card:hover {
        transform: scale(1.02);
    }

    .card-header {
        background-color: #c596bf;
        color: #4f4159;
        padding: 12px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
    }

    .card-body {
        padding: 12px;
        cursor: pointer;
    }

    .card-body p {
        margin: 6px 0;
        font-size: 13px;
        color: #242424;
    }

    .card-details {
        display: none;
        padding: 12px;
        border-top: 1px solid #ddd;

        overflow: hidden;
        margin-bottom: 20px;
        transition: transform 0.3s ease;
    }

    .card-details-atrasado {
        display: none;
        padding: 12px;
        border-top: 1px solid #ddd;
        background-color: #f9f9f9;
    }
    .card-details p {
        margin: 6px 0;
        font-size: 13px;
        color: #333;
    }

        .no-results {
            text-align: center;
            margin-top: 50px;
            color: #ffffff;
            font-size: 18px;
        }
        .status-laranja         { background-color: #ffe5b4; color: #b36b00; }  /* Laranja pastel */
        .status-amarelo         { background-color: #fff9b0; color: #b3a100; }  /* Amarelo pastel */
        .status-verde           { background-color: #c6f5e0; color: #259661; }  /* Verde pastel */
        .status-verde-escuro    { background-color: #a3e4c1; color: #1b5e20; }  /* Verde mais escuro */
        .status-verde-medio     { background-color: #b2f2d7; color: #218c5a; }  /* Verde médio */
        .status-azulclaro       { background-color: #cbe7ff; color: #2176ae; }  /* Azul claro pastel */
        .status-azulescuro      { background-color: #b0c4ff; color: #1a237e; }  /* Azul escuro pastel */
        .status-vermelho        { background-color: #ffadad; color: #b71c1c; }  /* Vermelho claro pastel */
        .status-rosa            { background-color: #ffe0f0; color: #ad1457; }  /* Rosa pastel */
        .status-marrom { background-color: #9b7b66ef; color:rgb(61, 50, 50)}
        .status-pendente { background-color: #eea77e; color: #993e2e; }

`

/** {{ x|string }} */
const str = (v) => (v === undefined ? '' : show(v))

function statusClass(status, statusDoc) {
  if (status.includes('enviado ao cadastro') && statusDoc === '0') return 'status-laranja'
  if (status.includes('aguardando entrevista online')) return 'status-verde'
  if (status.includes('entrevista online enviada')) return 'status-verde-escuro'
  if (status.includes('analise de declaração')) return 'status-verde-medio'
  if (status.includes('entrevista agendada')) return 'status-azulclaro'
  if (status.includes('geração de kit')) return 'status-azulescuro'
  if (status.includes('contrato finalizado')) return 'status-azulescuro'
  if (status.includes('enviado para financeiro')) return 'status-vermelho'
  if (status.includes('nota emitida')) return 'status-rosa'
  if (status.includes('venda cancelada')) return 'status-marrom'
  if (status.includes('em pendencia')) return 'status-pendente'
  if (statusDoc === '1') return 'status-amarelo'
  return ''
}

function OpcoesFiltro({ ctx }) {
  const { classe_usuario: classe, area, last_resp: lastResp } = ctx
  if (classe === 'supervisor' || area === 'dev') {
    return (
      <>
        <option value="Aguardando entrevista">Aguardando entrevista</option>
        <option value="Enviado ao cadastro">enviado ao cadastro</option>
        <option value="entrevista online enviada">entrevista online enviada</option>
        <option value="enviado para financeiro">Enviar para financeiro</option>
        <option value="nota emitida">nota emitida</option>
        <option value="analise de declaração">Enviar para analise</option>
        <option value="entrevista agendada">entrevista Agendada</option>
        <option value="geração de kit">gerar kit</option>
        <option value="contrato finalizado">contrato finalizado</option>
        <option value="venda cancelada"> venda cancelada</option>
        <option value="em pendencia"> em pendencia</option>
        <option value="kit enviado"> kit enviado</option>
      </>
    )
  }
  if (area === 'financeiro') {
    return (
      <>
        <option value="nota emitida">nota emitida</option>
        <option value="analise de declaração">enviado para confecção de kit</option>
      </>
    )
  }
  if (area === 'administrativo') {
    return (
      <>
        <option value="Aguardando entrevista">Aguardando entrevista</option>
        <option value="analise de declaração">Enviar para analise</option>
        <option value="entrevista agendada">entrevista Agendada</option>
        <option value="geração de kit">gerar kit</option>
        {lastResp === 'administrativo' && <option value="contrato finalizado">contrato finalizado</option>}
      </>
    )
  }
  if (area === 'cadastro') {
    return (
      <>
        <option value="Aguardando entrevista">Aguardando entrevista</option>
        <option value="Enviado ao cadastro">Enviado ao cadastro</option>
        <option value="entrevista online enviada">entrevista online enviada</option>
        <option value="enviado para financeiro">Enviar para financeiro</option>
      </>
    )
  }
  return <option value="status indefinido">Status indefinido</option>
}

export default function AcompanharCnt() {
  useStylesheet('/static/css/estilos.css')
  const ctx = useTemplateContext()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const filtroRef = useRef(null)
  // style.display de cada .card-details, como o toggleDetails() do template:
  // começa sem valor (o CSS esconde) e o primeiro clique só grava 'none'
  const [detalhes, setDetalhes] = useState({})

  function toggleDetails(index) {
    setDetalhes((atual) => {
      const novo = {}
      ;(ctx.result ?? []).forEach((_, i) => { if (i !== index) novo[i] = 'none' })
      novo[index] = atual[index] === 'none' ? 'block' : 'none'
      return novo
    })
  }

  const rows = ctx.result ?? []

  return (
    <Base1Layout title="acompanhamento de contratos">
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '10px 20px' }}>
        <AppLink href={urlFor('auth.fechar')} className="btn-home">🏠 </AppLink>
      </div>
      <div key={location.search} className="search-bar-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0' }}>
        {/* Filtro à esquerda */}
        <ApiForm ref={filtroRef} method="get" action={urlFor('cad.acompanhar_cnt')} id="autoSubmitForm" style={{ display: 'flex', gap: '8px', background: '#23272f00', padding: '12px 24px', borderRadius: '8px' }}>
          <select id="filtrar" name="filtrar" required defaultValue=""
            onChange={() => filtroRef.current?.requestSubmit()}
            style={{ height: '40px', padding: '0 12px', borderRadius: '6px' }}>
            <option value="" disabled>Filtrar fase:</option>
            <OpcoesFiltro ctx={ctx} />
          </select>
        </ApiForm>

        {/* Busca à direita */}
        <ApiForm method="get" action={urlFor('cad.acompanhar_cnt')} style={{ display: 'flex', gap: '8px', background: '#23272f00', padding: '12px 24px', borderRadius: '8px' }}>
          <input type="text" name="buscar" placeholder="Buscar por proposta" defaultValue={searchParams.get('buscar') ?? ''} style={{ padding: '8px 12px', border: '1px solid #bbb', borderRadius: '4px', minWidth: '220px', fontSize: '15px', background: '#fff', color: '#222' }} />
          <button className="btn" type="submit">Buscar</button>
        </ApiForm>
      </div>
      <InlineStyle css={css} />
      {truthy(ctx.result) ? (
        <div className="cards-container">
          {rows.map((row, i) => {
            const statusDoc = str(pos(row, 'venda', 19))
            const status = str(pos(row, 'venda', 6)).toLowerCase()
            const atraso = str(pos(row, 'venda', 23))
            const cardClass = atraso === '1' ? 'card-atrasado' : 'card'
            const contrato = pos(row, 'venda', 13)
            const display = detalhes[i]
            return (
              <div className={cardClass} key={i}>
                <div className={'card-header ' + statusClass(status, statusDoc)} onClick={() => toggleDetails(i)}>
                  Proposta #{show(pos(row, 'venda', 1))}
                </div>
                <div className="card-body" onClick={() => toggleDetails(i)}>
                  <h3 style={{ color: '#333' }}><strong>Responsavel:</strong> {show(pos(row, 'venda', 18))}</h3>
                  <p><strong>Data:</strong> {formatDateBr(pos(row, 'venda', 2))}</p>
                  <p><strong>Status:</strong> {show(pos(row, 'venda', 6))}</p>
                  {pos(row, 'venda', 6) === 'entrevista agendada' && (
                    <p><strong>Agendada para: {show(pos(row, 'venda', 20))}</strong></p>
                  )}
                  <p><strong>Contrato:</strong> {contrato === null || contrato === undefined ? 'N/A' : show(contrato)}</p>
                  <p><strong>Vidas:</strong> {show(pos(row, 'venda', 15))}</p>
                </div>
                <div className="card-details" style={display ? { display } : undefined}>
                  <p><strong>Tipo de Contrato:</strong> {show(pos(row, 'venda', 3))}</p>
                  <p><strong>Produto:</strong> {show(pos(row, 'venda', 4))}</p>
                  <p><strong>Valor Tabela:</strong> R$ {showFloat(pos(row, 'venda', 12))}</p>
                  <p><strong>Taxa de Inscrição:</strong> R$ {showFloat(pos(row, 'venda', 10))}</p>
                  <p><strong>ISS:</strong> R$ {showFloat(row.iss)}</p>
                  <p><strong>Valor Total:</strong> R$ {showFloat(pos(row, 'venda', 8))}</p>
                  <br /><br />
                  <AppLink className="btn" href={urlFor('cad.detalhes_cnt', { proposta: pos(row, 'venda', 1), contrato })}>detalhes da venda</AppLink>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="no-results">Sem vendas nesse estágio.</p>
      )}
    </Base1Layout>
  )
}
