// enfermagem/entrevista.html (documento próprio, sem layout)
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, toAppPath } from '../../lib/api.js'
import { show } from '../../lib/jinja.js'
import { useTemplateContext } from '../../lib/page.jsx'
import { urlFor } from '../../lib/urlFor.js'
import { InlineStyle, useStylesheet } from '../../lib/useStylesheet.jsx'
import { CATEGORIAS } from './categorias.js'
import { cssEntrevista } from './estilos.js'
import { campo, useDocumentTitle } from './util.js'

// --- textos como o DOM original os via (textContent), usados pelo script ---

const sp = (n) => ' '.repeat(n)

// .category-title textContent (com a indentação do HTML original)
const tituloRaw = (c) => `\n${sp(20)}${c.counter}\n${sp(20)} ${c.title}\n${sp(16)}`
// .category-title textContent.trim() — o "categoriaNome" enviado ao back
const categoriaNome = (c) => tituloRaw(c).trim()
// .form-check-label textContent
const perguntaRaw = (c) => `\n${sp(28)}${c.pergunta}\n${sp(24)}`
const labelRaw = (it) => (it.plus !== undefined
  ? `\n${sp(32)}${it.plus}\n${sp(28)}`
  : it.label + (it.badge !== undefined ? ' ' + it.badge : ''))

// Checkboxes "Outras" que mostram/escondem um campo de texto (lista do script)
const OUTRAS_CHECKBOXES = [
  'form_outras_cardiovascular',
  'form_outras_endocrina',
  'form_outras_digestivo',
  'form_outras_sangue',
  'form_outras_osteomuscular',
  'form_outras_neurologica',
  'form_outras_congenita',
  'form_outras_respiratoria',
  'form_outras_auditiva',
  'form_outras_ocular',
  'form_outras_genitourinaria',
  'form_outras_infectocontagiosa',
  'form_outras_psiquiatrica',
  'form_outras_pele',
  'form_outras_protese',
  'form_outras_doencas',
  'form_cancer_especifico',
]
const TEXT_IDS = new Set(CATEGORIAS.map((c) => c.texto.id))
// form_outras_cardiovascular -> outras_cardiovascular_text (form_cancer_especifico
// -> cancer_especifico_text, que não existe: o campo cancer_text nunca aparece)
const textFieldIdDe = (checkboxId) => {
  const id = checkboxId.replace('form_', '') + '_text'
  return TEXT_IDS.has(id) ? id : null
}

// input[name^="outras_"]:not([id*="_text"]) dentro da subcategoria
const outrasDe = (c) => c.itens.find((it) => it.name.startsWith('outras_') && !it.id.includes('_text')) || null
// doenças "reais" marcadas: exclui outras_* e form_cancer_especifico
const reaisMarcadas = (c, checks) => c.itens.filter((it) => checks[it.id]
  && !it.name.startsWith('outras_') && it.id !== 'form_cancer_especifico')

const CANCER = CATEGORIAS.find((c) => c.itens.some((it) => it.id === 'form_cancer_especifico'))

function calcularProgresso(cats, checks, textos) {
  const total = CATEGORIAS.length
  const preenchidas = CATEGORIAS.filter((c) => {
    if (!cats[c.key]) return false
    const reais = reaisMarcadas(c, checks)
    const outras = outrasDe(c)
    if (outras && checks[outras.id]) {
      return reais.length > 0 || (textos[c.texto.id] ?? '').trim() !== ''
    }
    return reais.length > 0
  }).length
  const progresso = total > 0 ? (preenchidas / total) * 100 : 0
  let background
  if (progresso < 30) background = 'linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)'
  else if (progresso < 70) background = 'linear-gradient(90deg, #ffa726 0%, #ffb74d 100%)'
  else background = 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)'
  return {
    width: `${progresso}%`,
    background,
    texto: `${Math.round(progresso)}% completado • ${preenchidas}/${total} categorias`,
  }
}

