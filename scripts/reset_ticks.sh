#!/bin/bash
set -e

MODE=${RESET_MODE:-drop}
DB_USER=${POSTGRES_USER:-postgres}
DB_PASS=${POSTGRES_PASSWORD:-postgres}
DB_NAME=${POSTGRES_DB:-exness}
DB_HOST=postgres
SQL_FILES=(/sql/ticks_table.sql /sql/continuous_aggregates.sql)   # <--- FIXED PATH

echo "⏳ Waiting for postgres at $DB_HOST..."
until PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; do
  echo "   ...still waiting..."
  sleep 2
done
echo "✅ Postgres is up!"


case "$MODE" in
  drop)
    echo "🗑️ Dropping and recreating ticks table and views..."
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS ticks CASCADE;"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP MATERIALIZED VIEW IF EXISTS ohlc_1m CASCADE;"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP MATERIALIZED VIEW IF EXISTS ohlc_5m CASCADE;"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP MATERIALIZED VIEW IF EXISTS ohlc_15m CASCADE;"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP MATERIALIZED VIEW IF EXISTS ohlc_1h CASCADE;"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP MATERIALIZED VIEW IF EXISTS ohlc_4h CASCADE;"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP MATERIALIZED VIEW IF EXISTS ohlc_1d CASCADE;"
    for sql_file in "${SQL_FILES[@]}"; do
      echo "📄 Executing $sql_file..."
      PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $sql_file
    done
    ;;
  truncate)
    echo "⚡ Truncating ticks table..."
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "TRUNCATE TABLE ticks;"
    ;;
  create)
    echo "📦 Creating ticks table and views if not exists..."
    for sql_file in "${SQL_FILES[@]}"; do
      echo "📄 Executing $sql_file..."
      PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $sql_file
    done
    ;;
  *)
    echo "❌ Unknown mode: $MODE"
    exit 1
    ;;
esac

echo "✅ Done (mode=$MODE)"
