// CSS comum a alt_page.html e cancelar_boleto.html (visual novo).
// Prefixado por .pagamento-edit (classe das duas telas) para não vazar
// para o resto do app — o original estilizava `select` e `.btn` globais.
export const pagamentoCss = `
.pagamento-edit { max-width: 600px; margin: 0 auto; }
.pagamento-edit .titulo-pagamento {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  font-size: var(--text-xl);
}
.pagamento-edit .titulo-pagamento i { color: var(--brand-700); }
.pagamento-edit .form-pagamento {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.pagamento-edit .info-pagamento {
  padding: var(--space-2) var(--space-4);
  background: var(--gray-50);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.pagamento-edit .info-pagamento p {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  margin: 0;
  padding: var(--space-2) 0;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
.pagamento-edit .info-pagamento p:last-child { border-bottom: 0; }
.pagamento-edit .info-pagamento strong { color: var(--text-muted); font-weight: 500; }
.pagamento-edit .campo-status select { margin-bottom: 0; }
.pagamento-edit .acoes-form {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
`
