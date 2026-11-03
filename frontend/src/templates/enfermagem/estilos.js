// CSS inline (<style>) dos templates de enfermagem, copiado sem alterações.

// enfermagem/entrevista.html
export const cssEntrevista = `
        
        
        .container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 15px;
    margin: 15px auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.8s ease-out;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.header-info {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    padding: 20px 15px;
    margin-bottom: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.header-info h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.3;
    text-align: center;
}

.header-info h2 {
    font-size: 1.1rem;
    font-weight: 400;
    margin-bottom: 5px;
    opacity: 0.9;
    text-align: center;
    line-height: 1.4;
}

.header-info .badge {
    background: rgba(255, 255, 255, 0.25);
    font-size: 0.8rem;
    padding: 6px 12px;
    border-radius: 50px;
    margin-top: 8px;
    display: inline-block;
    text-align: center;
}

.category-card {
    background: white;
    border-radius: 12px;
    padding: 18px 15px;
    margin-bottom: 18px;
    border-left: 4px solid #667eea;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    overflow: hidden;
    width: 100%;
}

.category-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.category-title {
    color: #667eea;
    font-weight: 700;
    margin-bottom: 15px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    line-height: 1.4;
    flex-wrap: wrap;
}

.category-title i {
    font-size: 1.1rem;
}

.form-check {
    padding: 7px 0;
    border-radius: 8px;
    transition: background-color 0.2s;
    margin: 2px 0;
}

.form-check:hover {
    background-color: rgba(102, 126, 234, 0.05);
}

.form-check-input {
    border: 2px solid #667eea;
    width: 1.1em;
    height: 1.1em;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-top: 0.1em;
    margin-left: 0.5em;
}

.form-check-input:checked {
    background-color: #667eea;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.form-check-label {
    margin-left: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    color: #333;
    user-select: none;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
}

.checkbox-group {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 15px;
}

.sub-question {
    margin-left: 10px;
    margin-top: 12px;
    padding-left: 12px;
    border-left: 2px solid #e0e0e0;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sub-question.show {
    max-height: 5000px;
    opacity: 1;
    margin-top: 15px;
    padding-top: 12px;
}

.outras-input {
    margin-top: 15px;
    padding: 10px 15px;
    border: 2px solid #667eea;
    border-radius: 8px;
    width: 100%;
    font-size: 0.95rem;
    transition: all 0.3s;
    background: rgba(102, 126, 234, 0.05);
    display: none;
    animation: slideIn 0.4s ease-out;
    box-sizing: border-box;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
}

.outras-input:focus {
    outline: none;
    border-color: #764ba2;
    box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.15);
    background: white;
}

.btn-submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px 30px;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    margin: 25px auto 15px;
    transition: all 0.3s;
    box-shadow: 0 6px 15px rgba(102, 126, 234, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    max-width: 300px;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
}

.btn-submit:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.35);
}

.btn-submit:active {
    transform: translateX(-50%) translateY(0);
}

.progress-container {
    background: #f0f0f0;
    border-radius: 8px;
    height: 8px;
    margin-bottom: 20px;
    overflow: hidden;
}

.progress-bar {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    height: 100%;
    width: 0%;
    transition: width 0.6s ease;
    border-radius: 8px;
}

.progress-text {
    text-align: center;
    color: #666;
    font-size: 0.85rem;
    margin-top: 5px;
    padding: 0 10px;
}

.category-counter {
    background: #667eea;
    color: white;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;
}

.category-toggle {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    
    background: rgba(102, 126, 234, 0.08);
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.3s;
    width: 100%;
}

.category-toggle:hover {
    background: rgba(102, 126, 234, 0.12);
}

.category-toggle i {
    transition: transform 0.3s ease;
    color: #667eea;
    font-size: 0.9rem;
}

.category-toggle.active i {
    transform: rotate(180deg);
}

.floating-alert {
    position: fixed;
    top: 15px;
    right: 15px;
    left: 15px;
    padding: 12px 15px;
    background: #4CAF50;
    color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: none;
    animation: slideInRight 0.5s ease;
    text-align: center;
    font-size: 0.9rem;
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.cid-badge {
    background: #f0f7ff;
    color: #667eea;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 6px;
    font-weight: 600;
    border: 1px solid #d1e0ff;
    white-space: nowrap;
}

.search-container {
    margin-bottom: 20px;
    padding: 0 5px;
}

.search-input {
    padding: 10px 15px;
    border: 2px solid #667eea;
    border-radius: 8px;
    width: 100%;
    font-size: 0.95rem;
    transition: all 0.3s;
    box-sizing: border-box;
}

.search-input:focus {
    outline: none;
    border-color: #764ba2;
    box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.15);
}

/* Melhorias específicas para mobile */
@media (max-width: 576px) {
    .container {
        padding: 12px;
        margin: 10px auto;
        border-radius: 12px;
    }
    
    .header-info {
        padding: 15px 12px;
        border-radius: 10px;
    }
    
    .header-info h1 {
        font-size: 1.3rem;
        margin-bottom: 6px;
    }
    
    .header-info h2 {
        font-size: 1rem;
        margin-bottom: 4px;
    }
    
    .category-card {
        padding: 15px 12px;
        margin-bottom: 15px;
        border-left-width: 3px;
    }
    
    .category-title {
        font-size: 1rem;
        margin-bottom: 12px;
        padding-bottom: 10px;
        gap: 6px;
    }
    
    .form-check-label {
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .checkbox-group {
        gap: 6px;
    }
    
    .btn-submit {
        padding: 12px 25px;
        font-size: 0.95rem;
        max-width: 280px;
    }
    
    .outras-input {
        padding: 8px 12px;
        font-size: 0.9rem;
    }
    
    .progress-container {
        height: 6px;
    }
    
    .progress-text {
        font-size: 0.8rem;
    }
}

/* Melhorias para telas muito pequenas */
@media (max-width: 360px) {
    .container {
        padding: 10px;
    }
    
    .header-info h1 {
        font-size: 1.2rem;
    }
    
    .category-title {
        font-size: 0.95rem;
    }
    
    .form-check-label {
        font-size: 0.85rem;
    }
    
    .btn-submit {
        padding: 10px 20px;
        font-size: 0.9rem;
    }
}

/* Ajustes para orientação paisagem em mobile */
@media (max-height: 500px) and (orientation: landscape) {
    .container {
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .category-card {
        padding: 12px 10px;
        margin-bottom: 10px;
    }
    
    .checkbox-group {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Ajustes para evitar quebra de layout */
.form-check {
    display: flex;
    align-items: flex-start;
    min-height: 24px;
    margin-left: 22px;

}

.form-check-input {
    margin-top: 0.15em;
    margin-left: 1.8em;
}

/* Melhorias de toque para dispositivos móveis */
@media (hover: none) and (pointer: coarse) {
    .category-toggle:hover {
        background: rgba(102, 126, 234, 0.08);
    }
    
    .form-check:hover {
        background-color: transparent;
    }
    
    .btn-submit:hover {
        transform: translateX(-50%) translateY(0);
        box-shadow: 0 6px 15px rgba(102, 126, 234, 0.25);
    }
    
    .btn-submit:active {
        transform: translateX(-50%) translateY(2px);
        box-shadow: 0 3px 8px rgba(102, 126, 234, 0.25);
    }
    
    .category-card:hover {
        transform: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
    
    .category-card:active {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
}

/* Melhorias de acessibilidade */
.form-check-input:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
}

.search-input:focus,
.outras-input:focus {
    outline: 2px solid #764ba2;
    outline-offset: 2px;
}

/* Prevenir zoom em inputs no iOS */
@media (max-width: 768px) {
    input[type="text"],
    input[type="search"],
    .search-input,
    .outras-input {
        font-size: 16px; /* Previne zoom automático no iOS */
    }
}

/* Ajustes para garantir que tudo caiba na tela */
* {
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

body {
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
    background-color: #f8f9fa;
}

/* Melhorias para os checkboxes em linha */
.checkbox-group .form-check {
    break-inside: avoid;
    page-break-inside: avoid;
}

/* Ajuste para garantir que o texto não saia da tela */
.form-check-label {
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}

/* Ajuste específico para o CID badge */
.cid-badge {
    display: inline-block;
    vertical-align: middle;
    line-height: 1;
}

/* Melhorias para o header info em várias linhas */
.header-info h1,
.header-info h2 {
    word-break: break-word;
}
    `

