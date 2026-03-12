# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for building
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy production assets from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/models ./models
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/utils ./utils

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
