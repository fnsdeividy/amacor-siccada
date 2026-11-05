// sac/index.html — fila de atendimentos (cada setor abre na própria fila)
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { PrazoSelo, SacEstilos, StatusSelo, dataBr, protocoloFmt } from './_sac.jsx'

const SITUACOES = [
  { id: 'abertos', nome: 'Em andamento' },
  { id: 'encerrados', nome: 'Encerrados' },
  { id: 'Resolvida', nome: 'Resolvidas' },
  { id: 'Parcialmente resolvida', nome: 'Parcialmente resolvidas' },
  { id: 'Não resolvida', nome: 'Não resolvidas' },
  { id: 'todos', nome: 'Todos' },
]

export default function SacIndex() {
  const ctx = useTemplateContext()
  const f = ctx.filtros ?? {}
  const resumo = ctx.resumo ?? {}
  const lista = ctx.atendimentos ?? []
  const setores = ctx.setores ?? []
  const nomeSetor = setores.find((s) => s.id === f.setor)?.nome
  // a chave muda quando o back devolve outros filtros: o formulário é recriado com os valores novos
  const chaveFiltros = JSON.stringify(f)

  return (
    <Base1Layout title="SAC">
      <SacEstilos />
      <div className="sac">
        <div className="card-container">
          <div className="stat-card">
            <div className="stat-label">Em andamento</div>
            <div className="stat-value">{resumo.em_andamento ?? 0}</div>
          </div>
          <div className={'stat-card' + (resumo.atrasados ? ' sac-alerta' : '')}>
            <div className="stat-label">Atrasados</div>
            <div className="stat-value">{resumo.atrasados ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Vencem hoje</div>
            <div className="stat-value">{resumo.vencem_hoje ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Encerrados no mês</div>
            <div className="stat-value">{resumo.encerrados_mes ?? 0}</div>
          </div>
        </div>

        <div className="card">
          <div className="page-toolbar">
            <div>
              <h1>Atendimentos</h1>
              <p className="sac-sub">{nomeSetor ? `Fila do setor ${nomeSetor}` : 'Todos os setores'}</p>
            </div>
            <div className="page-toolbar-actions">
              <AppLink className="btn btn-secondary" href={urlFor('sac.indicadores')}>
                <i className="fa-solid fa-chart-column" aria-hidden="true" /> Indicadores
              </AppLink>
              {ctx.pode_configurar && (
                <AppLink className="btn btn-secondary" href={urlFor('sac.configuracoes')}>
                  <i className="fa-solid fa-gear" aria-hidden="true" /> Configurações
                </AppLink>
              )}
              <AppLink className="btn" href={urlFor('sac.novo')}>
                <i className="fa-solid fa-plus" aria-hidden="true" /> Novo atendimento
              </AppLink>
            </div>
          </div>

          <ApiForm key={chaveFiltros} method="GET" action={urlFor('sac.home')} className="sac-filtros">
            <div className="form-group sac-busca">
              <label htmlFor="sac-busca">Buscar</label>
              <input id="sac-busca" type="search" name="busca" defaultValue={f.busca ?? ''}
                placeholder="Protocolo, nome ou carteirinha" />
            </div>
            <div className="form-group">
              <label htmlFor="sac-setor">Setor</label>
              <select id="sac-setor" name="setor" defaultValue={f.setor ?? ''}>
                <option value="">Todos os setores</option>
                {setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sac-situacao">Situação</label>
              <select id="sac-situacao" name="situacao" defaultValue={f.situacao ?? 'abertos'}>
                {SITUACOES.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sac-canal">Canal</label>
              <select id="sac-canal" name="canal" defaultValue={f.canal ?? ''}>
                <option value="">Todos</option>
                {(ctx.canais ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sac-tipo">Tipo de demanda</label>
              <select id="sac-tipo" name="tipo_id" defaultValue={f.tipo_id ?? ''}>
                <option value="">Todos</option>
                {(ctx.tipos ?? []).map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sac-mes">Mês de abertura</label>
              <input id="sac-mes" type="month" name="mes" defaultValue={f.mes ?? ''} />
            </div>
            <div className="sac-filtros-acoes">
              <button className="btn" type="submit"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Filtrar</button>
              <AppLink className="btn btn-secondary" href={urlFor('sac.home')} title="Limpar filtros">Limpar</AppLink>
            </div>
          </ApiForm>

          {lista.length === 0 ? (
            <div className="sac-vazio">
              <i className="fa-regular fa-folder-open fa-2x" aria-hidden="true" />
              <p>Nenhum atendimento encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Abertura</th>
                    <th>Beneficiário</th>
                    <th>Tipo de demanda</th>
                    <th>Motivo</th>
                    <th>Canal</th>
                    <th>Setor</th>
                    <th>Status</th>
                    <th>Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <AppLink className="sac-protocolo" href={urlFor('sac.atendimento', { atendimento_id: a.id })}>
                          {protocoloFmt(a.protocolo)}
                        </AppLink>
                      </td>
                      <td>{dataBr(a.data_abertura)}</td>
                      <td>
                        {a.beneficiario_nome}
                        {a.carteirinha && <div className="sac-sub">{a.carteirinha}</div>}
                      </td>
                      <td>{a.tipo_nome}</td>
                      <td className="sac-desc"><span title={a.descricao}>{a.descricao}</span></td>
                      <td>{a.canal}</td>
                      <td>{a.setor_atual_nome}</td>
                      <td><StatusSelo status={a.status} /></td>
                      <td><PrazoSelo atendimento={a} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {lista.length >= 500 && <p className="sac-sub">Mostrando os 500 mais recentes. Use os filtros para refinar.</p>}
        </div>
      </div>
    </Base1Layout>
  )
}
