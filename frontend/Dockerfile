FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx vite build

FROM nginx:1.27-alpine
# templates em /etc/nginx/templates viram config com as variáveis de ambiente
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# descobre o IP do back antes do template ser gerado e o acompanha depois
COPY backend-upstream.envsh /docker-entrypoint.d/05-backend-upstream.envsh
RUN chmod 755 /docker-entrypoint.d/05-backend-upstream.envsh
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=80
ENV BACKEND_HOSTPORT=backend:8001
EXPOSE 80
