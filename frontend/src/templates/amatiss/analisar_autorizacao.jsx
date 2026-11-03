// amatiss/analisar_autorizacao.html
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLink from '../../components/AppLink.jsx'
import AmatissLayout from '../../layouts/AmatissLayout.jsx'
import { apiFetch, apiUrl } from '../../lib/api.js'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { documentoUrl, lower } from './helpers.js'

const css = `
    .analise-container {
        max-width: 1200px;
        margin: 30px auto;
        padding: 20px;
    }

    .btn-voltar {
        background: linear-gradient(145deg, #1a2a6c, #36a2eb);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
        display: inline-block;
        margin-bottom: 20px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.25);
        transition: all 0.3s ease;
    }

    .btn-voltar:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.3);
    }

    .autorizacao-info {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        margin-bottom: 30px;
    }

    .info-header {
        border-bottom: 3px solid #c596bf;
        padding-bottom: 15px;
        margin-bottom: 25px;
    }

    .info-header h2 {
        color: #4f4159;
        margin: 0;
        font-size: 26px;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
    }

    .info-item {
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #c596bf;
    }

    .info-label {
        font-weight: bold;
        color: #4f4159;
        font-size: 14px;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .info-value {
        color: #333;
        font-size: 16px;
        word-wrap: break-word;
    }

    .status-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 600;
        text-transform: capitalize;
        font-size: 14px;
    }

    .status-pendente {
        background-color: #fff9b0;
        color: #b3a100;
    }

    .status-em-analise {
        background-color: #cbe7ff;
        color: #2176ae;
    }

    .status-aprovado {
        background-color: #c6f5e0;
        color: #259661;
    }

    .status-rejeitado {
        background-color: #ffadad;
        color: #b71c1c;
    }

    .documento-preview {
        margin-top: 20px;
        text-align: center;
    }

    .documento-preview img {
        max-width: 100%;
        max-height: 600px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: transform 0.3s ease;
    }

    .documento-preview img:hover {
        transform: scale(1.02);
    }

    .acoes-container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    .acoes-header {
        border-bottom: 3px solid #c596bf;
        padding-bottom: 15px;
        margin-bottom: 25px;
    }

    .acoes-header h3 {
        color: #4f4159;
        margin: 0;
        font-size: 22px;
    }

    .btn-acao {
        padding: 12px 30px;
        margin: 10px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s ease;
        display: inline-block;
        text-decoration: none;
    }

    .btn-aprovar {
        background-color: #c6f5e0;
        color: #259661;
        border: 2px solid #259661;
    }

    .btn-aprovar:hover {
        background-color: #a3e4c1;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(37, 150, 97, 0.3);
    }

    .btn-rejeitar {
        background-color: #ffadad;
        color: #b71c1c;
        border: 2px solid #b71c1c;
    }

    .btn-rejeitar:hover {
        background-color: #ff8787;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(183, 28, 28, 0.3);
    }

    .observacoes-box {
        margin-top: 20px;
    }

    .observacoes-box label {
        display: block;
        font-weight: bold;
        color: #4f4159;
        margin-bottom: 8px;
        font-size: 16px;
    }

    .observacoes-box textarea {
        width: 100%;
        min-height: 120px;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 15px;
        font-family: Arial, sans-serif;
        resize: vertical;
        transition: border-color 0.3s ease;
    }

    .observacoes-box textarea:focus {
        outline: none;
        border-color: #c596bf;
    }

    .alert-info {
        background-color: #cbe7ff;
        color: #2176ae;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #2176ae;
    }
`

function statusBadgeClass(statusRaw) {
  const status = lower(statusRaw)
  if (status.includes('pendente')) return 'status-badge status-pendente'
  if (status.includes('em analise') || status.includes('em análise')) return 'status-badge status-em-analise'
  if (status.includes('aprovado')) return 'status-badge status-aprovado'
  if (status.includes('rejeitado')) return 'status-badge status-rejeitado'
  return 'status-badge'
}

function DocumentoPreview({ path }) {
  // 'imagem' -> se a imagem falhar, 'pdf' (iframe) -> se falhar, 'download'
  const [etapa, setEtapa] = useState('imagem')
  const url = documentoUrl(path)
  return (
    <div className="documento-preview">
      <h3 style={{ color: '#4f4159', marginBottom: '15px' }}>📄 Documento Anexado</h3>

      <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Caminho do arquivo:</strong> {show(path)}<br />
        <strong>URL completa:</strong> {url}
      </div>

      <div id="imagemContainer" style={{ marginBottom: '15px', display: etapa === 'imagem' ? undefined : 'none' }}>
        <img id="documentoImagem"
          src={apiUrl(url)}
          alt="Documento da Autorização"
          style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          onError={() => { console.log('Imagem falhou, tentando PDF...'); setEtapa('pdf') }} />
      </div>

      <div id="alternativaContainer" style={{ display: etapa === 'pdf' ? 'block' : 'none' }}>
        {etapa !== 'imagem' && (
          <iframe id="documentoPdf"
            src={apiUrl(url)}
            style={{ width: '100%', height: '600px', border: '2px solid #ddd', borderRadius: '8px' }}
            onError={() => { console.log('PDF falhou, mostrando botão de download...'); setEtapa('download') }} />
        )}
      </div>

      <div id="downloadContainer" style={{ display: etapa === 'download' ? 'block' : 'none', textAlign: 'center', marginTop: '15px' }}>
        <p style={{ color: '#666', marginBottom: '15px' }}>⚠️ Não foi possível visualizar o documento no navegador.</p>
        <AppLink download href={url}
          target="_blank"
          className="btn-acao"
          style={{ backgroundColor: '#007bff', color: 'white', border: '2px solid #0056b3' }}>
          📥 Abrir/Baixar Documento
        </AppLink>
      </div>
    </div>
  )
}

