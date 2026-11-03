// geradores/concluido.html
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useBodyClass } from '../../lib/useBodyClass.js'

export default function Concluido() {
  // <body class="body"> dentro do conteúdo: o navegador aplicava a classe ao body
  useBodyClass('body')
  return (
    <WindowLayout title="Gerador de documentos">
      {/* o {% block title %} estava dentro do window_content: aparece também aqui */}
      Gerador de documentos

      <h1>Kit gerado</h1>
      <h3>Kit processado e gerado corretamente, <AppLink download href={urlFor('doc_gen.download_documento_final')}><strong>clique aqui para baixar.</strong></AppLink></h3>

      <AppLink className="btn" href={urlFor('doc_gen.gerar_documentos')}>voltar</AppLink>
    </WindowLayout>
  )
}