// enfermagem/entrevista_concluida.html
export const cssEntrevistaConcluida = `
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .confirmation-card {
            background: white;
            border-radius: 20px;
            padding: 40px 30px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            text-align: center;
            animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .success-icon {
            font-size: 80px;
            color: #4CAF50;
            margin-bottom: 20px;
            animation: bounce 1s ease-out;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-20px);}
            60% {transform: translateY(-10px);}
        }
        
        .title {
            color: #2E7D32;
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 1.2rem;
            margin-bottom: 30px;
        }
        
        .patient-info {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .info-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .info-label {
            color: #666;
            font-weight: 500;
        }
        
        .info-value {
            color: #333;
            font-weight: 600;
        }
        
        .actions {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 30px;
        }
        
        .btn-confirm {
            padding: 14px;
            border-radius: 10px;
            border: none;
            font-weight: 600;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s;
            cursor: pointer;
            text-decoration: none;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
            border: 2px solid #ddd;
        }
        
        .btn-success {
            background: #4CAF50;
            color: white;
        }
        
        .btn-confirm:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        
        .timestamp {
            color: #888;
            font-size: 0.9rem;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        @media (max-width: 576px) {
            .confirmation-card {
                padding: 30px 20px;
            }
            
            .success-icon {
                font-size: 60px;
            }
            
            .title {
                font-size: 1.8rem;
            }
            
            .subtitle {
                font-size: 1.1rem;
            }
            
            .info-row {
                flex-direction: column;
                gap: 5px;
            }
        }
    `

