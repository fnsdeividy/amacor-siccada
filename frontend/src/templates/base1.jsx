// generic/base1.html renderizado direto: a tela inicial.
// No sistema antigo era só o layout vazio (com o papel de parede). Aqui ela
// recebe o usuário e mostra atalhos para as áreas do menu. É só navegação,
// por isso fica marcada como moldura (data-chrome) no teste de equivalência.
import AppLink from '../components/AppLink.jsx'
import Base1Layout from '../layouts/Base1Layout.jsx'
import { menuPrincipal } from '../layouts/menus.js'
import { usePage } from '../lib/page.jsx'

const css = `
.home-hello { margin-bottom: var(--space-6); }
.home-hello h2 { font-size: var(--text-2xl); margin-bottom: var(--space-1); }
.home-hello p { margin: 0; }
.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}
.home-area { padding: var(--space-5); }
.home-area-head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  font-weight: 600;
}
.home-area-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: var(--brand-50);
  color: var(--brand-700);
}
.home-area ul { list-style: none; margin: 0; padding: 0; }
.home-area li a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  color: var(--gray-700);
  font-size: var(--text-sm);
  border-top: 1px solid var(--border);
}
.home-area li:first-child a { border-top: 0; }
.home-area li a:hover { color: var(--brand-700); text-decoration: none; }
.home-area li a i { font-size: 11px; color: var(--gray-400); }
`

export default function Base1() {
  const { session = {} } = usePage() ?? {}
  const primeiroNome = (session.user_nome || '').trim().split(/\s+/)[0]
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <Base1Layout title="Início">
      <style>{css}</style>
      <div data-chrome="">
        <div className="home-hello">
          <h2>{saudacao}{primeiroNome ? `, ${primeiroNome}` : ''}</h2>
          <p>Escolha uma área para começar.</p>
        </div>
        <div className="home-grid">
          {menuPrincipal().map((area) => (
            <section key={area.id} className="card home-area">
              <div className="home-area-head">
                <span className="home-area-icon"><i className={'fa-solid ' + area.icon} aria-hidden="true" /></span>
                {area.label}
              </div>
              <ul>
                {area.links.map((link) => (
                  <li key={link.href + link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noreferrer">
                        {link.label} <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      </a>
                    ) : (
                      <AppLink href={link.href}>
                        {link.label} <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                      </AppLink>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Base1Layout>
  )
}
