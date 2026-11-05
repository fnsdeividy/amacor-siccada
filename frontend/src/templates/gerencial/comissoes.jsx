// gerencial/comissoes.html — comissão de vendedores (cálculo em backend/app/comissao.py)
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { formatCurrencyBr, formatDateBr } from '../../lib/format.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

const CSS = `
.comissoes .filtros { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-end; }
.comissoes .filtros .form-group { margin-bottom: 0; min-width: 160px; }
.comissoes table td.num, .comissoes table th.num { text-align: right; white-space: nowrap; }
.comissoes table td.mes { white-space: nowrap; font-weight: 500; }
.comissoes .col-pagamento { border-left: 2px solid var(--border-strong); }
.comissoes .form-pagamento { display: flex; gap: var(--space-2); align-items: center; flex-wrap: nowrap; }
.comissoes .form-pagamento input { width: 120px; min-height: 32px; padding: 4px 8px; }
.comissoes .form-pagamento input[type='date'] { width: 140px; }
.comissoes .muted { color: var(--text-muted); }
.comissoes .regra-linha { display: grid; grid-template-columns: 110px 140px 1fr; gap: var(--space-3); align-items: center; margin-bottom: var(--space-2); }
.comissoes .regra-linha input, .comissoes .regra-linha select { margin: 0; }
.comissoes .versoes li { padding: var(--space-2) 0; border-bottom: 1px solid var(--border); display: flex; gap: var(--space-3); justify-content: space-between; align-items: center; flex-wrap: wrap; }
.comissoes .versoes { list-style: none; padding: 0; margin: 0 0 var(--space-4); }
.comissoes .parcelas-venda span { white-space: nowrap; margin-right: var(--space-3); }
.comissoes .riscado { text-decoration: line-through; color: var(--text-muted); }
`

const SITUACAO = {
  pago: 'status-green',
  'a pagar': 'status-yellow',
  previsto: 'badge',
  'sem regra': 'status-red',
}

function Situacao({ valor }) {
  return <span className={SITUACAO[valor] || 'badge'}>{valor}</span>
}

