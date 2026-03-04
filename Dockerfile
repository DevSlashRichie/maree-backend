FROM oven/bun:1.1-debian AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

FROM base AS production
WORKDIR /app

COPY --from=install /app/node_modules node_modules
COPY package.json .env* ./
COPY src src

ENV NODE_ENV=production

EXPOSE 8080

CMD ["bun", "run", "src/index.ts"]
