import AppLink from '../components/AppLink.jsx'
import { urlFor } from '../lib/urlFor.js'
import Base1Layout from './Base1Layout.jsx'

/**
 * Layout generic/window.html: a tela num cartão, com o botão de fechar
 * (que no sistema antigo levava ao início do perfil do usuário).
 */
export default function WindowLayout({ title, children }) {
  return (
    <Base1Layout title={title}>
      <div className="page">
        <div className="page-card">
          <AppLink href={urlFor('auth.fechar')} className="icon-btn page-card-close" data-chrome=""
            title="Fechar" aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </AppLink>
          {children}
        </div>
      </div>
    </Base1Layout>
  )
}
