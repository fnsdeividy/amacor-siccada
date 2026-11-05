// suporte/usuario_detalhe.html
// Dados cadastrados de um usuário (tudo da tabela usuarios, menos a senha).
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { AtivoForm, SituacaoBadge, estaAtivo } from './_ativo.jsx'

const css = `
.suporte-usuario { max-width: 760px; margin: 0 auto; }
.suporte-usuario .page-toolbar h1 { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.suporte-usuario .suporte-aviso { margin-bottom: var(--space-4); color: var(--danger-700); background: var(--danger-50); border-color: var(--danger-50); }
.suporte-usuario .detail-value { word-break: break-word; }
.suporte-usuario .vazio { color: var(--text-muted); font-weight: 400; }
`

function Valor({ campo, usuario }) {
  if (campo.coluna === 'ativo') return <SituacaoBadge usuario={usuario} />
  if (campo.valor === null || campo.valor === undefined || campo.valor === '') {
    return <span className="vazio">—</span>
  }
  return show(campo.valor)
}

export default function UsuarioDetalhe() {
  const ctx = useTemplateContext()
  const usuario = ctx.usuario ?? {}
  const ativo = estaAtivo(usuario)
  const voltar = urlFor('suporte.usuario_detalhe', { usuario_id: usuario.id })

  return (
    <Base1Layout title="Usuários do sistema">
      <InlineStyle css={css} />
      <div className="card suporte-usuario">
        <div className="page-toolbar">
          <h1>{usuario.nome} <SituacaoBadge usuario={usuario} /></h1>
          <div className="page-toolbar-actions">
            <AppLink className="btn btn-secondary btn-sm" href={urlFor('suporte.usuarios')}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar para a lista
            </AppLink>
            <AtivoForm usuario={usuario} usuarioLogadoId={ctx.usuario_logado_id} voltar={voltar} rotulo="usuário" />
          </div>
        </div>

        {!ativo && (
          <div className="info-box suporte-aviso">
            <i className="fa-solid fa-user-slash" aria-hidden="true" /> Usuário desativado: não consegue entrar no sistema.
          </div>
        )}

        <div>
          {(ctx.campos ?? []).map((campo) => (
            <div key={campo.coluna} className="detail-item">
              <span className="detail-label">{campo.rotulo}</span>
              <span className="detail-value"><Valor campo={campo} usuario={usuario} /></span>
            </div>
          ))}
        </div>
      </div>
    </Base1Layout>
  )
}
