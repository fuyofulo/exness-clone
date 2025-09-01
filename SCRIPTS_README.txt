================================================================================
EXNESS TRADING PLATFORM - SCRIPTS DOCUMENTATION
================================================================================

This document explains how to use all the scripts in the Exness trading platform.

Table of Contents:
1. Quick Start Guide
2. Script Overview
3. Detailed Usage Instructions
4. Troubleshooting

================================================================================
1. QUICK START GUIDE
================================================================================

# First time setup:
1. Start all services: docker-compose up -d
2. Reset database: docker-compose run --rm admin
3. Load commands: source scripts/commands.sh
4. Test everything: test_all

# Daily usage:
- Load commands: source scripts/commands.sh
- Check status: db_status
- View data: ./scripts/view_candles.sh

================================================================================
2. SCRIPT OVERVIEW
================================================================================

SCRIPTS DIRECTORY CONTENTS:
├── commands.sh      - Main helper script (source this first!)
├── reset_ticks.sh   - Database reset/recreation script
└── view_candles.sh  - View OHLC candle data

================================================================================
3. DETAILED USAGE INSTRUCTIONS
================================================================================

===============================================================================
3.1 COMMANDS.SH - MAIN HELPER SCRIPT
===============================================================================

DESCRIPTION:
This is the primary script you should use. It contains many helper functions
for database operations, Kafka management, service control, and development.

USAGE:
source scripts/commands.sh    # Load all commands into your shell
help                          # Show all available commands

AVAILABLE COMMANDS:

DATABASE COMMANDS:
------------------
db_status              - Check database status and table counts
                        Shows: container status, connection test, table stats

db_reset               - Reset database (drop and recreate tables)
                        Runs: docker-compose run --rm admin

db_clear_bad           - Clear bad data (future timestamps)
                        Removes ticks/ohlc with timestamps > NOW()

db_recent_trades       - Show recent trades from ticks table
                        Displays: asset, time, price, qty, decimals (last 10)

db_recent_ohlc         - Show recent OHLC candles
                        Displays: symbol, bucket, open, close, volume, is_closed (last 10)

db_aggregates          - Check continuous aggregates status
                        Shows count for: 5m, 15m, 1h, 4h, 1d candles

db_refresh_aggregates  - Refresh continuous aggregates
                        Forces refresh of all OHLC views

KAFKA COMMANDS:
---------------
kafka_status           - Check Kafka status and topics
                        Shows: zookeeper/kafka status, topic list

kafka_create_topic     - Create Kafka topic (default: 'ticks')
                        Usage: kafka_create_topic [topic_name]

kafka_consumer_groups  - Show consumer groups
                        Lists all active Kafka consumer groups

SERVICE COMMANDS:
-----------------
start_all              - Start all Docker services
                        Runs: docker-compose up -d

stop_all               - Stop all Docker services
                        Runs: docker-compose down

restart_all            - Restart all Docker services
                        Runs: docker-compose down + docker-compose up -d

logs [service]         - Show service logs
                        Usage: logs [service_name] or logs (for all)

logs_follow [service]  - Follow service logs (real-time)
                        Usage: logs_follow [service_name] or logs_follow (for all)

DEVELOPMENT COMMANDS:
---------------------
start_poller           - Build and start price poller
                        Runs: cd services/price_poller && npm run build && npm start

start_uploader         - Build and start batch uploader
                        Runs: cd services/batch_uploader && npm run build && npm start

test_all               - Run quick tests (database, Kafka, data)
                        Comprehensive health check

UTILITY COMMANDS:
-----------------
help                   - Show all available commands

===============================================================================
3.2 RESET_TICKS.SH - DATABASE RESET SCRIPT
===============================================================================

DESCRIPTION:
Script to reset/recreate database tables and views. Used by the 'admin' container.

MODES:
drop      - Drop and recreate everything (default)
truncate  - Clear data but keep structure
create    - Create if not exists

USAGE:
# Via Docker Compose (recommended):
docker-compose run --rm admin

# Direct execution:
./scripts/reset_ticks.sh

# With specific mode:
RESET_MODE=truncate ./scripts/reset_ticks.sh

WHAT IT DOES:
- Waits for PostgreSQL to be ready
- Drops existing tables and views (if mode=drop)
- Executes SQL files:
  * packages/database/sql/ticks_table.sql
  * packages/database/sql/continuous_aggregates.sql
