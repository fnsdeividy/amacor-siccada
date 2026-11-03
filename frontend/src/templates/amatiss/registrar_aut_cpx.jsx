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

        .btn {
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .btn:hover {
            background: #0056b3;
        }

        p {
            position: center;
            font-family: Arial, sans-serif;
            color: #ebebeb;
        }

        .cards-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: flex-start;
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

        .card-body h3 {
            margin: 8px 0;
            font-size: 15px;
            color: #333;
        }

        .card-details {
            display: none;
            padding: 12px;
            border-top: 1px solid #ddd;
            
            overflow: hidden;
            margin-bottom: 20px;
            transition: transform 0.3s ease;
        }

        .card-details p {
            margin: 6px 0;
            font-size: 13px;
            color: #333;
        }

        .btn-acao {
            padding: 8px 16px;
            margin: 5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-block;
            text-decoration: none;
        }

        .btn-aprovar {
            background-color: #c6f5e0;
            color: #259661;
            border: 1px solid #259661;
        }

        .btn-aprovar:hover {
            background-color: #a3e4c1;
            color: #1b5e20;
            transform: scale(1.05);
        }

        .btn-rejeitar {
            background-color: #ffadad;
            color: #b71c1c;
            border: 1px solid #b71c1c;
        }

        .btn-rejeitar:hover {
            background-color: #ff8787;
            color: #8b0000;
            transform: scale(1.05);
        }

        .btn-detalhes {
            background-color: #cbe7ff;
            color: #2176ae;
            border: 1px solid #2176ae;
        }

        .btn-detalhes:hover {
            background-color: #b0c4ff;
            color: #1a237e;
            transform: scale(1.05);
        }

        .no-results {
            text-align: center;
            margin-top: 50px;
            color: #ffffff;
            font-size: 18px;
        }

        .status-pendente {
            background-color: #fff9b0;
            color: #b3a100;
        }

        .status-aprovado {
            background-color: #c6f5e0;
            color: #259661;
        }

        .status-rejeitado {
            background-color: #ffadad;
            color: #b71c1c;
        }

        .status-em-analise {
            background-color: #cbe7ff;
            color: #2176ae;
        }

        .status-cancelado {
            background-color: #9b7b66ef;
            color: rgb(61, 50, 50);
        }

        .btn-responsavel:hover {
            background-color: #f5ed8e !important;
            color: #8a7900 !important;
            transform: scale(1.05);
        }

        .btn-analisar {
            background-color: #c596bf;
            color: #fff;
            border: 1px solid #4f4159;
        }

        .btn-analisar:hover {
            background-color: #a67ea6;
            color: #fff;
            transform: scale(1.05);
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.7);
        }

        .modal-content {
            background-color: #3549674a;
                backdrop-filter: blur(20px);
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            border-radius: 8px;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .modal-header {
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
            margin-bottom: 15px;
        }

        .modal-body {
            padding: 10px 0;
        }

        .modal-footer {
            padding: 10px 0;
            border-top: 1px solid #ddd;
            margin-top: 15px;
            text-align: right;
        }

        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }

        .close:hover,
        .close:focus {
            color: #000;
        }

        .form-control {
            width: 100%;
            padding: 8px;
            margin: 8px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        .form-label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #333;
        }

        .btn-primary {
            background-color: #007bff;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .btn-primary:hover {
            background-color: #0056b3;
        }

        .btn-secondary {
            background-color: #6c757d;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .btn-secondary:hover {
            background-color: #5a6268;
        }

        .bg-success {
            background-color: #c6f5e0 !important;
            color: #259661;
        }

        .bg-danger {
            background-color: #ffadad !important;
            color: #b71c1c;
        }

        .bg-info {
            background-color: #cbe7ff !important;
            color: #2176ae;
        }

        .text-danger {
            color: #dc3545;
        }
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
  const th = { padding: '8px', textAlign: 'left' }
  const td = { padding: '8px' }
  const tr = { borderBottom: '1px solid #ddd' }
  const js = (v) => (v === null ? 'null' : v === undefined ? 'undefined' : String(v))
  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr style={tr}><th style={th}>ID da Solicitação:</th><td style={td}>{js(data.id)}</td></tr>
          <tr style={tr}><th style={th}>ID do App:</th><td style={td}>{js(data.id_app)}</td></tr>
          <tr style={tr}><th style={th}>Carteirinha:</th><td style={td}>{js(data.card_beneficiario)}</td></tr>
          <tr style={tr}><th style={th}>Beneficiário:</th><td style={td}>{js(data.nome_beneficiario)}</td></tr>
          <tr style={tr}><th style={th}>Exame:</th><td style={td}>{js(data.nome_exame)}</td></tr>
          <tr style={tr}><th style={th}>Data/Hora:</th><td style={td}>{js(data.created_at || data.timestamp_solicitacao)}</td></tr>
          <tr style={tr}><th style={th}>Responsável:</th><td style={td}>{js(data.audit_resp_nome || 'Não atribuído')}</td></tr>
          <tr style={tr}><th style={th}>IP Origem:</th><td style={td}>{js(data.ip_origem || 'N/D')}</td></tr>
          <tr style={tr}><th style={th}>Session Token:</th><td style={{ padding: '8px', wordBreak: 'break-all', fontSize: '11px' }}>{js(data.session_token || 'N/D')}</td></tr>
          <tr style={tr}><th style={th}>Status:</th><td style={td}><span style={{ backgroundColor: statusColor, color: statusTextColor, padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>{js(data.status)}</span></td></tr>
          {data.documento_path ? (
            <tr style={tr}>
              <th style={th}>Documento:</th>
              <td style={td}>
                <AppLink download href={documentoUrl(data.documento_path)} target="_blank" style={{ color: '#007bff' }}>
                  📄 Ver Documento
                </AppLink>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {data.documento_path ? (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h4 style={{ marginBottom: '10px' }}>Pré-visualização do Documento:</h4>
          <img src={apiUrl(documentoUrl(data.documento_path))}
            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: imgError ? 'none' : undefined }}
            onError={() => setImgError(true)} />
          <div style={{ display: imgError ? 'block' : 'none', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
            <p style={{ color: '#666' }}>⚠️ Não foi possível pré-visualizar o documento.</p>
            <AppLink download href={documentoUrl(data.documento_path)} target="_blank" style={{ color: '#007bff', textDecoration: 'underline' }}>
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
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '10px 20px' }}>
        <AppLink href={urlFor('auth.fechar')} className="btn-home">🏠</AppLink>
      </div>

      <div className="search-bar-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 20px' }}>
        <ApiForm ref={filtroForm} method="get" action={urlFor('amatiss.render_aut_cpx')} id="autoSubmitForm" style={{ display: 'flex', gap: '8px', background: '#23272f00', padding: '12px 24px', borderRadius: '8px' }}>
          <select key={filtroSelecionado} id="filtrar" name="filtrar" defaultValue={filtroSelecionado}
            onChange={() => filtroForm.current.requestSubmit()}
            style={{ height: '40px', padding: '0 12px', borderRadius: '6px' }}>
            <option value="">Todas as autorizações</option>
            <option value="pendente">Pendentes</option>
            <option value="aprovado">Aprovadas</option>
            <option value="rejeitado">Rejeitadas</option>
            <option value="em analise">Em Análise</option>
            <option value="cancelado">Canceladas</option>
          </select>
        </ApiForm>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{ position: 'right', color: '#ebebeb', margin: 0 }}>Autorizações de Alta Complexidade</h2>
          <p style={{ color: '#bbb', margin: '5px 0' }}>
            <i className="fas fa-list" /> {show(ctx.total_pendentes)} autorizações
          </p>
        </div>

        <ApiForm method="get" action={urlFor('amatiss.render_aut_cpx')} style={{ display: 'flex', gap: '8px', background: '#23272f00', padding: '12px 24px', borderRadius: '8px' }}>
          <input key={buscar} type="text" name="buscar" placeholder="Buscar por nome, carteirinha..." defaultValue={buscar} style={{ padding: '8px 12px', border: '1px solid #bbb', borderRadius: '4px', minWidth: '220px', fontSize: '15px', background: '#fff', color: '#222' }} />
          <button className="btn" type="submit">Buscar</button>
        </ApiForm>
      </div>

      <InlineStyle css={css} />

      {truthy(autorizacoes) ? (
        <div className="cards-container">
          {autorizacoes.map((aut, i) => (
            <div className="card" key={i}>
              <div className={`card-header ${statusClassOf(aut)}`} onClick={() => toggleDetails(i)}>
                Autorização #{show(aut.id)}
              </div>
              <div className="card-body" onClick={() => toggleDetails(i)}>
                <h3><strong>Beneficiário:</strong> {show(aut.nome_beneficiario)}</h3>
                <p><strong>Carteirinha:</strong> {show(aut.card_beneficiario)}</p>
                <p><strong>Exame:</strong> {show(aut.nome_exame)}</p>
                <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{show(aut.status)}</span></p>
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
                  <p><strong>Responsável:</strong> <span style={{ color: '#007bff' }}>{show(aut.audit_resp)}</span></p>
                ) : (
                  <p><strong>Responsável:</strong> <span style={{ color: '#999' }}>Não atribuído</span></p>
                )}
                {truthy(aut.motivo_rejeicao) && (
                  <p><strong>Motivo Rejeição:</strong> {show(aut.motivo_rejeicao)}</p>
                )}
                {truthy(aut.documento_path) ? (
                  <p><strong>Documento:</strong>{' '}
                    <AppLink download href={documentoUrl(aut.documento_path)} target="_blank" style={{ color: '#007bff' }}>
                      📄 Ver Documento
                    </AppLink>
                  </p>
                ) : (
                  <p><strong>Documento:</strong> Não enviado</p>
                )}
                <br />
                <div style={{ textAlign: 'center' }}>
                  {aut.audit_resp !== 'None' && (
                    <>
                      <button className="btn-acao btn-aprovar" onClick={() => abrirConfirmacao('aprovar', aut.id)}>
                        ✓ Aprovar
                      </button>
                      <button className="btn-acao btn-rejeitar" onClick={() => abrirConfirmacao('rejeitar', aut.id)}>
                        ✗ Rejeitar
                      </button>
                    </>
                  )}
                  {(!truthy(aut.audit_resp) || aut.audit_resp === ctx.user_nome) && (
                    <button className="btn-acao btn-responsavel" onClick={() => assumirResponsabilidade(aut.id)} style={{ backgroundColor: '#fff9b0', color: '#b3a100', border: '1px solid #b3a100' }}>
                      👤 Assumir Responsabilidade
                    </button>
                  )}
                  {(aut.audit_resp === ctx.user_nome || ctx.tipo_usuario === 'administrativo') && (
                    <AppLink href={urlFor('amatiss.analisar_autorizacao', { autorizacao_id: aut.id })} className="btn-acao" style={{ backgroundColor: '#c596bf', color: '#fff', border: '1px solid #4f4159', textDecoration: 'none' }}>
                      🔍 Analisar em Detalhes
                    </AppLink>
                  )}
                  <button className="btn-acao btn-detalhes" onClick={() => verDetalhes(aut.id)}>
                    👁 Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-results">Não há autorizações{truthy(filtrar) ? ` com status "${show(filtrar)}"` : ''} no momento.</p>
      )}

      <div id="modalDetalhes" className="modal" style={detalhes ? { display: 'block' } : undefined}
        onClick={fecharSeFora(() => setDetalhes(null))}>
        <div className="modal-content">
          <div className="modal-header bg-info">
            <h3 style={{ margin: 0, color: 'white' }}>Detalhes da Autorização</h3>
            <span className="close" onClick={() => setDetalhes(null)}>&times;</span>
          </div>
          <div className="modal-body" id="modalDetalhesBody">
            {detalhes && <DetalhesBody key={detalhes.id} data={detalhes} />}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => setDetalhes(null)}>Fechar</button>
          </div>
        </div>
      </div>

      <div id="modalConfirmacao" className="modal" style={confirmacao ? { display: 'block' } : undefined}
        onClick={fecharSeFora(() => setConfirmacao(null))}>
        <div className="modal-content">
          <div className={'modal-header' + (confirmacao ? (aprovar ? ' bg-success' : ' bg-danger') : '')} id="modalConfirmacaoHeader">
            <h3 style={{ margin: 0 }} id="modalConfirmacaoTitulo">
              {confirmacao ? (aprovar ? 'Aprovar Autorização' : 'Rejeitar Autorização') : ''}
            </h3>
            <span className="close" onClick={() => setConfirmacao(null)}>&times;</span>
          </div>
          <div className="modal-body" id="modalConfirmacaoBody">
            {confirmacao && (aprovar ? (
              <>
                <p>Tem certeza que deseja <strong>aprovar</strong> esta autorização?</p>
                <div className="mb-3">
                  <label htmlFor="observacaoAprovacao" className="form-label">Observações (opcional):</label>
                  <textarea className="form-control" id="observacaoAprovacao" rows="3" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <p>Tem certeza que deseja <strong>rejeitar</strong> esta autorização?</p>
                <div className="mb-3">
                  <label htmlFor="observacaoRecusa" className="form-label">Motivo da rejeição <span className="text-danger">*</span>:</label>
                  <textarea className="form-control" id="observacaoRecusa" rows="3" required value={observacao} onChange={(e) => setObservacao(e.target.value)} />
                </div>
              </>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => setConfirmacao(null)}>Cancelar</button>
            <button type="button" className="btn-primary" id="btnConfirmarAcao" onClick={() => confirmacao && confirmarAcao()}>Confirmar</button>
          </div>
        </div>
      </div>
    </AmatissLayout>
  )
}
