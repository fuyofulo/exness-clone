#!/bin/bash
set -e

MODE=${RESET_MODE:-drop}
DB_USER=${POSTGRES_USER:-postgres}
DB_PASS=${POSTGRES_PASSWORD:-postgres}
DB_NAME=${POSTGRES_DB:-exness}
DB_HOST=postgres
SQL_FILE=/sql/ticks_table.sql   # <--- FIXED PATH

echo "⏳ Waiting for postgres at $DB_HOST..."
until PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; do
  echo "   ...still waiting..."
  sleep 2
done
echo "✅ Postgres is up!"


case "$MODE" in
  drop)
    echo "🗑️ Dropping and recreating ticks table..."
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS ticks CASCADE;"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $SQL_FILE
    ;;
  truncate)
    echo "⚡ Truncating ticks table..."
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "TRUNCATE TABLE ticks;"
    ;;
  create)
    echo "📦 Creating ticks table if not exists..."
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $SQL_FILE
    ;;
  *)
    echo "❌ Unknown mode: $MODE"
    exit 1
    ;;
esac

echo "✅ Done (mode=$MODE)"
