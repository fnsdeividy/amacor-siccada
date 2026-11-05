// generic/cadastrar.html (renderizado como 'cadastrar.html'; página própria, sem layout)
import { useState } from 'react'
import ApiForm from '../components/ApiForm.jsx'
import AppLink from '../components/AppLink.jsx'
import { LOGO } from '../components/Loader.jsx'
import Toast from '../components/Toast.jsx'
import { urlFor } from '../lib/urlFor.js'
import { InlineStyle } from '../lib/useStylesheet.jsx'

const css = `
.cadastro-card { max-width: 440px; }
.cadastro-card .cadastro-top { margin-bottom: var(--space-4); }
.cadastro-card .cadastro-title { margin-bottom: var(--space-1); }
.cadastro-card .cadastro-subtitle { color: var(--text-muted); margin-bottom: var(--space-5); }
.cadastro-card .form-row { gap: 0 var(--space-3); }
.cadastro-card .hidden { display: none; }
.cadastro-card .cadastro-grupo-vendedor {
  padding: var(--space-3) var(--space-4) 0;
  margin-bottom: var(--space-3);
  background: var(--brand-50);
  border: 1px solid var(--brand-100);
  border-radius: var(--radius);
}
`

export default function Cadastrar() {
  // atualizarCampoIdentificador(): o grupo só aparece (e é obrigatório) para "vendedor";
  // ao esconder, os campos são limpos
  const [classe, setClasse] = useState('agente')
  const [pf, setPf] = useState('')
  const [pj, setPj] = useState('')
  const mostrar = classe === 'vendedor'

  function onClasseChange(e) {
    setClasse(e.target.value)
    if (e.target.value !== 'vendedor') {
      setPf('')
      setPj('')
    }
  }

  return (
    <div className="auth-page cadastro-page">
      <InlineStyle css={css} />
      <Toast />
      <aside className="auth-brand" data-chrome="">
        <svg viewBox="0 0 300 300" fill="none" stroke="#ffffff" strokeWidth="8" aria-hidden="true">
          <path d={LOGO} />
        </svg>
        <div>
          <div className="auth-brand-title">SICCADA</div>
          <div className="auth-brand-sub">Sistema de gestão de contratos · Amacor Saúde</div>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card cadastro-card">
          <div className="cadastro-header">
            <div className="cadastro-top">
              <AppLink className="btn btn-secondary btn-sm voltar botao" href={urlFor('auth.fechar')}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar
              </AppLink>
            </div>
            <h1 className="cadastro-title">Cadastro de Usuario</h1>
            <p className="cadastro-subtitle">Preencha os dados para criar um novo acesso ao sistema.</p>
          </div>

          <ApiForm className="cadastro-form" action={urlFor('auth.cadastrar')} method="POST">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input type="text" id="nome" name="nome" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cpf">CPF</label>
                <input type="text" id="cpf" name="cpf" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input type="password" id="senha" name="senha" required autoComplete="new-password" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo_usuario">Local de utilizacao</label>
                <select id="tipo_usuario" name="tipo_usuario" required>
                  <option value="administrativo">Administrativo</option>
                  <option value="cadastro">Cadastro</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="vendas">Vendedor/vendas</option>
                  <option value="enfermagem">Enfermagem</option>
                  <option value="cobranca">Cobranca</option>
                  <option value="sac">SAC / Atendimento</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="classe_usuario">Classe do usuario</label>
                <select id="classe_usuario" name="classe_usuario" required value={classe} onChange={onClasseChange}>
                  <option value="agente">Agente</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="vendedor">Vendedor</option>
                </select>
              </div>
            </div>

            <div className={'form-group cadastro-grupo-vendedor' + (mostrar ? '' : ' hidden')} id="grupo_identificador_proposta">
              <label htmlFor="identificador_proposta_PF">Identificador de proposta PF</label>
              <input type="text" id="identificador_proposta_PF" name="identificador_proposta_PF" placeholder="Ex: 10001"
                required={mostrar} value={pf} onChange={(e) => setPf(e.target.value)} />

              <label htmlFor="identificador_proposta_PJ">Identificador de proposta PJ</label>
              <input type="text" id="identificador_proposta_PJ" name="identificador_proposta_PJ" placeholder="Ex: 10001"
                required={mostrar} value={pj} onChange={(e) => setPj(e.target.value)} />
            </div>

            <input className="btn btn-lg auth-submit envia2" type="submit" value="Cadastrar" />
          </ApiForm>
        </div>
      </main>
    </div>
  )
}
