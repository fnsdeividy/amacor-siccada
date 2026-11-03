// cadastro/listar_documentos.html
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { apiUrl } from '../../lib/api.js'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'

const th = { textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }
const td = { borderBottom: '1px solid #eee', padding: '8px' }

export default function ListarDocumentos() {
  const { proposta, arquivos } = useTemplateContext()
  return (
    <WindowLayout>
      <h1>Documentos da proposta {show(proposta)}</h1>

      <div style={{ marginTop: '12px', marginBottom: '10px' }}>
        <AppLink download href={urlFor('cad.baixar_todos_documentos_contrato', { proposta })}>Baixar todos (ZIP)</AppLink>
      </div>

      {truthy(arquivos) ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr>
              <th style={th}>Prévia</th>
              <th style={th}>Arquivo</th>
              <th style={th}>Tamanho</th>
              <th style={th}>Atualizado em</th>
              <th style={th}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {arquivos.map((arquivo, i) => {
              // a prévia é servida pelo back (arquivo de imagem)
              const preview = urlFor('cad.preview_documento_contrato', { proposta, nome_arquivo: arquivo.nome })
              return (
                <tr key={i}>
                  <td style={td}>
                    {truthy(arquivo.is_image) ? (
                      <AppLink download href={preview} target="_blank" rel="noopener noreferrer">
                        <img src={apiUrl(preview)}
                          alt={'Miniatura de ' + show(arquivo.nome)}
                          style={{ width: '56px', height: '56px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '6px' }} />
                      </AppLink>
                    ) : (
                      <span style={{ color: '#777' }}>Sem prévia</span>
                    )}
                  </td>
                  <td style={td}>{show(arquivo.nome)}</td>
                  {/* round(kb, 2) é float no Python: 3 -> "3.0" */}
                  <td style={td}>{showFloat(arquivo.tamanho_kb)} KB</td>
                  <td style={td}>{show(arquivo.modificado_em)}</td>
                  <td style={td}>
                    <AppLink download href={urlFor('cad.baixar_documento_contrato', { proposta, nome_arquivo: arquivo.nome })}>Baixar</AppLink>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p>Nenhum arquivo encontrado para esta proposta.</p>
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
        <AppLink href={urlFor('cad.render_page_doc', { proposta })}>Adicionar mais documentos</AppLink>
        <AppLink href={urlFor('auth.redir_atent')}>Voltar</AppLink>
      </div>
    </WindowLayout>
  )
}
