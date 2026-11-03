#!/bin/sh
# Com DATA_DIR definido (disco persistente no Render), as pastas onde o sistema
# grava arquivos passam a ficar no disco e sobrevivem a deploys e reinícios.
# Os arquivos que vêm do repositório (modelos .docx, imagens...) são copiados
# para o disco a cada subida, por cima das versões antigas; o que o sistema
# gravou (uploads, comprovantes, kits gerados) continua lá.
set -e

if [ -n "$DATA_DIR" ]; then
    mkdir -p "$DATA_DIR"

    persistir() {
        # $1: pasta no código (relativa a /app)  $2: nome da pasta no disco
        destino="$DATA_DIR/$2"
        mkdir -p "$destino"
        if [ -d "/app/$1" ] && [ ! -L "/app/$1" ]; then
            cp -a "/app/$1/." "$destino/"
            rm -rf "/app/$1"
        fi
        mkdir -p "$(dirname "/app/$1")"
        ln -sfn "$destino" "/app/$1"
    }

    persistir static static
    persistir app/static app_static
    persistir uploads uploads
    persistir app/routes/uploads routes_uploads

    # logs que o sistema grava na pasta de trabalho
    mkdir -p "$DATA_DIR/logs"
    for log in log_atualizacoa_banco.txt log_atualiza_status.txt log_atualiza_pagamentos.txt log_exclusao_propostas.txt; do
        touch "$DATA_DIR/logs/$log"
        ln -sfn "$DATA_DIR/logs/$log" "/app/$log"
    done
fi

exec "$@"
