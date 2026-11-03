// generic/manutencao.html
import { useNavigate } from 'react-router-dom'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

// O bloco trazia um documento inteiro; o navegador mantinha o <title> e o
// <style> dentro do conteúdo (o CSS vale para a página toda, inclusive o body).
const css = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            text-align: center;
            color: #e0e0e0;
        }
        
        .container12 {
            max-width: 600px;
            padding: 40px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            background: rgba(29, 29, 43, 0.493);
            border-radius: 16px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #e0e0e0;
            font-weight: 700;
        }
        
        h3 {
            font-size: 1.3rem;
            margin-top: 25px;
            color: #e0e0e0;
            font-weight: 400;
            line-height: 1.5;
        }
        
        a {
            color: #1565c0;
            text-decoration: none;
            transition: all 0.3s;
            font-weight: 600;
            padding: 2px 5px;
            border-radius: 4px;
        }
        
        a:hover {
            color: #0d47a1;
            background-color: rgba(21, 101, 192, 0.1);
            text-decoration: none;
        }
        
        .icon-container {
            margin: 30px 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .blocked-cloud {
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        
        .message {
            background-color: #f5f5f5;
            padding: 15px 25px;
            border-radius: 12px;
            margin-top: 25px;
            border-left: 4px solid #757575;
            font-size: 1rem;
            color: #455a64;
        }
        
        @media (max-width: 600px) {
            h1 {
                font-size: 2rem;
            }
            
            h3 {
                font-size: 1.1rem;
            }
            
            .container {
                padding: 25px;
            }
            
            .blocked-cloud {
                width: 140px;
                height: 140px;
            }
        }
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
      <div className="container12">
        <h1>Siccada Routemanager</h1>

        <div className="icon-container">
          {/* Símbolo de bloqueio preto com nuvem dentro */}
          <svg className="blocked-cloud" width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            {/* Círculo de bloqueio preto */}
            <circle cx="80" cy="80" r="70" fill="#000" />

            {/* Barra horizontal do símbolo de proibição */}
            <rect x="25" y="75" width="110" height="10" fill="#fff" transform="rotate(45 80 80)" />
            <rect x="25" y="75" width="110" height="10" fill="#fff" transform="rotate(-45 80 80)" />
            {/* Nuvem cinza dentro do círculo */}
          </svg>
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
