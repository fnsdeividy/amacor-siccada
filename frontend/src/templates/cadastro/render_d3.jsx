// cadastro/render_d3.html
import { useState } from 'react'
import ApiForm from '../../components/ApiForm.jsx'
import AppLink from '../../components/AppLink.jsx'
import Loader from '../../components/Loader.jsx'
import Base1Layout from '../../layouts/Base1Layout.jsx'
import { urlFor } from '../../lib/urlFor.js'

function formatMoney(value) {
  const cleaned = value.replace(/\D/g, '')
  if (!cleaned) return ''
  const number = parseInt(cleaned, 10)
  const cents = (number % 100).toString().padStart(2, '0')
  const integer = Math.floor(number / 100).toString()
  const withSeparators = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return withSeparators + ',' + cents
}

function onMoneyInput(e) {
  const cursorAtEnd = e.target.selectionStart === e.target.value.length
  e.target.value = formatMoney(e.target.value)
  if (cursorAtEnd) {
    e.target.selectionStart = e.target.selectionEnd = e.target.value.length
  }
}

export default function RenderD3() {
  const [loading, setLoading] = useState(false)
  return (
    <Base1Layout title="Relatório D3">
      {loading && <Loader />}
      <div className="container">
        <div className="divisoria2">
          <div className="close-btn-container">
            <AppLink href={urlFor('auth.fechar')} className="close-btn">✖</AppLink>
          </div>

          <h2>Relatório D3</h2>
          <p style={{ marginTop: '6px', color: '#bec6d5' }}>Informe o período e os valores para calcular o D3.</p>

          <ApiForm id="form-gerar-kit" action={urlFor('cad.d3_beneficiarios')} method="POST" style={{ marginTop: '16px' }}
            onSubmit={() => setLoading(true)} onResult={() => setLoading(false)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label htmlFor="valor_gasto">Valor gasto no período</label>
                <input type="text" inputMode="decimal" id="valor_gasto" name="valor_gasto" className="money" placeholder="0,00" required onInput={onMoneyInput} />
              </div>
              <div>
                <label htmlFor="valor_pago">Valor pago no período</label>
                <input type="text" inputMode="decimal" id="valor_pago" name="valor_pago" className="money" placeholder="0,00" required onInput={onMoneyInput} />
              </div>
              <div>
                <label htmlFor="data_inicio">Data de início</label>
                <input type="date" id="data_inicio" name="data_inicio" required />
              </div>
              <div>
                <label htmlFor="data_final">Data final</label>
                <input type="date" id="data_final" name="data_final" required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '20px' }}>
              <button className="btn" type="submit">Calcular D3</button>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Use vírgula para centavos.</span>
            </div>
          </ApiForm>
        </div>
      </div>
    </Base1Layout>
  )
}
