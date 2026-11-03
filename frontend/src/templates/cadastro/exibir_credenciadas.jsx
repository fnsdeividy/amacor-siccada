// cadastro/exibir_credenciadas.html
import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { show, truthy } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../../lib/useStylesheet.jsx'
import { pos } from './_colunas.js'

const css = `
        .btn-home {
    position: center;
    background: linear-gradient(145deg, #1a2a6c, #36a2eb);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    box-shadow: 0 4px 8px rgba(0,0,0,0.25);
    transition: all 0.3s ease;
}

.btn-home:hover {
    transform: translateY(-2px);
    background: linear-gradient(145deg, #1a2a6c, #36a2eb);
    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}
        /* Seus estilos permanecem os mesmos */
        p {
            position: center;
            font-family: Arial, sans-serif;
            color: #ebebeb;
        }
        .cards-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-start; /* Garante que cada cartão mantenha sua própria altura */
        gap: 20px;
        padding: 20px;
        margin-top: 30px;
    }

    .card {
        width: 280px;
        border: 1px solid #f8f8f8bd;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        background: rgba(255, 238, 201, 0.493);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        overflow: hidden;
        margin-bottom: 20px;
        transition: transform 0.3s ease;
    }

    .card-atrasado {
        width: 280px;
        border: 1px solid rgba(255, 126, 126, 0.493);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        background: rgba(255, 126, 126, 0.493);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        overflow: hidden;

        margin-bottom: 20px;
        transition: transform 0.3s ease;
    }
    .card-atrasado:hover {
        transform: scale(1.02);
    }

    .card:hover {
        transform: scale(1.02);
    }

    .card-header {
        background-color: #8ea7f8;
        color: #4f4159;
        padding: 12px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
    }

    .card-body {
        padding: 12px;
        cursor: pointer;
    }

    .card-body p {
        margin: 6px 0;
        font-size: 13px;
        color: #242424;
    }

    .card-details {
        display: none;
        padding: 12px;
        border-top: 1px solid #ddd;

        overflow: hidden;
        margin-bottom: 20px;
        transition: transform 0.3s ease;
    }

    .card-details-atrasado {
        display: none;
        padding: 12px;
        border-top: 1px solid #ddd;
        background-color: #f9f9f9;
    }
    .card-details p {
        margin: 6px 0;
        font-size: 13px;
        color: #333;
    }

        .no-results {
            text-align: center;
            margin-top: 50px;
            color: #ffffff;
            font-size: 18px;
        }
        .status-laranja         { background-color: #ffe5b4; color: #b36b00; }  /* Laranja pastel */
        .status-amarelo         { background-color: #fff9b0; color: #b3a100; }  /* Amarelo pastel */
        .status-verde           { background-color: #c6f5e0; color: #259661; }  /* Verde pastel */
        .status-verde-escuro    { background-color: #a3e4c1; color: #1b5e20; }  /* Verde mais escuro */
        .status-verde-medio     { background-color: #b2f2d7; color: #218c5a; }  /* Verde médio */
        .status-azulclaro       { background-color: #cbe7ff; color: #2176ae; }  /* Azul claro pastel */
        .status-azulescuro      { background-color: #b0c4ff; color: #1a237e; }  /* Azul escuro pastel */
        .status-vermelho        { background-color: #ffadad; color: #b71c1c; }  /* Vermelho claro pastel */
        .status-rosa            { background-color: #ffe0f0; color: #ad1457; }  /* Rosa pastel */
        .status-marrom { background-color: #9b7b66ef; color:rgb(61, 50, 50)}
        .status-pendente { background-color: #eea77e; color: #993e2e; }

`

/** {{ x|string }} (índice inexistente na linha -> Undefined -> "") */
const str = (v) => (v === undefined ? '' : show(v))

