// cadastro/definir.html
import ApiForm from '../../components/ApiForm.jsx'
import WindowLayout from '../../layouts/WindowLayout.jsx'
import { urlFor } from '../../lib/urlFor.js'

export default function Definir() {
  return (
    <WindowLayout title="Filtragem de Contratos">
      <h1>
        Filtragem de Contratos
      </h1>

      <ApiForm method="GET" action={urlFor('gerencial.relatorio_vendas')} className="filter-form">
        <label htmlFor="status">Status da proposta:</label>
        <select name="status" id="status" defaultValue="">
          <option value="" disabled>Selecione</option>
          <option value="Enviado ao cadastro">enviado ao cadastro</option>
          <option value="entrevista online enviada">entrevista online enviada</option>
          <option value="enviado para financeiro">Enviar para financeiro</option>
          <option value="nota emitida">nota emitida</option>
          <option value="analise de declaração">Enviar para analise</option>
          <option value="entrevista agendada">entrevista Agendada</option>
          <option value="geração de kit">gerar kit</option>
          <option value="contrato finalizado">contrato finalizado</option>
        </select>

        <label htmlFor="data_inicio" className="input-label">Data de Início:</label>
        <input type="date" id="data_inicio" name="venda_inicial" className="date-input" />

        <label htmlFor="data_fim" className="input-label">Data de Fim:</label>
        <input type="date" id="data_fim" name="venda_final" className="date-input" />

        <button type="submit" className="btn btn-primary">Redirecionar</button>
      </ApiForm>
    </WindowLayout>
  )
}
