// cadastro/alterar_credenciada.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
   

    .form-container {
        background: white;

        border-radius: 8px;
        overflow: hidden;
    }

    .header {
        background: #0a30688e;
        color: white;
        padding: 25px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header h1 {
        margin: 0;
        font-size: 24px;
    }

    .btn-voltar {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 8px 16px;
        border-radius: 5px;
        text-decoration: none;
        transition: background 0.3s;
    }

    .btn-voltar:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .card {
        padding: 25px;
        border-bottom: 1px solid #eee;
    }

    .card:last-child {
        border-bottom: none;
    }

    .card h2 {
        color: #d0d5dc;
        margin-top: 0;
        margin-bottom: 20px;
        border-bottom: 2px solid #0a2f68;
        padding-bottom: 10px;
    }

    .card h3 {
        color: #c0c0c0;
        margin-top: 20px;
        margin-bottom: 15px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #d0d0d0;
        font-weight: 500;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 14px;
        font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        outline: none;
        border-color: #0a2f68;
        box-shadow: 0 0 5px rgba(10, 47, 104, 0.2);
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }

    .form-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
    }

    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
    }

    .btn-primary {
        background: #0a2f68;
        color: white;
    }

    .btn-primary:hover {
        background: #082249;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(10, 47, 104, 0.3);
    }

    .btn-success {
        background: #4caf50;
        color: white;
    }

    .btn-success:hover {
        background: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
    }

    .especialidades-section {
        margin-bottom: 25px;
    }

    .especialidades-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 10px;
    }

    .especialidades-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 10px;
    }

    .especialidade-checkbox {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: #1e293b98;
        backdrop-filter: blur(5px);
        border-radius: 6px;
        border-left: 4px solid #38bdf8;
        font-weight: 500;
        color: #e2e8f0;
    }

    .especialidade-checkbox input {
        width: auto;
        margin: 0;
    }

    .especialidade-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: #1e293b98;
        backdrop-filter: blur(5px);
        border-radius: 6px;
        border-left: 4px solid #38bdf8;
        font-weight: 500;
        color: #e2e8f0;
    }

    .especialidade-item span {
        font-weight: 500;
        color: #e2e8f0;
    }

    .btn-remove {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
        padding: 0;
    }

    .btn-remove:hover {
        background: #da190b;
    }

    .text-muted {
        color: #999;
        font-style: italic;
    }

    @media (max-width: 600px) {
        .header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .especialidades-list {
            grid-template-columns: 1fr;
        }
    }
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
      <div className="container-tab-pix">
        <div className="header">
          <h1>Alterar Clínica: {show(clinica.nome)}</h1>
          <AppLink href={urlFor('cad.exibir_credenciadas')} className="btn-voltar">← Voltar</AppLink>
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
              <button type="submit" className="btn btn-primary">Salvar Informações</button>
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
                      <button type="submit" className="btn-remove" title="Remover">✕</button>
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
                <button type="submit" className="btn btn-success">Adicionar Especialidade</button>
              </div>
            </ApiForm>
          </div>
        </div>
      </div>

      <InlineStyle css={css} />
    </Base1Layout>
  )
}
