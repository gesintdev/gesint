# Build de producao — contexto: gesint-admin-frontend/
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_ADMIN_API_URL
ARG NEXT_PUBLIC_HR_API_URL
ENV NEXT_PUBLIC_ADMIN_API_URL=${NEXT_PUBLIC_ADMIN_API_URL}
ENV NEXT_PUBLIC_HR_API_URL=${NEXT_PUBLIC_HR_API_URL}
# Cap heap: TypeScript/Next com muitos workers estoura RAM no build paralelo
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
# Lab Coolify: cert Traefik self-signed em *.local; Auth.js faz fetch server-side.
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN addgroup -S gesint && adduser -S gesint -G gesint \
    && apk add --no-cache curl

COPY --from=builder /app/public ./public
COPY --from=builder --chown=gesint:gesint /app/.next/standalone ./
COPY --from=builder --chown=gesint:gesint /app/.next/static ./.next/static

USER gesint
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3001 || exit 1

CMD ["node", "server.js"]
