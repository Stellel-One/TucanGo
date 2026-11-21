# TucanGo Web — Production Container (Beta v1)
FROM node:22-alpine

WORKDIR /app

# Copiar manifiestos y crear directorio persistente para SQLite WAL
COPY package.json tsconfig.json ./
RUN mkdir -p /app/data

# Copiar código fuente y assets públicos
COPY src/ ./src/
COPY public/ ./public/

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000

# Healthcheck para Dokploy / Docker Compose
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/salud || exit 1

CMD ["node", "src/co/edu/uniamazonia/tucango/interfaz/server.ts"]
