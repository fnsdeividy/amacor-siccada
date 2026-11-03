// cadastro/home.html
import AppLink from '../../components/AppLink.jsx'
import BaseLayout from '../../layouts/BaseLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function Home() {
  return (
    <BaseLayout title="Bem-vindo">
      <div className="container-cards">
        <AppLink className="btn" href={urlFor('pdfgen.create_card')}>criar carteirinha</AppLink> <br />
        <a className="btn" href="">lote de telemedicina</a>
        <AppLink className="btn" href={urlFor('doc_gen.gerar_documentos')}>gerador de kit</AppLink>
        <AppLink className="btn" href={urlFor('doc_gen.gerar_documentos')}>gerador de kit</AppLink>
        <br /><br />
      </div>
      <div className="welcome" />
    </BaseLayout>
  )
}
