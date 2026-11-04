// cadastro/exibir_credenciadas.html
import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { pos } from './_colunas.js'
import { Oculto } from './_ui.js'

// Cartões de credenciada no visual novo (mesmas classes de fase do template,
// como faixa colorida à esquerda do cabeçalho).
const css = `
.cad-cred-lista .search-bar-wrapper {
  justify-content: space-between;
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}
.cad-cred-lista .cad-acoes { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
.cad-cred-lista .search-bar-wrapper form { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin: 0; }
.cad-cred-lista .search-bar-wrapper input { min-width: 220px; }

.cad-cred-lista .cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: start;
  gap: var(--space-4);
}
.cad-cred-lista .cred-card {
  padding: 0;
  margin: 0;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cad-cred-lista .cred-card:hover { border-color: var(--brand-600); box-shadow: var(--shadow-lg); }
.cad-cred-lista .card-atrasado { border-color: var(--danger-600); box-shadow: 0 0 0 1px var(--danger-600); }

.cad-cred-lista .cred-card .card-header {
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
  border-left: 4px solid var(--brand-700);
  cursor: pointer;
  user-select: none;
}
.cad-cred-lista .cred-card .card-header i { color: var(--text-muted); font-size: var(--text-sm); }
.cad-cred-lista .card-header.status-laranja       { border-left-color: var(--warning-700); background: var(--warning-50); }
.cad-cred-lista .card-header.status-amarelo       { border-left-color: var(--warning-700); }
.cad-cred-lista .card-header.status-verde,
.cad-cred-lista .card-header.status-verde-medio   { border-left-color: var(--success-700); background: var(--success-50); }
.cad-cred-lista .card-header.status-verde-escuro  { border-left-color: var(--success-700); }
.cad-cred-lista .card-header.status-azulclaro     { border-left-color: var(--info-700); background: var(--info-50); }
.cad-cred-lista .card-header.status-azulescuro    { border-left-color: var(--brand-900); background: var(--brand-50); }
.cad-cred-lista .card-header.status-vermelho      { border-left-color: var(--danger-700); background: var(--danger-50); }
.cad-cred-lista .card-header.status-rosa          { border-left-color: var(--danger-600); }
.cad-cred-lista .card-header.status-marrom        { border-left-color: var(--gray-500); background: var(--gray-100); }
.cad-cred-lista .card-header.status-pendente      { border-left-color: var(--danger-600); background: var(--warning-50); }

.cad-cred-lista .cred-card .card-body { padding: var(--space-2) var(--space-4); cursor: pointer; }
.cad-cred-lista .cred-card .cred-end { padding: var(--space-2) 0; color: var(--text); }
.cad-cred-lista .cred-card .cred-end .info-label { display: block; }
.cad-cred-lista .cred-card .info-item { padding: 6px 0; font-size: var(--text-sm); }
.cad-cred-lista .cred-card .card-details {
  display: none;
  padding: var(--space-2) var(--space-4) var(--space-4);
  background: var(--gray-50);
  border-top: 1px solid var(--border);
}
.cad-cred-lista .cred-card .card-details .btn { width: 100%; margin-top: var(--space-3); }
`

/** {{ x|string }} (índice inexistente na linha -> Undefined -> "") */
const str = (v) => (v === undefined ? '' : show(v))

// Mesmas regras do template (copiadas de acompanhar_cnt, com 'boleto emitido').
// As linhas são da tabela clinicas: row[19] e row[23] não existem.
function statusClass(status, statusDoc) {
  if (status.includes('enviado ao cadastro') && statusDoc === '0') return 'status-laranja'
  if (status.includes('aguardando entrevista online')) return 'status-verde'
  if (status.includes('entrevista online enviada')) return 'status-verde-escuro'
  if (status.includes('analise de declaração')) return 'status-verde-medio'
  if (status.includes('entrevista agendada')) return 'status-azulclaro'
  if (status.includes('geração de kit')) return 'status-azulescuro'
  if (status.includes('contrato finalizado')) return 'status-azulescuro'
  if (status.includes('enviado para financeiro')) return 'status-vermelho'
  if (status.includes('boleto emitido')) return 'status-rosa'
  if (status.includes('venda cancelada')) return 'status-marrom'
  if (status.includes('em pendencia')) return 'status-pendente'
  if (statusDoc === '1') return 'status-amarelo'
  return ''
}

export default function ExibirCredenciadas() {
  const ctx = useTemplateContext()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  // style.display de cada .card-details, como o toggleDetails() do template
  const [detalhes, setDetalhes] = useState({})

  function toggleDetails(index) {
    setDetalhes((atual) => {
      const novo = {}
      ;(ctx.resultado ?? []).forEach((_, i) => { if (i !== index) novo[i] = 'none' })
      novo[index] = atual[index] === 'none' ? 'block' : 'none'
      return novo
    })
  }

  return (
    <Base1Layout title="Exibir credenciadas">
      <InlineStyle css={css} />
      <div className="cad-cred-lista">
        <div className="search-bar-wrapper">
          <div className="cad-acoes">
            <AppLink href={urlFor('auth.fechar')} className="btn btn-secondary" title="Início" aria-label="Início">
              <i className="fa-solid fa-house" aria-hidden="true" />
            </AppLink>
            <AppLink href={urlFor('cad.adicionar_credenciada')} className="btn">
              <i className="fa-solid fa-plus" aria-hidden="true" /><Oculto>+</Oculto> Nova credenciada
            </AppLink>
          </div>

          {/* Busca */}
          <ApiForm key={location.search} method="get" action={urlFor('cad.exibir_credenciadas')}>
            <input type="text" name="buscar" placeholder="Buscar por Nome" defaultValue={searchParams.get('buscar') ?? ''} />
            <button className="btn" type="submit"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar</button>
          </ApiForm>
        </div>

        {truthy(ctx.resultado) && (
          <div className="cards-container">
            {ctx.resultado.map((row, i) => {
              const statusDoc = str(pos(row, 'clinicas', 19))
              const status = str(pos(row, 'clinicas', 6)).toLowerCase()
              const atraso = str(pos(row, 'clinicas', 23))
              const cardClass = 'card cred-card' + (atraso === '1' ? ' card-atrasado' : '')
              const display = detalhes[i]
              return (
                <div className={cardClass} key={i}>
                  <div className={'card-header ' + statusClass(status, statusDoc)} onClick={() => toggleDetails(i)}>
                    <span>{show(row.nome)}</span>
                    <i className={'fa-solid ' + (display === 'block' ? 'fa-chevron-up' : 'fa-chevron-down')} aria-hidden="true" />
                  </div>

                  <div className="card-body" onClick={() => toggleDetails(i)}>
                    <div className="cred-end">
                      <span className="info-label">Endereço:</span> {show(row.endereco)}
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className="info-value">{show(row.status)}</span>
                    </div>
                  </div>

                  <div className="card-details" style={display ? { display } : undefined}>
                    <div className="info-item">
                      <span className="info-label">Tel:</span>
                      <span className="info-value">{show(row.telefone)}</span>
                    </div>

                    <AppLink className="btn"
                      href={urlFor('cad.alterar_credenciada', { clinica_id: pos(row, 'clinicas', 0) })}>
                      <i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Alterar informações
                    </AppLink>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Base1Layout>
  )
}
