# Two targets: build and run API and web on a private network.
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY web/package.json ./web/package.json
RUN npm ci
COPY server/src ./server/src
COPY server/tsconfig.json ./server/tsconfig.json
COPY shared ./shared
COPY web ./web
ARG KUJUK_API_ORIGIN=http://kujuk-api:4000
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_ENABLE_GOOGLE=false
ARG NEXT_PUBLIC_FIREBASE_ENABLE_PHONE=false
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY
ARG NEXT_PUBLIC_KUJUK_SUPPORT_EMAIL
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/web/package.json ./web/package.json

FROM runtime AS api
ENV PORT=4000 KUJUK_STORE=firestore
COPY --from=build /app/server/dist ./server/dist
USER node
EXPOSE 4000
CMD ["npm", "run", "start", "-w", "server"]

FROM runtime AS web
ENV PORT=3000 KUJUK_API_ORIGIN=http://kujuk-api:4000
COPY --from=build --chown=node:node /app/web/.next ./web/.next
COPY --from=build /app/web/next.config.mjs ./web/next.config.mjs
COPY --from=build /app/web/public ./web/public
USER node
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "web"]
