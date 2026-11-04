// cadastro/detalhes_cnt.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { formatDateBr } from '../../lib/format.js'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { pos } from './_colunas.js'
import { useGoBack } from './_goBack.js'
import { Oculto } from './_ui.js'

const css = `
.cad-detalhes .cad-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0 var(--space-8);
}
.cad-detalhes .info-item:last-child { border-bottom: 1px solid var(--border); }
.cad-detalhes .info-value { overflow-wrap: anywhere; }
.cad-detalhes .cad-sem-comp {
  margin: var(--space-3) 0 0;
  color: var(--text-muted);
  font-style: italic;
}
.cad-detalhes .cad-acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
.cad-detalhes .card h2 {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.cad-detalhes .card h2 i { color: var(--text-muted); font-size: var(--text-md); }
.cad-detalhes .table-container { margin-bottom: 0; box-shadow: none; }
.cad-detalhes .no-results-tab-pix { margin: 0; color: var(--text-muted); }
`

function Info({ rotulo, children }) {
  return (
    <div className="info-item">
      <span className="info-label">{rotulo}</span>
      <span className="info-value">{children}</span>
    </div>
  )
}

export default function DetalhesCnt() {
  const ctx = useTemplateContext()
  const goBack = useGoBack()
  const v = (i) => pos(ctx.venda, 'venda', i)
  const status = v(6)
  const comAcoes = status === 'entrevista agendada' || status === 'analise de declaração'

  return (
    <Base1Layout title="Detalhes de Contrato">
      <InlineStyle css={css} />
      <div className="cad-detalhes">
        <div className="card">
          {/* Botão de fechar */}
          <div className="filter-tab-pix2">
            <a className="close-btn" href="#" onClick={goBack} title="Voltar" aria-label="Voltar">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /><Oculto>{'<-'}</Oculto>
            </a>
          </div>

          {/* Título da página */}
          <div className="page-toolbar">
            <h1 className="table-title-tab-pix">Detalhes do Contrato</h1>
          </div>

          {/* Seção de detalhes da venda */}
          <h2><i className="fa-solid fa-file-contract" aria-hidden="true" /> Venda</h2>
          <div className="cad-info-grid">
            <Info rotulo="Proposta:">{show(v(1))}</Info>
            <Info rotulo="Contrato:">
              {/* `contrato` não existe no context: o Jinja passa um Undefined, que vira contrato= */}
              <AppLink href={urlFor('cad.adicionar_cnt', { proposta: v(1), contrato: '', tipo_usuario: ctx.tipo_usuario, area: ctx.last_resp })}>
                {v(13) === 'Ainda' ? 'N/A' : show(v(13))}
              </AppLink>
            </Info>
            <Info rotulo="Corretor Responsável:">{show(v(5))}</Info>
            <Info rotulo="Data:">{formatDateBr(v(2))}</Info>
            <Info rotulo="Valor total:">{showFloat(v(8))}</Info>
            <Info rotulo="Tipo de pagamento:">{v(21) === 'None' ? 'N/A' : show(v(21))}</Info>
            <Info rotulo="Tipo de Contrato:">{show(v(3))}</Info>
            <Info rotulo="Produto:">{show(v(4))}</Info>
            <Info rotulo="Status:">
              <AppLink className="badge" href={urlFor('cad.atualizar_cnt', { contrato: v(13), proposta: v(1), id: v(0), last_resp: v(14), status: v(6) })}>
                {show(v(6))}
              </AppLink>
            </Info>
            {v(16) !== null && v(16) !== undefined && (
              <Info rotulo="Processo finalizado em: ">{formatDateBr(v(16))}</Info>
            )}
            {v(22) !== null && v(22) !== undefined && (
              <Info rotulo="Neste status desde: ">{formatDateBr(v(22))}</Info>
            )}
            {ctx.variavel_comp !== null && ctx.variavel_comp !== undefined && (
              <Info rotulo={show(ctx.variavel_comp)}>{show(ctx.complemento)}</Info>
            )}
            <Info rotulo="Digitado por:">{show(v(7))}</Info>
          </div>
          {(ctx.variavel_comp === null || ctx.variavel_comp === undefined) && (
            <p className="cad-sem-comp">Sem complemento para esta fase</p>
          )}

          <div className="cad-acoes">
            <AppLink href={urlFor('cad.alterar_proposta', { proposta: v(1) })} className="btn-detalhes">
              <i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Editar Informações
            </AppLink>
            <AppLink href={urlFor('cad.render_page_doc', { proposta: v(1) })} className="btn-detalhes btn-secondary">
              <i className="fa-solid fa-paperclip" aria-hidden="true" /> Anexar Documentos
            </AppLink>
            <AppLink href={urlFor('cad.documento_contrato', { proposta: v(1) })} className="btn-detalhes btn-secondary">
              <i className="fa-solid fa-folder-open" aria-hidden="true" /> Visualizar/Download Documentos
            </AppLink>
            <AppLink href={urlFor('vendas.concluido', { proposta: v(1), tipo_contrato: v(3) })} className="btn-detalhes btn-secondary">
              <i className="fa-solid fa-file-lines" aria-hidden="true" /> Gerar documento de proposta
            </AppLink>
            <AppLink href={urlFor('doc_gen.render_gerar_kit', { numero_contrato: v(13) })} className="btn-detalhes btn-secondary">
              <i className="fa-solid fa-box" aria-hidden="true" /> Gerar KIT
            </AppLink>
          </div>
        </div>

        {/* Seção de responsáveis */}
        <div className="card section-responsaveis">
          <h2><i className="fa-solid fa-user-tie" aria-hidden="true" /> Responsáveis</h2>
          {truthy(ctx.responsaveis) ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Data de Nascimento</th>
                    <th>CEP</th>
                    <th>Celular</th>
                    <th>Email</th>
                    <th>Estado Civil</th>
                  </tr>
                </thead>
                <tbody>
                  {ctx.responsaveis.map((responsavel, i) => {
                    const r = (n) => pos(responsavel, 'responsavel', n)
                    return (
                      <tr key={i}>
                        <td>{show(r(2))}</td>
                        <td>{show(r(3))}</td>
                        <td>{show(r(4))}</td>
                        <td>{show(r(5))}</td>
                        <td>{show(r(6))}</td>
                        <td>{show(r(7))}</td>
                        <td>{show(r(8))}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-results-tab-pix">Nenhum responsável encontrado.</p>
          )}
        </div>

        {/* Seção de titulares */}
        <div className="card">
          <h2><i className="fa-solid fa-user" aria-hidden="true" /> Titulares</h2>
          {truthy(ctx.titulares) ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Data de Nascimento</th>
                    <th>Idade</th>
                    <th>CEP</th>
                    <th>Celular</th>
                    <th>Email</th>
                    <th>Estado Civil</th>
                    <th>Nome da Mãe</th>
                    <th>Sexo</th>
                    {comAcoes && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {ctx.titulares.map((titular, i) => {
                    const t = (n) => pos(titular, 'titulares', n)
                    return (
                      <tr key={i}>
                        <td>{show(t(2))}</td>
                        <td>{show(t(3))}</td>
                        <td>{show(t(4))}</td>
                        <td>{show(t(5))}</td>
                        <td>{show(t(6))}</td>
                        <td>{show(t(7))}</td>
                        <td>{show(t(8))}</td>
                        <td>{show(t(9))}</td>
                        <td>{show(t(10))}</td>
                        <td>{show(t(12))}</td>
                        {status === 'entrevista agendada' ? (
                          <td>
                            <AppLink className="btn btn-sm" id="entrevista"
                              href={urlFor('enfermagem.gerar_qrcode', { cpf: t(3) })}
                              target="_blank"
                              rel="noopener noreferrer">
                              <i className="fa-solid fa-qrcode" aria-hidden="true" /> Gerar QR Code
                            </AppLink>
                          </td>
                        ) : status === 'analise de declaração' ? (
                          <td>
                            <AppLink className="btn btn-sm" id="ver_entrevista" href={urlFor('cad.respostas_entrevista', { cpf: t(3) })}>
                              <i className="fa-solid fa-eye" aria-hidden="true" /> Ver Entrevista
                            </AppLink>
                          </td>
                        ) : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-results-tab-pix">Nenhum titular encontrado.</p>
          )}
        </div>

        {/* Seção de dependentes */}
        <div className="card">
          <h2><i className="fa-solid fa-users" aria-hidden="true" /> Dependentes</h2>
          {truthy(ctx.dependentes) ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Data de Nascimento</th>
                    <th>Grau de Parentesco</th>
                    <th>Nome da Mãe</th>
                    {comAcoes && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {ctx.dependentes.map((dependente, i) => {
                    const d = (n) => pos(dependente, 'dependentes', n)
                    return (
                      <tr key={i}>
                        <td>{show(d(2))}</td>
                        <td>{show(d(3))}</td>
                        <td>{show(d(4))}</td>
                        <td>{show(d(5))}</td>
                        <td>{show(d(6))}</td>
                        {status === 'entrevista agendada' ? (
                          <td>
                            <AppLink className="btn btn-sm" href={urlFor('enfermagem.gerar_qrcode', { cpf: d(3) })}>
                              <i className="fa-solid fa-stethoscope" aria-hidden="true" /> Entrevistar
                            </AppLink>
                          </td>
                        ) : status === 'analise de declaração' ? (
                          <td>
                            <AppLink className="btn btn-sm" href={urlFor('cad.respostas_entrevista', { cpf: d(3) })}>
                              <i className="fa-solid fa-eye" aria-hidden="true" /> Ver Entrevista
                            </AppLink>
                          </td>
                        ) : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-results-tab-pix">Nenhum dependente encontrado.</p>
          )}
        </div>
      </div>
    </Base1Layout>
  )
}
