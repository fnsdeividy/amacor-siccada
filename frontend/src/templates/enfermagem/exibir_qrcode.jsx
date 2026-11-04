// enfermagem/exibir_qrcode.html (documento próprio, sem layout)
import { useEffect, useRef, useState } from 'react'
import AppLink from '../../components/AppLink.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../../lib/useStylesheet.jsx'
import { cssExibirQrcode, cssPublica } from './estilos.js'
import { useDocumentTitle } from './util.js'

// Detectar dispositivo móvel
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export default function ExibirQrcode() {
  const ctx = useTemplateContext()
  useDocumentTitle('QR Code para Declaração')
  // Bootstrap mantido (grade e modal); cores e tipografia vêm dos tokens
  useStylesheet('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css')

  const cpf = show(ctx.cpf)
  const url = show(ctx.url)
  const imgRef = useRef(null)
  const urlRef = useRef(null)
  const [countdown, setCountdown] = useState(null) // texto do #countdown
  const [alternativas, setAlternativas] = useState(false)
  const [mobile, setMobile] = useState(false)

  // Contador de atualização (5 minutos)
  useEffect(() => {
    let restante = 300
    let timer
    const updateCountdown = () => {
      if (restante > 0) {
        const minutes = Math.floor(restante / 60)
        const seconds = restante % 60
        setCountdown({ texto: `${minutes}:${seconds.toString().padStart(2, '0')}` })
        restante--
        timer = setTimeout(updateCountdown, 1000)
      } else {
        setCountdown({ texto: 'QR Code expirado', expirado: true })
      }
    }
    updateCountdown()
    return () => clearTimeout(timer)
  }, [])

  // Auto-focus no QR Code + instruções específicas para mobile
  useEffect(() => {
    imgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setMobile(isMobileDevice())
  }, [])

  function copiarURL() {
    const urlText = urlRef.current.textContent
    navigator.clipboard.writeText(urlText).then(() => {
      alert('URL copiada para a área de transferência!')
    })
  }

  // Abrir no celular (envio por WhatsApp)
  function abrirNoCelular() {
    const texto = urlRef.current.textContent
    const whatsappUrl = `https://wa.me/?text=QR%20Code%20para%20declaração:%20${encodeURIComponent(texto)}`
    window.open(whatsappUrl, '_blank')
  }

  function imprimirQRCode() {
    window.print()
  }

  async function compartilharQRCode() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code para Declaração Médica',
          text: `Escaneie este QR Code para acessar a declaração do paciente CPF: ${cpf}`,
          url,
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      alert('Compartilhamento não suportado neste navegador. Copie a URL manualmente.')
    }
  }

  function mostrarAlternativas(event) {
    // o original não cancelava o href="#"; aqui é cancelado para não mexer na rota do front
    event.preventDefault()
    setAlternativas((v) => !v)
  }

  function downloadQRCode(format) {
    const link = document.createElement('a')
    const qrcodeData = imgRef.current.src
    if (format === 'png') {
      link.href = qrcodeData
      link.download = `qrcode_paciente_${cpf}.png`
    } else {
      alert(`Funcionalidade ${format.toUpperCase()} requer configuração no servidor`)
      return
    }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="enf-publica enf-qrcode">
      <InlineStyle css={cssPublica} />
      <InlineStyle css={cssExibirQrcode} />
      <div className="container">
        <div className="qr-container enf-cartao">
          {/* Cabeçalho */}
          <div className="header">
            <h1><i className="fa-solid fa-qrcode me-2" aria-hidden="true"></i>QR Code para Acesso</h1>
            <span className="badge"><i className="fa-solid fa-user me-1" aria-hidden="true"></i> CPF: {cpf}</span>
            <p className="text-muted mt-2">Escaneie com a câmera do seu celular</p>
          </div>

          {/* Informações do Paciente */}
          <div className="info-card">
            <h5><i className="fa-solid fa-circle-info" aria-hidden="true"></i> Informações</h5>
            <ul>
              <li><strong>CPF do Paciente:</strong> {cpf}</li>
              <li><strong>Data de Geração:</strong> {show(ctx.timestamp)}</li>
              <li><strong>Servidor:</strong> {show(ctx.ip_servidor)}</li>
            </ul>
          </div>

          {/* QR Code Display */}
          <div className="qrcode-display">
            <img src={`data:image/png;base64,${show(ctx.qrcode_base64)}`}
              alt="QR Code para declaração do paciente"
              id="qrcodeImage" ref={imgRef} />
            <div className={'countdown' + (countdown?.expirado ? ' expirado' : '')} id="countdown">{countdown?.texto}</div>
            <p className="mt-3 text-muted">
              <i className="fa-solid fa-mobile-screen me-2" aria-hidden="true"></i>
              Aponte a câmera do celular para o código acima
            </p>
          </div>

          {/* URL para acesso manual */}
          <div className="url-display">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fa-solid fa-link me-2 text-primary" aria-hidden="true"></i>
                <strong>URL para acesso manual:</strong>
              </div>
              <button className="btn btn-sm btn-outline-primary" onClick={copiarURL}>
                <i className="fa-solid fa-copy" aria-hidden="true"></i> Copiar
              </button>
            </div>
            <div className="mt-2" id="urlText" ref={urlRef}>{url}</div>
          </div>

          {/* Instruções */}
          <div className="instruction-box">
            {mobile
              ? <h4><i className="fa-solid fa-mobile-screen me-2" aria-hidden="true"></i> Como escanear no seu celular</h4>
              : <h4><i className="fa-solid fa-graduation-cap me-2" aria-hidden="true"></i> Como escanear o QR Code</h4>}

            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <strong>Abra a câmera do seu celular</strong>
                <p className="mb-0 text-muted">A maioria dos smartphones modernos já tem leitor de QR Code integrado na câmera.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <strong>Aponte para o código acima</strong>
                <p className="mb-0 text-muted">Mantenha o código dentro do quadro da câmera até que seja reconhecido.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <strong>Toque na notificação</strong>
                <p className="mb-0 text-muted">Quando detectado, aparecerá uma notificação - toque nela para abrir o link.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <strong>Acesse a declaração</strong>
                <p className="mb-0 text-muted">Você será redirecionado para a declaração completa do paciente.</p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="enf-acoes">
            <button className="btn-action" onClick={abrirNoCelular}>
              <i className="fa-solid fa-mobile-screen" aria-hidden="true"></i> Abrir no Celular
            </button>

            <button className="btn-action" onClick={imprimirQRCode}>
              <i className="fa-solid fa-print" aria-hidden="true"></i> Imprimir
            </button>

            <button className="btn-action" onClick={compartilharQRCode}>
              <i className="fa-solid fa-share-nodes" aria-hidden="true"></i> Compartilhar
            </button>

            <AppLink href={urlFor('enfermagem.declaracao', { cpf })} target="_blank" className="btn-action btn-action-principal">
              <i className="fa-solid fa-up-right-from-square" aria-hidden="true"></i> Acessar Agora
            </AppLink>
          </div>

          {/* Alternativas */}
          <div className="enf-alternativas">
            <p className="text-muted">
              <small>
                <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true"></i>
                Problemas com o QR Code?{' '}
                <a href="#" onClick={mostrarAlternativas}>Clique aqui para alternativas</a>
              </small>
            </p>

            <div id="alternativas" style={{ display: alternativas ? 'block' : 'none' }}>
              <div className="alert alert-info mt-2">
                <h6><i className="fa-solid fa-rotate me-2" aria-hidden="true"></i> Alternativas de acesso:</h6>
                <ol className="mb-0">
                  <li>Copie e cole a URL acima no navegador</li>
                  <li>Use um aplicativo leitor de QR Code</li>
                  <li>Acesse diretamente pelo botão "Acessar Agora"</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para download (nenhum controle da página o abre) */}
      <div className="modal fade enf-qrcode-modal" id="downloadModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"><i className="fa-solid fa-download me-2" aria-hidden="true"></i>Download do QR Code</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body text-center">
              <p>Escolha o formato para download:</p>
              <button className="btn btn-primary m-2" onClick={() => downloadQRCode('png')}>
                <i className="fa-solid fa-image" aria-hidden="true"></i> PNG
              </button>
              <button className="btn btn-success m-2" onClick={() => downloadQRCode('svg')}>
                <i className="fa-solid fa-vector-square" aria-hidden="true"></i> SVG
              </button>
              <button className="btn btn-info m-2" onClick={() => downloadQRCode('pdf')}>
                <i className="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
