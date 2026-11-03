// cadastro/beneficiario_detalhes.html
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, showFloat, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { useStylesheet } from '../../lib/useStylesheet.jsx'

export default function BeneficiarioDetalhes() {
  useStylesheet('/static/css/tabpix.css')
  const ctx = useTemplateContext()
  const b = ctx.beneficiario ?? {}
  const codigo = show(b.sCodigoUSR)

  return (
    <Base1Layout title="Detalhes do Beneficiário">
      <div className="container-tab-pix">
        <div className="filter-tab-pix2">
          <AppLink className="close-btn" href={urlFor('cad.render_menu_manutencao_beneficiarios')}>✖</AppLink>
        </div>

        <h1 className="table-title-tab-pix">Detalhes do Beneficiário</h1>

        <div style={{ margin: '16px 0' }}>
          <strong>Status:</strong>{' '}
          {truthy(b.dExclusaoUSR) ? (
            <span style={{ color: '#e74c3c' }}>Cancelado</span>
          ) : b.suspenso === 1 ? (
            <span style={{ color: '#f39c12' }}>Suspenso</span>
          ) : (
            <span style={{ color: '#2ecc71' }}>Ativo</span>
          )}
        </div>

        <ApiForm method="post" action={urlFor('cad.atualizar_beneficiario')} className="divisoria2">
          <input type="hidden" name="codigo_usr" value={codigo} />

          <div className="form-row">
            <label>Carteirinha</label>
            <input type="text" defaultValue={codigo} disabled />
          </div>
          <div className="form-row">
            <label>Contrato</label>
            <input type="text" name="sNumeroCNT" defaultValue={show(b.sNumeroCNT)} />
          </div>
          <div className="form-row">
            <label>Nome do Beneficiário</label>
            <input type="text" name="sNomeUSR" defaultValue={show(b.sNomeUSR)} />
          </div>
          <div className="form-row">
            <label>CPF do Beneficiário</label>
            <input type="text" name="sCpfUSR" defaultValue={show(b.sCpfUSR)} />
          </div>
          <div className="form-row">
            <label>Responsável</label>
            <input type="text" name="sNomeResp" defaultValue={show(b.sNomeResp)} />
          </div>
          <div className="form-row">
            <label>CPF/CNPJ Responsável</label>
            <input type="text" name="sCpfCgcResp" defaultValue={show(b.sCpfCgcResp)} />
          </div>
          <div className="form-row">
            <label>Telefone</label>
            <input type="text" name="Fone_CNT" defaultValue={show(b.Fone_CNT)} />
          </div>
          <div className="form-row">
            <label>Tipo de Usuário</label>
            <input type="text" name="sTipoUsuario" defaultValue={show(b.sTipoUsuario)} />
          </div>
          <div className="form-row">
            <label>Data de Nascimento</label>
            <input type="text" name="dNascimento" defaultValue={show(b.dNascimento)} />
          </div>

          <button className="btn" type="submit">Salvar alterações</button>
        </ApiForm>

        <hr style={{ margin: '24px 0' }} />

        <div className="divisoria2">
          <h2 style={{ marginBottom: '12px' }}>Suspender / Reativar</h2>
          {b.suspenso === 1 ? (
            <ApiForm method="post" action={urlFor('cad.reativar_beneficiario')}>
              <input type="hidden" name="codigo_usr" value={codigo} />
              <button className="btn" type="submit">Reativar beneficiário</button>
            </ApiForm>
          ) : (
            <ApiForm method="post" action={urlFor('cad.suspender_beneficiario')}>
              <input type="hidden" name="codigo_usr" value={codigo} />
              <label>Motivo da suspensão</label>
              <textarea name="motivo_suspensao" rows="3" placeholder="Descreva o motivo"></textarea>
              <button className="btn" type="submit">Suspender beneficiário</button>
            </ApiForm>
          )}
        </div>

        <hr style={{ margin: '24px 0' }} />

        <div className="divisoria2">
          <h2 style={{ marginBottom: '12px' }}>Cancelar beneficiário</h2>
          <ApiForm method="post" action={urlFor('cad.cancelar_beneficiario')}>
            <input type="hidden" name="codigo_usr" value={codigo} />
            <div className="form-row">
              <label>Data de exclusão</label>
              <input type="date" name="data_exclusao" defaultValue={show(b.dExclusaoUSR)} />
            </div>
            <div className="form-row">
              <label>Motivo (código)</label>
              {/* coluna REAL no banco: 4 -> "4.0" */}
              <input type="text" name="motivo_cancelamento" defaultValue={showFloat(b.sMotivoCancelamentoTIT)} placeholder="Ex: 4.0" />
            </div>
            <div className="form-row">
              <label>Descrição do cancelamento</label>
              <textarea name="descricao_cancelamento" rows="3" defaultValue={show(b.sDescricaoCancTit)} />
            </div>
            <button className="btn" type="submit">Cancelar beneficiário</button>
          </ApiForm>
        </div>
      </div>
    </Base1Layout>
  )
}
