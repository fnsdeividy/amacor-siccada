import AppShell from '../components/AppShell.jsx'
import { menuBase } from './menus.js'

/** Layout das telas que no sistema antigo estendiam generic/base.html. */
export default function BaseLayout({ title = 'Sistema', children }) {
  return (
    <AppShell title={title} menu={menuBase()}>
      {children}
    </AppShell>
  )
}
