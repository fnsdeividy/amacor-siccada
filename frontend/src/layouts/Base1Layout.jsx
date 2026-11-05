import AppShell from '../components/AppShell.jsx'
import { usePage } from '../lib/page.jsx'
import { menuPrincipal } from './menus.js'

/**
 * Layout das telas que no sistema antigo estendiam generic/base1.html.
 * O título vem do {% block title %} de cada template (padrão "Início").
 */
export default function Base1Layout({ title = 'Início', children }) {
  const session = usePage()?.session
  return (
    <AppShell title={title === 'Inicial' ? 'Início' : title} menu={menuPrincipal(session)}>
      {children}
    </AppShell>
  )
}
