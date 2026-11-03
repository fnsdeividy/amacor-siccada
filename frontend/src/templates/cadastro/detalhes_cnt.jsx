// cadastro/detalhes_cnt.html
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { formatDateBr } from '../../lib/format.js'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'
import { pos } from './_colunas.js'
import { useGoBack } from './_goBack.js'

export default function DetalhesCnt() {
  useStylesheet('/static/css/estilos.css')
  const ctx = useTemplateContext()
  const goBack = useGoBack()
  const v = (i) => pos(ctx.venda, 'venda', i)
  const status = v(6)
  const comAcoes = status === 'entrevista agendada' || status === 'analise de declaração'

  const titulares = (
    // Seção de titulares
    <div className="section-tab-pix">
      <h2>Titulares</h2>
      {truthy(ctx.titulares) ? (
        <div className="table-container-tab-pix">
          <table className="table-tab-pix">
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
                        <AppLink className="btn" id="entrevista"
                          href={urlFor('enfermagem.gerar_qrcode', { cpf: t(3) })}
                          target="_blank"
                          rel="noopener noreferrer">
                          Gerar QR Code
                        </AppLink>
                      </td>
                    ) : status === 'analise de declaração' ? (
                      <td>
                        <AppLink className="btn" id="ver_entrevista" href={urlFor('cad.respostas_entrevista', { cpf: t(3) })}>
                          Ver Entrevista
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
  )

  const dependentes = (
    // Seção de dependentes
    <div className="section-tab-pix">
      <h2>Dependentes</h2>
      {truthy(ctx.dependentes) ? (
        <div className="table-container-tab-pix">
          <table className="table-tab-pix">
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
                        <AppLink className="btn" href={urlFor('enfermagem.gerar_qrcode', { cpf: d(3) })}>
                          Entrevistar
                        </AppLink>
                      </td>
                    ) : status === 'analise de declaração' ? (
                      <td>
                        <AppLink className="btn" href={urlFor('cad.respostas_entrevista', { cpf: d(3) })}>
                          Ver Entrevista
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
  )

  // No template, quando há responsáveis, um </div> a mais fecha a seção e o
  // container-tab-pix logo depois da tabela: titulares e dependentes ficam
  // fora do container. A estrutura abaixo é a que o navegador montava.
  const temResponsaveis = truthy(ctx.responsaveis)

  return (
    <Base1Layout title="Detalhes de Contrato">
      <div className="container-tab-pix">
        {/* Botão de fechar */}
        <div className="filter-tab-pix2">
          <a className="close-btn" onClick={goBack}>{'<-'}</a>
        </div>

        {/* Título da página */}
        <h1 className="table-title-tab-pix">Detalhes do Contrato</h1>

        {/* Seção de detalhes da venda */}
        <div className="section-tab-pix">
          <h2>Venda</h2>
          <p><strong>Proposta:</strong> {show(v(1))}</p>
          <p><strong>Contrato:</strong>{' '}
            {/* `contrato` não existe no context: o Jinja passa um Undefined, que vira contrato= */}
            <AppLink href={urlFor('cad.adicionar_cnt', { proposta: v(1), contrato: '', tipo_usuario: ctx.tipo_usuario, area: ctx.last_resp })}>
              {v(13) === 'Ainda' ? 'N/A' : show(v(13))}
            </AppLink>
          </p>
          <p><strong>Corretor Responsável:</strong> {show(v(5))}</p>
          <p><strong>Data:</strong> {formatDateBr(v(2))}</p>
          <br />
          <p><strong>Valor total:</strong>{showFloat(v(8))}</p>
          <p><strong>Tipo de pagamento:</strong> {v(21) === 'None' ? 'N/A' : show(v(21))}</p>
          <p><strong>Tipo de Contrato:</strong> {show(v(3))}</p>
          <p><strong>Produto:</strong> {show(v(4))}</p>
          <br />

          <p><strong>Status:</strong>{' '}
            <AppLink href={urlFor('cad.atualizar_cnt', { contrato: v(13), proposta: v(1), id: v(0), last_resp: v(14), status: v(6) })}>
              {show(v(6))}
            </AppLink>
          </p>

          {v(16) !== null && v(16) !== undefined && (
            <p><strong>Processo finalizado em: </strong>{formatDateBr(v(16))}</p>
          )}

          {v(22) !== null && v(22) !== undefined && (
            <p><strong>Neste status desde: </strong>{formatDateBr(v(22))}</p>
          )}

          {ctx.variavel_comp !== null && ctx.variavel_comp !== undefined ? (
            <p><strong>{show(ctx.variavel_comp)}</strong> {show(ctx.complemento)}</p>
          ) : (
            <>
              <p><strong>Sem complemento para esta fase</strong></p>
              <br />
            </>
          )}

          <p><strong>Digitado por:</strong> {show(v(7))}</p>
        </div>

        <br /><br />
        <div>
          <AppLink href={urlFor('cad.alterar_proposta', { proposta: v(1) })} className="btn-detalhes">Editar Informações</AppLink>
          <AppLink href={urlFor('cad.render_page_doc', { proposta: v(1) })} className="btn-detalhes">Anexar Documentos</AppLink>
          <AppLink href={urlFor('cad.documento_contrato', { proposta: v(1) })} className="btn-detalhes">Visualizar/Download Documentos</AppLink>
          <AppLink href={urlFor('vendas.concluido', { proposta: v(1), tipo_contrato: v(3) })} className="btn-detalhes">Gerar documento de proposta</AppLink>
          <AppLink href={urlFor('doc_gen.render_gerar_kit', { numero_contrato: v(13) })} className="btn-detalhes">Gerar KIT</AppLink>
        </div>

        <br /><br />

        {/* Seção de responsáveis */}
        <div className="section-tab-pix">
          <h2>Responsáveis</h2>
          {temResponsaveis ? (
            <table className="table-tab-pix">
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
          ) : (
            <p className="no-results-tab-pix">Nenhum responsável encontrado.</p>
          )}
        </div>

        {!temResponsaveis && titulares}
        {!temResponsaveis && dependentes}
      </div>
      {temResponsaveis && titulares}
      {temResponsaveis && dependentes}
    </Base1Layout>
  )
}
