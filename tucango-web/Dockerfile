# TucanGo Web — Production Container
FROM node:22-alpine

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package.json tsconfig.json ./

# Copiar código fuente y assets públicos
COPY src/ ./src/
COPY public/ ./public/

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Healthcheck para Dokploy / Docker Swarm
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/estado || exit 1

CMD ["node", "src/server.ts"]
