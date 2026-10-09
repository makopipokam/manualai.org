# Produktions-Image: Express serviert API und statisches Frontend aus einem Prozess.
FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

# pnpm über Corepack in der im Projekt gepinnten Version.
RUN corepack enable

# Abhängigkeiten zuerst: bessere Layer-Wiederverwendung.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json ./shared/package.json
RUN pnpm install --prod --frozen-lockfile

# Anwendungscode.
COPY server ./server
COPY shared ./shared
COPY content ./content
COPY public ./public

# Der Listener folgt PORT, Standard 3000 (siehe server/index.mjs).
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/index.mjs"]
