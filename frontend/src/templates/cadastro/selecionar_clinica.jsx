// cadastro/selecionar_clinica.html
import AppLink from '../../components/AppLink.jsx'
import BaseLayout from '../../layouts/BaseLayout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'
import { Oculto } from './_ui.js'

const css = `
.cad-sel-clinica .clinicas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  margin: var(--space-5) 0;
}
.cad-sel-clinica .clinica-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cad-sel-clinica .clinica-card:hover {
  border-color: var(--brand-600);
  box-shadow: var(--shadow-lg);
  text-decoration: none;
}
.cad-sel-clinica .clinica-info h3 { margin: 0 0 var(--space-2); }
.cad-sel-clinica .clinica-info p { margin: 0; }
.cad-sel-clinica .arrow { color: var(--gray-400); }
.cad-sel-clinica .clinica-card:hover .arrow { color: var(--brand-700); }
.cad-sel-clinica .info-box p { margin: 0; color: inherit; }
`

export default function SelecionarClinica() {
  const { clinicas } = useTemplateContext()
  return (
    <BaseLayout>
      <InlineStyle css={css} />
      <div className="card cad-sel-clinica">
        <h2>Alterar Clínica Credenciada</h2>
        <p>Selecione uma clínica para alterar suas informações e especialidades:</p>

        <div className="clinicas-grid">
          {truthy(clinicas) ? (
            clinicas.map((clinica, i) => (
              <AppLink key={i} href={urlFor('cad.alterar_credenciada', { clinica_id: clinica.id })} className="clinica-card">
                <div className="clinica-info">
                  <h3>{show(clinica.nome)}</h3>
                  <p className="status">
                    <span className={clinica.status === 'credenciada' ? 'status-green' : 'status-red'}>
                      Status: {show(clinica.status)}
                    </span>
                  </p>
                </div>
                <div className="arrow">
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" /><Oculto>→</Oculto>
                </div>
              </AppLink>
            ))
          ) : (
            <div className="alert info info-box">
              <p>Nenhuma clínica encontrada no sistema.</p>
            </div>
          )}
        </div>

        <AppLink href={urlFor('cad.home')} className="btn btn-secondary">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar
        </AppLink>
      </div>
    </BaseLayout>
  )
}
