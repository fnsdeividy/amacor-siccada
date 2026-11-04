// CSS das telas de enfermagem no visual novo (ver frontend/DESIGN.md).
// Só variáveis de src/styles/tokens.css; seletores prefixados pela classe da tela.

// Base das telas públicas (sem moldura; o paciente abre pelo QR code).
// Elas ainda carregam o Bootstrap (grade/form-check/modal): os ajustes abaixo
// trazem tipografia, cores e títulos de volta para os tokens.
export const cssPublica = `
.enf-publica {
  min-height: 100vh;
  padding: var(--space-6) var(--space-4);
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--text-base);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}
.enf-publica *,
.enf-publica *::before,
.enf-publica *::after { box-sizing: border-box; }
.enf-publica h1,
.enf-publica h2,
.enf-publica h3,
.enf-publica h4,
.enf-publica h5,
.enf-publica h6 {
  font-family: var(--font);
  color: var(--text);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.enf-publica h1 { font-size: var(--text-xl); }
.enf-publica h2 { font-size: var(--text-md); }
.enf-publica h3 { font-size: var(--text-md); }
.enf-publica h4,
.enf-publica h5,
.enf-publica h6 { font-size: var(--text-base); }
.enf-publica p { color: var(--text-soft); }
.enf-publica .text-muted { color: var(--text-muted) !important; }
.enf-publica .text-primary { color: var(--brand-700) !important; }
.enf-publica a { color: var(--link); }

/* cartão branco das telas públicas */
.enf-publica .enf-cartao {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

@media (max-width: 576px) {
  .enf-publica { padding: var(--space-3) var(--space-3) var(--space-6); }
}
@media print {
  .enf-publica { background: var(--white); padding: 0; min-height: 0; }
}
`

