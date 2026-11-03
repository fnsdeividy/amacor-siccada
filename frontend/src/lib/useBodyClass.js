import { useEffect } from 'react'

/** <body class="..."> dos templates, aplicado enquanto a tela estiver aberta. */
export function useBodyClass(className) {
  useEffect(() => {
    if (!className) return undefined
    const classes = className.split(/\s+/).filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [className])
}