// Mesmas regras do template (copiadas de acompanhar_cnt, com 'boleto emitido').
// As linhas são da tabela clinicas: row[19] e row[23] não existem.
function statusClass(status, statusDoc) {
  if (status.includes('enviado ao cadastro') && statusDoc === '0') return 'status-laranja'
  if (status.includes('aguardando entrevista online')) return 'status-verde'
  if (status.includes('entrevista online enviada')) return 'status-verde-escuro'
  if (status.includes('analise de declaração')) return 'status-verde-medio'
  if (status.includes('entrevista agendada')) return 'status-azulclaro'
  if (status.includes('geração de kit')) return 'status-azulescuro'
  if (status.includes('contrato finalizado')) return 'status-azulescuro'
  if (status.includes('enviado para financeiro')) return 'status-vermelho'
  if (status.includes('boleto emitido')) return 'status-rosa'
  if (status.includes('venda cancelada')) return 'status-marrom'
  if (status.includes('em pendencia')) return 'status-pendente'
  if (statusDoc === '1') return 'status-amarelo'
  return ''
}

export default function ExibirCredenciadas() {
  useStylesheet('/static/css/estilos.css')
  const ctx = useTemplateContext()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  // style.display de cada .card-details, como o toggleDetails() do template
  const [detalhes, setDetalhes] = useState({})

  function toggleDetails(index) {
    setDetalhes((atual) => {
      const novo = {}
      ;(ctx.resultado ?? []).forEach((_, i) => { if (i !== index) novo[i] = 'none' })
      novo[index] = atual[index] === 'none' ? 'block' : 'none'
      return novo
    })
  }

  return (
    <Base1Layout title="Exibir credenciadas">
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '10px 20px' }}>
        <AppLink href={urlFor('auth.fechar')} className="btn-home">🏠 </AppLink>
      </div>
      <div className="search-bar-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0' }}>
        {/* Filtro à esquerda */}
        <div>
          <AppLink href={urlFor('cad.adicionar_credenciada')} className="btn">+ Nova credenciada</AppLink>
        </div>

        {/* Busca à direita */}
        <ApiForm key={location.search} method="get" action={urlFor('cad.exibir_credenciadas')} style={{ display: 'flex', gap: '8px', background: '#23272f00', padding: '12px 24px', borderRadius: '8px' }}>
          <input type="text" name="buscar" placeholder="Buscar por Nome" defaultValue={searchParams.get('buscar') ?? ''} style={{ padding: '8px 12px', border: '1px solid #bbb', borderRadius: '4px', minWidth: '220px', fontSize: '15px', background: '#fff', color: '#222' }} />
          <button className="btn" type="submit">Buscar</button>
        </ApiForm>
      </div>
      <InlineStyle css={css} />
      {truthy(ctx.resultado) && (
        <div className="cards-container">
          {ctx.resultado.map((row, i) => {
            const statusDoc = str(pos(row, 'clinicas', 19))
            const status = str(pos(row, 'clinicas', 6)).toLowerCase()
            const atraso = str(pos(row, 'clinicas', 23))
            const cardClass = atraso === '1' ? 'card-atrasado' : 'card'
            const display = detalhes[i]
            return (
              <div className={cardClass} key={i}>
                <div className={'card-header ' + statusClass(status, statusDoc)} onClick={() => toggleDetails(i)}>
                  {show(row.nome)}
                </div>

                <div className="card-body" onClick={() => toggleDetails(i)}>
                  <h3 style={{ color: '#333' }}>
                    <strong>Endereço:</strong> {show(row.endereco)}
                  </h3>

                  <p>
                    <strong>Status:</strong> {show(row.status)}
                  </p>
                </div>

                <div className="card-details" style={display ? { display } : undefined}>
                  <p>
                    <strong>Tel:</strong> {show(row.telefone)}
                  </p>

                  <AppLink className="btn"
                    href={urlFor('cad.alterar_credenciada', { clinica_id: pos(row, 'clinicas', 0) })}>
                    Alterar informações
                  </AppLink>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Base1Layout>
  )
}