// enfermagem/entrevista.html
export const cssEntrevista = `
.enf-entrevista .container1 {
  max-width: 880px;
  margin: 0 auto;
}

/* cabeçalho com dados do beneficiário */
.enf-entrevista .header-info {
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  border-top: 4px solid var(--brand-900);
}
.enf-entrevista .header-info h1 {
  margin: 0 0 var(--space-3);
  color: var(--brand-900);
  font-size: var(--text-xl);
}
.enf-entrevista .header-info h1 i { color: var(--brand-700); }
.enf-entrevista .header-info h2 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-soft);
}
.enf-entrevista .header-info .badge {
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-2);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: normal;
  line-height: 1.4;
  color: var(--info-700);
  background: var(--info-50);
}

/* progresso + busca */
.enf-entrevista .enf-progresso {
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-4);
}
.enf-entrevista .progress-container {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--gray-200);
}
.enf-entrevista .progress-bar {
  display: block;
  width: 0;
  height: 100%;
  border-radius: 999px;
  background: var(--danger-600);
  transition: width 0.4s ease, background 0.4s ease;
}
.enf-entrevista .progress-bar.nivel-medio { background: var(--warning-700); }
.enf-entrevista .progress-bar.nivel-alto { background: var(--success-700); }
.enf-entrevista .progress-text {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  text-align: center;
}
.enf-entrevista .search-container {
  position: relative;
  margin-top: var(--space-4);
}
.enf-entrevista .search-container > i {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
.enf-entrevista .search-input {
  min-height: 44px;
  margin: 0;
  padding-left: 40px;
  font-size: var(--text-md);
}

/* categorias */
.enf-entrevista .category-card {
  padding: var(--space-5);
  margin-bottom: var(--space-3);
}
.enf-entrevista .category-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  font-size: var(--text-md);
  color: var(--text);
}
.enf-entrevista .category-title i { color: var(--brand-700); width: 20px; text-align: center; }
.enf-entrevista .category-counter {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--brand-700);
  background: var(--brand-50);
}
.enf-entrevista .category-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-muted);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.enf-entrevista .category-toggle:hover { border-color: var(--border-strong); }
.enf-entrevista .category-toggle.active {
  background: var(--brand-50);
  border-color: var(--brand-100);
}
.enf-entrevista .category-toggle > i {
  flex: none;
  color: var(--text-muted);
  transition: transform 0.25s ease;
}
.enf-entrevista .category-toggle.active > i {
  color: var(--brand-700);
  transform: rotate(180deg);
}
.enf-entrevista .category-toggle .form-check { margin: 0; padding-top: 0; padding-bottom: 0; }
.enf-entrevista .category-toggle .form-check:hover { background: transparent; }

.enf-entrevista .sub-question {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  margin-left: var(--space-2);
  padding-left: var(--space-3);
  border-left: 2px solid var(--brand-100);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.enf-entrevista .sub-question.show {
  max-height: 5000px;
  opacity: 1;
  margin-top: var(--space-3);
  padding-top: var(--space-1);
}
.enf-entrevista .checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-1) var(--space-3);
}

/* opções (form-check do Bootstrap, nas cores da marca) */
.enf-entrevista .form-check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 40px;
  margin: 0;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.enf-entrevista .form-check:hover { background: var(--gray-50); }
.enf-entrevista .form-check .form-check-input {
  flex: none;
  float: none;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  cursor: pointer;
}
.enf-entrevista .form-check-input:checked {
  background-color: var(--brand-700);
  border-color: var(--brand-700);
}
.enf-entrevista .form-check-input:focus {
  border-color: var(--brand-600);
  box-shadow: 0 0 0 3px var(--focus);
}
.enf-entrevista .form-check-label {
  display: inline;
  margin: 0;
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--text);
  line-height: 1.35;
  cursor: pointer;
}
.enf-entrevista .category-toggle .form-check-label { font-weight: 500; }
.enf-entrevista .form-check-label strong { font-weight: 600; }
.enf-entrevista .icone-outras { color: var(--brand-700); }
.enf-entrevista .cid-badge {
  display: inline-flex;
  align-items: center;
  margin-left: var(--space-1);
  padding: 1px 6px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-soft);
  background: var(--gray-100);
  white-space: nowrap;
}
.enf-entrevista .outras-input {
  display: none;
  margin: var(--space-3) 0 var(--space-2);
}

/* envio */
.enf-entrevista .enf-envio {
  margin-top: var(--space-5);
  text-align: center;
}
.enf-entrevista .btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-width: 260px;
  min-height: 48px;
  padding: 12px 28px;
  font: inherit;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--white);
  background: var(--brand-700);
  border: 1px solid var(--brand-700);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.enf-entrevista .btn-submit:hover { background: var(--brand-800); border-color: var(--brand-800); }
.enf-entrevista .btn-submit:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus); }
.enf-entrevista .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* aviso flutuante */
.enf-entrevista .floating-alert {
  display: none;
  position: fixed;
  top: var(--space-4);
  left: 50%;
  z-index: 1000;
  width: calc(100% - 2 * var(--space-4));
  max-width: 520px;
  transform: translateX(-50%);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border);
  border-left: 4px solid var(--info-700);
  border-radius: var(--radius);
  font-size: var(--text-base);
  color: var(--info-700);
  background: var(--info-50);
  box-shadow: var(--shadow-lg);
  white-space: pre-line;
}
.enf-entrevista .floating-alert.alerta-success { color: var(--success-700); background: var(--success-50); border-left-color: var(--success-700); }
.enf-entrevista .floating-alert.alerta-warning { color: var(--warning-700); background: var(--warning-50); border-left-color: var(--warning-700); }
.enf-entrevista .floating-alert.alerta-error { color: var(--danger-700); background: var(--danger-50); border-left-color: var(--danger-600); }

@media (max-width: 576px) {
  .enf-entrevista .header-info { padding: var(--space-4); }
  .enf-entrevista .header-info h1 { font-size: var(--text-lg); }
  .enf-entrevista .enf-progresso { padding: var(--space-4); }
  .enf-entrevista .category-card { padding: var(--space-4); }
  .enf-entrevista .category-toggle { padding: var(--space-3); }
  .enf-entrevista .checkbox-group { grid-template-columns: 1fr; }
  .enf-entrevista .form-check { min-height: 44px; }
  .enf-entrevista .sub-question { margin-left: 0; padding-left: var(--space-2); }
  .enf-entrevista .btn-submit { width: 100%; min-width: 0; }
}
@media (hover: none) and (pointer: coarse) {
  .enf-entrevista .form-check:hover { background: transparent; }
  .enf-entrevista .category-toggle:hover { border-color: var(--border); }
  .enf-entrevista .search-input,
  .enf-entrevista .outras-input { font-size: 16px; } /* evita o zoom automático do iOS */
}
`

