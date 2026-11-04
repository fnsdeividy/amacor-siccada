// cadastro/adicionar_credenciada.html
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
.cad-cred .especialidades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-2);
}
.cad-cred .especialidade-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 42px;
  padding: var(--space-2) var(--space-3);
  margin: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.cad-cred .especialidade-checkbox:hover,
.cad-cred .especialidade-checkbox:has(input:checked) { border-color: var(--brand-600); background: var(--brand-50); }
.cad-cred .especialidade-checkbox input { margin: 0; flex: none; }
.cad-cred .text-muted { color: var(--text-muted); font-style: italic; }
`

export default function AdicionarCredenciada() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout>
      <InlineStyle css={css} />
      <div className="cad-cred">
        <div className="page-toolbar header">
          <h1>Adicionar Clínica Credenciada</h1>
          <div className="page-toolbar-actions">
            <AppLink href={urlFor('cad.exibir_credenciadas')} className="btn btn-secondary btn-voltar">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /><Oculto>←</Oculto> Voltar
            </AppLink>
          </div>
        </div>

        <div className="card">
          <h2>Informações Gerais</h2>
          <ApiForm method="POST" id="form-clinica">
            <div className="form-group">
              <label htmlFor="nome">Nome da Clínica:</label>
              <input type="text" id="nome" name="nome" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefone">Telefone:</label>
                <input type="tel" id="telefone" name="telefone" />
              </div>
              <input type="hidden" id="bloco_id" name="bloco_id" value={show(ctx.proximo_bloco_id)} />
            </div>

            <div className="form-group">
              <label htmlFor="endereco">Endereço:</label>
              <textarea id="endereco" name="endereco" rows="3"></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude:</label>
                <input type="text" id="latitude" name="latitude" placeholder="Ex: -23.5505" />
              </div>
              <div className="form-group">
                <label htmlFor="logitude">Longitude:</label>
                <input type="text" id="logitude" name="logitude" placeholder="Ex: -46.6333" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="horario_funcionamento">Horário de Funcionamento:</label>
                <input type="text" id="horario_funcionamento" name="horario_funcionamento" placeholder="Ex: Seg-Sex 08:00-18:00" />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <select id="status" name="status" defaultValue="credenciada">
                  <option value="credenciada">Credenciada</option>
                  <option value="descredenciada">Descredenciada</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Cadastrar Clínica
              </button>
            </div>
          </ApiForm>
        </div>

        <div className="card">
          <h2>Especialidades</h2>

          <div className="especialidades-section">
            <h3>Selecione Especialidades</h3>
            {truthy(ctx.especialidades_disponiveis) ? (
              <div className="especialidades-grid">
                {ctx.especialidades_disponiveis.map((esp, i) => (
                  <label className="especialidade-checkbox" key={i}>
                    <input type="checkbox" name="especialidades" value={show(esp.id)} form="form-clinica" />
                    <span>{show(esp.nome)}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-muted">Nenhuma especialidade cadastrada.</p>
            )}
          </div>

          <div className="especialidades-section">
            <h3>Adicionar Novas Especialidades</h3>
            <p className="text-muted">Separe por vírgula. Ex: Cardiologia, Pediatria</p>
            <input type="text" name="novas_especialidades" placeholder="Digite novas especialidades" form="form-clinica" />
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
