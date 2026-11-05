// sac/novo.html — abertura de atendimento (o protocolo é gerado ao salvar)
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { apiFetch } from '../../lib/api.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { Avisos, SacEstilos } from './_sac.jsx'

function prazoTexto(dias) {
  if (dias === 0) return 'resposta imediata (mesmo dia)'
  return `até ${dias} ${dias === 1 ? 'dia útil' : 'dias úteis'}`
}

function Formulario({ ctx }) {
  const inicial = ctx.form ?? {}
  const tipos = ctx.tipos ?? []
  const [tipoId, setTipoId] = useState(inicial.tipo_id ?? '')
  const [nome, setNome] = useState(inicial.beneficiario_nome ?? '')
  const [contato, setContato] = useState(inicial.contato ?? '')
  const [resolvida, setResolvida] = useState(Boolean(inicial.resolvida_primeiro_contato))
  const [busca, setBusca] = useState({ estado: 'ocioso' })
  const tipo = tipos.find((t) => String(t.id) === String(tipoId))

  async function buscarCarteirinha(event) {
    const carteirinha = event.target.value.trim()
    if (!carteirinha) {
      setBusca({ estado: 'ocioso' })
      return
    }
    setBusca({ estado: 'buscando' })
    try {
      const resp = await apiFetch(urlFor('sac.beneficiario', { carteirinha }))
      const dados = await resp.json()
      if (!dados.encontrado) {
        setBusca({ estado: 'nao_encontrado' })
        return
      }
      setBusca({ estado: 'encontrado', ...dados })
      setNome(dados.nome)
      if (!contato && dados.telefone) setContato(dados.telefone)
    } catch {
      setBusca({ estado: 'ocioso' })
    }
  }

  return (
    <ApiForm method="POST" action={urlFor('sac.novo')}>
      <div className="sac-grid-2">
        <div className="card">
          <h2 className="sac-secao">Beneficiário</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="carteirinha">Carteirinha</label>
              <input id="carteirinha" name="carteirinha" defaultValue={inicial.carteirinha ?? ''}
                placeholder="000.000000-00" autoComplete="off" onBlur={buscarCarteirinha} />
              {busca.estado === 'buscando' && <div className="sac-dica">Buscando beneficiário…</div>}
              {busca.estado === 'encontrado' && (
                <div className={'sac-dica ' + (busca.ativo ? 'sac-ok' : 'sac-erro')}>
                  <i className={'fa-solid ' + (busca.ativo ? 'fa-circle-check' : 'fa-circle-exclamation')} aria-hidden="true" />{' '}
                  Contrato {busca.contrato}{busca.ativo ? ' · ativo' : ' · beneficiário excluído'}
                </div>
              )}
              {busca.estado === 'nao_encontrado' && (
                <div className="sac-dica">Carteirinha não encontrada na base. Preencha o nome.</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="beneficiario_nome">Nome do beneficiário *</label>
              <input id="beneficiario_nome" name="beneficiario_nome" required maxLength={200}
                value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="contato">Contato para retorno</label>
            <input id="contato" name="contato" maxLength={200} placeholder="Telefone ou e-mail"
              value={contato} onChange={(e) => setContato(e.target.value)} />
          </div>

          <h2 className="sac-secao" style={{ marginTop: 'var(--space-4)' }}>Demanda</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="canal">Canal *</label>
              <select id="canal" name="canal" required defaultValue={inicial.canal ?? ''}>
                <option value="" disabled>Selecione</option>
                {(ctx.canais ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tipo_id">Tipo de demanda *</label>
              <select id="tipo_id" name="tipo_id" required value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
                <option value="" disabled>Selecione</option>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
              {tipo && <div className="sac-dica">Prazo de resposta: {prazoTexto(tipo.prazo_dias)}</div>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Motivo / descrição *</label>
            <textarea id="descricao" name="descricao" rows={5} required maxLength={5000}
              defaultValue={inicial.descricao ?? ''} placeholder="O que o beneficiário pediu e o que foi informado" />
          </div>
        </div>

        <div className="card">
          <h2 className="sac-secao">Encaminhamento</h2>
          <div className="form-group">
            <label htmlFor="setor">Setor responsável *</label>
            <select id="setor" name="setor" required defaultValue={inicial.setor || ctx.setor_usuario || 'sac'}>
              {(ctx.setores ?? []).map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <div className="sac-dica">A demanda entra na fila deste setor, que lança o andamento até a resposta.</div>
          </div>

          <label className="sac-check">
            <input type="checkbox" name="resolvida_primeiro_contato" value="1"
              checked={resolvida} onChange={(e) => setResolvida(e.target.checked)} />
            <span>Resolvido neste atendimento (1º contato)</span>
          </label>
          {resolvida && (
            <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
              <label htmlFor="confirmacao">Beneficiário confirmou a resolução?</label>
              <select id="confirmacao" name="confirmacao" defaultValue={inicial.confirmacao || 'Sim'}>
                {(ctx.confirmacoes ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="sac-aviso" style={{ marginTop: 'var(--space-4)' }}>
            <i className="fa-solid fa-hashtag" aria-hidden="true" /> O protocolo é gerado ao salvar
            (registro ANS {ctx.registro_ans} + data + sequencial). Informe-o ao beneficiário.
          </div>

          <div className="sac-acoes-form">
            <AppLink className="btn btn-secondary" href={urlFor('sac.home')}>Cancelar</AppLink>
            <button type="submit" className="btn"><i className="fa-solid fa-check" aria-hidden="true" /> Gerar protocolo</button>
          </div>
        </div>
      </div>
    </ApiForm>
  )
}

export default function SacNovo() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout title="SAC">
      <SacEstilos />
      <div className="sac">
        <div className="page-toolbar">
          <div>
            <h1>Novo atendimento</h1>
            <p className="sac-sub">Registre a demanda no mesmo dia em que ela chegou, em qualquer canal.</p>
          </div>
        </div>
        <Avisos />
        {/* recria o formulário quando o back devolve os dados digitados (erro de validação) */}
        <Formulario key={JSON.stringify(ctx.form ?? {})} ctx={ctx} />
      </div>
    </Base1Layout>
  )
}