// enfermagem/exibir_qrcode.html
export const cssExibirQrcode = `
        body {
            background: linear-gradient(135deg, #253fb0 0%, #4b6ca2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding-top: 20px;
        }
        
        .qr-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin: 20px auto;
            max-width: 600px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .header h1 {
            color: #667eea;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header .badge {
            background: #667eea;
            font-size: 0.9rem;
            padding: 8px 15px;
            border-radius: 50px;
        }
        
        .qrcode-display {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
            border: 2px dashed #dee2e6;
        }
        
        .qrcode-display img {
            max-width: 300px;
            width: 100%;
            height: auto;
            border: 10px solid white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .info-card {
            background: #f0f7ff;
            border-left: 5px solid #667eea;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .info-card h5 {
            color: #667eea;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .info-card ul {
            padding-left: 20px;
            margin-bottom: 0;
        }
        
        .info-card li {
            margin-bottom: 8px;
            color: #555;
        }
        
        .url-display {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 0.9rem;
        }
        
        .btn-action {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin: 5px;
        }
        
        .btn-action:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            color: white;
        }
        
        .instruction-box {
            background: #e7f3ff;
            border: 2px solid #b3d4fc;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .instruction-box h4 {
            color: #2c5282;
            margin-bottom: 15px;
        }
        
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .step-number {
            background: #667eea;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            flex-shrink: 0;
        }
        
        .step-content {
            flex: 1;
        }
        
        @media print {
            body {
                background: white !important;
            }
            
            .qr-container {
                box-shadow: none;
                border: 1px solid #ddd;
            }
            
            .btn-action {
                display: none;
            }
        }
        
        .qr-animation {
            position: relative;
            overflow: hidden;
        }
        
        .qr-animation::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                45deg,
                transparent 30%,
                rgba(102, 126, 234, 0.1) 50%,
                transparent 70%
            );
            animation: shine 3s infinite;
        }
        
        @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        .countdown {
            font-size: 1.5rem;
            font-weight: bold;
            color: #667eea;
            text-align: center;
            margin: 10px 0;
        }
    `

