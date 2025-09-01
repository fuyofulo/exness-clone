#!/bin/bash

# =============================================================================
# EXNESS TRADING PLATFORM - HELPER COMMANDS
# =============================================================================
# Usage: source scripts/commands.sh
# Then run any command like: db_status, kafka_status, etc.
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Database connection details
DB_USER=${POSTGRES_USER:-postgres}
DB_PASS=${POSTGRES_PASSWORD:-postgres}
DB_NAME=${POSTGRES_DB:-exness}
DB_HOST=postgres

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

# Check database status
db_status() {
    echo -e "${BLUE}📊 Database Status${NC}"
    echo "=================="
    
    # Check if postgres container is running
    if docker ps | grep -q "postgres"; then
        echo -e "${GREEN}✅ PostgreSQL container is running${NC}"
    else
        echo -e "${RED}❌ PostgreSQL container is not running${NC}"
        return 1
    fi
    
    # Test connection
    if docker exec postgres psql -U $DB_USER -d $DB_NAME -c "SELECT NOW();" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        return 1
    fi
    
    # Show table counts
    echo -e "\n${CYAN}📈 Table Statistics:${NC}"
    docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
        SELECT 
            'ticks' as table_name,
            COUNT(*) as row_count,
            MIN(time) as earliest,
            MAX(time) as latest
        FROM ticks
        UNION ALL
        SELECT 
            'ohlc_1m' as table_name,
            COUNT(*) as row_count,
            MIN(bucket) as earliest,
            MAX(bucket) as latest
        FROM ohlc_1m;
    "
}

# Reset database (drop and recreate tables)
db_reset() {
    echo -e "${YELLOW}🗑️ Resetting database...${NC}"
    docker compose up admin --abort-on-container-exit
    echo -e "${GREEN}✅ Database reset complete${NC}"
}

# Clear bad data (future timestamps)
db_clear_bad() {
    echo -e "${YELLOW}🧹 Clearing bad data (future timestamps)...${NC}"
    docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
        DELETE FROM ticks WHERE time > NOW();
        DELETE FROM ohlc_1m WHERE bucket > NOW();
    "
    echo -e "${GREEN}✅ Bad data cleared${NC}"
}

# Show recent trades
db_recent_trades() {
    echo -e "${CYAN}📊 Recent Trades:${NC}"
    docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
        SELECT 
            symbol,
            time,
            price,
            qty,
            decimals
        FROM ticks 
        ORDER BY time DESC 
        LIMIT 10;
    "
}

# Show recent OHLC candles
db_recent_ohlc() {
    echo -e "${CYAN}📈 Recent OHLC Candles:${NC}"
    docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
        SELECT
            symbol,
            bucket,
            open,
            high,
            low,
            close,
            volume,
            trade_count
        FROM ohlc_1m
        ORDER BY bucket DESC
        LIMIT 10;
    "
}

# Check continuous aggregates
db_aggregates() {
    echo -e "${CYAN}📊 Continuous Aggregates:${NC}"
    docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
        SELECT 
            '5m' as timeframe, COUNT(*) as count FROM ohlc_5m
        UNION ALL
        SELECT '15m', COUNT(*) FROM ohlc_15m
        UNION ALL
        SELECT '1h', COUNT(*) FROM ohlc_1h
        UNION ALL
        SELECT '4h', COUNT(*) FROM ohlc_4h
        UNION ALL
        SELECT '1d', COUNT(*) FROM ohlc_1d
        ORDER BY timeframe;
    "
}

# Refresh continuous aggregates
db_refresh_aggregates() {
    echo -e "${YELLOW}🔄 Refreshing continuous aggregates...${NC}"
    docker exec postgres psql -U $DB_USER -d $DB_NAME -c "
        CALL refresh_continuous_aggregate('ohlc_5m', NULL, NULL);
        CALL refresh_continuous_aggregate('ohlc_15m', NULL, NULL);
        CALL refresh_continuous_aggregate('ohlc_1h', NULL, NULL);
        CALL refresh_continuous_aggregate('ohlc_4h', NULL, NULL);
        CALL refresh_continuous_aggregate('ohlc_1d', NULL, NULL);
    "
    echo -e "${GREEN}✅ Continuous aggregates refreshed${NC}"
}

# =============================================================================
# KAFKA COMMANDS
# =============================================================================

# Check Kafka status
kafka_status() {
    echo -e "${BLUE}📡 Kafka Status${NC}"
    echo "==============="
    
    # Check if containers are running
    if docker ps | grep -q "zookeeper"; then
        echo -e "${GREEN}✅ Zookeeper is running${NC}"
    else
        echo -e "${RED}❌ Zookeeper is not running${NC}"
    fi
    
    if docker ps | grep -q "kafka-exness"; then
        echo -e "${GREEN}✅ Kafka is running${NC}"
    else
        echo -e "${RED}❌ Kafka is not running${NC}"
    fi
    
    # List topics
    echo -e "\n${CYAN}📋 Kafka Topics:${NC}"
    docker exec kafka-exness kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null || echo "Could not list topics"
}

