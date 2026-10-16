# ==========================================
# Stage 1: Build React SPA with Vite
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Build arguments for frontend environment configuration
ARG VITE_API_URL=/api
ARG VITE_STRIPE_PUBLISHABLE_KEY=
ARG VITE_PAYPAL_CLIENT_ID=
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_FACEBOOK_APP_ID=

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_FACEBOOK_APP_ID=$VITE_FACEBOOK_APP_ID

COPY package*.json tsconfig*.json vite.config.ts eslint.config.js ./
RUN npm ci

COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./

RUN npm run build

# ==========================================
# Stage 2: Serve SPA with Nginx Alpine
# ==========================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optimized nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Built-in container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
