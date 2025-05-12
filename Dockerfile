FROM node:18-alpine AS base

# 依存関係のインストール
FROM base AS deps
WORKDIR /app

# パッケージマネージャーのファイルをコピー
COPY package.json package-lock.json* ./
RUN npm ci

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prismaクライアントの生成
RUN npx prisma generate

# 本番用ビルド
RUN npm run build

# 本番用イメージ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# 必要なファイルのみをコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
