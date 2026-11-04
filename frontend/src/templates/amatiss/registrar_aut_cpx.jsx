// amatiss/registrar_aut_cpx.html
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import AmatissLayout from '../../layouts/AmatissLayout.jsx'
import { apiFetch, apiUrl } from '../../lib/api.js'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { documentoUrl, lower, statusColors, useReload } from './helpers.js'

const css = `
.aut-cpx .aut-cpx-topo .page-toolbar { padding-right: 0; }
.aut-cpx .aut-cpx-titulo h2 { margin: 0; }
.aut-cpx .aut-cpx-total { margin: var(--space-1) 0 0; color: var(--text-muted); font-size: var(--text-sm); }
.aut-cpx .aut-cpx-total i { margin-right: var(--space-1); }
.aut-cpx .aut-cpx-filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.aut-cpx .aut-cpx-filtros form { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
.aut-cpx .aut-cpx-filtros select,
.aut-cpx .aut-cpx-filtros input { width: auto; min-width: 220px; margin: 0; }

.aut-cpx .cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: start;
  gap: var(--space-4);
}
.aut-cpx .aut-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 3px solid var(--warning-700);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.aut-cpx .aut-card:hover { box-shadow: var(--shadow-lg); }
.aut-cpx .aut-card.status-aprovado { border-top-color: var(--success-700); }
.aut-cpx .aut-card.status-rejeitado { border-top-color: var(--danger-700); }
.aut-cpx .aut-card.status-em-analise { border-top-color: var(--info-700); }
.aut-cpx .aut-card.status-cancelado { border-top-color: var(--gray-400); }
.aut-cpx .aut-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}
.aut-cpx .aut-card .card-header i { color: var(--text-muted); font-size: var(--text-sm); }
.aut-cpx .aut-card .card-body { padding: var(--space-3) var(--space-4); cursor: pointer; }
.aut-cpx .aut-card .card-body h3 { margin: 0 0 var(--space-2); font-size: var(--text-base); }
.aut-cpx .aut-card p { margin: var(--space-1) 0; font-size: var(--text-sm); color: var(--text-soft); }
.aut-cpx .aut-card strong { color: var(--text); font-weight: 600; }
.aut-cpx .status-texto {
  display: inline-flex;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: capitalize;
}
.aut-cpx .aut-card .status-texto { color: var(--warning-700); background: var(--warning-50); }
.aut-cpx .aut-card.status-aprovado .status-texto { color: var(--success-700); background: var(--success-50); }
.aut-cpx .aut-card.status-rejeitado .status-texto { color: var(--danger-700); background: var(--danger-50); }
.aut-cpx .aut-card.status-em-analise .status-texto { color: var(--info-700); background: var(--info-50); }
.aut-cpx .aut-card.status-cancelado .status-texto { color: var(--gray-700); background: var(--gray-100); }
.aut-cpx .card-details {
  display: none;
  padding: var(--space-3) var(--space-4) var(--space-4);
  background: var(--gray-50);
  border-top: 1px solid var(--border);
}
.aut-cpx .responsavel { color: var(--brand-700); }
.aut-cpx .sem-responsavel { color: var(--text-muted); }
.aut-cpx .aut-acoes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
.aut-cpx .btn-success:hover { background: var(--success-700); border-color: var(--success-700); filter: brightness(0.92); }
.aut-cpx .btn-danger:hover { background: var(--danger-700); border-color: var(--danger-700); }

.aut-cpx .no-results {
  margin: var(--space-6) 0;
  padding: var(--space-8) var(--space-4);
  text-align: center;
  font-size: var(--text-md);
  color: var(--text-muted);
  background: var(--surface);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
}

.aut-cpx .modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  align-items: flex-start;
  justify-content: center;
  padding: 5vh var(--space-4);
  overflow: auto;
  background: color-mix(in srgb, var(--gray-950) 55%, transparent);
}
.aut-cpx .modal-content {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}
.aut-cpx .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border);
}
.aut-cpx .modal-header h3 { margin: 0; font-size: var(--text-lg); color: var(--text); }
.aut-cpx .modal-header.bg-info h3 { color: var(--info-700); }
.aut-cpx .modal-header.bg-success h3 { color: var(--success-700); }
.aut-cpx .modal-header.bg-danger h3 { color: var(--danger-700); }
.aut-cpx .modal-body { padding: var(--space-4) var(--space-5); }
.aut-cpx .modal-body p { color: var(--text-soft); }
.aut-cpx .modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--gray-50);
  border-top: 1px solid var(--border);
}
.aut-cpx .close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: var(--text-xl);
  line-height: 1;
  color: var(--gray-500);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.aut-cpx .close:hover { color: var(--gray-900); background: var(--gray-100); }
.aut-cpx .form-label { display: block; margin-bottom: var(--space-1); }
.aut-cpx .text-danger { color: var(--danger-700); }

.aut-cpx .detalhes-tabela { width: 100%; border-collapse: collapse; }
.aut-cpx .detalhes-tabela th,
.aut-cpx .detalhes-tabela td {
  padding: var(--space-2) var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--border);
  background: transparent;
}
.aut-cpx .detalhes-tabela th {
  width: 34%;
  font-size: var(--text-sm);
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-muted);
}
.aut-cpx .detalhes-tabela tbody tr:hover td { background: transparent; }
.aut-cpx .detalhes-tabela .token { word-break: break-all; font-size: var(--text-xs); }
.aut-cpx .detalhes-preview { margin-top: var(--space-5); text-align: center; }
.aut-cpx .detalhes-preview h4 { margin-bottom: var(--space-3); }
.aut-cpx .detalhes-preview img {
  max-width: 100%;
  max-height: 400px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.aut-cpx .detalhes-falha {
  padding: var(--space-5);
  background: var(--surface-muted);
  border-radius: var(--radius);
}
.aut-cpx .detalhes-falha p { color: var(--text-soft); }
.aut-cpx .detalhes-falha i { color: var(--warning-700); }
`

