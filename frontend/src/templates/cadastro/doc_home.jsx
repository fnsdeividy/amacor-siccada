// cadastro/doc_home.html
import BaseLayout from '../../layouts/BaseLayout.jsx'

export default function DocHome() {
  return (
    <BaseLayout title="Bem-vindo">
      <div className="container-cards">
        <a className="btn" href="">criar kit</a> <br />
        <a className="btn" href="">criar documento de cancelamento</a> <br />
        <a className="btn" href="">criar documento de dividas</a> <br />
        <br /><br />
      </div>
      <div className="welcome" />
    </BaseLayout>
  )
}
