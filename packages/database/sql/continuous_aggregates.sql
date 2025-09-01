-- TimescaleDB Continuous Aggregates for OHLC Candles
-- These views automatically refresh as new tick data arrives

-- 1-Minute OHLC Candles
CREATE MATERIALIZED VIEW IF NOT EXISTS ohlc_1m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,     -- First price in the minute
    MAX(price) AS high,             -- Highest price in the minute
    MIN(price) AS low,              -- Lowest price in the minute
    LAST(price, time) AS close,     -- Last price in the minute
    SUM(qty) AS volume,             -- Total volume in the minute
    COUNT(*) AS trade_count,        -- Number of trades in the minute
    AVG(decimals) AS avg_decimals   -- Average decimals (should be consistent)
FROM ticks
GROUP BY bucket, symbol
WITH NO DATA;

-- 5-Minute OHLC Candles
CREATE MATERIALIZED VIEW IF NOT EXISTS ohlc_5m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close,
    SUM(qty) AS volume,
    COUNT(*) AS trade_count,
    AVG(decimals) AS avg_decimals
FROM ticks
GROUP BY bucket, symbol
WITH NO DATA;

-- 15-Minute OHLC Candles
CREATE MATERIALIZED VIEW IF NOT EXISTS ohlc_15m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('15 minutes', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close,
    SUM(qty) AS volume,
    COUNT(*) AS trade_count,
    AVG(decimals) AS avg_decimals
FROM ticks
GROUP BY bucket, symbol
WITH NO DATA;

-- 1-Hour OHLC Candles
CREATE MATERIALIZED VIEW IF NOT EXISTS ohlc_1h
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close,
    SUM(qty) AS volume,
    COUNT(*) AS trade_count,
    AVG(decimals) AS avg_decimals
FROM ticks
GROUP BY bucket, symbol
WITH NO DATA;

-- 4-Hour OHLC Candles
CREATE MATERIALIZED VIEW IF NOT EXISTS ohlc_4h
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('4 hours', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close,
    SUM(qty) AS volume,
    COUNT(*) AS trade_count,
    AVG(decimals) AS avg_decimals
FROM ticks
GROUP BY bucket, symbol
WITH NO DATA;

-- 1-Day OHLC Candles
CREATE MATERIALIZED VIEW IF NOT EXISTS ohlc_1d
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close,
    SUM(qty) AS volume,
    COUNT(*) AS trade_count,
    AVG(decimals) AS avg_decimals
FROM ticks
GROUP BY bucket, symbol
WITH NO DATA;

-- Add continuous aggregate policies for automatic refresh
-- These policies tell TimescaleDB when to refresh the views

-- 1-minute candles refresh every minute
SELECT add_continuous_aggregate_policy('ohlc_1m',
    start_offset => INTERVAL '7 days',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute',
    if_not_exists => TRUE);

-- 5-minute candles refresh every 5 minutes
SELECT add_continuous_aggregate_policy('ohlc_5m',
    start_offset => INTERVAL '7 days',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '5 minutes',
    if_not_exists => TRUE);

-- 15-minute candles refresh every 15 minutes
SELECT add_continuous_aggregate_policy('ohlc_15m',
    start_offset => INTERVAL '7 days',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '15 minutes',
    if_not_exists => TRUE);

-- 1-hour candles refresh every hour
SELECT add_continuous_aggregate_policy('ohlc_1h',
    start_offset => INTERVAL '7 days',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- 4-hour candles refresh every 4 hours
SELECT add_continuous_aggregate_policy('ohlc_4h',
    start_offset => INTERVAL '7 days',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '4 hours',
    if_not_exists => TRUE);

-- 1-day candles refresh every day
SELECT add_continuous_aggregate_policy('ohlc_1d',
    start_offset => INTERVAL '30 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 day',
    if_not_exists => TRUE);

-- Create indexes for fast queries on the materialized views
CREATE INDEX IF NOT EXISTS idx_ohlc_1m_bucket_symbol ON ohlc_1m (bucket DESC, symbol);
CREATE INDEX IF NOT EXISTS idx_ohlc_5m_bucket_symbol ON ohlc_5m (bucket DESC, symbol);
CREATE INDEX IF NOT EXISTS idx_ohlc_15m_bucket_symbol ON ohlc_15m (bucket DESC, symbol);
CREATE INDEX IF NOT EXISTS idx_ohlc_1h_bucket_symbol ON ohlc_1h (bucket DESC, symbol);
CREATE INDEX IF NOT EXISTS idx_ohlc_4h_bucket_symbol ON ohlc_4h (bucket DESC, symbol);
CREATE INDEX IF NOT EXISTS idx_ohlc_1d_bucket_symbol ON ohlc_1d (bucket DESC, symbol);
