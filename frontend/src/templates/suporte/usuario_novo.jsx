// suporte/usuario_novo.html
// Cadastro de usuário pelo suporte (só classe 'dev' chega aqui; o back valida
// tudo de novo e devolve os erros por campo).
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.suporte-novo { max-width: 760px; margin: 0 auto; }
.suporte-novo .campo-erro { display: block; color: var(--danger-700); font-size: var(--text-sm); margin-top: var(--space-1); }
.suporte-novo .suporte-aviso { margin-bottom: var(--space-4); color: var(--danger-700); background: var(--danger-50); border-color: var(--danger-50); }
.suporte-novo .campo-ajuda { color: var(--text-muted); font-size: var(--text-sm); margin-top: var(--space-1); }
.suporte-novo .suporte-novo-acoes { display: flex; gap: var(--space-2); justify-content: flex-end; margin-top: var(--space-4); }
.suporte-novo .hidden { display: none; }
`

function Erro({ erros, campo }) {
  return erros[campo] ? <span className="campo-erro">{erros[campo]}</span> : null
}

export default function UsuarioNovo() {
  const ctx = useTemplateContext()
  const dados = ctx.dados ?? {}
  const erros = ctx.erros ?? {}
  const senhaMinimo = ctx.senha_minimo ?? 8
  const [classe, setClasse] = useState(dados.classe_usuario || 'agente')
  const vendedor = classe === 'vendedor'

  // depois de um envio com erro o back devolve a tela de novo: a key troca
  // e os campos voltam com o que foi digitado (menos a senha)
  const chave = JSON.stringify([dados, erros])

  return (
    <Base1Layout title="Usuários do sistema">
      <InlineStyle css={css} />
      <div className="card suporte-novo">
        <div className="page-toolbar">
          <h1>Novo usuário</h1>
          <div className="page-toolbar-actions">
            <AppLink className="btn btn-secondary btn-sm" href={urlFor('suporte.usuarios')}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar para a lista
            </AppLink>
          </div>
        </div>

        {erros.geral && (
          <div className="info-box suporte-aviso">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> {erros.geral}
          </div>
        )}

        <ApiForm key={chave} method="POST" action={urlFor('suporte.novo_usuario')}>
          <div className="form-group">
            <label htmlFor="nome">Nome completo</label>
            <input type="text" id="nome" name="nome" defaultValue={dados.nome ?? ''} required autoFocus />
            <Erro erros={erros} campo="nome" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cpf">CPF</label>
              <input type="text" id="cpf" name="cpf" defaultValue={dados.cpf ?? ''} inputMode="numeric"
                placeholder="000.000.000-00" required />
              <Erro erros={erros} campo="cpf" />
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail (login)</label>
              <input type="email" id="email" name="email" defaultValue={dados.email ?? ''} required
                autoComplete="off" />
              <Erro erros={erros} campo="email" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo_usuario">Área</label>
              <select id="tipo_usuario" name="tipo_usuario" defaultValue={dados.tipo_usuario ?? ''} required>
                <option value="">Escolha…</option>
                {(ctx.areas ?? []).map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
              </select>
              <Erro erros={erros} campo="tipo_usuario" />
            </div>
            <div className="form-group">
              <label htmlFor="classe_usuario">Classe</label>
              <select id="classe_usuario" name="classe_usuario" value={classe}
                onChange={(e) => setClasse(e.target.value)} required>
                {(ctx.classes ?? []).map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
              </select>
              <Erro erros={erros} campo="classe_usuario" />
              {classe === 'dev' && (
                <div className="campo-ajuda">Classe dev acessa todas as telas, inclusive esta área de suporte.</div>
              )}
            </div>
          </div>

          <div className={'form-row' + (vendedor ? '' : ' hidden')}>
            <div className="form-group">
              <label htmlFor="identificador_proposta_pf">Identificador de proposta PF</label>
              <input type="text" id="identificador_proposta_pf" name="identificador_proposta_pf"
                defaultValue={dados.identificador_proposta_pf ?? ''} placeholder="Ex.: 10001" required={vendedor}
                disabled={!vendedor} />
              <Erro erros={erros} campo="identificador_proposta_pf" />
            </div>
            <div className="form-group">
              <label htmlFor="identificador_proposta_pj">Identificador de proposta PJ</label>
              <input type="text" id="identificador_proposta_pj" name="identificador_proposta_pj"
                defaultValue={dados.identificador_proposta_pj ?? ''} placeholder="Ex.: 10001" required={vendedor}
                disabled={!vendedor} />
              <Erro erros={erros} campo="identificador_proposta_pj" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha inicial</label>
              <input type="password" id="senha" name="senha" autoComplete="new-password"
                minLength={senhaMinimo} required />
              <div className="campo-ajuda">Mínimo de {senhaMinimo} caracteres. A pessoa pode trocar depois em "Mudar senha".</div>
              <Erro erros={erros} campo="senha" />
            </div>
            <div className="form-group">
              <label htmlFor="senha_confirmacao">Confirme a senha</label>
              <input type="password" id="senha_confirmacao" name="senha_confirmacao" autoComplete="new-password"
                required />
              <Erro erros={erros} campo="senha_confirmacao" />
            </div>
          </div>

          <div className="suporte-novo-acoes">
            <AppLink className="btn btn-secondary" href={urlFor('suporte.usuarios')}>Cancelar</AppLink>
            <button className="btn" type="submit">
              <i className="fa-solid fa-user-plus" aria-hidden="true" /> Cadastrar usuário
            </button>
          </div>
        </ApiForm>
      </div>
    </Base1Layout>
  )
}
