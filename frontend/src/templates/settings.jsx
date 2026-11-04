// generic/settings.html (renderizado como 'settings.html'; estende base.html)
import BaseLayout from '../layouts/BaseLayout.jsx'

export default function Settings() {
  return (
    <BaseLayout title="Configurações">
      <div className="card">
        <h1>Configurações</h1>
        <p className="mb-0">Aqui você pode ajustar as configurações da sua conta.</p>
      </div>
    </BaseLayout>
  )
}
