// generic/settings.html (renderizado como 'settings.html'; estende base.html)
import BaseLayout from '../layouts/BaseLayout.jsx'

export default function Settings() {
  return (
    <BaseLayout title="Configurações">
      <h1>Configurações</h1>
      <p>Aqui você pode ajustar as configurações da sua conta.</p>
    </BaseLayout>
  )
}
