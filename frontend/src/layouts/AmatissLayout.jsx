import AppShell from '../components/AppShell.jsx'
import { menuAutorizacao } from './menus.js'

/** Layout das telas que no sistema antigo estendiam generic/base_amatiss.html. */
export default function AmatissLayout({ title = 'Início', children }) {
  return (
    <AppShell title={title === 'Inicial' ? 'Início' : title} menu={menuAutorizacao()}>
      {children}
    </AppShell>
  )
}
