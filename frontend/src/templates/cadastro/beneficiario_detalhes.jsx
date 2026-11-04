// cadastro/beneficiario_detalhes.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle } from '../../lib/useStylesheet.jsx'

const css = `
.cad-benef .cad-benef-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  color: var(--text-soft);
}
.cad-benef .cad-benef-acoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-4);
  align-items: start;
}
.cad-benef .cad-benef-acoes .card { margin-bottom: 0; }
.cad-benef h2 { display: flex; align-items: center; gap: var(--space-2); }
.cad-benef h2 i { color: var(--text-muted); }
`

export default function BeneficiarioDetalhes() {
  const ctx = useTemplateContext()
  const b = ctx.beneficiario ?? {}
  const codigo = show(b.sCodigoUSR)

  return (
    <Base1Layout title="Detalhes do Beneficiário">
      <InlineStyle css={css} />
      <div className="cad-benef">
        <div className="card">
          <div className="filter-tab-pix2">
            <AppLink className="close-btn" href={urlFor('cad.render_menu_manutencao_beneficiarios')} title="Fechar" aria-label="Fechar">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </AppLink>
          </div>

          <div className="page-toolbar">
            <h1 className="table-title-tab-pix">Detalhes do Beneficiário</h1>
          </div>

          <div className="cad-benef-status">
            <strong>Status:</strong>{' '}
            {truthy(b.dExclusaoUSR) ? (
              <span className="status-red">Cancelado</span>
            ) : b.suspenso === 1 ? (
              <span className="status-yellow">Suspenso</span>
            ) : (
              <span className="status-green">Ativo</span>
            )}
          </div>

          <ApiForm method="post" action={urlFor('cad.atualizar_beneficiario')}>
            <input type="hidden" name="codigo_usr" value={codigo} />

            <div className="form-row">
              <div className="form-group">
                <label>Carteirinha</label>
                <input type="text" defaultValue={codigo} disabled />
              </div>
              <div className="form-group">
                <label>Contrato</label>
                <input type="text" name="sNumeroCNT" defaultValue={show(b.sNumeroCNT)} />
              </div>
              <div className="form-group">
                <label>Nome do Beneficiário</label>
                <input type="text" name="sNomeUSR" defaultValue={show(b.sNomeUSR)} />
              </div>
              <div className="form-group">
                <label>CPF do Beneficiário</label>
                <input type="text" name="sCpfUSR" defaultValue={show(b.sCpfUSR)} />
              </div>
              <div className="form-group">
                <label>Responsável</label>
                <input type="text" name="sNomeResp" defaultValue={show(b.sNomeResp)} />
              </div>
              <div className="form-group">
                <label>CPF/CNPJ Responsável</label>
                <input type="text" name="sCpfCgcResp" defaultValue={show(b.sCpfCgcResp)} />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input type="text" name="Fone_CNT" defaultValue={show(b.Fone_CNT)} />
              </div>
              <div className="form-group">
                <label>Tipo de Usuário</label>
                <input type="text" name="sTipoUsuario" defaultValue={show(b.sTipoUsuario)} />
              </div>
              <div className="form-group">
                <label>Data de Nascimento</label>
                <input type="text" name="dNascimento" defaultValue={show(b.dNascimento)} />
              </div>
            </div>

            <button className="btn" type="submit"><i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Salvar alterações</button>
          </ApiForm>
        </div>

        <div className="cad-benef-acoes">
          <div className="card">
            <h2><i className="fa-solid fa-pause" aria-hidden="true" /> Suspender / Reativar</h2>
            {b.suspenso === 1 ? (
              <ApiForm method="post" action={urlFor('cad.reativar_beneficiario')}>
                <input type="hidden" name="codigo_usr" value={codigo} />
                <button className="btn" type="submit"><i className="fa-solid fa-play" aria-hidden="true" /> Reativar beneficiário</button>
              </ApiForm>
            ) : (
              <ApiForm method="post" action={urlFor('cad.suspender_beneficiario')}>
                <input type="hidden" name="codigo_usr" value={codigo} />
                <div className="form-group">
                  <label>Motivo da suspensão</label>
                  <textarea name="motivo_suspensao" rows="3" placeholder="Descreva o motivo"></textarea>
                </div>
                <button className="btn btn-secondary" type="submit">Suspender beneficiário</button>
              </ApiForm>
            )}
          </div>

          <div className="card">
            <h2><i className="fa-solid fa-user-xmark" aria-hidden="true" /> Cancelar beneficiário</h2>
            <ApiForm method="post" action={urlFor('cad.cancelar_beneficiario')}>
              <input type="hidden" name="codigo_usr" value={codigo} />
              <div className="form-row">
                <div className="form-group">
                  <label>Data de exclusão</label>
                  <input type="date" name="data_exclusao" defaultValue={show(b.dExclusaoUSR)} />
                </div>
                <div className="form-group">
                  <label>Motivo (código)</label>
                  {/* coluna REAL no banco: 4 -> "4.0" */}
                  <input type="text" name="motivo_cancelamento" defaultValue={showFloat(b.sMotivoCancelamentoTIT)} placeholder="Ex: 4.0" />
                </div>
              </div>
              <div className="form-group">
                <label>Descrição do cancelamento</label>
                <textarea name="descricao_cancelamento" rows="3" defaultValue={show(b.sDescricaoCancTit)} />
              </div>
              <button className="btn btn-danger" type="submit">Cancelar beneficiário</button>
            </ApiForm>
          </div>
        </div>
      </div>
    </Base1Layout>
  )
}