function Filtros({ ctx }) {
  return (
    <ApiForm method="GET" action={urlFor('gerencial.comissoes')} className="filtros" key={`${ctx.corretor}|${ctx.mes}|${ctx.inicio}|${ctx.fim}`}>
      <div className="form-group">
        <label htmlFor="corretor">Vendedor</label>
        <select id="corretor" name="corretor" defaultValue={ctx.corretor || ''}>
          <option value="">Todos (resumo do mês)</option>
          {(ctx.corretores ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {ctx.modo === 'resumo' ? (
        <div className="form-group">
          <label htmlFor="mes">Mês de pagamento</label>
          <input type="month" id="mes" name="mes" defaultValue={ctx.mes} />
        </div>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="inicio">Vendas de</label>
            <input type="month" id="inicio" name="inicio" defaultValue={ctx.inicio} />
          </div>
          <div className="form-group">
            <label htmlFor="fim">até</label>
            <input type="month" id="fim" name="fim" defaultValue={ctx.fim} />
          </div>
        </>
      )}
      <button type="submit" className="btn"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Ver</button>
    </ApiForm>
  )
}

function Resumo({ ctx }) {
  const linhas = ctx.resumo ?? []
  return (
    <>
      <div className="card-container">
        <div className="stat-card">
          <span className="stat-label">A pagar em {ctx.mes_rotulo}</span>
          <span className="stat-value">R$ {formatCurrencyBr(ctx.total)}</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header">Comissões de {ctx.mes_rotulo}</div>
        {linhas.length === 0 ? (
          <p className="muted">Nenhuma regra cadastrada e nenhuma venda nos meses que geram pagamento em {ctx.mes_rotulo}.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>Regra atual</th>
                  <th className="num">Valor a pagar</th>
                  <th className="num">Valor pago</th>
                  <th>Data de pagamento</th>
                  <th>Situação</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.corretor}>
                    <td>{l.corretor}</td>
                    <td className={l.tem_regra ? '' : 'muted'}>{l.regra}</td>
                    <td className="num">R$ {formatCurrencyBr(l.valor_a_pagar)}</td>
                    <td className="num">{l.valor_pago === null ? '—' : `R$ ${formatCurrencyBr(l.valor_pago)}`}</td>
                    <td>{l.data_pagamento ? formatDateBr(l.data_pagamento) : '—'}</td>
                    <td><Situacao valor={l.situacao} /></td>
                    <td>
                      <AppLink className="btn btn-secondary btn-sm" href={urlFor('gerencial.comissoes', { corretor: l.corretor })}>
                        {l.tem_regra ? 'Abrir' : 'Cadastrar regra'}
                      </AppLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted" style={{ marginTop: 'var(--space-3)' }}>
          Vendedores sem regra cadastrada aparecem com valor zero. Abra o vendedor para cadastrar a regra.
        </p>
      </div>
    </>
  )
}

function FormPagamento({ ctx, linha }) {
  const comuns = (
    <>
      <input type="hidden" name="corretor" value={ctx.corretor} />
      <input type="hidden" name="mes_ref" value={linha.mes_pagamento} />
      <input type="hidden" name="inicio" value={ctx.inicio} />
      <input type="hidden" name="fim" value={ctx.fim} />
    </>
  )
  if (linha.situacao === 'pago') {
    return (
      <ApiForm method="POST" action={urlFor('gerencial.registrar_pagamento_comissao')} className="form-pagamento"
        onSubmit={(e) => { if (!window.confirm(`Desfazer o pagamento de ${linha.mes_pagamento_rotulo}?`)) e.preventDefault() }}>
        {comuns}
        <button type="submit" name="acao" value="desfazer" className="btn btn-secondary btn-sm">Desfazer</button>
      </ApiForm>
    )
  }
  if (linha.situacao !== 'a pagar') return null
  return (
    <ApiForm method="POST" action={urlFor('gerencial.registrar_pagamento_comissao')} className="form-pagamento" key={`${ctx.corretor}|${linha.mes_pagamento}|${linha.valor_a_pagar}`}>
      {comuns}
      <input type="text" name="valor_pago" aria-label="Valor pago" defaultValue={formatCurrencyBr(linha.valor_a_pagar)} />
      <input type="date" name="data_pagamento" aria-label="Data do pagamento" defaultValue={ctx.hoje} />
      <button type="submit" name="acao" value="registrar" className="btn btn-sm">Registrar</button>
    </ApiForm>
  )
}

function Extrato({ ctx }) {
  const ex = ctx.extrato ?? {}
  const n = ex.n_parcelas ?? 1
  const linhas = ex.linhas ?? []
  const regras = ex.regras ?? []
  const atual = regras.length ? regras[regras.length - 1] : null
  return (
    <>
      <div className="card-container">
        <div className="stat-card">
          <span className="stat-label">A pagar no período</span>
          <span className="stat-value">R$ {formatCurrencyBr(ctx.total_a_pagar)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pago no período</span>
          <span className="stat-value">R$ {formatCurrencyBr(ctx.total_pago)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Regra mais recente</span>
          <span className="stat-value">{atual ? atual.descricao : 'Sem regra cadastrada'}</span>
        </div>
      </div>

      {regras.length === 0 && (
        <p className="alert-info">{ctx.corretor} ainda não tem regra de comissão. Cadastre abaixo para o Siccada calcular os valores.</p>
      )}

      {(ex.invalidas ?? []).length > 0 && (
        <p className="alert-info">
          Vendas com data inválida (fora do cálculo — corrija a data da venda):{' '}
          {ex.invalidas.map((v) => `${v.numero_proposta} (${v.data_venda})`).join(', ')}
        </p>
      )}

      <div className="card">
        <div className="card-header">{ctx.corretor}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mês da venda</th>
                <th className="num">Valor da venda</th>
                {Array.from({ length: n }, (_, k) => <th key={k} className="num">{k + 1}ª parcela</th>)}
                {ex.tem_fixo && <th className="num">Fixo</th>}
                <th className="col-pagamento">Mês de pagamento</th>
                <th className="num">Valor a pagar</th>
                <th className="num">Valor pago</th>
                <th>Data de pag.</th>
                <th>Situação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.mes_venda}>
                  <td className="mes">{l.mes_venda_rotulo}</td>
                  <td className="num">R$ {formatCurrencyBr(l.valor_vendas)}</td>
                  {Array.from({ length: n }, (_, k) => <td key={k} className="num">R$ {formatCurrencyBr(l.parcelas[k])}</td>)}
                  {ex.tem_fixo && <td className="num">R$ {formatCurrencyBr(l.fixo)}</td>}
                  <td className="mes col-pagamento">{l.mes_pagamento_rotulo}</td>
                  <td className="num">R$ {formatCurrencyBr(l.valor_a_pagar)}</td>
                  <td className="num">{l.valor_pago === null ? '—' : `R$ ${formatCurrencyBr(l.valor_pago)}`}</td>
                  <td>{l.data_pagamento ? formatDateBr(l.data_pagamento) : '—'}</td>
                  <td><Situacao valor={l.situacao} /></td>
                  <td><FormPagamento ctx={ctx} linha={l} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 'var(--space-3)' }}>
          Cada linha mostra as vendas do mês e, ao lado, o pagamento do mês seguinte (1ª parcela deste mês + 2ª do mês anterior + 3ª de dois meses antes...).
          Parcelas de vendas canceladas ou de contratos excluídos antes do mês do pagamento não entram.
        </p>
      </div>

      <Regras ctx={ctx} regras={regras} />
      <Vendas ctx={ctx} vendas={ex.vendas ?? []} />
    </>
  )
}

function Regras({ ctx, regras }) {
  const form = ctx.regra_form ?? { parcelas: [] }
  return (
    <div className="card">
      <div className="card-header">Regra de comissão</div>
      {regras.length > 0 && (
        <ul className="versoes">
          {regras.map((r) => (
            <li key={r.vigencia}>
              <div>
                <strong>Vendas a partir de {r.vigencia_rotulo}:</strong> {r.descricao}
                {r.observacao ? <div className="muted">{r.observacao}</div> : null}
                <div className="muted">Atualizada por {r.atualizado_por || '—'} em {formatDateBr((r.atualizado_em || '').slice(0, 10))}</div>
              </div>
              <ApiForm method="POST" action={urlFor('gerencial.salvar_regra_comissao')}
                onSubmit={(e) => { if (!window.confirm(`Excluir a regra a partir de ${r.vigencia_rotulo}?`)) e.preventDefault() }}>
                <input type="hidden" name="corretor" value={ctx.corretor} />
                <input type="hidden" name="vigencia" value={r.vigencia} />
                <input type="hidden" name="inicio" value={ctx.inicio} />
                <input type="hidden" name="fim" value={ctx.fim} />
                <button type="submit" name="acao" value="excluir" className="btn btn-danger btn-sm">Excluir</button>
              </ApiForm>
            </li>
          ))}
        </ul>
      )}

      <ApiForm method="POST" action={urlFor('gerencial.salvar_regra_comissao')} key={`${ctx.corretor}|${regras.length}|${regras.map((r) => r.atualizado_em).join()}`}>
        <input type="hidden" name="corretor" value={ctx.corretor} />
        <input type="hidden" name="inicio" value={ctx.inicio} />
        <input type="hidden" name="fim" value={ctx.fim} />
        <p className="muted">
          A 1ª parcela é paga no mês seguinte à venda, a 2ª dois meses depois, e assim por diante.
          Deixe em branco as parcelas que não existem. Se já houver regra no mesmo mês de início, ela é substituída;
          vendas de meses anteriores continuam com a regra antiga.
        </p>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vigencia">Vale para vendas a partir de</label>
            <input type="month" id="vigencia" name="vigencia" defaultValue={form.vigencia} required />
          </div>
          <div className="form-group">
            <label htmlFor="valor_fixo">Valor fixo por mês (R$)</label>
            <input type="text" id="valor_fixo" name="valor_fixo" defaultValue={form.valor_fixo ? formatCurrencyBr(form.valor_fixo) : ''} placeholder="0,00" />
          </div>
        </div>
        {(form.parcelas ?? []).map((p, i) => (
          <div className="regra-linha" key={i}>
            <label htmlFor={`percentual_${i + 1}`}>{i + 1}ª parcela</label>
            <input type="text" id={`percentual_${i + 1}`} name={`percentual_${i + 1}`} placeholder="%"
              defaultValue={p.percentual === '' ? '' : String(p.percentual).replace('.', ',')} />
            <select name={`base_${i + 1}`} aria-label={`Base da ${i + 1}ª parcela`} defaultValue={i === 0 ? 'venda' : p.base}>
              <option value="venda">% sobre o valor da venda</option>
              {i > 0 && <option value="anterior">% sobre a {i}ª parcela</option>}
            </select>
          </div>
        ))}
        <div className="form-group">
          <label htmlFor="observacao">Observação</label>
          <input type="text" id="observacao" name="observacao" defaultValue={form.observacao} placeholder="Ex.: contrato assinado em 03/2026" />
        </div>
        <button type="submit" name="acao" value="salvar" className="btn">Salvar regra</button>
      </ApiForm>
    </div>
  )
}

function Vendas({ ctx, vendas }) {
  return (
    <div className="card">
      <div className="card-header">Vendas consideradas ({vendas.length})</div>
      {vendas.length === 0 ? <p className="muted">Nenhuma venda no período.</p> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Proposta</th>
                <th>Responsável</th>
                <th>Data da venda</th>
                <th className="num">Valor</th>
                <th>Status</th>
                <th>Encerrada em</th>
                <th>Parcelas</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((v) => (
                <tr key={`${v.numero_proposta}|${v.data_venda}`}>
                  <td>{v.numero_proposta}</td>
                  <td>{v.nome_responsavel || '—'}</td>
                  <td>{formatDateBr(v.data_venda)}</td>
                  <td className="num">R$ {formatCurrencyBr(v.valor_venda)}</td>
                  <td>{v.status || '—'}</td>
                  <td>{v.fim ? formatDateBr(v.fim) : '—'}</td>
                  <td className="parcelas-venda">
                    {v.parcelas.length === 0 ? <span className="muted">sem regra</span> : v.parcelas.map((p) => (
                      <span key={p.mes_pagamento} className={p.devida ? '' : 'riscado'} title={p.devida ? '' : 'Não devida: venda/contrato encerrado antes do pagamento'}>
                        {p.mes_pagamento_rotulo}: R$ {formatCurrencyBr(p.valor)}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Comissoes() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="Comissões">
      <InlineStyle css={CSS} />
      <div className="comissoes">
        <div className="card">
          <div className="page-toolbar">
            <h1>Comissões de vendedores</h1>
            {ctx.modo === 'corretor' && (
              <div className="page-toolbar-actions">
                <AppLink className="btn btn-secondary" href={urlFor('gerencial.comissoes')}>
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Resumo do mês
                </AppLink>
              </div>
            )}
          </div>
          <Filtros ctx={ctx} />
        </div>
        {ctx.modo === 'resumo' ? <Resumo ctx={ctx} /> : <Extrato ctx={ctx} />}
      </div>
    </Base1Layout>
  )
}
