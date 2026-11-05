// suporte/usuarios.html
// Lista de usuários do sistema para o suporte: busca, filtros e
// ativar/desativar (só classe 'dev' chega aqui; o back confere).
import { useLocation } from 'react-router-dom'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { AtivoForm, SituacaoBadge, estaAtivo } from './_ativo.jsx'

const css = `
.suporte-usuarios .stat-card { display: block; color: var(--text); text-decoration: none; }
.suporte-usuarios .stat-card:hover { border-color: var(--brand-100); text-decoration: none; }
.suporte-usuarios .stat-card.selecionado { border-color: var(--brand-600); }
.suporte-usuarios .suporte-filtros { align-items: end; margin-bottom: var(--space-3); }
.suporte-usuarios .suporte-filtros-acoes { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
.suporte-usuarios .suporte-contagem { color: var(--text-muted); font-size: var(--text-sm); margin: 0 0 var(--space-3); }
.suporte-usuarios tr.inativo td { color: var(--text-muted); }
.suporte-usuarios td.acoes { white-space: nowrap; }
.suporte-usuarios td.acoes > * { vertical-align: middle; }
.suporte-usuarios td.acoes .suporte-ativo-form { display: inline-block; margin-left: var(--space-2); }
.suporte-usuarios .vazio { text-align: center; color: var(--text-muted); padding: var(--space-6); }
`

function StatCard({ label, valor, status, atual }) {
  return (
    <AppLink className={'stat-card' + (atual === status ? ' selecionado' : '')}
      href={urlFor('suporte.usuarios', status ? { status } : {})}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{show(valor ?? 0)}</span>
    </AppLink>
  )
}

export default function Usuarios() {
  const ctx = useTemplateContext()
  const location = useLocation()
  const filtros = ctx.filtros ?? {}
  const totais = ctx.totais ?? {}
  const usuarios = ctx.usuarios ?? []
  const voltar = location.pathname + location.search
  const temFiltro = Boolean(filtros.busca || filtros.area || filtros.classe || filtros.status)

  // filtros de seleção aplicam na hora; a busca, com Enter ou o botão
  const aplicar = (event) => event.currentTarget.form?.requestSubmit()

  return (
    <Base1Layout title="Usuários do sistema">
      <InlineStyle css={css} />
      <div className="suporte-usuarios">
        <div className="card-container">
          <StatCard label="Total de usuários" valor={totais.total} status="" atual={filtros.status} />
          <StatCard label="Ativos" valor={totais.ativos} status="ativos" atual={filtros.status} />
          <StatCard label="Inativos" valor={totais.inativos} status="inativos" atual={filtros.status} />
        </div>

        <div className="card">
          <div className="page-toolbar">
            <h1>Usuários do sistema</h1>
          </div>

          <ApiForm key={JSON.stringify(filtros)} method="GET" action={urlFor('suporte.usuarios')}
            className="form-row suporte-filtros">
            <div className="form-group">
              <label htmlFor="busca">Buscar</label>
              <input type="search" id="busca" name="busca" defaultValue={filtros.busca ?? ''}
                placeholder="Nome, e-mail/login ou CPF" />
            </div>
            <div className="form-group">
              <label htmlFor="area">Área</label>
              <select id="area" name="area" defaultValue={filtros.area ?? ''} onChange={aplicar}>
                <option value="">Todas</option>
                {(ctx.areas ?? []).map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="classe">Classe</label>
              <select id="classe" name="classe" defaultValue={filtros.classe ?? ''} onChange={aplicar}>
                <option value="">Todas</option>
                {(ctx.classes ?? []).map((classe) => <option key={classe} value={classe}>{classe}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Situação</label>
              <select id="status" name="status" defaultValue={filtros.status ?? ''} onChange={aplicar}>
                <option value="">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </div>
            <div className="suporte-filtros-acoes">
              <button className="btn" type="submit">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Filtrar
              </button>
              {temFiltro && (
                <AppLink className="btn btn-secondary" href={urlFor('suporte.usuarios')}>Limpar</AppLink>
              )}
            </div>
          </ApiForm>

          <p className="suporte-contagem">{usuarios.length} usuário(s) encontrado(s).</p>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail / login</th>
                  <th>Área</th>
                  <th>Classe</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className={estaAtivo(u) ? 'ativo' : 'inativo'}>
                    <td>
                      <AppLink href={urlFor('suporte.usuario_detalhe', { usuario_id: u.id })}>{u.nome}</AppLink>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.tipo_usuario ?? ''}</td>
                    <td>{u.classe_usuario ?? ''}</td>
                    <td><SituacaoBadge usuario={u} /></td>
                    <td className="acoes">
                      <AppLink className="btn btn-secondary btn-sm"
                        href={urlFor('suporte.usuario_detalhe', { usuario_id: u.id })}>
                        Detalhes
                      </AppLink>
                      <AtivoForm usuario={u} usuarioLogadoId={ctx.usuario_logado_id} voltar={voltar} />
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr><td colSpan={6} className="vazio">Nenhum usuário encontrado com esses filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