- Creates hypertable for ticks
- Creates continuous aggregates for OHLC candles

===============================================================================
3.3 VIEW_CANDLES.SH - CANDLE DATA VIEWER
===============================================================================

DESCRIPTION:
Quick script to view OHLC candle data across different timeframes.

USAGE:
./scripts/view_candles.sh

WHAT IT SHOWS:
- Available tables and views
- Recent 1-minute candles (BTCUSDT, last 5)
- Recent 5-minute candles (BTCUSDT, last 3)
- Recent 1-hour candles (BTCUSDT, last 2)
- Recent 1-day candles (BTCUSDT, last 1)
- Symbol statistics (candle counts by symbol)

================================================================================
4. TROUBLESHOOTING
================================================================================

===============================================================================
4.1 COMMON ISSUES AND SOLUTIONS
===============================================================================

ISSUE: "Database connection failed"
SOLUTION:
- Check if containers are running: docker ps
- Restart services: restart_all
- Check logs: logs postgres

ISSUE: "Kafka is not running"
SOLUTION:
- Check container status: docker ps | grep kafka
- Restart Kafka: docker-compose restart kafka-exness
- Check logs: logs kafka-exness

ISSUE: "No data in tables"
SOLUTION:
- Check if price_poller is running: docker ps | grep price_poller
- Check logs: logs price_poller
- Reset database: db_reset
- Check Kafka topics: kafka_status

ISSUE: "OHLC views are empty"
SOLUTION:
- Wait for continuous aggregates to refresh (usually 1-2 minutes)
- Force refresh: db_refresh_aggregates
- Check if ticks table has data: db_recent_trades

ISSUE: "Permission denied" or "authentication failed"
SOLUTION:
- Check environment variables in docker-compose.yml
- Ensure POSTGRES_PASSWORD is set correctly
- Restart containers: restart_all

===============================================================================
4.2 DEBUGGING STEPS
===============================================================================

1. Quick Health Check:
   source scripts/commands.sh
   test_all

2. Check Individual Components:
   - Database: db_status
   - Kafka: kafka_status
   - Services: docker ps
   - Logs: logs [service_name]

3. Reset Everything:
   stop_all
   docker system prune -f
   start_all
   db_reset

4. Check Environment:
   - docker-compose.yml configuration
   - packages/secrets/.env file
   - Database connection strings

===============================================================================
4.3 LOG FILES TO CHECK
===============================================================================

- Price Poller: logs price_poller
- Batch Uploader: logs batch_uploader
- Database: logs postgres
- Kafka: logs kafka-exness
- Zookeeper: logs zookeeper

================================================================================
5. DAILY WORKFLOW
================================================================================

MORNING STARTUP:
1. source scripts/commands.sh    # Load commands
2. start_all                     # Start all services
3. db_status                     # Check database
4. kafka_status                  # Check Kafka
5. test_all                      # Quick health check

MONITORING:
- db_recent_trades              # Check data flow
- ./scripts/view_candles.sh     # View candle data
- logs_follow                   # Monitor logs

MAINTENANCE:
- db_clear_bad                  # Clean bad data
- db_refresh_aggregates         # Update views
- db_status                     # Check stats

SHUTDOWN:
- stop_all                      # Stop everything
- docker system prune -f        # Clean up (optional)

================================================================================
6. DATA FLOW OVERVIEW
================================================================================

1. Binance WebSocket → Price Poller
   - Receives real-time trade data
   - Scales prices (multiplies by 10^8)
   - Sends to Kafka topic 'ticks'

2. Kafka → Batch Uploader
   - Consumes from 'ticks' topic
   - Batches data (100 ticks)
   - Inserts into PostgreSQL 'ticks' table

3. TimescaleDB Continuous Aggregates
   - Automatically create OHLC candles
   - 6 timeframes: 1m, 5m, 15m, 1h, 4h, 1d
   - Refresh every few minutes

4. Query Layer
   - Use view_candles.sh to see data
   - Query ohlc_1m, ohlc_5m, etc. tables
   - Real-time data available

================================================================================
END OF DOCUMENTATION
================================================================================

For more help:
- Run 'source scripts/commands.sh && help'
- Check individual script comments
- Review docker-compose.yml for service configuration