// enfermagem/entrevista_concluida.html
export const cssEntrevistaConcluida = `
.enf-concluida {
  display: flex;
  align-items: center;
  justify-content: center;
}
.enf-concluida .confirmation-card {
  width: 100%;
  max-width: 520px;
  padding: var(--space-8) var(--space-6);
  text-align: center;
}
.enf-concluida .success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-4);
  border-radius: 999px;
  font-size: 30px;
  color: var(--success-700);
  background: var(--success-50);
}
.enf-concluida .title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-2xl);
  color: var(--brand-900);
}
.enf-concluida .subtitle {
  margin: 0 0 var(--space-5);
  font-size: var(--text-md);
  color: var(--text-soft);
}
.enf-concluida .alert {
  margin: 0 0 var(--space-6);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-base);
  color: var(--success-700);
  background: var(--success-50);
  border: 1px solid var(--border);
  border-left: 4px solid var(--success-700);
  border-radius: var(--radius);
}
.enf-concluida .actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.enf-concluida .btn-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 10px 20px;
  font-size: var(--text-md);
  font-weight: 500;
  text-decoration: none;
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  transition: background 0.15s, border-color 0.15s;
}
.enf-concluida .btn-confirm:hover {
  color: var(--gray-900);
  background: var(--gray-50);
  border-color: var(--gray-400);
  text-decoration: none;
}
.enf-concluida .btn-confirm.btn-primary {
  color: var(--white);
  background: var(--brand-700);
  border-color: var(--brand-700);
}
.enf-concluida .btn-confirm.btn-primary:hover {
  background: var(--brand-800);
  border-color: var(--brand-800);
}
.enf-concluida .btn-confirm:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus); }
.enf-concluida .timestamp {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

@media (max-width: 576px) {
  .enf-concluida { align-items: flex-start; }
  .enf-concluida .confirmation-card { padding: var(--space-6) var(--space-4); }
  .enf-concluida .title { font-size: var(--text-xl); }
}
`

// enfermagem/exibir_qrcode.html
export const cssExibirQrcode = `
.enf-qrcode .container { max-width: 720px; padding: 0; }
.enf-qrcode .qr-container { padding: var(--space-6); }

.enf-qrcode .header {
  margin-bottom: var(--space-5);
  text-align: center;
}
.enf-qrcode .header h1 {
  margin: 0 0 var(--space-2);
  color: var(--brand-900);
}
.enf-qrcode .header h1 i { color: var(--brand-700); }
.enf-qrcode .header .badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--brand-700);
  background: var(--brand-50);
}
.enf-qrcode .header p { margin: var(--space-2) 0 0; }

.enf-qrcode .info-card {
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-muted);
}
.enf-qrcode .info-card h5 {
  margin: 0 0 var(--space-2);
  color: var(--text);
}
.enf-qrcode .info-card h5 i { color: var(--brand-700); }
.enf-qrcode .info-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.enf-qrcode .info-card li {
  padding: var(--space-1) 0;
  color: var(--text-soft);
  word-break: break-word;
}
.enf-qrcode .info-card li strong { color: var(--text); font-weight: 600; }

.enf-qrcode .qrcode-display {
  margin-bottom: var(--space-5);
  padding: var(--space-5);
  text-align: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--white);
}
.enf-qrcode .qrcode-display img {
  display: block;
  width: 100%;
  max-width: 260px;
  height: auto;
  margin: 0 auto;
  padding: var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--white);
}
.enf-qrcode .countdown {
  margin-top: var(--space-3);
  font-size: var(--text-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--brand-700);
}
.enf-qrcode .countdown.expirado { color: var(--danger-600); }
.enf-qrcode .qrcode-display p { margin-bottom: 0; }

.enf-qrcode .url-display {
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-muted);
}
.enf-qrcode .url-display .d-flex { gap: var(--space-3); flex-wrap: wrap; }
.enf-qrcode .url-display .text-primary { color: var(--brand-700) !important; }
.enf-qrcode #urlText {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--white);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--text-sm);
  color: var(--text-soft);
  word-break: break-all;
}
.enf-qrcode .url-display .btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  min-height: 30px;
  padding: 4px 10px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}
.enf-qrcode .url-display .btn:hover {
  color: var(--gray-900);
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.enf-qrcode .instruction-box {
  margin-bottom: var(--space-5);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.enf-qrcode .instruction-box h4 {
  margin: 0 0 var(--space-3);
  font-size: var(--text-md);
}
.enf-qrcode .instruction-box h4 i { color: var(--brand-700); }
.enf-qrcode .step {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--border);
}
.enf-qrcode .step:first-of-type { border-top: 0; }
.enf-qrcode .step-number {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--brand-700);
  background: var(--brand-50);
}
.enf-qrcode .step-content { flex: 1; min-width: 0; }
.enf-qrcode .step-content strong { color: var(--text); font-weight: 600; }
.enf-qrcode .step-content p { font-size: var(--text-sm); }

.enf-qrcode .enf-acoes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}
.enf-qrcode .btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 10px 18px;
  font: inherit;
  font-size: var(--text-base);
  font-weight: 500;
  text-decoration: none;
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.enf-qrcode .btn-action:hover {
  color: var(--gray-900);
  background: var(--gray-50);
  border-color: var(--gray-400);
  text-decoration: none;
}
.enf-qrcode .btn-action.btn-action-principal {
  color: var(--white);
  background: var(--brand-700);
  border-color: var(--brand-700);
}
.enf-qrcode .btn-action.btn-action-principal:hover {
  background: var(--brand-800);
  border-color: var(--brand-800);
}
.enf-qrcode .btn-action:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus); }

.enf-qrcode .enf-alternativas { margin-top: var(--space-5); text-align: center; }
.enf-qrcode .enf-alternativas > p { margin: 0; }
.enf-qrcode .alert-info {
  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  color: var(--info-700);
  background: var(--info-50);
  border: 1px solid var(--border);
  border-left: 4px solid var(--info-700);
  border-radius: var(--radius);
}
.enf-qrcode .alert-info h6 { margin: 0 0 var(--space-2); color: var(--info-700); }
.enf-qrcode .alert-info ol { padding-left: var(--space-5); }

/* modal de download (Bootstrap) nas cores da marca */
.enf-qrcode-modal .modal-content {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  font-family: var(--font);
}
.enf-qrcode-modal .modal-title { font-size: var(--text-md); font-weight: 600; }
.enf-qrcode-modal .modal-body .btn {
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--border-strong);
}
.enf-qrcode-modal .modal-body .btn-primary {
  color: var(--white);
  background: var(--brand-700);
  border-color: var(--brand-700);
}

@media (max-width: 576px) {
  .enf-qrcode .qr-container { padding: var(--space-4); }
  .enf-qrcode .enf-acoes { display: grid; grid-template-columns: 1fr 1fr; }
  .enf-qrcode .btn-action { width: 100%; padding: 10px 12px; }
  .enf-qrcode .instruction-box { padding: var(--space-3) var(--space-4); }
}
@media print {
  .enf-qrcode .qr-container { box-shadow: none; border: 1px solid var(--border-strong); }
  .enf-qrcode .btn-action,
  .enf-qrcode .enf-alternativas,
  .enf-qrcode .url-display .btn { display: none; }
}
`

