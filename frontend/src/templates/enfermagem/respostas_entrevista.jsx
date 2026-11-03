// enfermagem/respostas_entrevista.html (rota cad.respostas_entrevista)
import { useEffect, useState } from 'react'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { length, show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { InlineStyle, useStylesheet } from '../../lib/useStylesheet.jsx'
import { cssRespostasEntrevista } from './estilos.js'

// "Adicionar efeito de clique nos cards"
function efeitoClique(event) {
  const card = event.currentTarget
  card.style.transform = 'scale(0.98)'
  setTimeout(() => { card.style.transform = '' }, 200)
}

function DescricaoRisco({ grau }) {
  if (grau === 'Muito Alto') {
    return <><i className="fas fa-skull-crossbones text-danger me-1"></i> Risco significativo que requer atenção imediata</>
  }
  if (grau === 'Alto') {
    return <><i className="fas fa-exclamation-circle text-warning me-1"></i> Risco elevado que necessita análise cuidadosa</>
  }
  if (grau === 'Médio') {
    return <><i className="fas fa-info-circle text-info me-1"></i> Risco moderado, recomenda-se acompanhamento</>
  }
  if (grau === 'Baixo') {
    return <><i className="fas fa-check-circle text-success me-1"></i> Risco dentro dos parâmetros aceitáveis</>
  }
  return <><i className="fas fa-question-circle text-secondary me-1"></i> Risco não classificado</>
}

export default function RespostasEntrevista() {
  const ctx = useTemplateContext()
  useStylesheet('/static/css/estilos.css')
  useStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css')

  const dados = ctx.dados
  const info = ctx.entrevista_info
  const pat = ctx.patologias_data
  const d = (k) => (dados ? show(dados[k]) : '')

  // Animar barras de risco: largura 0 e, após 300 ms, volta à largura do CSS
  const [barraZerada, setBarraZerada] = useState(false)
  useEffect(() => {
    setBarraZerada(true)
    const timer = setTimeout(() => setBarraZerada(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // {{ entrevista_info.grau_risco|replace(' ', '-')|lower }}
  const grauClasse = info ? show(info.grau_risco).replaceAll(' ', '-').toLowerCase() : ''

  return (
    <Base1Layout title="Análise de Declaração">
      <div className="container-tab-pix">
        {/* Cabeçalho melhorado */}
        <div className="page-header mb-5">
          <h1 className="display-5 fw-bold text-primary">
            <i className="fas fa-clipboard-check me-2"></i>Resultados da Análise de Entrevista
          </h1>
          <p className="lead text-muted">Análise completa das informações coletadas durante a entrevista</p>
          <div className="header-divider">
            <span className="line"></span>
            <span className="circle"></span>
            <span className="line"></span>
          </div>
        </div>

        {/* Container principal com layout melhorado */}
        <div className="results-container">
          {truthy(dados) && (
            /* Seção Dados da Pessoa */
            <section className="person-card card-hover-effect mb-5" onClick={efeitoClique}>
              <div className="section-header">
                <div className="section-icon">
                  <i className="fas fa-user-circle"></i>
                </div>
                <h2 className="section-title">Dados Pessoais</h2>
              </div>
              <div className="person-info-grid">
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">
                    <i className="fas fa-id-card"></i> CPF
                  </div>
                  <div className="info-value highlight">{d('cpf')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">
                    <i className="fas fa-user"></i> Nome Completo
                  </div>
                  <div className="info-value">{d('nome_completo')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">
                    <i className="fas fa-birthday-cake"></i> Data de Nascimento
                  </div>
                  <div className="info-value">{d('data_nascimento')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">
                    <i className="fas fa-venus-mars"></i> Sexo
                  </div>
                  <div className="info-value">{d('sexo')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">
                    <i className="fas fa-tag"></i> Tipo de Pessoa
                  </div>
                  <div className="info-value">{d('tipo_pessoa')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">
                    <i className="fas fa-file-contract"></i> Proposta ID
                  </div>
                  <div className="info-value proposal-id">{d('proposta_id')}</div>
                </div>
              </div>
            </section>
          )}

          {truthy(info) ? (
            <>
              {/* Seção Avaliação de Risco */}
              <section className="risk-assessment mb-5">
                <div className="section-header">
                  <div className="section-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h2 className="section-title">Avaliação de Risco</h2>
                  <div className="section-subtitle">
                    <i className="fas fa-calendar-alt me-1"></i>
                    Entrevista realizada em {show(info.data_declaracao)}
                  </div>
                </div>

                <div className="risk-grid">
                  {/* Cartão Grau de Risco */}
                  <div className="risk-card" onClick={efeitoClique}>
                    <div className="risk-card-header">
                      <h5><i className="fas fa-exclamation-triangle me-2"></i>Grau de Risco</h5>
                    </div>
                    <div className={`risk-card-body risk-level-${grauClasse}`}>
                      <div className="risk-indicator">
                        <div className="risk-value">{show(info.grau_risco)}</div>
                        <div className="risk-bar">
                          <div className="risk-fill" data-risk={show(info.grau_risco)}
                            style={barraZerada ? { width: '0' } : undefined}></div>
                        </div>
                      </div>
                      <div className="risk-description">
                        <DescricaoRisco grau={info.grau_risco} />
                      </div>
                    </div>
                  </div>

                  {/* Cartão Pontuação */}
                  <div className="risk-card" onClick={efeitoClique}>
                    <div className="risk-card-header">
                      <h5><i className="fas fa-calculator me-2"></i>Pontuação de Risco</h5>
                    </div>
                    <div className="risk-card-body">
                      <div className="score-display">
                        <div className="score-value">{show(info.pontuacao_risco)}</div>
                        <div className="score-label">pontos</div>
                      </div>
                      <div className="score-context">
                        <i className="fas fa-chart-bar me-1"></i> Escala de 0-100 pontos
                      </div>
                    </div>
                  </div>

                  {/* Cartão CID Principal */}
                  <div className="risk-card" onClick={efeitoClique}>
                    <div className="risk-card-header">
                      <h5><i className="fas fa-stethoscope me-2"></i>CID Principal</h5>
                    </div>
                    <div className="risk-card-body">
                      <div className="cid-display">
                        {truthy(info.cid_principal) ? (
                          <>
                            <span className="cid-code">{show(info.cid_principal)}</span>
                            <div className="cid-info">Classificação Internacional de Doenças</div>
                          </>
                        ) : (
                          <div className="no-cid">
                            <i className="fas fa-minus-circle text-muted"></i>
                            <div>Não informado</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção Patologias */}
              {truthy(pat) ? (
                <section className="pathologies-section">
                  <div className="section-header">
                    <div className="section-icon">
                      <i className="fas fa-heartbeat"></i>
                    </div>
                    <h2 className="section-title">Patologias Declaradas</h2>
                  </div>

                  {/* Resumo de patologias */}
                  <div className="summary-card mb-4">
                    <div className="summary-header">
                      <h5><i className="fas fa-clipboard-list me-2"></i>Resumo das Patologias</h5>
                    </div>
                    <div className="summary-body">
                      <div className="summary-item">
                        <div className="summary-label">Total de Patologias</div>
                        <div className="summary-value">
                          <span className="badge-count">{show(pat.total_patologias)}</span>
                        </div>
                      </div>
                      <div className="summary-item">
                        <div className="summary-label">CIDs Identificados</div>
                        <div className="summary-value">
                          <span className="badge-count">{length(pat.cids)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de patologias */}
                  <div className="row">
                    <div className="col-lg-6 mb-4">
                      <div className="card card-hover-effect h-100" onClick={efeitoClique}>
                        <div className="card-header bg-gradient-primary text-white">
                          <h5 className="mb-0">
                            <i className="fas fa-list-ul me-2"></i>Lista de Patologias
                          </h5>
                        </div>
                        <div className="card-body-pathologies-list">
                          <ul className="styled-list">
                            {(pat.patologias ?? []).map((patologia, i) => (
                              <li key={i}>
                                <i className="fas fa-arrow-right text-primary me-2"></i>
                                {show(patologia)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6 mb-4">
                      <div className="card card-hover-effect h-100" onClick={efeitoClique}>
                        <div className="card-header bg-gradient-info text-white">
                          <h5 className="mb-0">
                            <i className="fas fa-barcode me-2"></i>Códigos CID
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="cids-container">
                            {(pat.cids ?? []).map((cid, i) => (
                              <div className="cid-tag" key={i}>
                                <span className="cid-code">{show(cid)}</span>
                              </div>
                            ))}
                          </div>
                          {length(pat.cids) === 0 && (
                            <div className="text-center text-muted py-3">
                              <i className="fas fa-info-circle fa-2x mb-2"></i>
                              <p>Nenhum CID identificado</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabela de detalhamento */}
                  {truthy(pat.patologias_com_cid) && (
                    <div className="card card-hover-effect mb-4 detailed-pathologies" onClick={efeitoClique}>
                      <div className="card-header bg-gradient-success text-white">
                        <h5 className="mb-0">
                          <i className="fas fa-stethoscope me-2"></i>Detalhamento Completo de Patologias
                        </h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="pathologies-grid">
                          {pat.patologias_com_cid.map((item, i) => (
                            <div className="pathology-item" key={i}>
                              <div className="pathology-header">
                                <div className="pathology-name">
                                  <i className="fas fa-heartbeat text-danger me-2"></i>
                                  <span className="pathology-title">{show(item.nome)}</span>
                                </div>
                                {truthy(item.cid)
                                  ? <span className="badge-cid-large">{show(item.cid)}</span>
                                  : <span className="badge-cid-empty">S/ CID</span>}
                              </div>
                              <div className="pathology-category">
                                <i className="fas fa-tag text-info me-2"></i>
                                <span>{truthy(item.categoria) ? show(item.categoria) : 'Não categorizada'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              ) : (
                /* Mensagem se não houver dados de patologias */
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle fa-2x me-3"></i>
                    <div>
                      <h5 className="alert-heading mb-1">Dados de patologias não disponíveis</h5>
                      <p className="mb-0">Os dados de patologias não estão disponíveis ou estão em formato inválido.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de ação */}
              <div className="action-buttons mt-5 pt-4 border-top">
                <div className="d-flex justify-content-between">
                  <a href="   " className="btn btn-outline-primary btn-lg">
                    <i className="fas fa-arrow-left me-2"></i>Voltar
                  </a>
                  <div>
                    <button onClick={() => window.print()} className="btn btn-outline-secondary btn-lg me-2">
                      <i className="fas fa-print me-2"></i>Imprimir
                    </button>
                    <a href="" className="btn btn-primary btn-lg">
                      <i className="fas fa-edit me-2"></i>Editar Entrevista
                    </a>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Mensagem se não houver entrevista */
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-clipboard-question fa-4x text-muted"></i>
              </div>
              <h3 className="empty-state-title">Nenhuma entrevista encontrada</h3>
              <p className="empty-state-description">
                Não foi possível localizar os dados da entrevista para esta pessoa.
              </p>
              <a href="   " className="btn btn-primary btn-lg mt-3">
                <i className="fas fa-search me-2"></i>Buscar outra entrevista
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Estilos adicionais para melhorar a aparência */}
      <InlineStyle css={cssRespostasEntrevista} />
    </Base1Layout>
  )
}
