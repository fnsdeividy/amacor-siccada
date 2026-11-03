// generic/escolher_wallpaper.html
import { useState } from 'react'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { apiFetch } from '../../lib/api.js'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `

.btn-home {
    position: center;
    background: linear-gradient(145deg, #1a2a6c, #36a2eb);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    box-shadow: 0 4px 8px rgba(0,0,0,0.25);
    transition: all 0.3s ease;
}
.btn-home:hover {
    transform: translateY(-2px);
    background: linear-gradient(145deg, #1a2a6c, #36a2eb);
    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

.wallpaper-chooser-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    text-align: left;
    margin-bottom: 30px;
}

.wallpapers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.wallpaper-item {
    background: rgba(0, 0, 0, 0.18);;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.wallpaper-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.wallpaper-preview {
    height: 200px;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    position: relative;
}

.wallpaper-preview::after {
    content: '👁️ Visualizar';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.wallpaper-preview:hover::after {
    opacity: 1;
}

.wallpaper-info {
    padding: 15px;
    text-align: center;
}

.wallpaper-info h4 {
    margin: 0 0 10px 0;
    color: white;
    font-family: 'Poppins', sans-serif;
}

.btn-select {
    background: linear-gradient(135deg, #0a2f68 0%, #1e4a8e 100%);
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-select:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(10, 47, 104, 0.3);
}

.no-wallpapers {
    text-align: center;
    padding: 40px;
    background: rgba(90, 86, 86, 0.616);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.wallpaper-item.selected {
    border: 3px solid #0a2f68;
}

.wallpaper-item.selected .wallpaper-preview::before {
    content: '✅ Selecionado';
    position: absolute;
    top: 10px;
    right: 10px;
    background: #0a2f68;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}
`

// Função para aplicar background
function applyBackground(fullImageUrl) {
  const img = new Image()
  img.src = fullImageUrl
  img.onload = function () {
    document.body.style.backgroundImage = `url('${fullImageUrl}')`
    // Salva no localStorage para persistência
    try { localStorage.setItem('userBackground', fullImageUrl) } catch { /* sem localStorage */ }
    console.log('✅ Background aplicado:', fullImageUrl)
  }
}

function setWallpaper(filename) {
  apiFetch(urlFor('generic.set_wallpaper'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wallpaper: filename,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // 🔥 USA A URL COMPLETA RETORNADA PELA API
        if (data.background_url) {
          applyBackground(data.background_url)
        }
      } else {
        alert('Erro: ' + data.message)
      }
    })
    .catch((error) => {
      console.error('Erro:', error)
      alert('Erro ao alterar papel de parede')
    })
}

export default function EscolherWallpaper() {
  const ctx = useTemplateContext()
  // Preview em tela cheia (o overlay que o script criava no <body>)
  const [preview, setPreview] = useState(null)

  return (
    <Base1Layout title="Escolher Papel de Parede">
      <br /><br />
      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '10px 20px' }}>
        <AppLink href={urlFor('auth.fechar')} className="btn-home">🏠 </AppLink>
      </div>
      <div className="wallpaper-chooser-container">
        <div className="header">
          <br /><br />
          <h1>Definir papel de parede</h1>
          <p>Selecione um dos papéis de parede disponíveis no sistema</p>
        </div>

        {truthy(ctx.wallpapers) ? (
          <div className="wallpapers-grid">
            {ctx.wallpapers.map((wallpaper, i) => (
              <div key={i} className="wallpaper-item" data-filename={show(wallpaper.filename)}>
                <div className="wallpaper-preview"
                  style={{ backgroundImage: `url('${show(wallpaper.url)}')` }}
                  onClick={() => setPreview(show(wallpaper.url))}>
                </div>
                <div className="wallpaper-info">
                  <h4>{show(wallpaper.name)}</h4>
                  <button className="btn-select" onClick={() => setWallpaper(show(wallpaper.filename))}>
                    Selecionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-wallpapers">
            <p>Nenhum papel de parede disponível no sistema.</p>
            <p><small>Adicione imagens na pasta <code>static/image/system_wallapaper/</code></small></p>
          </div>
        )}
      </div>

      <InlineStyle css={css} />

      {preview !== null && (
        <div onClick={() => setPreview(null)} style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 10000, cursor: 'pointer',
        }}>
          <div style={{
            backgroundImage: `url('${preview}')`, backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
            width: '90%', height: '90%', maxWidth: '1200px', maxHeight: '800px',
          }} />
        </div>
      )}
    </Base1Layout>
  )
}