// enfermagem/respostas_entrevista.html (tela interna, Base1Layout)
export const cssRespostasEntrevista = `
.enf-respostas .page-toolbar h1 i { color: var(--brand-700); }
.enf-respostas .page-toolbar p { margin: var(--space-1) 0 0; }

.enf-respostas .section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  margin-bottom: var(--space-4);
}
.enf-respostas .section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  color: var(--brand-700);
  background: var(--brand-50);
}
.enf-respostas .section-title { margin: 0; }
.enf-respostas .section-subtitle {
  margin-left: auto;
  font-size: var(--text-sm);
  color: var(--text-muted);
}
.enf-respostas .card-hover-effect { transition: transform 0.15s ease; cursor: default; }

/* dados pessoais */
.enf-respostas .person-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-3);
}
.enf-respostas .person-info-grid .info-item {
  display: block;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--gray-50);
  transition: transform 0.15s ease;
}
.enf-respostas .info-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.enf-respostas .info-value {
  font-size: var(--text-md);
  font-weight: 500;
  color: var(--text);
  word-break: break-word;
}
.enf-respostas .info-value.highlight,
.enf-respostas .info-value.proposal-id { font-variant-numeric: tabular-nums; color: var(--brand-900); }

/* avaliação de risco */
.enf-respostas .risk-grid { margin-bottom: 0; }
.enf-respostas .risk-card { padding: var(--space-5); transition: transform 0.15s ease; }
.enf-respostas .risk-card-header h5 {
  margin: 0 0 var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
}
.enf-respostas .risk-value { margin-bottom: var(--space-3); font-size: var(--text-sm); }
.enf-respostas .risk-bar {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--gray-200);
}
.enf-respostas .risk-fill {
  width: 0;
  height: 100%;
  border-radius: 999px;
  background: var(--gray-400);
  transition: width 1s ease;
}
.enf-respostas .risk-fill[data-risk="Muito Alto"] { width: 95%; background: var(--danger-600); }
.enf-respostas .risk-fill[data-risk="Alto"] { width: 75%; background: var(--danger-600); }
.enf-respostas .risk-fill[data-risk="Médio"] { width: 50%; background: var(--warning-700); }
.enf-respostas .risk-fill[data-risk="Baixo"] { width: 25%; background: var(--success-700); }
.enf-respostas .risk-description {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
.enf-respostas .text-danger { color: var(--danger-700); }
.enf-respostas .text-warning { color: var(--warning-700); }
.enf-respostas .text-info { color: var(--info-700); }
.enf-respostas .text-success { color: var(--success-700); }
.enf-respostas .text-secondary { color: var(--text-muted); }
.enf-respostas .score-display { display: flex; align-items: baseline; gap: var(--space-2); }
.enf-respostas .score-value {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.enf-respostas .score-label { color: var(--text-muted); }
.enf-respostas .score-context {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-muted);
}
.enf-respostas .cid-code {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--brand-700);
  background: var(--brand-50);
}
.enf-respostas .cid-display .cid-code { font-size: var(--text-lg); padding: 4px 14px; }
.enf-respostas .cid-info {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
}
.enf-respostas .no-cid { display: flex; align-items: center; gap: var(--space-2); color: var(--text-muted); }

/* patologias */
.enf-respostas .summary-card h5 {
  margin: 0 0 var(--space-3);
  font-size: var(--text-base);
}
.enf-respostas .summary-card h5 i,
.enf-respostas .card-header i { color: var(--brand-700); }
.enf-respostas .enf-duas-colunas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}
.enf-respostas .enf-duas-colunas .card { margin-bottom: 0; }
.enf-respostas .card-header h5 { margin: 0; font-size: var(--text-base); }
.enf-respostas .styled-list { margin: 0; padding: 0; list-style: none; }
.enf-respostas .styled-list li {
  display: flex;
  align-items: baseline;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border);
}
.enf-respostas .styled-list li:last-child { border-bottom: 0; }
.enf-respostas .styled-list li i { font-size: var(--text-xs); color: var(--brand-700); }
.enf-respostas .cids-container { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.enf-respostas .enf-vazio-cid {
  padding: var(--space-4) 0;
  text-align: center;
  color: var(--text-muted);
}
.enf-respostas .enf-vazio-cid i { display: block; margin-bottom: var(--space-2); font-size: var(--text-xl); }
.enf-respostas .enf-vazio-cid p { margin: 0; color: var(--text-muted); }

.enf-respostas .pathologies-grid { display: flex; flex-direction: column; }
.enf-respostas .pathology-item {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
}
.enf-respostas .pathology-item:last-child { border-bottom: 0; }
.enf-respostas .pathology-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.enf-respostas .pathology-name { display: flex; align-items: baseline; font-weight: 500; color: var(--text); }
.enf-respostas .pathology-name i { color: var(--danger-600); }
.enf-respostas .badge-cid-large { color: var(--brand-700); background: var(--brand-50); }
.enf-respostas .pathology-category {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-muted);
}
.enf-respostas .pathology-category i { color: var(--text-muted); }

.enf-respostas .enf-aviso {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--border);
  border-left: 4px solid var(--warning-700);
  border-radius: var(--radius);
  color: var(--warning-700);
  background: var(--warning-50);
}
.enf-respostas .enf-aviso > i { font-size: var(--text-xl); }
.enf-respostas .enf-aviso h5 { margin: 0 0 var(--space-1); color: var(--warning-700); }
.enf-respostas .enf-aviso p { margin: 0; color: var(--warning-700); }

.enf-respostas .empty-state {
  padding: var(--space-8) var(--space-4);
  text-align: center;
}
.enf-respostas .empty-state-icon {
  margin-bottom: var(--space-4);
  font-size: 40px;
  color: var(--gray-400);
}
.enf-respostas .empty-state-title { margin-bottom: var(--space-2); font-size: var(--text-lg); }
.enf-respostas .empty-state-description { margin-bottom: var(--space-4); color: var(--text-muted); }

@media (max-width: 768px) {
  .enf-respostas .section-subtitle { margin-left: 0; width: 100%; }
  .enf-respostas .enf-duas-colunas { grid-template-columns: 1fr; }
}
@media print {
  .enf-respostas .btn,
  .enf-respostas .page-toolbar-actions,
  .enf-respostas .section-subtitle { display: none !important; }
  .enf-respostas .card,
  .enf-respostas .risk-card,
  .enf-respostas .info-item { break-inside: avoid; box-shadow: none !important; }
}
`