function validarFormulario(cats, checks, textos) {
  const erros = []
  for (const c of CATEGORIAS) {
    if (!cats[c.key]) continue
    const reais = reaisMarcadas(c, checks)
    const outras = outrasDe(c)
    const outrasTexto = (textos[c.texto.id] ?? '').trim()
    if (reais.length === 0) {
      if (!(outras && checks[outras.id] && outrasTexto !== '')) {
        if (c.key === 'cancer') {
          if ((textos.cancer_text ?? '').trim() === '') {
            erros.push(`A categoria "${categoriaNome(c)}" está marcada como "Sim" mas nenhuma doença foi especificada.`)
          }
        } else {
          erros.push(`A categoria "${categoriaNome(c)}" está marcada como "Sim" mas nenhuma doença foi selecionada.`)
        }
      }
    }
    if (outras && checks[outras.id]) {
      if (outrasTexto === '') {
        erros.push(`Na categoria "${categoriaNome(c)}", você marcou "Outras" mas não descreveu a doença.`)
      }
    }
  }
  if (checks.form_cancer_especifico && (textos.cancer_text ?? '').trim() === '') {
    erros.push('Você marcou que tem câncer, mas não especificou o tipo.')
  }
  return erros
}

/**
 * Visibilidade da busca (filtrarDoencas): o script original escrevia
 * style.display = 'block' | 'none' nos cards e em cada .form-check.
 * Devolve { cards: {key: display}, itens: {id: display}, encontrou }.
 */
function filtrar(termo) {
  const cards = {}
  const itens = {}
  let encontrou = false
  for (const c of CATEGORIAS) {
    const formChecks = [[`cat_${c.key}`, perguntaRaw(c)], ...c.itens.map((it) => [it.id, labelRaw(it)])]
    if (!termo) {
      cards[c.key] = 'block'
      for (const [id] of formChecks) itens[id] = 'block'
      continue
    }
    let visiveis = 0
    if (tituloRaw(c).toLowerCase().includes(termo)) {
      cards[c.key] = 'block'
      encontrou = true
      for (const [id] of formChecks) { itens[id] = 'block'; visiveis++ }
    } else {
      for (const [id, label] of formChecks) {
        if (label.toLowerCase().includes(termo)) {
          itens[id] = 'block'
          visiveis++
          encontrou = true
        } else {
          itens[id] = 'none'
        }
      }
      cards[c.key] = visiveis > 0 ? 'block' : 'none'
    }
  }
  return { cards, itens, encontrou }
}

const CORES_ALERTA = { success: '#4CAF50', warning: '#ff9800', error: '#f44336' }

