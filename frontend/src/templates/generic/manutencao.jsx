// generic/manutencao.html
import { useNavigate } from 'react-router-dom'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

// O bloco trazia um documento inteiro (com <title> e <style> que valiam para a
// página toda). No visual novo o CSS fica restrito à própria tela.
const css = `
.manutencao { max-width: 600px; margin: var(--space-8) auto; padding: var(--space-8) var(--space-6); text-align: center; }
.manutencao h1 { font-size: var(--text-2xl); margin-bottom: 0; }
.manutencao h3 { margin: var(--space-3) 0 0; font-size: var(--text-md); font-weight: 400; color: var(--text-soft); }
.manutencao h3 a { font-weight: 600; }
.manutencao .icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin: var(--space-6) auto;
  border-radius: 50%;
  font-size: 44px;
  color: var(--gray-500);
  background: var(--gray-100);
}
.manutencao .message {
  margin-top: var(--space-6);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  background: var(--gray-50);
  border: 1px solid var(--border);
  border-left: 4px solid var(--gray-400);
  border-radius: var(--radius);
}
.manutencao .message p { margin: 0; color: var(--text-soft); }
`

export default function Manutencao() {
  const navigate = useNavigate()

  function goBack() {
    // document.referrer não muda numa SPA: usa o histórico do próprio app
    if (window.history.state && window.history.state.idx > 0) {
      // Voltar para a página anterior
      navigate(-1)
    } else {
      // Redirecionar para a home se não houver página anterior
      navigate('/')
    }
  }

  return (
    <Base1Layout title="Siccada Routemanager">
      <title>Página em Manutenção - Siccada Routemanager</title>
      <InlineStyle css={css} />
      <div className="card container12 manutencao">
        <h1>Siccada Routemanager</h1>

        <div className="icon-container">
          <i className="fa-solid fa-ban blocked-cloud" aria-hidden="true" />
        </div>

        <h3>Esta página está temporariamente offline.</h3>
        <h3>Por favor, <a href="javascript:void(0);" onClick={(e) => { e.preventDefault(); goBack() }}><strong>retorne</strong></a> ou tente novamente mais tarde.</h3>

        <div className="message">
          <p>Estamos trabalhando para melhorar sua experiência. Pedimos desculpas pelo inconveniente.</p>
        </div>
      </div>
    </Base1Layout>
  )
}
