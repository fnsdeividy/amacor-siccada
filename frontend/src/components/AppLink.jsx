import { Link } from 'react-router-dom'
import { apiUrl } from '../lib/api.js'

/**
 * Substitui <a href="{{ url_for(...) }}">.
 *  - caminhos do sistema navegam dentro do front (sem recarregar);
 *  - download=true aponta direto para o back (rotas que devolvem arquivo);
 *  - links externos, "#", mailto: etc. ficam como <a> normal.
 */
export default function AppLink({ href, download, children, ...props }) {
  if (!href || href.startsWith('#') || /^[a-z]+:/i.test(href) || props.target === '_blank' && !href.startsWith('/')) {
    return <a href={href} {...props}>{children}</a>
  }
  if (download || href.startsWith('/static/')) {
    return <a href={href.startsWith('/static/') ? href : apiUrl(href)} {...props}>{children}</a>
  }
  return <Link to={href} {...props}>{children}</Link>
}
