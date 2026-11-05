// sac/configuracoes.html — aba "Listas" da planilha: tipos de demanda, prazos e feriados
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { SacEstilos, dataBr } from './_sac.jsx'

const CLASSIFICACOES = ['Assistencial', 'Não assistencial']

function CamposTipo({ tipo = {} }) {
  return (
    <>
      <div className="form-group">
        <label>Nome *</label>
        <input name="nome" required maxLength={200} defaultValue={tipo.nome ?? ''} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Prazo de resposta (dias úteis) *</label>
          <input name="prazo_dias" type="number" min={0} max={60} required defaultValue={tipo.prazo_dias ?? ''} />
        </div>
        <div className="form-group">
          <label>Classificação</label>
          <select name="classificacao" defaultValue={tipo.classificacao ?? 'Assistencial'}>
            {CLASSIFICACOES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Base / observação</label>
        <input name="base_legal" maxLength={500} defaultValue={tipo.base_legal ?? ''} />
      </div>
    </>
  )
}

function LinhaTipo({ tipo }) {
  const [editando, setEditando] = useState(false)
  if (editando) {
    return (
      <tr>
        <td colSpan={5}>
          <ApiForm method="POST" action={urlFor('sac.configuracoes')}>
            <input type="hidden" name="acao" value="salvar_tipo" />
            <input type="hidden" name="tipo_id" value={tipo.id} />
            <CamposTipo tipo={tipo} />
            <div className="form-group">
              <label>Situação</label>
              <select name="ativo" defaultValue={tipo.ativo ? '1' : '0'}>
                <option value="1">Ativo (aparece no formulário)</option>
                <option value="0">Inativo</option>
              </select>
            </div>
            <div className="sac-acoes-form">
              <button type="button" className="btn btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
              <button type="submit" className="btn">Salvar</button>
            </div>
          </ApiForm>
        </td>
      </tr>
    )
  }
  return (
    <tr>
      <td>{tipo.nome}{!tipo.ativo && <> <span className="badge sac-badge-neutro">Inativo</span></>}</td>
      <td className="sac-num">{tipo.prazo_dias === 0 ? 'Mesmo dia' : tipo.prazo_dias}</td>
      <td>{tipo.classificacao}</td>
      <td className="sac-desc"><span title={tipo.base_legal}>{tipo.base_legal}</span></td>
      <td>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditando(true)}>
          <i className="fa-solid fa-pen" aria-hidden="true" /> Editar
        </button>
      </td>
    </tr>
  )
}

export default function SacConfiguracoes() {
  const ctx = useTemplateContext()
  const tipos = ctx.tipos ?? []
  const feriados = ctx.feriados ?? []
  const [novoTipo, setNovoTipo] = useState(false)

  return (
    <Base1Layout title="SAC">
      <SacEstilos />
      <div className="sac">
        <div className="page-toolbar">
          <div>
            <h1>Configurações do SAC</h1>
            <p className="sac-sub">Alterar aqui muda as opções do formulário e o cálculo dos prazos dos novos atendimentos.</p>
          </div>
          <div className="page-toolbar-actions">
            <AppLink className="btn btn-secondary" href={urlFor('sac.home')}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Atendimentos
            </AppLink>
          </div>
        </div>

        <div className="card">
          <div className="page-toolbar">
            <h2 className="sac-secao">Tipos de demanda e prazos</h2>
            {!novoTipo && (
              <button type="button" className="btn btn-sm" onClick={() => setNovoTipo(true)}>
                <i className="fa-solid fa-plus" aria-hidden="true" /> Novo tipo
              </button>
            )}
          </div>
          {novoTipo && (
            <ApiForm method="POST" action={urlFor('sac.configuracoes')} style={{ marginBottom: 'var(--space-4)' }}>
              <input type="hidden" name="acao" value="novo_tipo" />
              <CamposTipo />
              <div className="sac-acoes-form">
                <button type="button" className="btn btn-secondary" onClick={() => setNovoTipo(false)}>Cancelar</button>
                <button type="submit" className="btn">Incluir tipo</button>
              </div>
            </ApiForm>
          )}
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Tipo</th><th className="sac-num">Prazo (dias úteis)</th><th>Classificação</th><th>Base / observação</th><th /></tr>
              </thead>
              <tbody>
                {tipos.map((t) => <LinhaTipo key={`${t.id}|${t.nome}|${t.prazo_dias}|${t.ativo}`} tipo={t} />)}
              </tbody>
            </table>
          </div>
          <p className="sac-sub">
            O prazo fica gravado em cada atendimento na abertura: mudar o prazo de um tipo não altera os atendimentos já abertos.
          </p>
        </div>

        <div className="card">
          <h2 className="sac-secao">Feriados (dias não úteis)</h2>
          <ApiForm method="POST" action={urlFor('sac.configuracoes')} className="sac-filtros">
            <input type="hidden" name="acao" value="novo_feriado" />
            <div className="form-group">
              <label htmlFor="feriado-data">Data</label>
              <input id="feriado-data" type="date" name="data" required />
            </div>
            <div className="form-group sac-busca">
              <label htmlFor="feriado-desc">Descrição</label>
              <input id="feriado-desc" name="descricao" maxLength={120} placeholder="Ex.: aniversário da cidade" />
            </div>
            <div className="sac-filtros-acoes">
              <button type="submit" className="btn"><i className="fa-solid fa-plus" aria-hidden="true" /> Incluir</button>
            </div>
          </ApiForm>
          <div className="table-container">
            <table>
              <thead><tr><th>Data</th><th>Descrição</th><th /></tr></thead>
              <tbody>
                {feriados.map((f) => (
                  <tr key={f.data}>
                    <td>{dataBr(f.data)}</td>
                    <td>{f.descricao}</td>
                    <td>
                      <ApiForm method="POST" action={urlFor('sac.configuracoes')}
                        onSubmit={(e) => { if (!window.confirm(`Remover o feriado de ${dataBr(f.data)}?`)) e.preventDefault() }}>
                        <input type="hidden" name="acao" value="remover_feriado" />
                        <input type="hidden" name="data" value={f.data} />
                        <button type="submit" className="btn btn-secondary btn-sm" aria-label={`Remover ${dataBr(f.data)}`}>
                          <i className="fa-solid fa-trash" aria-hidden="true" /> Remover
                        </button>
                      </ApiForm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="sac-sub">Protocolos gerados com o registro ANS {ctx.registro_ans}.</p>
      </div>
    </Base1Layout>
  )
}
