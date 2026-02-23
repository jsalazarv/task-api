#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Running database seeders..."
npm run prisma:seed || echo "⚠️  Seeders already run or failed (this is ok)"

echo "🚀 Starting application..."
exec node dist/src/main.js
