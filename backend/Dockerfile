FROM python:3.11-slim

# Apply security updates to reduce vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependências antes do código: mudar o código não reinstala tudo
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app
RUN chmod +x /app/docker-entrypoint.sh

ENV PORT=8001
EXPOSE 8001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
# Produção: gunicorn (o run.py é só para desenvolvimento). Timeout alto
# porque gerar kit/PDF com o LibreOffice pode demorar.
CMD gunicorn run:app --bind 0.0.0.0:${PORT} --workers ${WEB_CONCURRENCY:-2} --threads 4 --timeout 300 --access-logfile -
