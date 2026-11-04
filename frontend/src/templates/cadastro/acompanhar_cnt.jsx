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
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { pos } from './_colunas.js'

// Cartões de contrato no visual novo. As classes de fase (status-laranja,
// status-verde...) continuam as mesmas do template; aqui viram uma faixa
// colorida à esquerda do cabeçalho, com as cores de estado do tokens.css.
const css = `
.cad-acomp .search-bar-wrapper {
  justify-content: space-between;
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}
.cad-acomp .cad-filtros { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
.cad-acomp .search-bar-wrapper form { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin: 0; }
.cad-acomp .search-bar-wrapper select { width: auto; min-width: 220px; margin: 0; }
.cad-acomp .search-bar-wrapper input { min-width: 220px; }

.cad-acomp .cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: start;
  gap: var(--space-4);
}
.cad-acomp .cnt-card {
  padding: 0;
  margin: 0;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cad-acomp .cnt-card:hover { border-color: var(--brand-600); box-shadow: var(--shadow-lg); }
.cad-acomp .card-atrasado { border-color: var(--danger-600); box-shadow: 0 0 0 1px var(--danger-600); }
.cad-acomp .card-atrasado:hover { border-color: var(--danger-700); }

.cad-acomp .cnt-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--text);
  background: var(--gray-50);
  border-bottom: 1px solid var(--border);
  border-left: 4px solid var(--gray-300);
  cursor: pointer;
  user-select: none;
}
.cad-acomp .cnt-card .card-header i { color: var(--text-muted); font-size: var(--text-sm); }

.cad-acomp .card-header.status-laranja       { border-left-color: var(--warning-700); background: var(--warning-50); }
.cad-acomp .card-header.status-amarelo       { border-left-color: var(--warning-700); }
.cad-acomp .card-header.status-verde         { border-left-color: var(--success-700); background: var(--success-50); }
.cad-acomp .card-header.status-verde-escuro  { border-left-color: var(--success-700); }
.cad-acomp .card-header.status-verde-medio   { border-left-color: var(--success-700); background: var(--success-50); }
.cad-acomp .card-header.status-azulclaro     { border-left-color: var(--info-700); background: var(--info-50); }
.cad-acomp .card-header.status-azulescuro    { border-left-color: var(--brand-900); background: var(--brand-50); }
.cad-acomp .card-header.status-vermelho      { border-left-color: var(--danger-700); background: var(--danger-50); }
.cad-acomp .card-header.status-rosa          { border-left-color: var(--danger-600); }
.cad-acomp .card-header.status-marrom        { border-left-color: var(--gray-500); background: var(--gray-100); }
.cad-acomp .card-header.status-pendente      { border-left-color: var(--danger-600); background: var(--warning-50); }

.cad-acomp .cnt-card .card-body { padding: var(--space-2) var(--space-4); cursor: pointer; }
.cad-acomp .cnt-card .cnt-resp { padding: var(--space-2) 0; font-weight: 600; color: var(--text); }
.cad-acomp .cnt-card .cnt-resp .info-label { display: block; font-weight: 400; }
.cad-acomp .cnt-card .info-item { padding: 6px 0; font-size: var(--text-sm); }
.cad-acomp .cnt-card .card-details {
  display: none;
  padding: var(--space-2) var(--space-4) var(--space-4);
  background: var(--gray-50);
  border-top: 1px solid var(--border);
}
.cad-acomp .cnt-card .card-details .btn { width: 100%; margin-top: var(--space-3); }
.cad-acomp .no-results {
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
}
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

function Info({ rotulo, children }) {
  return (
    <div className="info-item">
      <span className="info-label">{rotulo}</span>
      <span className="info-value">{children}</span>
    </div>
  )
}

export default function AcompanharCnt() {
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
      <InlineStyle css={css} />
      <div className="cad-acomp">
        <div key={location.search} className="search-bar-wrapper">
          <div className="cad-filtros">
            <AppLink href={urlFor('auth.fechar')} className="btn btn-secondary" title="Início" aria-label="Início">
              <i className="fa-solid fa-house" aria-hidden="true" />
            </AppLink>
            {/* Filtro */}
            <ApiForm ref={filtroRef} method="get" action={urlFor('cad.acompanhar_cnt')} id="autoSubmitForm">
              <select id="filtrar" name="filtrar" required defaultValue=""
                onChange={() => filtroRef.current?.requestSubmit()}>
                <option value="" disabled>Filtrar fase:</option>
                <OpcoesFiltro ctx={ctx} />
              </select>
            </ApiForm>
          </div>

          {/* Busca */}
          <ApiForm method="get" action={urlFor('cad.acompanhar_cnt')}>
            <input type="text" name="buscar" placeholder="Buscar por proposta" defaultValue={searchParams.get('buscar') ?? ''} />
            <button className="btn" type="submit"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar</button>
          </ApiForm>
        </div>

        {truthy(ctx.result) ? (
          <div className="cards-container">
            {rows.map((row, i) => {
              const statusDoc = str(pos(row, 'venda', 19))
              const status = str(pos(row, 'venda', 6)).toLowerCase()
              const atraso = str(pos(row, 'venda', 23))
              const cardClass = 'card cnt-card' + (atraso === '1' ? ' card-atrasado' : '')
              const contrato = pos(row, 'venda', 13)
              const display = detalhes[i]
              return (
                <div className={cardClass} key={i}>
                  <div className={'card-header ' + statusClass(status, statusDoc)} onClick={() => toggleDetails(i)}>
                    <span>Proposta #{show(pos(row, 'venda', 1))}</span>
                    <i className={'fa-solid ' + (display === 'block' ? 'fa-chevron-up' : 'fa-chevron-down')} aria-hidden="true" />
                  </div>
                  <div className="card-body" onClick={() => toggleDetails(i)}>
                    <div className="cnt-resp">
                      <span className="info-label">Responsavel:</span> {show(pos(row, 'venda', 18))}
                    </div>
                    <Info rotulo="Data:">{formatDateBr(pos(row, 'venda', 2))}</Info>
                    <Info rotulo="Status:">{show(pos(row, 'venda', 6))}</Info>
                    {pos(row, 'venda', 6) === 'entrevista agendada' && (
                      <Info rotulo="Agendada para:">{show(pos(row, 'venda', 20))}</Info>
                    )}
                    <Info rotulo="Contrato:">{contrato === null || contrato === undefined ? 'N/A' : show(contrato)}</Info>
                    <Info rotulo="Vidas:">{show(pos(row, 'venda', 15))}</Info>
                  </div>
                  <div className="card-details" style={display ? { display } : undefined}>
                    <Info rotulo="Tipo de Contrato:">{show(pos(row, 'venda', 3))}</Info>
                    <Info rotulo="Produto:">{show(pos(row, 'venda', 4))}</Info>
                    <Info rotulo="Valor Tabela:">R$ {showFloat(pos(row, 'venda', 12))}</Info>
                    <Info rotulo="Taxa de Inscrição:">R$ {showFloat(pos(row, 'venda', 10))}</Info>
                    <Info rotulo="ISS:">R$ {showFloat(row.iss)}</Info>
                    <Info rotulo="Valor Total:">R$ {showFloat(pos(row, 'venda', 8))}</Info>
                    <AppLink className="btn" href={urlFor('cad.detalhes_cnt', { proposta: pos(row, 'venda', 1), contrato })}>detalhes da venda</AppLink>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="no-results">Sem vendas nesse estágio.</p>
        )}
      </div>
    </Base1Layout>
  )
}
