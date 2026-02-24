#!/bin/sh
set -e

echo "🔄 Running database migrations..."
# Verificar que DATABASE_URL existe
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  exit 1
fi

echo "✅ DATABASE_URL is set (length: ${#DATABASE_URL} chars)"
npx prisma migrate deploy

echo "🌱 Running database seeders..."
npm run prisma:seed || echo "⚠️  Seeders already run or failed (this is ok)"

echo "🚀 Starting application..."
exec node dist/src/main.js
