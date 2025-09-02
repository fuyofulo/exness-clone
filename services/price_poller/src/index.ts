import WebSocket from 'ws';
import { connectRedis, rPublish } from 'exness_redis';
import { connectToKafka, pushTradeData } from './kafka';

const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt'];

const SPREAD = 0.01;                   // 1% spread
const HALF_SPREAD = SPREAD / 2;        // 0.5% spread on both sides

function checkDecimals (value: string) {
    if (!value.includes('.')) {
        return 0
    } else {
        return value.split('.')[1]!.length;
    }
}

async function startTradesPoller (symbols: string[]) {

    const tradesStreams = symbols.map(symbol => `${symbol}@trade`);
    const trades_ws = new WebSocket(`wss://stream.binance.com:9443/ws/${tradesStreams.join('/')}`);

    trades_ws.on('open', () => console.log('Trades WebSocket connected'));

    trades_ws.on('message', async (data) =>  {
        try {
            const message = JSON.parse(data.toString());

            // console.log(message);

            const tradeData = {
                symbol: message.s,
                price: (message.p),
                quantity: (message.q),
                timestamp: message.T,
                isBuyerMarketMaker: message.m
            }

            const rawPrice = parseFloat(message.p);
            if (!Number.isFinite(rawPrice)) {
                console.error("Invalid price from Binance:", message.p);
                return;
            }            
            const decimals = checkDecimals(message.p);
            const scaledPrice = Math.round(rawPrice * (10 ** decimals));
            
            const buyPrice = Math.round(scaledPrice * (1 + HALF_SPREAD));
            const sellPrice = Math.round(scaledPrice * (1 - HALF_SPREAD));


            // send data to redis pub/sub 
            const newPrice = {
                symbol: tradeData.symbol,
                price: scaledPrice,
                buyPrice: buyPrice,
                sellPrice: sellPrice,
                decimals,
                timestamp: tradeData.timestamp,
            }

            await rPublish(`${tradeData.symbol}`, newPrice);
    
            // send data to kafka queue
            const tickData = {
                symbol: message.s,
                trade_id: message.t,
                price: scaledPrice,
                qty: parseFloat(message.q),
                time: message.T,
                decimals: decimals,
                is_buyer_maker: message.m
            }; 

            await pushTradeData(`ticks`, tickData);

        } catch (error) {
            console.log('error', error);
        }

    })
}

connectRedis();
connectToKafka();
startTradesPoller(SYMBOLS);