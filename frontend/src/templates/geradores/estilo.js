// Estilo comum das telas curtas de geradores/gerencial (não é template):
// um cartão centralizado e objetivo, com ícone, título, texto e ações.
export const cssGerador = `
.page:has(> .page-card .gerador) { max-width: 640px; }
.gerador.card {
  max-width: 640px;
  margin: var(--space-6) auto;
  padding: var(--space-6) var(--space-8) var(--space-8);
}
.gerador .gerador-icone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: var(--space-4);
  font-size: var(--text-lg);
  color: var(--brand-700);
  background: var(--brand-50);
  border-radius: var(--radius-lg);
}
.gerador .gerador-icone.sucesso { color: var(--success-700); background: var(--success-50); }
.gerador .gerador-icone.alerta { color: var(--warning-700); background: var(--warning-50); }
.gerador h1 { margin-bottom: var(--space-2); }
.gerador h2 { margin: var(--space-4) 0 var(--space-2); }
.gerador h3 { font-weight: 400; color: var(--text-soft); margin-bottom: var(--space-4); }
.gerador .gerador-texto { margin-bottom: var(--space-4); color: var(--text-soft); }
.gerador form { margin-top: var(--space-4); }
.gerador .gerador-acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-5);
}
`
