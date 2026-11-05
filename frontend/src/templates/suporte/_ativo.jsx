// Peças compartilhadas pelas telas de suporte/usuarios.html e
// suporte/usuario_detalhe.html (não é um template do back).
import ApiForm from '../../components/ApiForm.jsx'
import { urlFor } from '../../lib/urlFor.js'

export function estaAtivo(usuario) {
  return Number(usuario?.ativo) === 1
}

export function SituacaoBadge({ usuario }) {
  return estaAtivo(usuario)
    ? <span className="status-green">Ativo</span>
    : <span className="status-red">Inativo</span>
}

/**
 * Botão Ativar/Desativar de um usuário, com confirmação antes.
 * O back responde com redirect para `voltar` (a tela atual), que é
 * carregada de novo com a situação nova e a mensagem.
 */
export function AtivoForm({ usuario, usuarioLogadoId, voltar, rotulo }) {
  const ativo = estaAtivo(usuario)

  // ninguém desativa o próprio usuário (o back também recusa)
  if (ativo && usuario.id === usuarioLogadoId) {
    return <span className="badge" title="Você não pode desativar o seu próprio usuário">Você</span>
  }

  function confirmar(event) {
    const mensagem = ativo
      ? `Desativar ${usuario.nome}? Ele não vai conseguir entrar no sistema e a sessão aberta será encerrada.`
      : `Ativar ${usuario.nome}? Ele volta a conseguir entrar no sistema.`
    if (!window.confirm(mensagem)) event.preventDefault()
  }

  return (
    <ApiForm method="POST" className="suporte-ativo-form"
      action={urlFor('suporte.alterar_ativo', { usuario_id: usuario.id })}
      onSubmit={confirmar}>
      <input type="hidden" name="ativo" value={ativo ? '0' : '1'} readOnly />
      <input type="hidden" name="voltar" value={voltar} readOnly />
      <button type="submit" className={'btn btn-sm ' + (ativo ? 'btn-danger' : 'btn-success')}>
        <i className={'fa-solid ' + (ativo ? 'fa-user-slash' : 'fa-user-check')} aria-hidden="true" />
        {' '}{ativo ? 'Desativar' : 'Ativar'}{rotulo ? ` ${rotulo}` : ''}
      </button>
    </ApiForm>
  )
}
