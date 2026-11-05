// sac/atendimento.html — dados da demanda, histórico e lançamento de andamento pelos setores
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { CopiarProtocolo, PrazoSelo, SacEstilos, StatusSelo, dataBr, dataHoraBr, protocoloFmt } from './_sac.jsx'

function simNao(v) {
  return v ? 'Sim' : 'Não'
}

function FormAndamento({ a, ctx }) {
  const finais = ctx.status_finais ?? []
  const [status, setStatus] = useState(a.status)
  const final = finais.includes(status)
  return (
    <ApiForm method="POST" action={urlFor('sac.andamento', { atendimento_id: a.id })}>
      <div className="form-group">
        <label htmlFor="descricao">O que foi feito *</label>
        <textarea id="descricao" name="descricao" rows={4} maxLength={5000}
          placeholder="Ex.: guia liberada e enviada por e-mail; aguardando parecer da auditoria; beneficiário orientado…" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {(ctx.status_opcoes ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {final && (
          <div className="form-group">
            <label htmlFor="data_resolucao">Data da resposta conclusiva</label>
            <input id="data_resolucao" type="date" name="data_resolucao" max={ctx.hoje}
              defaultValue={a.data_resolucao ? String(a.data_resolucao).slice(0, 10) : ctx.hoje} />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="setor">Setor responsável</label>
          <select id="setor" name="setor" defaultValue={a.setor_atual}>
            {(ctx.setores ?? []).map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="escalonamento">Escalou?</label>
          <select id="escalonamento" name="escalonamento" defaultValue={a.escalonamento || 'Não'}>
            {(ctx.escalonamentos ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="confirmacao">Beneficiário confirmou a resolução?</label>
          <select id="confirmacao" name="confirmacao" defaultValue={a.confirmacao || ''}>
            <option value="">—</option>
            {(ctx.confirmacoes ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <label className="sac-check">
        <input type="checkbox" name="recontato" value="1" defaultChecked={Boolean(a.recontato)} />
        <input type="hidden" name="recontato" value="0" />
        <span>Recontato: o beneficiário voltou com o mesmo assunto em até 30 dias</span>
      </label>
      <div className="sac-dica">Mudanças de status, setor e demais campos ficam registradas no histórico.</div>
      <div className="sac-acoes-form">
        <button type="submit" className="btn"><i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Registrar andamento</button>
      </div>
    </ApiForm>
  )
}

export default function SacAtendimento() {
  const ctx = useTemplateContext()
  const a = ctx.atendimento
  if (!a) return <Base1Layout title="SAC" />
  const outros = a.outros_do_beneficiario ?? []

  return (
    <Base1Layout title="SAC">
      <SacEstilos />
      <div className="sac">
        <div className="page-toolbar">
          <div>
            <h1>{a.beneficiario_nome}</h1>
            <p className="sac-sub">{a.tipo_nome} · {a.canal}</p>
          </div>
          <div className="page-toolbar-actions">
            <AppLink className="btn btn-secondary" href={urlFor('sac.home')}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Atendimentos
            </AppLink>
          </div>
        </div>

        <div className="sac-protocolo-box">
          <div>
            <div className="sac-protocolo-rotulo">Protocolo</div>
            <div className="sac-protocolo-num">{a.protocolo_formatado || protocoloFmt(a.protocolo)}</div>
          </div>
          <CopiarProtocolo protocolo={a.protocolo} />
          <div className="sac-selos">
            <StatusSelo status={a.status} />
            <PrazoSelo atendimento={a} completo />
            {(a.escalonamento && a.escalonamento !== 'Não') && <span className="badge status-red">Escalou: {a.escalonamento}</span>}
          </div>
        </div>

        {a.recontato_de_protocolo && (
          <div className="sac-avisos">
            <div className="sac-aviso sac-aviso-alerta">
              <i className="fa-solid fa-rotate-left" aria-hidden="true" /> Recontato: o beneficiário já tinha aberto o
              protocolo{' '}
              <AppLink href={urlFor('sac.atendimento', { atendimento_id: a.recontato_de })}>{protocoloFmt(a.recontato_de_protocolo)}</AppLink>
              {' '}sobre o mesmo tipo de demanda nos últimos 30 dias.
            </div>
          </div>
        )}

        <div className="sac-grid-2">
          <div>
            <div className="card">
              <h2 className="sac-secao">Demanda</h2>
              <dl className="sac-dados">
                <div><dt>Abertura</dt><dd>{dataHoraBr(a.data_abertura)}</dd></div>
                <div><dt>Carteirinha</dt><dd>{a.carteirinha || '—'}</dd></div>
                <div><dt>Contato</dt><dd>{a.contato || '—'}</dd></div>
                <div><dt>Setor responsável</dt><dd>{a.setor_atual_nome}</dd></div>
                <div><dt>Aberto por</dt><dd>{a.usuario_abertura_nome || '—'}</dd></div>
              </dl>
              <h2 className="sac-secao" style={{ marginTop: 'var(--space-4)' }}>Motivo / descrição</h2>
              <p className="sac-texto">{a.descricao}</p>
            </div>

            <div className="card">
              <h2 className="sac-secao">Andamento</h2>
              <ol className="sac-historico">
                {(a.andamentos ?? []).map((h) => (
                  <li key={h.id}>
                    <div className="sac-hist-topo">
                      <strong>{h.usuario_nome || '—'}</strong>
                      {h.setor_nome ? ` · ${h.setor_nome}` : ''} · {dataHoraBr(h.data_hora)}
                    </div>
                    <p className="sac-texto">{h.descricao}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card">
              <h2 className="sac-secao">Registrar andamento</h2>
              <FormAndamento key={`${a.status}|${a.setor_atual}|${(a.andamentos ?? []).length}`} a={a} ctx={ctx} />
            </div>
          </div>

          <div>
            <div className="card">
              <h2 className="sac-secao">Prazo de resposta</h2>
              <dl className="sac-dados">
                <div><dt>Prazo</dt><dd>{a.prazo_dias === 0 ? 'Mesmo dia' : `${a.prazo_dias} dias úteis`}</dd></div>
                <div><dt>Data limite</dt><dd>{dataBr(a.data_limite)}</dd></div>
                <div><dt>Resposta</dt><dd>{a.data_resolucao ? dataBr(a.data_resolucao) : '—'}</dd></div>
                <div><dt>{a.encerrada ? 'Dias úteis até resolver' : 'Dias úteis em aberto'}</dt><dd>{a.dias_uteis}</dd></div>
              </dl>
            </div>

            <div className="card">
              <h2 className="sac-secao">Resolutividade</h2>
              <dl className="sac-dados">
                <div><dt>Resolvida no 1º contato</dt><dd>{simNao(a.resolvida_primeiro_contato)}</dd></div>
                <div><dt>Recontato em até 30 dias</dt><dd>{simNao(a.recontato)}</dd></div>
                <div><dt>Escalou</dt><dd>{a.escalonamento || 'Não'}</dd></div>
                <div><dt>Confirmação do beneficiário</dt><dd>{a.confirmacao || '—'}</dd></div>
              </dl>
            </div>

            <div className="card">
              <h2 className="sac-secao">Outros atendimentos do beneficiário</h2>
              {outros.length === 0 ? <p className="sac-sub">Nenhum outro atendimento.</p> : (
                <ul className="sac-mini-lista">
                  {outros.map((o) => (
                    <li key={o.id}>
                      <AppLink className="sac-protocolo" href={urlFor('sac.atendimento', { atendimento_id: o.id })}>{protocoloFmt(o.protocolo)}</AppLink>
                      <span>{dataBr(o.data_abertura)} · {o.tipo_nome}</span>
                      <StatusSelo status={o.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