export default function Entrevista() {
  const ctx = useTemplateContext()
  const navigate = useNavigate()
  useDocumentTitle('Questionário de Saúde - Patologias')
  useStylesheet('/static/css/estilos.css')
  useStylesheet('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css')
  useStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css')

  const dados = ctx.dados
  const cpf = show(campo(dados, 'cpf'))
  const propostaId = show(campo(dados, 'proposta_id'))
  const tipoPessoa = show(campo(dados, 'tipo_pessoa'))

  const [cats, setCats] = useState({})          // cat_<key> marcado
  const [checks, setChecks] = useState({})      // checkboxes de doença por id
  const [textos, setTextos] = useState({})      // campos "outras" por id
  const [textoVisivel, setTextoVisivel] = useState({})
  const [overflow, setOverflow] = useState({})  // style.overflow das .sub-question
  const [progresso, setProgresso] = useState(null)
  const [filtro, setFiltro] = useState(null)    // null = busca nunca usada
  const [alerta, setAlerta] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const textRefs = useRef({})

  // DOMContentLoaded: atualizarProgresso()
  useEffect(() => {
    setProgresso(calcularProgresso({}, {}, {}))
  }, [])

  function mostrarAlerta(mensagem, tipo = 'success') {
    setAlerta({ mensagem, background: CORES_ALERTA[tipo] ?? '#667eea', display: 'block' })
    setTimeout(() => setAlerta((a) => a && { ...a, display: 'none' }), 5000)
  }

  function mudarCategoria(c, marcado) {
    const nextCats = { ...cats, [c.key]: marcado }
    let nextChecks = checks
    let nextTextos = textos
    if (marcado) {
      setTimeout(() => setOverflow((o) => ({ ...o, [c.key]: 'visible' })), 500)
    } else {
      setOverflow((o) => ({ ...o, [c.key]: 'hidden' }))
      // Desmarcar todas as opções dentro da subcategoria (e disparar o change
      // dos "Outras": esconde e limpa o campo de texto)
      nextChecks = { ...checks }
      nextTextos = { ...textos }
      const nextVisivel = { ...textoVisivel }
      for (const it of c.itens) {
        nextChecks[it.id] = false
        if (OUTRAS_CHECKBOXES.includes(it.id)) {
          const textId = textFieldIdDe(it.id)
          if (textId) {
            nextVisivel[textId] = false
            nextTextos[textId] = ''
          }
        }
      }
      setTextoVisivel(nextVisivel)
    }
    setCats(nextCats)
    setChecks(nextChecks)
    setTextos(nextTextos)
    setProgresso(calcularProgresso(nextCats, nextChecks, nextTextos))
  }

  function clicarToggle(c, event) {
    // No original, clicar direto no checkbox o marcava (nativo) e o handler do
    // .category-toggle o desmarcava de volta: o clique no próprio checkbox não
    // muda nada. Clicar no label ou no resto da faixa alterna a categoria.
    if (event.target.id === `cat_${c.key}`) return
    mudarCategoria(c, !cats[c.key])
  }

  function mudarItem(it, marcado) {
    const nextChecks = { ...checks, [it.id]: marcado }
    setChecks(nextChecks)
    if (!OUTRAS_CHECKBOXES.includes(it.id)) return // demais doenças: sem listener
    const textId = textFieldIdDe(it.id)
    let nextTextos = textos
    if (textId) {
      if (marcado) {
        setTextoVisivel((v) => ({ ...v, [textId]: true }))
        setTimeout(() => textRefs.current[textId]?.focus(), 300)
      } else {
        setTextoVisivel((v) => ({ ...v, [textId]: false }))
        nextTextos = { ...textos, [textId]: '' }
        setTextos(nextTextos)
      }
    }
    setProgresso(calcularProgresso(cats, nextChecks, nextTextos))
  }

  function buscar(event) {
    const termo = event.target.value.toLowerCase()
    setFiltro(termo)
    if (!termo) return
    const { encontrou } = filtrar(termo)
    if (!encontrou && termo.length > 2) {
      mostrarAlerta(`Nenhum resultado encontrado para "${termo}"`, 'warning')
    }
  }

  async function enviarFormulario() {
    const erros = validarFormulario(cats, checks, textos)
    if (erros.length > 0) {
      mostrarAlerta('Por favor, corrija os seguintes erros:\n' + erros.join('\n'), 'error')
      return
    }

    const formData = {
      cpf,
      proposta_id: propostaId,
      tipo_pessoa: tipoPessoa,
      patologias: [],
      timestamp: new Date().toISOString(),
    }

    for (const c of CATEGORIAS) {
      if (!cats[c.key]) continue
      const nomeCategoria = categoriaNome(c)
      for (const it of c.itens) {
        if (!checks[it.id]) continue
        if (it.name.startsWith('outras_') || it.id === 'form_cancer_especifico') continue
        formData.patologias.push({
          nome: it.label.trim(),
          cid: it.cid || (it.badge !== undefined ? it.badge : ''),
          categoria: nomeCategoria,
          tipo: 'especifica',
        })
      }
      const outras = outrasDe(c)
      const outrasTexto = (textos[c.texto.id] ?? '').trim()
      if (outras && checks[outras.id] && outrasTexto !== '') {
        formData.patologias.push({
          nome: outrasTexto,
          cid: '',
          categoria: nomeCategoria,
          tipo: 'outra',
          observacao: 'Doença informada no campo "Outras"',
        })
      }
    }

    const cancerTexto = (textos.cancer_text ?? '').trim()
    if (CANCER && checks.form_cancer_especifico && cancerTexto !== '') {
      formData.patologias.push({
        nome: cancerTexto,
        cid: 'C00-C97',
        categoria: 'Doença Neoplásica (Câncer)',
        tipo: 'cancer',
      })
    }

    setEnviando(true)
    try {
      const response = await apiFetch(urlFor('enfermagem.receber_entrevista'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        mostrarAlerta('Questionário enviado com sucesso!', 'success')
        setTimeout(() => {
          const destino = data.redirect || '/'
          const path = toAppPath(destino)
          if (path === null) window.location.href = destino
          else navigate(path)
        }, 1500)
      } else {
        mostrarAlerta('Erro ao enviar: ' + (data.message || 'Tente novamente'), 'error')
        setEnviando(false)
      }
    } catch (error) {
      console.error('Erro:', error)
      mostrarAlerta('Erro de conexão. Verifique sua internet e tente novamente.', 'error')
      setEnviando(false)
    }
  }

  const vis = filtro === null ? null : filtrar(filtro)
  const displayCard = (c) => (vis ? { display: vis.cards[c.key] } : undefined)
  const displayItem = (id) => (vis ? { display: vis.itens[id] } : undefined)

  return (
    <>
      <InlineStyle css={cssEntrevista} />
      <div className="container1">
        {/* Cabeçalho com informações do beneficiário */}
        <div className="header-info text-center">
          <h1><i className="fas fa-clipboard-check me-2"></i>Questionário de Saúde • {show(campo(dados, 'tipo_pessoa'))}</h1>
          <h2> Proposta: {show(campo(dados, 'proposta_id'))}</h2>
          <h2>{show(campo(dados, 'nome'))} <br />CPF: {show(campo(dados, 'cpf'))}</h2>
          <span className="badge"><i className="fas fa-info-circle me-2"></i>Marque as patologias que possui ou já teve</span>
        </div>

        {/* Barra de progresso */}
        <div className="progress-container">
          <div className="progress-bar" id="progressBar"
            style={progresso ? { width: progresso.width, background: progresso.background } : undefined}></div>
        </div>
        <div className="progress-text" id="progressText">{progresso ? progresso.texto : '0% completado'}</div>

        {/* Campo de busca */}
        <div className="search-container">
          <input type="text" className="search-input" id="searchInput" placeholder="🔍 Buscar doença ou categoria..." onInput={buscar} />
        </div>

        <form id="health-form" onSubmit={(e) => e.preventDefault()}>
          <input type="hidden" id="cpf" name="cpf" defaultValue={cpf} />
          <input type="hidden" id="proposta_id" name="proposta_id" defaultValue={propostaId} />
          <input type="hidden" id="tipo_pessoa" name="tipo_pessoa" defaultValue={tipoPessoa} />

          {CATEGORIAS.map((c) => (
            <div className="category-card" key={c.key} style={displayCard(c)}>
              <h3 className="category-title">
                <span className="category-counter">{c.counter}</span>
                <i className={c.icon}></i> {c.title}
              </h3>
              <div className={'category-toggle' + (cats[c.key] ? ' active' : '')} id={`toggle_${c.key}`}
                onClick={(e) => clicarToggle(c, e)}>
                <div className="form-check" style={displayItem(`cat_${c.key}`)}>
                  <input className="form-check-input category-checkbox" type="checkbox" id={`cat_${c.key}`}
                    checked={Boolean(cats[c.key])} onChange={() => {}} />
                  <label className="form-check-label" htmlFor={`cat_${c.key}`}>
                    <strong>{c.pergunta}</strong>
                  </label>
                </div>
                <i className="fas fa-chevron-down ms-auto"></i>
              </div>
              <div className={'sub-question' + (cats[c.key] ? ' show' : '')} id={`sub_${c.key}`}
                style={overflow[c.key] ? { overflow: overflow[c.key] } : undefined}>
                <div className="checkbox-group">
                  {c.itens.map((it) => (
                    <div className="form-check" key={it.id} style={displayItem(it.id)}>
                      <input className="form-check-input" type="checkbox" id={it.id} name={it.name}
                        {...(it.cid !== undefined ? { 'data-cid': it.cid } : {})}
                        checked={Boolean(checks[it.id])} onChange={(e) => mudarItem(it, e.target.checked)} />
                      {it.plus !== undefined ? (
                        <label className="form-check-label" htmlFor={it.id}>
                          <i className="fas fa-plus-circle me-2" style={{ color: '#667eea' }}></i>{it.plus}
                        </label>
                      ) : (
                        <label className="form-check-label" htmlFor={it.id}>
                          {it.label}{it.badge !== undefined && <> <span className="cid-badge">{it.badge}</span></>}
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <input type="text" className="outras-input" id={c.texto.id} name={c.texto.name}
                  placeholder={c.texto.placeholder}
                  ref={(el) => { textRefs.current[c.texto.id] = el }}
                  style={c.texto.id in textoVisivel ? { display: textoVisivel[c.texto.id] ? 'block' : 'none' } : undefined}
                  value={textos[c.texto.id] ?? ''}
                  onChange={(e) => { const v = e.target.value; setTextos((t) => ({ ...t, [c.texto.id]: v })) }} />
              </div>
            </div>
          ))}

          {/* Botão de Envio */}
          <div className="text-center">
            <button type="button" className="btn-submit" onClick={enviarFormulario} disabled={enviando}>
              {enviando
                ? <><i className="fas fa-spinner fa-spin"></i> Enviando...</>
                : <><i className="fas fa-paper-plane"></i> Enviar Questionário</>}
            </button>
          </div>
        </form>
      </div>

      {/* Alert flutuante */}
      <div className="floating-alert" id="floatingAlert"
        style={alerta ? { background: alerta.background, display: alerta.display } : undefined}>
        {alerta?.mensagem}
      </div>
    </>
  )
}
