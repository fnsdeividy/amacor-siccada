import AppLink from '../components/AppLink.jsx'
import { urlFor } from '../lib/urlFor.js'
import Base1Layout from './Base1Layout.jsx'

/** Layout generic/window.html: base1 + janela central com botão de fechar. */
export default function WindowLayout({ title, children }) {
  return (
    <Base1Layout title={title}>
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <AppLink href={urlFor('auth.fechar')} className="close-btn">✖</AppLink>
          </div>
          <div className="window-content">
            {children}
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
