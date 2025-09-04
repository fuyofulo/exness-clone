import { connectRedis, rSubscribe, upsertLatestPrice } from 'exness_redis';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

export type LatestPrice = {
    symbol: string;
    price: number;
    decimals: number;
    buyPrice: number;
    sellPrice: number;
    timestamp: number;
}

async function main() {
    await connectRedis();
    
    for (const s of SYMBOLS) {
        await rSubscribe(s, async (message) => {
            const latestPrice = JSON.parse(message) as LatestPrice;
            const price = await upsertLatestPrice(latestPrice);
            console.log(`Upserted latest price for ${s}`);
        }); 
    }
}

main();


