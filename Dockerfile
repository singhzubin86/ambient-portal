# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
# --legacy-peer-deps bypasses the @chromatic-com/storybook peer conflict
# (it requires storybook v10 but project pins v8; Storybook is dev-only,
#  so the conflict has zero impact on the production build output)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .

# Build-time env — NEXT_PUBLIC_* vars must be present at build time
ARG NEXT_PUBLIC_API_URL=https://ambient-api.fly.dev
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy standalone output — Next.js writes server.js + node_modules here
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Static assets must live at .next/static relative to the server.js workdir
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
