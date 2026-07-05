FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY apps/server ./apps/server
COPY agents ./agents
COPY packages ./packages
RUN npm ci && npm run build -w apps/server
EXPOSE 3001
CMD ["node", "apps/server/dist/index.js"]
