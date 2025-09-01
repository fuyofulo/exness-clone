CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS ticks (
    time            TIMESTAMPTZ      NOT NULL,        -- Tick timestamp
    symbol          TEXT             NOT NULL,        -- Trading pair (BTCUSDT, ETHUSDC)
    price           BIGINT           NOT NULL,        -- Tick price (scaled by 10^decimals)
    qty             DOUBLE PRECISION NOT NULL,        -- Trade volume
    decimals        INT              NOT NULL,        -- Price decimal places
    trade_id        BIGINT           NOT NULL,        -- Unique trade ID from exchange
    is_buyer_maker  BOOLEAN          NOT NULL,        -- Taker side (true = seller, false = buyer)

    PRIMARY KEY (symbol, trade_id, time)
);

-- Convert to hypertable
SELECT create_hypertable('ticks', 'time', if_not_exists => TRUE);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticks_symbol_time ON ticks (symbol, time DESC);
CREATE INDEX IF NOT EXISTS idx_ticks_time ON ticks (time DESC);
