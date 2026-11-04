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
.wallpaper-chooser-container .header { margin-bottom: var(--space-5); }
.wallpaper-chooser-container .header p { margin: var(--space-1) 0 0; color: var(--text-muted); }
.wallpaper-chooser-container .wallpapers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}
.wallpaper-chooser-container .wallpaper-item {
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.wallpaper-chooser-container .wallpaper-item:hover { border-color: var(--brand-600); box-shadow: var(--shadow-lg); }
.wallpaper-chooser-container .wallpaper-item.selected { border-color: var(--brand-700); box-shadow: 0 0 0 2px var(--brand-700); }
.wallpaper-chooser-container .wallpaper-preview {
  position: relative;
  height: 180px;
  background-color: var(--gray-100);
  background-size: cover;
  background-position: center;
  border: 0;
  border-bottom: 1px solid var(--border);
  cursor: zoom-in;
}
.wallpaper-chooser-container .wallpaper-selected-badge {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  color: var(--white);
  background: var(--brand-700);
}
.wallpaper-chooser-container .wallpaper-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}
.wallpaper-chooser-container .wallpaper-info h4 { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wallpaper-chooser-container .no-wallpapers {
  padding: var(--space-8) var(--space-6);
  text-align: center;
  background: var(--gray-50);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
}
.wallpaper-chooser-container .no-wallpapers p { margin: 0 0 var(--space-1); }
.wallpaper-chooser-container .no-wallpapers i { font-size: 32px; color: var(--gray-400); margin-bottom: var(--space-3); }
.wallpaper-lightbox {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--gray-950) 88%, transparent);
  cursor: zoom-out;
}
.wallpaper-lightbox-img {
  width: 90%;
  height: 90%;
  max-width: 1200px;
  max-height: 800px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
`

// Função para aplicar background. O visual novo não mostra papel de parede na
// moldura: a escolha continua salva (no back e no localStorage), mas não é
// mais pintada no <body>.
function applyBackground(fullImageUrl) {
  // Salva no localStorage para persistência
  try { localStorage.setItem('userBackground', fullImageUrl) } catch { /* sem localStorage */ }
  console.log('Background aplicado:', fullImageUrl)
}

function setWallpaper(filename, onSaved) {
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
        // USA A URL COMPLETA RETORNADA PELA API
        if (data.background_url) {
          applyBackground(data.background_url)
        }
        onSaved()
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
  // sem papel de parede na moldura, a escolha salva é marcada no próprio cartão
  const [salvo, setSalvo] = useState(null)

  return (
    <Base1Layout title="Escolher Papel de Parede">
      <InlineStyle css={css} />
      <div className="card wallpaper-chooser-container">
        <div className="page-toolbar header">
          <div>
            <h1>Definir papel de parede</h1>
            <p>Selecione um dos papéis de parede disponíveis no sistema</p>
          </div>
          <div className="page-toolbar-actions">
            <AppLink href={urlFor('auth.fechar')} className="btn btn-secondary btn-home" title="Início" aria-label="Início">
              <i className="fa-solid fa-house" aria-hidden="true" />
            </AppLink>
          </div>
        </div>

        {truthy(ctx.wallpapers) ? (
          <div className="wallpapers-grid">
            {ctx.wallpapers.map((wallpaper, i) => (
              <div key={i} className={'wallpaper-item' + (salvo === show(wallpaper.filename) ? ' selected' : '')}
                data-filename={show(wallpaper.filename)}>
                <div className="wallpaper-preview" role="button" tabIndex={0} title="Visualizar"
                  style={{ backgroundImage: `url('${show(wallpaper.url)}')` }}
                  onClick={() => setPreview(show(wallpaper.url))}
                  onKeyDown={(e) => { if (e.key === 'Enter') setPreview(show(wallpaper.url)) }}>
                  {salvo === show(wallpaper.filename) && (
                    <span className="badge wallpaper-selected-badge">
                      <i className="fa-solid fa-check me-1" aria-hidden="true" />Selecionado
                    </span>
                  )}
                </div>
                <div className="wallpaper-info">
                  <h4>{show(wallpaper.name)}</h4>
                  <button className="btn btn-sm btn-select"
                    onClick={() => setWallpaper(show(wallpaper.filename), () => setSalvo(show(wallpaper.filename)))}>
                    Selecionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-wallpapers">
            <i className="fa-regular fa-image" aria-hidden="true" />
            <p>Nenhum papel de parede disponível no sistema.</p>
            <p><small>Adicione imagens na pasta <code>static/image/system_wallapaper/</code></small></p>
          </div>
        )}
      </div>

      {preview !== null && (
        <div className="wallpaper-lightbox" onClick={() => setPreview(null)}>
          <div className="wallpaper-lightbox-img" style={{ backgroundImage: `url('${preview}')` }} />
        </div>
      )}
    </Base1Layout>
  )
}
