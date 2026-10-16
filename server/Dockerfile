# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for build
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code and compile TypeScript
COPY src/ ./src/
RUN npm run build

# Remove development dependencies to keep final bundle minimal
RUN npm prune --omit=dev

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy minimal production dependencies and compiled artifacts
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Run container as non-root user for security
USER node

EXPOSE 5000

# Built-in container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "dist/index.js"]
