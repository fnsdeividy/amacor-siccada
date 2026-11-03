import { useNavigate } from 'react-router-dom'

/**
 * goBack() dos templates de cadastro:
 *   if (document.referrer) window.history.back(); else window.location.href = '/';
 */
export function useGoBack() {
  const navigate = useNavigate()
  return (event) => {
    if (event) event.preventDefault()
    if (document.referrer || window.history.length > 1) navigate(-1)
    else navigate('/')
  }
}