# Create Kafka topic
kafka_create_topic() {
    local topic=${1:-ticks}
    echo -e "${YELLOW}📝 Creating Kafka topic: $topic${NC}"
    docker exec kafka-exness kafka-topics --create --bootstrap-server localhost:9092 --topic $topic --partitions 3 --replication-factor 1 2>/dev/null || echo "Topic might already exist"
    echo -e "${GREEN}✅ Topic creation attempted${NC}"
}

# Show Kafka consumer groups
kafka_consumer_groups() {
    echo -e "${CYAN}👥 Kafka Consumer Groups:${NC}"
    docker exec kafka-exness kafka-consumer-groups --bootstrap-server localhost:9092 --list 2>/dev/null || echo "Could not list consumer groups"
}

# =============================================================================
# SERVICE COMMANDS
# =============================================================================

# Start all services
start_all() {
    echo -e "${BLUE}🚀 Starting all services...${NC}"
    docker compose up -d
    echo -e "${GREEN}✅ All services started${NC}"
}

# Stop all services
stop_all() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    docker compose down
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Restart all services
restart_all() {
    echo -e "${PURPLE}🔄 Restarting all services...${NC}"
    docker compose down
    docker compose up -d
    echo -e "${GREEN}✅ All services restarted${NC}"
}

# Show service logs
logs() {
    local service=${1:-}
    if [ -z "$service" ]; then
        echo -e "${CYAN}📋 All service logs:${NC}"
        docker compose logs
    else
        echo -e "${CYAN}📋 Logs for $service:${NC}"
        docker compose logs $service
    fi
}

# Follow service logs
logs_follow() {
    local service=${1:-}
    if [ -z "$service" ]; then
        echo -e "${CYAN}📋 Following all service logs:${NC}"
        docker compose logs -f
    else
        echo -e "${CYAN}📋 Following logs for $service:${NC}"
        docker compose logs -f $service
    fi
}

# =============================================================================
# DEVELOPMENT COMMANDS
# =============================================================================

# Build and start price poller
start_poller() {
    echo -e "${BLUE}📡 Starting Price Poller...${NC}"
    cd services/price_poller
    npm run build && npm start
}

# Build and start batch uploader
start_uploader() {
    echo -e "${BLUE}📤 Starting Batch Uploader...${NC}"
    cd services/batch_uploader
    npm run build && npm start
}

# Quick test - check everything
test_all() {
    echo -e "${BLUE}🧪 Running quick tests...${NC}"
    echo "========================"
    
    # Test database
    echo -e "${CYAN}1. Testing database...${NC}"
    db_status
    
    # Test Kafka
    echo -e "\n${CYAN}2. Testing Kafka...${NC}"
    kafka_status
    
    # Test recent data
    echo -e "\n${CYAN}3. Checking recent data...${NC}"
    db_recent_trades
    
    echo -e "\n${GREEN}✅ All tests complete${NC}"
}

# =============================================================================
# UTILITY COMMANDS
# =============================================================================

# Show all available commands
help() {
    echo -e "${BLUE}📚 Available Commands:${NC}"
    echo "======================"
    echo ""
    echo -e "${CYAN}Database Commands:${NC}"
    echo "  db_status              - Check database status and table counts"
    echo "  db_reset               - Reset database (drop and recreate tables)"
    echo "  db_clear_bad           - Clear bad data (future timestamps)"
    echo "  db_recent_trades       - Show recent trades"
    echo "  db_recent_ohlc         - Show recent OHLC candles"
    echo "  db_aggregates          - Check continuous aggregates"
    echo "  db_refresh_aggregates  - Refresh continuous aggregates"
    echo ""
    echo -e "${CYAN}Kafka Commands:${NC}"
    echo "  kafka_status           - Check Kafka status and topics"
    echo "  kafka_create_topic     - Create Kafka topic"
    echo "  kafka_consumer_groups  - Show consumer groups"
    echo ""
    echo -e "${CYAN}Service Commands:${NC}"
    echo "  start_all              - Start all Docker services"
    echo "  stop_all               - Stop all Docker services"
    echo "  restart_all            - Restart all Docker services"
    echo "  logs [service]         - Show service logs"
    echo "  logs_follow [service]  - Follow service logs"
    echo ""
    echo -e "${CYAN}Development Commands:${NC}"
    echo "  start_poller           - Build and start price poller"
    echo "  start_uploader         - Build and start batch uploader"
    echo "  test_all               - Run quick tests"
    echo ""
    echo -e "${CYAN}Utility Commands:${NC}"
    echo "  help                   - Show this help message"
    echo ""
    echo -e "${YELLOW}Usage: source scripts/commands.sh${NC}"
    echo -e "${YELLOW}Then run any command like: db_status, kafka_status, etc.${NC}"
}

# =============================================================================
# INITIALIZATION
# =============================================================================

echo -e "${GREEN}✅ Exness Trading Platform Commands Loaded${NC}"
echo -e "${YELLOW}Run 'help' to see all available commands${NC}"
