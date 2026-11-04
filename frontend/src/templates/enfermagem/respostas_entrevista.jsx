// enfermagem/respostas_entrevista.html (rota cad.respostas_entrevista)
import { useEffect, useState } from 'react'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { length, show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { cssRespostasEntrevista } from './estilos.js'

// "Adicionar efeito de clique nos cards"
function efeitoClique(event) {
  const card = event.currentTarget
  card.style.transform = 'scale(0.98)'
  setTimeout(() => { card.style.transform = '' }, 200)
}

const SELO_RISCO = {
  'Muito Alto': 'status-red',
  Alto: 'status-red',
  'Médio': 'status-yellow',
  Baixo: 'status-green',
}

function DescricaoRisco({ grau }) {
  if (grau === 'Muito Alto') {
    return <><i className="fa-solid fa-skull-crossbones text-danger me-1" aria-hidden="true"></i> Risco significativo que requer atenção imediata</>
  }
  if (grau === 'Alto') {
    return <><i className="fa-solid fa-circle-exclamation text-warning me-1" aria-hidden="true"></i> Risco elevado que necessita análise cuidadosa</>
  }
  if (grau === 'Médio') {
    return <><i className="fa-solid fa-circle-info text-info me-1" aria-hidden="true"></i> Risco moderado, recomenda-se acompanhamento</>
  }
  if (grau === 'Baixo') {
    return <><i className="fa-solid fa-circle-check text-success me-1" aria-hidden="true"></i> Risco dentro dos parâmetros aceitáveis</>
  }
  return <><i className="fa-solid fa-circle-question text-secondary me-1" aria-hidden="true"></i> Risco não classificado</>
}

export default function RespostasEntrevista() {
  const ctx = useTemplateContext()

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
  // selo do grau de risco (status-* do visual novo)
  const grauSelo = info ? (SELO_RISCO[info.grau_risco] ?? 'badge') : 'badge'

  const icone = (nome, extra = '') => <i className={`fa-solid fa-${nome}${extra ? ' ' + extra : ''}`} aria-hidden="true"></i>

  return (
    <Base1Layout title="Análise de Declaração">
      <InlineStyle css={cssRespostasEntrevista} />
      <div className="enf-respostas">
        {/* Cabeçalho da tela: título e ações */}
        <div className="card">
          <div className="page-toolbar">
            <div>
              <h1>{icone('clipboard-check', 'me-2')}Resultados da Análise de Entrevista</h1>
              <p className="text-muted">Análise completa das informações coletadas durante a entrevista</p>
            </div>
            {truthy(info) && (
              <div className="page-toolbar-actions">
                <a href="   " className="btn btn-secondary">
                  {icone('arrow-left')}Voltar
                </a>
                <button onClick={() => window.print()} className="btn btn-secondary">
                  {icone('print')}Imprimir
                </button>
                <a href="" className="btn">
                  {icone('pen-to-square')}Editar Entrevista
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="results-container">
          {truthy(dados) && (
            /* Seção Dados da Pessoa */
            <section className="card person-card card-hover-effect" onClick={efeitoClique}>
              <div className="section-header">
                <div className="section-icon">{icone('circle-user')}</div>
                <h2 className="section-title">Dados Pessoais</h2>
              </div>
              <div className="person-info-grid">
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">{icone('id-card')} CPF</div>
                  <div className="info-value highlight">{d('cpf')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">{icone('user')} Nome Completo</div>
                  <div className="info-value">{d('nome_completo')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">{icone('cake-candles')} Data de Nascimento</div>
                  <div className="info-value">{d('data_nascimento')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">{icone('venus-mars')} Sexo</div>
                  <div className="info-value">{d('sexo')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">{icone('tag')} Tipo de Pessoa</div>
                  <div className="info-value">{d('tipo_pessoa')}</div>
                </div>
                <div className="info-item" onClick={efeitoClique}>
                  <div className="info-label">{icone('file-contract')} Proposta ID</div>
                  <div className="info-value proposal-id">{d('proposta_id')}</div>
                </div>
              </div>
            </section>
          )}

          {truthy(info) ? (
            <>
              {/* Seção Avaliação de Risco */}
              <section className="card risk-assessment">
                <div className="section-header">
                  <div className="section-icon">{icone('chart-line')}</div>
                  <h2 className="section-title">Avaliação de Risco</h2>
                  <div className="section-subtitle">
                    {icone('calendar-days', 'me-1')}
                    Entrevista realizada em {show(info.data_declaracao)}
                  </div>
                </div>

                <div className="card-container risk-grid">
                  {/* Cartão Grau de Risco */}
                  <div className="risk-card" onClick={efeitoClique}>
                    <div className="risk-card-header">
                      <h5>{icone('triangle-exclamation', 'me-2')}Grau de Risco</h5>
                    </div>
                    <div className={`risk-card-body risk-level-${grauClasse}`}>
                      <div className="risk-indicator">
                        <div className="risk-value"><span className={grauSelo}>{show(info.grau_risco)}</span></div>
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
                      <h5>{icone('calculator', 'me-2')}Pontuação de Risco</h5>
                    </div>
                    <div className="risk-card-body">
                      <div className="score-display">
                        <div className="score-value">{show(info.pontuacao_risco)}</div>
                        <div className="score-label">pontos</div>
                      </div>
                      <div className="score-context">
                        {icone('chart-column', 'me-1')} Escala de 0-100 pontos
                      </div>
                    </div>
                  </div>

                  {/* Cartão CID Principal */}
                  <div className="risk-card" onClick={efeitoClique}>
                    <div className="risk-card-header">
                      <h5>{icone('stethoscope', 'me-2')}CID Principal</h5>
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
                            {icone('circle-minus', 'text-muted')}
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
                <section className="card pathologies-section">
                  <div className="section-header">
                    <div className="section-icon">{icone('heart-pulse')}</div>
                    <h2 className="section-title">Patologias Declaradas</h2>
                  </div>

                  {/* Resumo de patologias */}
                  <div className="summary-card">
                    <h5>{icone('clipboard-list', 'me-2')}Resumo das Patologias</h5>
                    <div className="card-container">
                      <div className="stat-card">
                        <span className="stat-label">Total de Patologias</span>
                        <span className="stat-value">{show(pat.total_patologias)}</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-label">CIDs Identificados</span>
                        <span className="stat-value">{length(pat.cids)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de patologias */}
                  <div className="enf-duas-colunas">
                    <div className="card card-hover-effect" onClick={efeitoClique}>
                      <div className="card-header">
                        <h5>{icone('list-ul', 'me-2')}Lista de Patologias</h5>
                      </div>
                      <div className="card-body">
                        <ul className="styled-list">
                          {(pat.patologias ?? []).map((patologia, i) => (
                            <li key={i}>
                              {icone('arrow-right', 'me-2')}
                              {show(patologia)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="card card-hover-effect" onClick={efeitoClique}>
                      <div className="card-header">
                        <h5>{icone('barcode', 'me-2')}Códigos CID</h5>
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
                          <div className="enf-vazio-cid">
                            {icone('circle-info')}
                            <p>Nenhum CID identificado</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tabela de detalhamento */}
                  {truthy(pat.patologias_com_cid) && (
                    <div className="card card-hover-effect detailed-pathologies" onClick={efeitoClique}>
                      <div className="card-header">
                        <h5>{icone('stethoscope', 'me-2')}Detalhamento Completo de Patologias</h5>
                      </div>
                      <div className="card-body">
                        <div className="pathologies-grid">
                          {pat.patologias_com_cid.map((item, i) => (
                            <div className="pathology-item" key={i}>
                              <div className="pathology-header">
                                <div className="pathology-name">
                                  {icone('heart-pulse', 'me-2')}
                                  <span className="pathology-title">{show(item.nome)}</span>
                                </div>
                                {truthy(item.cid)
                                  ? <span className="badge badge-cid-large">{show(item.cid)}</span>
                                  : <span className="badge badge-cid-empty">S/ CID</span>}
                              </div>
                              <div className="pathology-category">
                                {icone('tag', 'me-2')}
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
                <div className="enf-aviso" role="alert">
                  {icone('triangle-exclamation')}
                  <div>
                    <h5>Dados de patologias não disponíveis</h5>
                    <p>Os dados de patologias não estão disponíveis ou estão em formato inválido.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Mensagem se não houver entrevista */
            <div className="card empty-state">
              <div className="empty-state-icon">
                {icone('clipboard-question')}
              </div>
              <h3 className="empty-state-title">Nenhuma entrevista encontrada</h3>
              <p className="empty-state-description">
                Não foi possível localizar os dados da entrevista para esta pessoa.
              </p>
              <a href="   " className="btn">
                {icone('magnifying-glass')}Buscar outra entrevista
              </a>
            </div>
          )}
        </div>
      </div>
    </Base1Layout>
  )
}
