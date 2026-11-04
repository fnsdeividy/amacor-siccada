// CSS comum aos dashboards (home_vendas e gerenciais/*), no visual novo.
// Antes as telas carregavam /static/css/dashboard.css; agora cada uma usa
// <InlineStyle css={dashboardCss} /> e envolve o conteúdo em <div className="dash">.
export const dashboardCss = `
.dash .quick-actions { margin-bottom: var(--space-5); }
.dash .quick-actions > h3,
.dash .dash-section-title {
  margin: 0 0 var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.dash .quick-actions-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
  margin-bottom: 0;
}
.dash .quick-action-card {
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
}
.dash .quick-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  color: var(--brand-700);
  background: var(--brand-50);
}
.dash .quick-action-card p { margin: 0; color: var(--text); font-weight: 500; }
.dash .quick-action-card:hover .quick-action-icon { color: var(--white); background: var(--brand-700); }

.dash .welcome-card { padding: var(--space-5) var(--space-6); }
.dash .welcome-card h2 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
.dash .welcome-card h2 i { color: var(--brand-600); }
.dash .welcome-card h2 span { color: var(--brand-900); }
.dash .welcome-card p { margin: 0; }

.dash .dashboard-title { margin: 0 0 var(--space-4); }

.dash .filter-section { padding: var(--space-4) var(--space-5); }
.dash .filter-section form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
}
.dash .filter-section label { margin: 0; }
.dash .filter-section select,
.dash .filter-section input { width: auto; min-width: 160px; margin: 0; }
.dash .filter-section form > span { color: var(--text-muted); font-size: var(--text-sm); }

.dash .card-container > .card { margin-bottom: 0; }
.dash .stat-card .stat-value { margin: 0 0 var(--space-1); font-variant-numeric: tabular-nums; }
.dash .stat-card .stat-label { color: var(--text-soft); }
.dash .stat-card .stat-label + .stat-label { margin-top: var(--space-1); font-size: var(--text-xs); color: var(--text-muted); }

.dash .status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-1);
  border-bottom: 1px solid var(--border);
}
.dash .status-header h3 { margin: 0; }
.dash .status-total { font-size: var(--text-sm); color: var(--text-muted); }
.dash .status-list { margin: 0; padding: 0; list-style: none; }
.dash .status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--border);
}
.dash .status-item:last-child { border-bottom: 0; }
.dash .status-name { text-transform: capitalize; color: var(--text); }
.dash .status-count { margin-right: var(--space-2); font-weight: 600; font-variant-numeric: tabular-nums; }
.dash .status-percentage {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: var(--text-xs);
  color: var(--brand-700);
  background: var(--brand-50);
}

.dash .sales-table {
  overflow: hidden;
  margin-bottom: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}
.dash .sales-table h3 { margin: 0; padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--border); }
.dash .sales-table .table-scroll { overflow-x: auto; }
.dash .sales-table td { font-variant-numeric: tabular-nums; }
`

/** selo de status de pagamento (mesmas cores da tabela de pagamentos) */
export function statusPagamentoClass(status) {
  if (status === 'baixado') return 'status-green'
  if (status === 'cancelado') return 'status-red'
  return 'status-yellow'
}
