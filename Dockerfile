# ========== STAGE 1 : Build (L'établi) ==========
FROM node:20-alpine AS builder

WORKDIR /app

# On copie d'abord les fichiers de dépendances pour profiter du cache Docker
COPY package.json package-lock.json ./

# Installation des dépendances (y compris de dev si besoin pour le build)
RUN npm ci

# Copie du reste du code source
COPY . .

# On nettoie les dépendances de développement pour ne garder que le runtime
RUN npm prune --production


# ========== STAGE 2 : Production (Le paquet final) ==========
FROM node:20-alpine AS production

WORKDIR /app

# Sécurité : On crée un utilisateur non-root (appuser)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# On ne copie QUE ce qui est nécessaire depuis l'étape "builder"
# On change aussi le propriétaire des fichiers pour notre utilisateur non-root
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

# On bascule sur l'utilisateur sécurisé
USER appuser

EXPOSE 3000

ENV NODE_ENV=production

# Healthcheck Docker interne (différent de celui de l'app, mais il l'utilise)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]