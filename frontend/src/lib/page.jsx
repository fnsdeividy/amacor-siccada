import { createContext, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, toAppPath } from './api.js'

/**
 * Dados da página atual, vindos do back:
 *   context  - o que a rota passou para o template
 *   session  - usuário logado (user_nome, tipo_usuario, classe_usuario...)
 *   flashes  - mensagens [{category, message}]
 *   template - nome do template que o back renderizaria
 *   show     - aplica uma resposta do back (página, redirect, arquivo...)
 */
export const PageContext = createContext(null)

export function usePage() {
  return useContext(PageContext)
}

/** Atalho para os dados que a rota passou ao template. */
export function useTemplateContext() {
  return usePage()?.context ?? {}
}

/**
 * Envia algo para uma rota do back e aplica a resposta como o navegador
 * faria com um <form> ou link: segue redirects, mostra a página devolvida,
 * baixa arquivos. Devolve a resposta para quem quiser tratar 'json'.
 */
export function useSubmit() {
  const page = usePage()
  const navigate = useNavigate()
  return useCallback(async (path, options = {}) => {
    const result = await apiRequest(path, options)
    if (result.type === 'redirect') {
      const target = toAppPath(result.location)
      if (target === null) window.location.href = result.location
      else navigate(target)
    } else if (result.type === 'page' || result.type === 'html' || result.type === 'error') {
      // POST que devolve uma página: mostra sem mudar a URL, como o navegador
      page?.show(result)
    }
    return result
  }, [navigate, page])
}
