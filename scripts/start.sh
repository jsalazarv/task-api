#!/bin/sh
set -e

echo "🔄 Running database migrations..."
# Verificar que DATABASE_URL existe
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  exit 1
fi

echo "✅ DATABASE_URL is set (length: ${#DATABASE_URL} chars)"
echo "📊 Testing database connectivity..."

# Extraer host y puerto del DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

echo "🔍 Database host: $DB_HOST"
echo "🔍 Database port: $DB_PORT"

# Intentar ping al host (si nc está disponible)
if command -v nc >/dev/null 2>&1; then
  if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
    echo "✅ Database host is reachable"
  else
    echo "❌ Cannot reach database host $DB_HOST:$DB_PORT"
    echo "⚠️  Continuing anyway (might fail)..."
  fi
fi

npx prisma migrate deploy

echo "🌱 Running database seeders..."
npm run prisma:seed || echo "⚠️  Seeders already run or failed (this is ok)"

echo "🚀 Starting application..."
exec node dist/src/main.js
