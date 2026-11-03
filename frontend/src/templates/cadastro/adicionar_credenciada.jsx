// cadastro/adicionar_credenciada.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
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

    .especialidades-section {
        margin-bottom: 25px;
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

        .especialidades-grid {
            grid-template-columns: 1fr;
        }
    }
`

export default function AdicionarCredenciada() {
  const ctx = useTemplateContext()
  return (
    <Base1Layout>
      <div className="container-tab-pix">
        <div className="header">
          <h1>Adicionar Clínica Credenciada</h1>
          <AppLink href={urlFor('cad.exibir_credenciadas')} className="btn-voltar">← Voltar</AppLink>
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
              <button type="submit" className="btn btn-primary">Cadastrar Clínica</button>
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

      <InlineStyle css={css} />
    </Base1Layout>
  )
}
