// Ordem das colunas das tabelas usadas pelos templates de cadastro com
// acesso por posição (row[1], dados[13]...). O back serializa as linhas como
// objetos com as chaves em ordem alfabética, então col(row, i) não serve:
// aqui o índice é traduzido para o nome da coluna (ordem do banco).
const COLUNAS = {
  venda: [
    'id', 'numero_proposta', 'data_venda', 'tipo_contrato', 'tipo_produto', 'corretor_resp',
    'status', 'digitador', 'valor_venda', 'dt_cadastro', 'taxa_inscricao', 'iss',
    'valor_tabela', 'numero_contrato', 'last_resp', 'vidas', 'finalizado_em', 'exportado',
    'nome_responsavel', 'documento_enviado', 'complemento_fase', 'tipo_pagamento',
    'data_att_fase', 'em_atraso', 'nota_inclusa',
  ],
  responsavel: [
    'id', 'proposta_id', 'nome', 'cpf', 'data_nascimento', 'cep', 'celular', 'email',
    'estado_civil', 'complemento_cep', 'rg', 'cnpj', 'socio',
  ],
  titulares: [
    'id', 'proposta_id', 'nome', 'cpf', 'data_nascimento', 'idade', 'cep', 'celular', 'email',
    'estado_civil', 'nome_mae', 'nome_pai', 'sexo', 'numero_rg', 'profissao',
    'grau_parentesco', 'valor', 'valor_titular',
  ],
  dependentes: [
    'id', 'proposta_id', 'nome', 'cpf', 'data_nascimento', 'grau_parentesco', 'cpf_titular',
    'nome_mae', 'sexo', 'valor', 'idade', 'valor_dependente', 'idade_dependente',
  ],
  clinicas: [
    'id', 'bloco_id', 'nome', 'endereco', 'telefone', 'horario_funcionamento', 'status',
    'id_amatiss', 'latitude', 'longitude', 'logitude',
  ],
}

/**
 * row[index] de uma linha da tabela `tabela`.
 * Linha ausente (None) devolve undefined (o Jinja imprime "" para None[i]).
 */
export function pos(row, tabela, index) {
  if (row === null || row === undefined) return undefined
  if (Array.isArray(row)) return row[index]
  const nome = COLUNAS[tabela]?.[index]
  if (nome === undefined) return undefined
  return row[nome]
}
