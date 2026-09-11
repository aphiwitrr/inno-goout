# ใช้จริงเพื่อ deploy
FROM oven/bun:1.3-alpine

WORKDIR /app/

EXPOSE 3000

ARG NPM_REPOSITORY
ARG NPM_TOKEN_READONLY
ENV NPM_REPOSITORY=$NPM_REPOSITORY
ENV NPM_TOKEN_READONLY=$NPM_TOKEN_READONLY

COPY package.json bun.lock bunfig.toml ./

RUN apk update && apk upgrade --no-cache

RUN bun install --verbose

COPY . .

ARG ARG_APP_VERSION
ENV NUXT_APP_VERSION=$ARG_APP_VERSION
ENV NUXT_APP_PROGRAM_NAME=

RUN bun run generate
