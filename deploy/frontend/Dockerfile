FROM node:24-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS builder

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION
ARG WP_API_URL
ARG WP_PUBLIC_API_URL
ARG WP_REST_ROOT
ARG WP_MODE=mock

ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION=${NEXT_PUBLIC_INQUIRY_PRIVACY_VERSION} \
    WP_API_URL=${WP_API_URL} \
    WP_PUBLIC_API_URL=${WP_PUBLIC_API_URL} \
    WP_REST_ROOT=${WP_REST_ROOT} \
    WP_MODE=${WP_MODE}

RUN npm run build

FROM node:24-bookworm-slim AS runtime

# OCI standard labels — how "which commit is live?" gets answered.
#
# The tag alone is not enough: tags are mutable (someone can retag, or two
# deploys can share the fallback `dev`). The revision label is baked into the
# image at build time and survives any retagging, so
# `docker image inspect` is authoritative.
#
# Passed as build args because the build has no access to the git history.
ARG IMAGE_REVISION=""
ARG IMAGE_TAG=""
LABEL org.opencontainers.image.revision="${IMAGE_REVISION}" \
      org.opencontainers.image.version="${IMAGE_TAG}" \
      org.opencontainers.image.title="fenghuai-frontend"

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

WORKDIR /app
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
