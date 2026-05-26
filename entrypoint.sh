#!/bin/sh

set -e

# Prisma マイグレーション実行
echo "Running database migrations..."
npx prisma migrate deploy

# Nginx バックグラウンド起動（フロント配信）
echo "Starting nginx..."
nginx -g "daemon off;" &

# バックエンド起動
echo "Starting backend..."
node dist/index.js
