# Ruang Guru Merdeka — production image
# Build:  docker build -t ruang-guru-merdeka .
# Run:    docker run -p 3000:3000 --env-file .env ruang-guru-merdeka

FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./index.html
COPY server.ts serverFallback.ts ./
COPY server ./server
# Data dir (db.json dibuat otomatis saat start bila belum ada)
RUN mkdir -p data
EXPOSE 3000
CMD ["bun", "server.ts"]