export default function AnalisarAutorizacao() {
  const ctx = useTemplateContext()
  const navigate = useNavigate()
  const autorizacao = ctx.autorizacao ?? {}
  const [observacao, setObservacao] = useState('')

  function processarDecisao(status) {
    if (status === 'rejeitado' && !observacao.trim()) {
      alert('Por favor, informe o motivo da rejeição.')
      return
    }
    const mensagem = status === 'aprovado'
      ? 'Tem certeza que deseja APROVAR esta autorização?'
      : 'Tem certeza que deseja REJEITAR esta autorização?'
    if (!confirm(mensagem)) {
      return
    }
    apiFetch(urlFor('amatiss.processar_autorizacao'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: autorizacao.id, status, observacao }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(`Autorização ${status} com sucesso!`)
          navigate(urlFor('amatiss.render_aut_cpx'))
        } else {
          alert('Erro ao processar autorização: ' + data.error)
        }
      })
      .catch((error) => {
        console.error('Erro:', error)
        alert('Erro ao processar autorização.')
      })
  }

  return (
    <AmatissLayout title={`Analisar Autorização #${show(autorizacao.id)}`}>
      <InlineStyle css={css} />

      <div className="analise-container">
        <AppLink href={urlFor('amatiss.render_aut_cpx')} className="btn-voltar">⬅ Voltar para Lista</AppLink>

        <div className="autorizacao-info">
          <div className="info-header">
            <h2>📋 Autorização #{show(autorizacao.id)}</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Beneficiário</div>
              <div className="info-value">{show(autorizacao.nome_beneficiario)}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Carteirinha</div>
              <div className="info-value">{show(autorizacao.card_beneficiario)}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Exame Solicitado</div>
              <div className="info-value">{show(autorizacao.nome_exame)}</div>
            </div>

            <div className="info-item">
              <div className="info-label">ID do App</div>
              <div className="info-value">{show(autorizacao.id_app)}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Data/Hora da Solicitação</div>
              <div className="info-value">
                {truthy(autorizacao.created_at)
                  ? show(autorizacao.created_at)
                  : (truthy(autorizacao.timestamp_solicitacao) ? show(autorizacao.timestamp_solicitacao) : 'N/D')}
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">Status Atual</div>
              <div className="info-value">
                <span className={statusBadgeClass(autorizacao.status)}>{show(autorizacao.status)}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">Responsável pela Análise</div>
              <div className="info-value">
                {truthy(autorizacao.audit_resp)
                  ? <strong style={{ color: '#007bff' }}>{show(autorizacao.audit_resp)}</strong>
                  : <span style={{ color: '#999' }}>Não atribuído</span>}
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">IP de Origem</div>
              <div className="info-value">{truthy(autorizacao.ip_origem) ? show(autorizacao.ip_origem) : 'N/D'}</div>
            </div>
          </div>

          {truthy(autorizacao.motivo_rejeicao) && (
            <div className="alert-info">
              <strong>⚠️ Motivo de Rejeição:</strong> {show(autorizacao.motivo_rejeicao)}
            </div>
          )}

          {truthy(autorizacao.documento_path) ? (
            <DocumentoPreview key={autorizacao.documento_path} path={autorizacao.documento_path} />
          ) : (
            <div className="alert-info">
              ⚠️ Nenhum documento foi anexado a esta autorização.
            </div>
          )}
        </div>

        {autorizacao.status === 'em analise' || autorizacao.status === 'pendente' ? (
          <div className="acoes-container">
            <div className="acoes-header">
              <h3>🔍 Decisão sobre a Autorização</h3>
            </div>

            <div className="observacoes-box">
              <label htmlFor="observacao">Observações da Análise:</label>
              <textarea id="observacao" placeholder="Digite suas observações sobre a análise (opcional para aprovar, obrigatório para rejeitar)..."
                value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </div>

            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <button className="btn-acao btn-aprovar" onClick={() => processarDecisao('aprovado')}>
                ✓ Aprovar Autorização
              </button>
              <button className="btn-acao btn-rejeitar" onClick={() => processarDecisao('rejeitado')}>
                ✗ Rejeitar Autorização
              </button>
            </div>
          </div>
        ) : (
          <div className="acoes-container">
            <div className="alert-info">
              Esta autorização já foi processada e está com status: <strong>{show(autorizacao.status)}</strong>
            </div>
          </div>
        )}
      </div>
    </AmatissLayout>
  )
}
