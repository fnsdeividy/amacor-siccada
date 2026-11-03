// cadastro/selecionar_clinica.html
import AppLink from '../../components/AppLink.jsx'
import BaseLayout from '../../layouts/BaseLayout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
    .container {
        max-width: 1000px;
        margin: 30px auto;
        padding: 20px;
    }

    .card {
        background: white;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card h2 {
        color: #0a2f68;
        margin-bottom: 10px;
        border-bottom: 2px solid #0a2f68;
        padding-bottom: 10px;
    }

    .clinicas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin: 30px 0;
    }

    .clinica-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: #f5f5f5;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        color: inherit;
        border: 2px solid transparent;
    }

    .clinica-card:hover {
        background: white;
        border-color: #0a2f68;
        box-shadow: 0 4px 8px rgba(10, 47, 104, 0.2);
        transform: translateY(-2px);
    }

    .clinica-info h3 {
        margin: 0 0 10px 0;
        color: #0a2f68;
    }

    .clinica-info p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
    }

    .arrow {
        font-size: 24px;
        color: #0a2f68;
    }

    .btn {
        display: inline-block;
        padding: 10px 20px;
        border-radius: 5px;
        text-decoration: none;
        cursor: pointer;
        margin-top: 20px;
        font-weight: 500;
        transition: all 0.3s ease;
        border: none;
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
    }

    .btn-secondary:hover {
        background: #5a6268;
    }
`

export default function SelecionarClinica() {
  const { clinicas } = useTemplateContext()
  return (
    <BaseLayout>
      <div className="container">
        <div className="card">
          <h2>Alterar Clínica Credenciada</h2>
          <p>Selecione uma clínica para alterar suas informações e especialidades:</p>

          <div className="clinicas-grid">
            {truthy(clinicas) ? (
              clinicas.map((clinica, i) => (
                <AppLink key={i} href={urlFor('cad.alterar_credenciada', { clinica_id: clinica.id })} className="clinica-card">
                  <div className="clinica-info">
                    <h3>{show(clinica.nome)}</h3>
                    <p className="status" style={{ color: clinica.status === 'credenciada' ? '#4caf50' : '#f44336' }}>
                      Status: {show(clinica.status)}
                    </p>
                  </div>
                  <div className="arrow">→</div>
                </AppLink>
              ))
            ) : (
              <div className="alert info">
                <p>Nenhuma clínica encontrada no sistema.</p>
              </div>
            )}
          </div>

          <AppLink href={urlFor('cad.home')} className="btn btn-secondary">Voltar</AppLink>
        </div>
      </div>

      <InlineStyle css={css} />
    </BaseLayout>
  )
}
