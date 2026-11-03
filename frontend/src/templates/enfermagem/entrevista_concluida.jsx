// enfermagem/entrevista_concluida.html (documento próprio, sem layout)
import AppLink from '../../components/AppLink.jsx'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../../lib/useStylesheet.jsx'
import { cssEntrevistaConcluida } from './estilos.js'
import { campo, useDocumentTitle } from './util.js'

// "Adiciona animação aos botões": o clique fixa transform: translateY(0) no botão
function animarClique(event) {
  event.currentTarget.style.transform = 'translateY(0)'
}

export default function EntrevistaConcluida() {
  const ctx = useTemplateContext()
  useDocumentTitle('Entrevista Concluída')
  useStylesheet('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css')
  useStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css')
  const cpf = show(campo(ctx.dados, 'cpf'))

  // O script de DOMContentLoaded só reescrevia o horário se o texto não
  // contivesse o próprio {{ timestamp }} — o que sempre contém; não faz nada.
  return (
    <>
      <InlineStyle css={cssEntrevistaConcluida} />
      <div className="confirmation-card">
        {/* Ícone de sucesso */}
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>

        {/* Título e subtítulo */}
        <h1 className="title">Entrevista Concluída!</h1>
        <p className="subtitle">O questionário de saúde foi registrado com sucesso.</p>

        {/* Mensagem de confirmação */}
        <div className="alert alert-success" role="alert">
          <i className="fas fa-check me-2"></i>
          Todas as informações foram salvas no sistema. O paciente está apto para continuar o processo.
        </div>

        {/* Botões de ação */}
        <div className="actions">
          <AppLink href={urlFor('enfermagem.declaracao', { cpf })} className="btn-confirm btn-primary" target="_blank" onClick={animarClique}>
            <i className="fas fa-file-medical"></i> Visualizar Declaração
          </AppLink>

          <AppLink href={urlFor('enfermagem.gerar_qrcode', { cpf })} className="btn-confirm btn-success" target="_blank" onClick={animarClique}>
            <i className="fas fa-qrcode"></i> Gerar QR Code
          </AppLink>

          <AppLink href="/" className="btn-confirm btn-secondary" onClick={animarClique}>
            <i className="fas fa-home"></i> Voltar ao Início
          </AppLink>
        </div>

        {/* Timestamp */}
        <div className="timestamp">
          <i className="far fa-clock me-2"></i>
          Concluído em: {show(ctx.timestamp)}
        </div>
      </div>
    </>
  )
}
