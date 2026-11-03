// generic/cadastrar.html (renderizado como 'cadastrar.html'; página própria, sem layout)
import { useState } from 'react'
import ApiForm from '../components/ApiForm.jsx'
import AppLink from '../components/AppLink.jsx'
import { useBodyClass } from '../lib/useBodyClass.js'
import { urlFor } from '../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../lib/useStylesheet.jsx'

const css = `
        .cadastro-page {
            min-height: 100dvh;
            margin: 0;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 24px 12px 18px;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            color: #e9f1f8;
            overflow-y: auto;
        }

        .cadastro-card {
            width: 100%;
            max-width: 460px;
            border-radius: 14px;
            background: rgba(0,0,0,0.2);
            border: 1px solid rgba(255, 255, 255, 0.14);
            box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
            backdrop-filter: blur(8px);
            overflow: hidden;
            text-align: left;
        }

        .cadastro-header {
            padding: 16px 18px 4px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .cadastro-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
        }

        .voltar {
            text-decoration: none;
            color: #b7d9f4;
            font-size: 0.84rem;
            border: 1px solid rgba(183, 217, 244, 0.4);
            padding: 4px 10px;
            border-radius: 999px;
            position: static;
            width: auto;
        }

        .voltar:hover {
            color: #ffffff;
            border-color: #ffffff;
        }

        .cadastro-title {
            margin: 0 !important;
            font-size: 1.35rem;
            line-height: 1.2;
            letter-spacing: 0.2px;
        }

        .cadastro-subtitle {
            margin: 0 !important;
            color: #bfd3e4;
            font-size: 0.85rem;
            line-height: 1.35;
        }

        .cadastro-card h1,
        .cadastro-card p {
            margin-bottom: 0;
        }

        .cadastro-form {
            padding: 10px 18px 16px;
            display: grid;
            gap: 9px;
        }

        .form-group {
            display: grid;
            gap: 4px;
        }

        .form-group label {
            font-size: 0.82rem;
            color: #d6e8f5;
        }

        .form-group input,
        .form-group select {
            border: 1px solid rgba(220, 235, 248, 0.2);
            border-radius: 8px;
            background: rgba(7, 18, 28, 0.68);
            color: #f2f8fd;
            padding: 8px 10px;
            font-size: 0.88rem;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
            border-color: #7ec8ff;
            box-shadow: 0 0 0 3px rgba(126, 200, 255, 0.2);
        }

        .envia2 {
            margin-top: 6px;
            width: 100%;
            border: none;
            border-radius: 9px;
            padding: 9px;
            font-weight: 600;
            font-size: 0.9rem;
            color: #0b2234;
            background: linear-gradient(120deg, #8de6d0 0%, #9dd3ff 100%);
            cursor: pointer;
            transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .envia2:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 20px rgba(34, 164, 213, 0.3);
        }

        .hidden {
            display: none;
        }
    `

export default function Cadastrar() {
  useStylesheet('/static/css/estilos_login.css')
  useBodyClass('login-body cadastro-page')
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
    <>
      <InlineStyle css={css} />
      <div className="cadastro-card divisoria">
        <div className="cadastro-header">
          <div className="cadastro-top">
            <AppLink className="voltar botao" href={urlFor('auth.fechar')}>Voltar</AppLink>
          </div>
          <h1 className="cadastro-title">Cadastro de Usuario</h1>
          <p className="cadastro-subtitle">Preencha os dados para criar um novo acesso ao sistema.</p>
        </div>

        <ApiForm className="cadastro-form" action={urlFor('auth.cadastrar')} method="POST">
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input type="text" id="nome" name="nome" required />
          </div>

          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input type="text" id="cpf" name="cpf" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" name="senha" required />
          </div>

          <div className="form-group">
            <label htmlFor="tipo_usuario">Local de utilizacao</label>
            <select id="tipo_usuario" name="tipo_usuario" required>
              <option value="administrativo">Administrativo</option>
              <option value="cadastro">Cadastro</option>
              <option value="financeiro">Financeiro</option>
              <option value="vendas">Vendedor/vendas</option>
              <option value="enfermagem">Enfermagem</option>
              <option value="cobranca">Cobranca</option>
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

          <div className={'form-group' + (mostrar ? '' : ' hidden')} id="grupo_identificador_proposta">
            <label htmlFor="identificador_proposta_PF">Identificador de proposta PF</label>
            <input type="text" id="identificador_proposta_PF" name="identificador_proposta_PF" placeholder="Ex: 10001"
              required={mostrar} value={pf} onChange={(e) => setPf(e.target.value)} />

            <label htmlFor="identificador_proposta_PJ">Identificador de proposta PJ</label>
            <input type="text" id="identificador_proposta_PJ" name="identificador_proposta_PJ" placeholder="Ex: 10001"
              required={mostrar} value={pj} onChange={(e) => setPj(e.target.value)} />
          </div>

          <input className="envia2" type="submit" defaultValue="Cadastrar" />
        </ApiForm>
      </div>
    </>
  )
}
