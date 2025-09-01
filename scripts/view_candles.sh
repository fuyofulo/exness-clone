#!/bin/bash
set -e

DB_USER=${POSTGRES_USER:-postgres}
DB_PASS=${POSTGRES_PASSWORD:-postgres}
DB_NAME=${POSTGRES_DB:-exness}
DB_HOST=postgres

echo "📊 Checking OHLC Candle Data..."
echo "=================================="

# Check what tables/views exist
echo "Available tables and views:"
docker exec -i $DB_HOST psql -U $DB_USER -d $DB_NAME -c "\dt" 2>/dev/null || echo "No tables found"

echo ""
echo "🔍 Recent 1-Minute Candles (BTCUSDT):"
docker exec -i $DB_HOST psql -U $DB_USER -d $DB_NAME -c "SELECT bucket, symbol, open, high, low, close, volume, trade_count FROM ohlc_1m WHERE symbol = 'BTCUSDT' ORDER BY bucket DESC LIMIT 5;" 2>/dev/null || echo "ohlc_1m view not found or empty"

echo ""
echo "📈 Recent 5-Minute Candles (BTCUSDT):"
docker exec -i $DB_HOST psql -U $DB_USER -d $DB_NAME -c "SELECT bucket, symbol, open, high, low, close FROM ohlc_5m WHERE symbol = 'BTCUSDT' ORDER BY bucket DESC LIMIT 3;" 2>/dev/null || echo "ohlc_5m view not found or empty"

echo ""
echo "📊 Recent 1-Hour Candles (BTCUSDT):"
docker exec -i $DB_HOST psql -U $DB_USER -d $DB_NAME -c "SELECT bucket, symbol, open, high, low, close FROM ohlc_1h WHERE symbol = 'BTCUSDT' ORDER BY bucket DESC LIMIT 2;" 2>/dev/null || echo "ohlc_1h view not found or empty"

echo ""
echo "📊 Recent 1-Day Candles (BTCUSDT):"
docker exec -i $DB_HOST psql -U $DB_USER -d $DB_NAME -c "SELECT bucket, symbol, open, high, low, close FROM ohlc_1d WHERE symbol = 'BTCUSDT' ORDER BY bucket DESC LIMIT 1;" 2>/dev/null || echo "ohlc_1d view not found or empty"

echo ""
echo "📊 Symbol Statistics:"
docker exec -i $DB_HOST psql -U $DB_USER -d $DB_NAME -c "SELECT symbol, COUNT(*) as candle_count, MIN(bucket) as oldest_candle, MAX(bucket) as newest_candle FROM ohlc_1m GROUP BY symbol ORDER BY candle_count DESC;" 2>/dev/null || echo "No candle data found"

echo ""
echo "✅ Candle view check complete!"
