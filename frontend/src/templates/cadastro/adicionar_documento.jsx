// cadastro/adicionar_documento.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function AdicionarDocumento() {
  const ctx = useTemplateContext()
  return (
    <WindowLayout>
      <h1>Anexar documentos da proposta</h1>
      <ApiForm action={urlFor('cad.adicionar_doc', { proposta: ctx.proposta })} method="POST" encType="multipart/form-data">
        <label htmlFor="arquivos">Selecione os documentos para upload:</label>
        <input type="file" name="arquivos" id="arquivos" multiple required />
        <button type="submit">Enviar</button>
      </ApiForm>
      <p style={{ marginTop: '12px' }}>
        <AppLink href={urlFor('cad.listar_documentos_contrato', { proposta: ctx.proposta })}>Visualizar arquivos enviados desta proposta</AppLink>
      </p>
    </WindowLayout>
  )
}
