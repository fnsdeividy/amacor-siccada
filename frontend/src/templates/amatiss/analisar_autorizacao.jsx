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
.analise-aut { max-width: 1200px; margin: 0 auto; }
.analise-aut .analise-voltar { margin-bottom: var(--space-4); }
.analise-aut .autorizacao-info,
.analise-aut .acoes-container { padding: var(--space-6); }
.analise-aut .info-header,
.analise-aut .acoes-header {
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-5);
  border-bottom: 1px solid var(--border);
}
.analise-aut .info-header h2,
.analise-aut .acoes-header h3 { margin: 0; display: flex; align-items: center; gap: var(--space-2); }
.analise-aut .info-header i,
.analise-aut .acoes-header i { color: var(--brand-700); }
.analise-aut .info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.analise-aut .info-item {
  display: block;
  padding: var(--space-3) var(--space-4);
  background: var(--gray-50);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.analise-aut .info-item:last-child { border-bottom: 1px solid var(--border); }
.analise-aut .info-label {
  margin-bottom: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.analise-aut .info-value {
  font-size: var(--text-md);
  font-weight: 500;
  text-align: left;
  color: var(--text);
  overflow-wrap: anywhere;
}
.analise-aut .responsavel { color: var(--brand-700); }
.analise-aut .sem-responsavel { color: var(--text-muted); font-weight: 400; }
.analise-aut .status-badge { text-transform: capitalize; font-size: var(--text-sm); padding: 2px 10px; }
.analise-aut .status-pendente { color: var(--warning-700); background: var(--warning-50); }
.analise-aut .status-em-analise { color: var(--info-700); background: var(--info-50); }
.analise-aut .status-aprovado { color: var(--success-700); background: var(--success-50); }
.analise-aut .status-rejeitado { color: var(--danger-700); background: var(--danger-50); }
.analise-aut .alert-info { margin-bottom: var(--space-4); }
.analise-aut .alert-info i { margin-right: var(--space-1); }

.analise-aut .documento-preview { margin-top: var(--space-5); }
.analise-aut .documento-preview h3 { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3); }
.analise-aut .documento-preview h3 i { color: var(--brand-700); }
.analise-aut .documento-caminho {
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-muted);
  background: var(--surface-muted);
  border-radius: var(--radius-sm);
  overflow-wrap: anywhere;
}
.analise-aut .documento-caminho strong { color: var(--text-soft); }
.analise-aut .documento-imagem { margin-bottom: var(--space-4); text-align: center; }
.analise-aut .documento-imagem img {
  max-width: 100%;
  max-height: 600px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.analise-aut .documento-pdf {
  width: 100%;
  height: 600px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.analise-aut .documento-download { text-align: center; margin-top: var(--space-4); }
.analise-aut .documento-download p { color: var(--text-soft); }
.analise-aut .documento-download p i { color: var(--warning-700); }

.analise-aut .observacoes-box label { margin-bottom: var(--space-2); }
.analise-aut .observacoes-box textarea { min-height: 120px; }
.analise-aut .decisao-acoes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-5);
}
.analise-aut .btn-success:hover { background: var(--success-700); border-color: var(--success-700); filter: brightness(0.92); }
.analise-aut .btn-danger:hover { background: var(--danger-700); border-color: var(--danger-700); }
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
      <h3><i className="fa-solid fa-file-lines" aria-hidden="true" /> Documento Anexado</h3>

      <div className="documento-caminho">
        <strong>Caminho do arquivo:</strong> {show(path)}<br />
        <strong>URL completa:</strong> {url}
      </div>

      <div id="imagemContainer" className="documento-imagem" style={{ display: etapa === 'imagem' ? undefined : 'none' }}>
        <img id="documentoImagem"
          src={apiUrl(url)}
          alt="Documento da Autorização"
          onError={() => { console.log('Imagem falhou, tentando PDF...'); setEtapa('pdf') }} />
      </div>

      <div id="alternativaContainer" style={{ display: etapa === 'pdf' ? 'block' : 'none' }}>
        {etapa !== 'imagem' && (
          <iframe id="documentoPdf" className="documento-pdf"
            src={apiUrl(url)}
            onError={() => { console.log('PDF falhou, mostrando botão de download...'); setEtapa('download') }} />
        )}
      </div>

      <div id="downloadContainer" className="documento-download" style={{ display: etapa === 'download' ? 'block' : 'none' }}>
        <p><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Não foi possível visualizar o documento no navegador.</p>
        <AppLink download href={url}
          target="_blank"
          className="btn">
          <i className="fa-solid fa-download" aria-hidden="true" /> Abrir/Baixar Documento
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

      <div className="analise-aut">
        <div className="analise-voltar">
          <AppLink href={urlFor('amatiss.render_aut_cpx')} className="btn btn-secondary">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar para Lista
          </AppLink>
        </div>

        <div className="card autorizacao-info">
          <div className="info-header">
            <h2><i className="fa-solid fa-clipboard-list" aria-hidden="true" /> Autorização #{show(autorizacao.id)}</h2>
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
                  ? <strong className="responsavel">{show(autorizacao.audit_resp)}</strong>
                  : <span className="sem-responsavel">Não atribuído</span>}
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">IP de Origem</div>
              <div className="info-value">{truthy(autorizacao.ip_origem) ? show(autorizacao.ip_origem) : 'N/D'}</div>
            </div>
          </div>

          {truthy(autorizacao.motivo_rejeicao) && (
            <div className="alert-info">
              <strong><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Motivo de Rejeição:</strong> {show(autorizacao.motivo_rejeicao)}
            </div>
          )}

          {truthy(autorizacao.documento_path) ? (
            <DocumentoPreview key={autorizacao.documento_path} path={autorizacao.documento_path} />
          ) : (
            <div className="alert-info">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Nenhum documento foi anexado a esta autorização.
            </div>
          )}
        </div>

        {autorizacao.status === 'em analise' || autorizacao.status === 'pendente' ? (
          <div className="card acoes-container">
            <div className="acoes-header">
              <h3><i className="fa-solid fa-scale-balanced" aria-hidden="true" /> Decisão sobre a Autorização</h3>
            </div>

            <div className="form-group observacoes-box">
              <label htmlFor="observacao">Observações da Análise:</label>
              <textarea id="observacao" placeholder="Digite suas observações sobre a análise (opcional para aprovar, obrigatório para rejeitar)..."
                value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </div>

            <div className="decisao-acoes">
              <button className="btn btn-lg btn-success btn-aprovar" onClick={() => processarDecisao('aprovado')}>
                ✓ Aprovar Autorização
              </button>
              <button className="btn btn-lg btn-danger btn-rejeitar" onClick={() => processarDecisao('rejeitado')}>
                ✗ Rejeitar Autorização
              </button>
            </div>
          </div>
        ) : (
          <div className="card acoes-container">
            <div className="alert-info mb-0">
              Esta autorização já foi processada e está com status: <strong>{show(autorizacao.status)}</strong>
            </div>
          </div>
        )}
      </div>
    </AmatissLayout>
  )
}
