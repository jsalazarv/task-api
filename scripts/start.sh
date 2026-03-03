#!/bin/sh
set -e

echo "⚠️  SKIPPING MIGRATIONS FOR TESTING - Starting app directly..."
echo "🚀 Starting application..."
exec node dist/src/main.js