const FILTROS = ['pendente', 'aprovado', 'rejeitado', 'em analise', 'cancelado']

function statusClassOf(aut) {
  const status = lower(aut.status)
  if (status.includes('pendente')) return 'status-pendente'
  if (status.includes('aprovado')) return 'status-aprovado'
  if (status.includes('rejeitado')) return 'status-rejeitado'
  if (status.includes('em analise') || status.includes('em análise')) return 'status-em-analise'
  if (status.includes('cancelado')) return 'status-cancelado'
  return 'status-pendente'
}

function DetalhesBody({ data }) {
  const [imgError, setImgError] = useState(false)
  const { statusColor, statusTextColor } = statusColors(data.status)
  const js = (v) => (v === null ? 'null' : v === undefined ? 'undefined' : String(v))
  return (
    <>
      <table className="detalhes-tabela">
        <tbody>
          <tr><th>ID da Solicitação:</th><td>{js(data.id)}</td></tr>
          <tr><th>ID do App:</th><td>{js(data.id_app)}</td></tr>
          <tr><th>Carteirinha:</th><td>{js(data.card_beneficiario)}</td></tr>
          <tr><th>Beneficiário:</th><td>{js(data.nome_beneficiario)}</td></tr>
          <tr><th>Exame:</th><td>{js(data.nome_exame)}</td></tr>
          <tr><th>Data/Hora:</th><td>{js(data.created_at || data.timestamp_solicitacao)}</td></tr>
          <tr><th>Responsável:</th><td>{js(data.audit_resp_nome || 'Não atribuído')}</td></tr>
          <tr><th>IP Origem:</th><td>{js(data.ip_origem || 'N/D')}</td></tr>
          <tr><th>Session Token:</th><td className="token">{js(data.session_token || 'N/D')}</td></tr>
          <tr><th>Status:</th><td><span className="status-texto" style={{ backgroundColor: statusColor, color: statusTextColor }}>{js(data.status)}</span></td></tr>
          {data.documento_path ? (
            <tr>
              <th>Documento:</th>
              <td>
                <AppLink download href={documentoUrl(data.documento_path)} target="_blank">
                  <i className="fa-solid fa-file-lines" aria-hidden="true" /> Ver Documento
                </AppLink>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {data.documento_path ? (
        <div className="detalhes-preview">
          <h4>Pré-visualização do Documento:</h4>
          <img src={apiUrl(documentoUrl(data.documento_path))}
            style={{ display: imgError ? 'none' : undefined }}
            onError={() => setImgError(true)} />
          <div className="detalhes-falha" style={{ display: imgError ? 'block' : 'none' }}>
            <p><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Não foi possível pré-visualizar o documento.</p>
            <AppLink download href={documentoUrl(data.documento_path)} target="_blank">
              Clique aqui para abrir em nova aba
            </AppLink>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default function RegistrarAutCpx() {
  const ctx = useTemplateContext()
  const [searchParams] = useSearchParams()
  const reload = useReload()
  const filtroForm = useRef(null)
  const [aberto, setAberto] = useState(null)
  const [detalhes, setDetalhes] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null) // {acao, id}
  const [observacao, setObservacao] = useState('')

  const autorizacoes = ctx.autorizacoes ?? []
  const filtrar = ctx.filtrar
  const filtroSelecionado = truthy(filtrar) && FILTROS.includes(filtrar) ? filtrar : ''
  const buscar = searchParams.get('buscar') ?? ''

  const toggleDetails = (i) => setAberto((a) => (a === i ? null : i))
  const fecharSeFora = (fechar) => (e) => { if (e.target === e.currentTarget) fechar() }

  function processarAutorizacao(id, status, obs) {
    apiFetch(urlFor('amatiss.processar_autorizacao'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, observacao: obs }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(`Autorização ${status} com sucesso!`)
          reload()
        } else {
          alert('Erro ao processar autorização: ' + data.error)
        }
      })
      .catch((error) => {
        console.error('Erro:', error)
        alert('Erro ao processar autorização.')
      })
  }

  function abrirConfirmacao(acao, id) {
    setObservacao('')
    setConfirmacao({ acao, id })
  }

  function confirmarAcao() {
    const { acao, id } = confirmacao
    if (acao === 'aprovar') {
      processarAutorizacao(id, 'aprovado', observacao)
      setConfirmacao(null)
    } else {
      const motivo = observacao
      if (!motivo.trim()) {
        alert('Por favor, informe o motivo da rejeição.')
        return
      }
      processarAutorizacao(id, 'rejeitado', motivo)
      setConfirmacao(null)
    }
  }

  function verDetalhes(id) {
    apiFetch(urlFor('amatiss.detalhes_autorizacao', { autorizacao_id: id }))
      .then((response) => response.json())
      .then((data) => setDetalhes(data))
      .catch((error) => {
        console.error('Erro ao carregar detalhes:', error)
        alert('Erro ao carregar detalhes da autorização.')
      })
  }

  function assumirResponsabilidade(id) {
    if (confirm('Deseja assumir a responsabilidade por esta autorização?')) {
      apiFetch(urlFor('amatiss.atribuir_responsavel'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert(data.message)
            reload()
          } else {
            alert('Erro: ' + data.error)
          }
        })
        .catch((error) => {
          console.error('Erro:', error)
          alert('Erro ao assumir responsabilidade.')
        })
    }
  }

  const aprovar = confirmacao?.acao === 'aprovar'

  return (
    <AmatissLayout title="Autorizações de Alta Complexidade">
      <div className="aut-cpx">
      <InlineStyle css={css} />

      <div className="card aut-cpx-topo">
        <div className="page-toolbar">
          <div className="aut-cpx-titulo">
            <h2>Autorizações de Alta Complexidade</h2>
            <p className="aut-cpx-total">
              <i className="fa-solid fa-list" aria-hidden="true" /> {show(ctx.total_pendentes)} autorizações
            </p>
          </div>
          <div className="page-toolbar-actions">
            <AppLink href={urlFor('auth.fechar')} className="btn btn-secondary" title="Início" aria-label="Início">
              <i className="fa-solid fa-house" aria-hidden="true" />
            </AppLink>
          </div>
        </div>

        <div className="search-bar-wrapper aut-cpx-filtros">
          <ApiForm ref={filtroForm} method="get" action={urlFor('amatiss.render_aut_cpx')} id="autoSubmitForm">
            <select key={filtroSelecionado} id="filtrar" name="filtrar" defaultValue={filtroSelecionado}
              onChange={() => filtroForm.current.requestSubmit()} aria-label="Filtrar por status">
              <option value="">Todas as autorizações</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovadas</option>
              <option value="rejeitado">Rejeitadas</option>
              <option value="em analise">Em Análise</option>
              <option value="cancelado">Canceladas</option>
            </select>
          </ApiForm>

          <ApiForm method="get" action={urlFor('amatiss.render_aut_cpx')}>
            <input key={buscar} type="text" name="buscar" placeholder="Buscar por nome, carteirinha..." defaultValue={buscar} />
            <button className="btn" type="submit">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Buscar
            </button>
          </ApiForm>
        </div>
      </div>

      {truthy(autorizacoes) ? (
        <div className="cards-container">
          {autorizacoes.map((aut, i) => (
            <div className={`aut-card ${statusClassOf(aut)}`} key={i}>
              <div className={`card-header ${statusClassOf(aut)}`} onClick={() => toggleDetails(i)}>
                <span>Autorização #{show(aut.id)}</span>
                <i className={`fa-solid ${aberto === i ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true" />
              </div>
              <div className="card-body" onClick={() => toggleDetails(i)}>
                <h3><strong>Beneficiário:</strong> {show(aut.nome_beneficiario)}</h3>
                <p><strong>Carteirinha:</strong> {show(aut.card_beneficiario)}</p>
                <p><strong>Exame:</strong> {show(aut.nome_exame)}</p>
                <p><strong>Status:</strong> <span className="status-texto">{show(aut.status)}</span></p>
                <p><strong>Data:</strong>{' '}
                  {truthy(aut.created_at)
                    ? show(aut.created_at)
                    : (truthy(aut.timestamp_solicitacao) ? show(aut.timestamp_solicitacao) : 'N/D')}
                </p>
              </div>
              <div className="card-details" style={aberto === i ? { display: 'block' } : undefined}>
                <p><strong>ID App:</strong> {show(aut.id_app)}</p>
                <p><strong>IP Origem:</strong> {truthy(aut.ip_origem) ? show(aut.ip_origem) : 'N/D'}</p>
                {truthy(aut.audit_resp) ? (
                  <p><strong>Responsável:</strong> <span className="responsavel">{show(aut.audit_resp)}</span></p>
                ) : (
                  <p><strong>Responsável:</strong> <span className="sem-responsavel">Não atribuído</span></p>
                )}
                {truthy(aut.motivo_rejeicao) && (
                  <p><strong>Motivo Rejeição:</strong> {show(aut.motivo_rejeicao)}</p>
                )}
                {truthy(aut.documento_path) ? (
                  <p><strong>Documento:</strong>{' '}
                    <AppLink download href={documentoUrl(aut.documento_path)} target="_blank">
                      <i className="fa-solid fa-file-lines" aria-hidden="true" /> Ver Documento
                    </AppLink>
                  </p>
                ) : (
                  <p><strong>Documento:</strong> Não enviado</p>
                )}
                <div className="aut-acoes">
                  {aut.audit_resp !== 'None' && (
                    <>
                      <button className="btn btn-sm btn-success btn-aprovar" onClick={() => abrirConfirmacao('aprovar', aut.id)}>
                        ✓ Aprovar
                      </button>
                      <button className="btn btn-sm btn-danger btn-rejeitar" onClick={() => abrirConfirmacao('rejeitar', aut.id)}>
                        ✗ Rejeitar
                      </button>
                    </>
                  )}
                  {(!truthy(aut.audit_resp) || aut.audit_resp === ctx.user_nome) && (
                    <button className="btn btn-sm btn-secondary btn-responsavel" onClick={() => assumirResponsabilidade(aut.id)}>
                      <i className="fa-solid fa-user-check" aria-hidden="true" /> Assumir Responsabilidade
                    </button>
                  )}
                  {(aut.audit_resp === ctx.user_nome || ctx.tipo_usuario === 'administrativo') && (
                    <AppLink href={urlFor('amatiss.analisar_autorizacao', { autorizacao_id: aut.id })} className="btn btn-sm btn-analisar">
                      <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Analisar em Detalhes
                    </AppLink>
                  )}
                  <button className="btn btn-sm btn-secondary btn-detalhes-aut" onClick={() => verDetalhes(aut.id)}>
                    <i className="fa-solid fa-eye" aria-hidden="true" /> Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-results">
          <i className="fa-solid fa-inbox" aria-hidden="true" /> Não há autorizações{truthy(filtrar) ? ` com status "${show(filtrar)}"` : ''} no momento.
        </p>
      )}

      <div id="modalDetalhes" className="modal" style={detalhes ? { display: 'flex' } : undefined}
        onClick={fecharSeFora(() => setDetalhes(null))}>
        <div className="modal-content">
          <div className="modal-header bg-info">
            <h3>Detalhes da Autorização</h3>
            <span className="close" role="button" aria-label="Fechar" onClick={() => setDetalhes(null)}>&times;</span>
          </div>
          <div className="modal-body" id="modalDetalhesBody">
            {detalhes && <DetalhesBody key={detalhes.id} data={detalhes} />}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setDetalhes(null)}>Fechar</button>
          </div>
        </div>
      </div>

      <div id="modalConfirmacao" className="modal" style={confirmacao ? { display: 'flex' } : undefined}
        onClick={fecharSeFora(() => setConfirmacao(null))}>
        <div className="modal-content">
          <div className={'modal-header' + (confirmacao ? (aprovar ? ' bg-success' : ' bg-danger') : '')} id="modalConfirmacaoHeader">
            <h3 id="modalConfirmacaoTitulo">
              {confirmacao ? (aprovar ? 'Aprovar Autorização' : 'Rejeitar Autorização') : ''}
            </h3>
            <span className="close" role="button" aria-label="Fechar" onClick={() => setConfirmacao(null)}>&times;</span>
          </div>
          <div className="modal-body" id="modalConfirmacaoBody">
            {confirmacao && (aprovar ? (
              <>
                <p>Tem certeza que deseja <strong>aprovar</strong> esta autorização?</p>
                <div className="form-group">
                  <label htmlFor="observacaoAprovacao" className="form-label">Observações (opcional):</label>
                  <textarea className="form-control" id="observacaoAprovacao" rows="3" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <p>Tem certeza que deseja <strong>rejeitar</strong> esta autorização?</p>
                <div className="form-group">
                  <label htmlFor="observacaoRecusa" className="form-label">Motivo da rejeição <span className="text-danger">*</span>:</label>
                  <textarea className="form-control" id="observacaoRecusa" rows="3" required value={observacao} onChange={(e) => setObservacao(e.target.value)} />
                </div>
              </>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmacao(null)}>Cancelar</button>
            <button type="button" className={'btn' + (confirmacao && !aprovar ? ' btn-danger' : '')} id="btnConfirmarAcao" onClick={() => confirmacao && confirmarAcao()}>Confirmar</button>
          </div>
        </div>
      </div>
      </div>
    </AmatissLayout>
  )
}
