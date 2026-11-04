// cadastro/alterar_credenciada.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { Oculto } from './_ui.js'

const css = `
.cad-cred .page-toolbar { padding-right: 0; }
.cad-cred .card h2 {
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
}
.cad-cred .card h3 {
  margin: var(--space-2) 0 var(--space-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-soft);
}
.cad-cred .form-actions { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
.cad-cred .especialidades-section { margin-bottom: var(--space-6); }
.cad-cred .especialidades-section:last-child { margin-bottom: 0; }
.cad-cred .especialidades-grid,
.cad-cred .especialidades-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-2);
}
.cad-cred .especialidade-checkbox,
.cad-cred .especialidade-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 42px;
  padding: var(--space-2) var(--space-3);
  margin: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text);
}
.cad-cred .especialidade-checkbox {
  background: var(--surface);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.cad-cred .especialidade-checkbox:hover,
.cad-cred .especialidade-checkbox:has(input:checked) { border-color: var(--brand-600); background: var(--brand-50); }
.cad-cred .especialidade-checkbox input { margin: 0; flex: none; }
.cad-cred .especialidade-item { justify-content: space-between; background: var(--gray-50); }
.cad-cred .especialidade-item form { margin: 0; }
.cad-cred .btn-remove {
  width: 28px;
  height: 28px;
  min-height: 0;
  padding: 0;
  color: var(--gray-500);
  background: transparent;
  border: 0;
  box-shadow: none;
}
.cad-cred .btn-remove:hover { color: var(--danger-700); background: var(--danger-50); }
.cad-cred .text-muted { color: var(--text-muted); font-style: italic; }
`

/** {{ x or '' }} */
const ou = (v) => (truthy(v) ? show(v) : '')

const STATUS = ['credenciada', 'descredenciada', 'pendente']

export default function AlterarCredenciada() {
  const ctx = useTemplateContext()
  const clinica = ctx.clinica ?? {}
  const especialidadesClinica = ctx.especialidades_clinica ?? []
  const status = STATUS.includes(clinica.status) ? clinica.status : undefined

  return (
    <Base1Layout>
      <InlineStyle css={css} />
      <div className="cad-cred">
        <div className="page-toolbar header">
          <h1>Alterar Clínica: {show(clinica.nome)}</h1>
          <div className="page-toolbar-actions">
            <AppLink href={urlFor('cad.exibir_credenciadas')} className="btn btn-secondary btn-voltar">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /><Oculto>←</Oculto> Voltar
            </AppLink>
          </div>
        </div>

        {/* Formulário de Informações Gerais */}
        <div className="card">
          <h2>Informações Gerais</h2>
          <ApiForm key={'info-' + show(clinica.id)} method="POST" id="form-clinica">
            <input type="hidden" name="clinica_id" value={show(clinica.id)} />
            <input type="hidden" name="acao" value="atualizar_info" />

            <div className="form-group">
              <label htmlFor="nome">Nome da Clínica:</label>
              <input type="text" id="nome" name="nome" defaultValue={show(clinica.nome)} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefone">Telefone:</label>
                <input type="tel" id="telefone" name="telefone" defaultValue={show(clinica.telefone)} />
              </div>
              <div className="form-group">
                <label htmlFor="bloco_id">Bloco ID:</label>
                <input type="text" id="bloco_id" name="bloco_id" defaultValue={ou(clinica.bloco_id)} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="endereco">Endereço:</label>
              <textarea id="endereco" name="endereco" rows="3" defaultValue={show(clinica.endereco)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude:</label>
                <input type="text" id="latitude" name="latitude" defaultValue={ou(clinica.latitude)} placeholder="Ex: -23.5505" />
              </div>
              <div className="form-group">
                <label htmlFor="logitude">Longitude:</label>
                <input type="text" id="logitude" name="logitude" defaultValue={ou(clinica.logitude)} placeholder="Ex: -46.6333" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="horario_funcionamento">Horário de Funcionamento:</label>
                <input type="text" id="horario_funcionamento" name="horario_funcionamento"
                  defaultValue={ou(clinica.horario_funcionamento)}
                  placeholder="Ex: Seg-Sex 08:00-18:00" />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <select id="status" name="status" defaultValue={status}>
                  <option value="credenciada">Credenciada</option>
                  <option value="descredenciada">Descredenciada</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Salvar Informações
              </button>
            </div>
          </ApiForm>
        </div>

        {/* Gerenciamento de Especialidades */}
        <div className="card">
          <h2>Especialidades</h2>

          {/* Especialidades Atuais */}
          <div className="especialidades-section">
            <h3>Especialidades Atuais</h3>
            {truthy(ctx.especialidades_clinica) ? (
              <div className="especialidades-list">
                {especialidadesClinica.map((esp, i) => (
                  <div className="especialidade-item" key={i}>
                    <span>{show(esp.nome)}</span>
                    <ApiForm method="POST" style={{ display: 'inline' }}>
                      <input type="hidden" name="clinica_id" value={show(clinica.id)} />
                      <input type="hidden" name="acao" value="remover_especialidade" />
                      <input type="hidden" name="especialidade_id" value={show(esp.id)} />
                      <button type="submit" className="btn-remove" title="Remover" aria-label="Remover">
                        <i className="fa-solid fa-xmark" aria-hidden="true" /><Oculto>✕</Oculto>
                      </button>
                    </ApiForm>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Nenhuma especialidade associada ainda.</p>
            )}
          </div>

          {/* Adicionar Nova Especialidade */}
          <div className="especialidades-section">
            <h3>Adicionar Especialidade</h3>
            <ApiForm key={'esp-' + show(clinica.id) + '-' + especialidadesClinica.length} method="POST" id="form-especialidade">
              <input type="hidden" name="clinica_id" value={show(clinica.id)} />
              <input type="hidden" name="acao" value="adicionar_especialidade" />

              <div className="form-group">
                <label>Selecione especialidades:</label>
                {truthy(ctx.especialidades_disponiveis) ? (
                  <div className="especialidades-grid">
                    {/* No template, o {% set ja_tem = true %} fica preso ao escopo do
                        {% for %} interno do Jinja: ja_tem é sempre false e todas as
                        especialidades aparecem, inclusive as já associadas. */}
                    {ctx.especialidades_disponiveis.map((esp, i) => (
                      <label className="especialidade-checkbox" key={i}>
                        <input type="checkbox" name="especialidades" value={show(esp.id)} />
                        <span>{show(esp.nome)}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Nenhuma especialidade cadastrada.</p>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  <i className="fa-solid fa-plus" aria-hidden="true" /> Adicionar Especialidade
                </button>
              </div>
            </ApiForm>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
