import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import PageView from './PageView.jsx'
import './styles/tokens.css'
import './styles/base.css'
import './styles/shell.css'
import { urlFor } from './lib/urlFor.js'

// Todas as URLs do sistema são as mesmas do back. Cada uma é carregada
// do back em modo API e desenhada pelo componente do template devolvido.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* no back, "/" redireciona para o login (run.py) */}
        <Route path="/" element={<Navigate to={urlFor('auth.login')} replace />} />
        <Route path="*" element={<PageView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
