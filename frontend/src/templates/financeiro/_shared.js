// CSS inline comum a alt_page.html e cancelar_boleto.html (copiado sem alterar).
export const pagamentoCss = `
.titulo-pagamento {
    text-align: center;
    margin-bottom: 25px;
    font-size: 1.6em;
    letter-spacing: 0.5px;
}

.form-pagamento {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.info-pagamento p {
    margin: 4px 0;
    font-size: 1em;
    line-height: 1.4;
}

.campo-status {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

select {
    padding: 8px 10px;
    border-radius: 8px;
    border: none;
    font-size: 1em;
}

.acoes-form {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.btn,
.btn-cancela {
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.2s ease;
}

.btn:hover,
.btn-cancela:hover {
    transform: scale(1.05);
}
`
