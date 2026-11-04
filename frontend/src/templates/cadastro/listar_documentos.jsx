// cadastro/listar_documentos.html
import AppLink from '../../components/AppLink.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { apiUrl } from '../../lib/api.js'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.cad-docs .cad-docs-thumb {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: cover;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.cad-docs .cad-docs-sem { color: var(--text-muted); font-size: var(--text-xs); }
.cad-docs .cad-docs-acoes { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.cad-docs td.cad-docs-num { font-variant-numeric: tabular-nums; white-space: nowrap; }
`

export default function ListarDocumentos() {
  const { proposta, arquivos } = useTemplateContext()
  return (
    <WindowLayout>
      <InlineStyle css={css} />
      <div className="cad-docs">
        <div className="page-toolbar">
          <h1>Documentos da proposta {show(proposta)}</h1>
          <div className="page-toolbar-actions">
            <AppLink className="btn" download href={urlFor('cad.baixar_todos_documentos_contrato', { proposta })}>
              <i className="fa-solid fa-file-zipper" aria-hidden="true" /> Baixar todos (ZIP)
            </AppLink>
          </div>
        </div>

        {truthy(arquivos) ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Prévia</th>
                  <th>Arquivo</th>
                  <th>Tamanho</th>
                  <th>Atualizado em</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {arquivos.map((arquivo, i) => {
                  // a prévia é servida pelo back (arquivo de imagem)
                  const preview = urlFor('cad.preview_documento_contrato', { proposta, nome_arquivo: arquivo.nome })
                  return (
                    <tr key={i}>
                      <td>
                        {truthy(arquivo.is_image) ? (
                          <AppLink download href={preview} target="_blank" rel="noopener noreferrer">
                            <img className="cad-docs-thumb" src={apiUrl(preview)} alt={'Miniatura de ' + show(arquivo.nome)} />
                          </AppLink>
                        ) : (
                          <span className="cad-docs-sem">Sem prévia</span>
                        )}
                      </td>
                      <td>{show(arquivo.nome)}</td>
                      {/* round(kb, 2) é float no Python: 3 -> "3.0" */}
                      <td className="cad-docs-num">{showFloat(arquivo.tamanho_kb)} KB</td>
                      <td className="cad-docs-num">{show(arquivo.modificado_em)}</td>
                      <td>
                        <AppLink className="btn btn-secondary btn-sm" download href={urlFor('cad.baixar_documento_contrato', { proposta, nome_arquivo: arquivo.nome })}>
                          <i className="fa-solid fa-download" aria-hidden="true" /> Baixar
                        </AppLink>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Nenhum arquivo encontrado para esta proposta.</p>
        )}

        <div className="cad-docs-acoes">
          <AppLink className="btn" href={urlFor('cad.render_page_doc', { proposta })}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Adicionar mais documentos
          </AppLink>
          <AppLink className="btn btn-secondary" href={urlFor('auth.redir_atent')}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar
          </AppLink>
        </div>
      </div>
    </WindowLayout>
  )
}