// enfermagem/respostas_entrevista.html
export const cssRespostasEntrevista = `
        /* Estilos gerais */
        .results-container {
            
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }
        
        /* Cabeçalho da página */
        .page-header {
            text-align: center;
            padding-bottom: 1.5rem;
        }
        h2{
            color:white;
        }
        
        .header-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1.5rem;
        }
        
        .header-divider .line {
            height: 2px;
            width: 100px;
            background: linear-gradient(90deg, transparent, #4e73df, transparent);
        }
        
        .header-divider .circle {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #4e73df;
            margin: 0 15px;
        }
        
        /* Seções */
        .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            margin-top: 18px;
            border-bottom: 2px solid #eaeaea;
            padding-bottom: 0.75rem;
            padding-top: 18px;
        }
        
        .card-hover-effect {
            margin-top:22px;
        }

        .section-icon {
            background: linear-gradient(135deg, #4e73df, #224abe);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-right: 1rem;
        }
        
        .section-title {
            font-weight: 600;
            
            margin-bottom: 0;
        }
        
        .section-subtitle {
            margin-left: auto;
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        /* Card de dados pessoais */
        .person-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .info-item {
            background: white;
            border-radius: 10px;
            padding: 1.25rem;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
            border-left: 4px solid #4e73df;
            transition: transform 0.3s ease;
        }
        
        .info-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .info-label {
            font-size: 0.85rem;
            color: #6c757d;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .info-label i {
            width: 20px;
            margin-right: 8px;
        }
        
        .info-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2e3a59;
        }
        
        .highlight {
            color: #4e73df;
            font-weight: 700;
        }
        
        .proposal-id {
            background: linear-gradient(135deg, #f6d365, #fda085);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
        }
        
        /* Avaliação de risco */
        .risk-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 1rem;
        }
        
        .risk-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease;
        }
        
        .risk-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        .risk-card-header {
            background: #f8f9fa;
            padding: 1.25rem;
            border-bottom: 1px solid #eaeaea;
        }
        
        .risk-card-header h5 {
            color: #2e3a59;
            margin-bottom: 0;
            font-weight: 600;
        }
        
        .risk-card-body {
            padding: 1.5rem;
        }
        
        .risk-level-muito-alto .risk-value {
            color: #e74a3b;
        }
        
        .risk-level-alto .risk-value {
            color: #f6c23e;
        }
        
        .risk-level-médio .risk-value {
            color: #36b9cc;
        }
        
        .risk-level-baixo .risk-value {
            color: #1cc88a;
        }
        
        .risk-indicator {
            margin-bottom: 1rem;
        }
        
        .risk-value {
            font-size: 2.5rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 0.5rem;
        }
        
        .risk-bar {
            height: 10px;
            background-color: #eaeaea;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .risk-fill {
            height: 100%;
            border-radius: 5px;
            width: 0;
            transition: width 1s ease;
        }
        
        .risk-fill[data-risk="Muito Alto"] {
            background: linear-gradient(90deg, #e74a3b, #f8afa6);
            width: 95%;
        }
        
        .risk-fill[data-risk="Alto"] {
            background: linear-gradient(90deg, #f6c23e, #fce8b2);
            width: 75%;
        }
        
        .risk-fill[data-risk="Médio"] {
            background: linear-gradient(90deg, #36b9cc, #b6e6ee);
            width: 50%;
        }
        
        .risk-fill[data-risk="Baixo"] {
            background: linear-gradient(90deg, #1cc88a, #a6f1d5);
            width: 25%;
        }
        
        .risk-description {
            text-align: center;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        /* Pontuação */
        .score-display {
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .score-value {
            font-size: 3rem;
            font-weight: 700;
            color: #4e73df;
            line-height: 1;
        }
        
        .score-label {
            font-size: 1rem;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .score-context {
            text-align: center;
            font-size: 0.85rem;
            color: #858796;
        }
        
        /* CID */
        .cid-display {
            text-align: center;
            padding: 1rem 0;
        }
        
        .cid-code {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-size: 2.5rem;
            font-weight: 700;
            padding: 0.5rem 1.5rem;
            border-radius: 10px;
            margin-bottom: 0.5rem;
        }
        
        .cid-info {
            font-size: 0.85rem;
            color: #6c757d;
        }
        
        .no-cid {
            text-align: center;
            color: #b7b9cc;
            padding: 1rem 0;
        }
        
        .no-cid i {
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }
        
        /* Resumo de patologias */
        .summary-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        
        .summary-header {
            background: linear-gradient(135deg, #4e73df, #224abe);
            color: white;
            padding: 1.25rem;
            margin-bottom:24px;
        }
        
        .summary-header h5 {
            margin-bottom: 0;
            font-weight: 600;
        }
        
        .summary-body {
            display: flex;
            padding: 1.5rem;
        }
        
        .summary-item {
            flex: 1;
            text-align: center;
            padding: 0 1rem;
        }
        
        .summary-item:not(:last-child) {
            border-right: 1px solid #eaeaea;
        }
        
        .summary-label {
            font-size: 0.9rem;
            color: #6c757d;
            margin-bottom: 0.5rem;
        }
        
        .badge-count {
            display: inline-block;
            background: linear-gradient(135deg, #f6d365, #fda085);
            color: white;
            font-size: 2rem;
            font-weight: 700;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            line-height: 70px;
            text-align: center;
        }
        .card-body-pathologies-list1{
            margin-top: 22px;   
        }
        /* Lista de patologias */
        .styled-list {
            list-style-type: none;
            padding-left: 0;
        }
        
        .styled-list li {
            padding: 0.75rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .styled-list li:last-child {
            border-bottom: none;
        }
        
        /* Códigos CID */
        .cids-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 22px;
        }
        
        .cid-tag {
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        /* Tabela */
        .badge-cid {
            background: linear-gradient(135deg, #4e73df, #224abe);
            color: white;
            padding: 0.35rem 0.75rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.85rem;
        }
        
        .category-badge {
            background-color: #f8f9fa;
            color: #2e3a59;
            padding: 0.35rem 0.75rem;
            border-radius: 5px;
            font-size: 0.85rem;
            border: 1px solid #eaeaea;
        }
        
        /* Detalhamento de patologias com grid */
        .detailed-pathologies {
            border: none !important;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08) !important;
        }
        
        .pathologies-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.25rem;
            padding: 1.75rem;
        }
        
        .pathology-item {
            background: rgba(255, 255, 255, 0.461);
            border-radius: 12px;
            padding: 1.5rem;
            border-left: 5px solid #1c41c8e0;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .pathology-item:hover {
            transform: translateY(-8px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
            border-left-color: #17a673;
        }
        
        .pathology-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
        }
        
        .pathology-name {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            flex: 1;
        }
        
        .pathology-name i {
            margin-top: 2px;
            flex-shrink: 0;
        }
        
        .pathology-title {
            font-weight: 700;
            color: #2e3a59;
            font-size: 1.05rem;
            line-height: 1.4;
            word-wrap: break-word;
        }
        
        .badge-cid-large {
            background: linear-gradient(135deg, #4099e6, #3573d7);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 700;
            font-size: 0.9rem;
            white-space: nowrap;
            flex-shrink: 0;
        }
        
        .badge-cid-empty {
            background: #e8eaed;
            color: #757575;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.85rem;
            white-space: nowrap;
            flex-shrink: 0;
        }
        
        .pathology-category {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: #6c757d;
            padding: 0.5rem 0.75rem;
            background: #31554869;
            border-radius: 8px;
            width: fit-content;
        }
        
        .pathology-category i {
            color: #36b9cc;
            font-size: 0.95rem;
        }
        
        /* Efeito de hover em cards */
        .card-hover-effect {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card-hover-effect:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Botões de gradiente */
        .bg-gradient-primary {
            background: linear-gradient(135deg, #1c80c8, #3998dc) !important;
        }
        
        .bg-gradient-info {
            background: linear-gradient(135deg, #1c80c8, #3998dc) !important;
        }
        
        .bg-gradient-success {
            background: linear-gradient(135deg, #1c80c8, #3998dc) !important;
        }
        
        /* Estado vazio */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
        }
        
        .empty-state-icon {
            margin-bottom: 1.5rem;
        }
        
        .empty-state-title {
            font-weight: 600;
            color: #2e3a59;
            margin-bottom: 0.5rem;
        }
        
        .empty-state-description {
            color: #6c757d;
            max-width: 500px;
            margin: 0 auto 1.5rem;
        }
        
        /* Botões de ação */
        .action-buttons .btn {
            padding: 0.75rem 2rem;
            font-weight: 600;
            border-radius: 8px;
        }
        
        /* Estilos para impressão */
        @media print {
            .btn, .action-buttons, .header-divider, .section-subtitle {
                display: none !important;
            }
            
            .results-container {
                padding: 0;
            }
            
            .section-header {
                border-bottom: 2px solid #000;
            }
            
            .risk-card, .info-item, .summary-card, .card {
                break-inside: avoid;
                box-shadow: none !important;
                border: 1px solid #000 !important;
            }
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .person-info-grid, .risk-grid {
                grid-template-columns: 1fr;
            }
            
            .summary-body {
                flex-direction: column;
            }
            
            .summary-item:not(:last-child) {
                border-right: none;
                border-bottom: 1px solid #eaeaea;
                padding-bottom: 1rem;
                margin-bottom: 1rem;
            }
            
            .section-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .section-subtitle {
                margin-left: 0;
                margin-top: 0.5rem;
            }
            
            .action-buttons .btn {
                width: 100%;
                margin-bottom: 0.5rem;
            }
            
            .action-buttons .d-flex {
                flex-direction: column;
            }
            
            .action-buttons .d-flex > div {
                width: 100%;
            }
            
            .pathologies-grid {
                grid-template-columns: 1fr;
                padding: 1rem;
                gap: 1rem;
            }
            
            .pathology-item {
                padding: 1.25rem;
            }
            
            .pathology-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .badge-cid-large {
                align-self: flex-start;
            }
        }
    `
