import { getRedis } from "./index";

export type LatestPrice = {
    symbol: string;
    price: number;
    decimals: number;
    buyPrice: number;
    sellPrice: number;
    timestamp: number;
}

const PRICE_CHANNEL = 'price_updates';

function priceKey(symbol: string) {
    return `price:${symbol}`;
}

export async function upsertLatestPrice(
    payload: LatestPrice,
    ttlSeconds = 15
) {
    console.log('inside upsertLatestPrice');
    const r = getRedis();
    console.log('redis client', r);
    const key = priceKey(payload.symbol);
    const json = JSON.stringify(payload);

    console.log('key', key);
    console.log('json', json);

    const tx = r.multi();
    tx.publish(PRICE_CHANNEL, json);
    tx.setEx(key, ttlSeconds, json);
    const result = await tx.exec();
    console.log('result', result);
    return result;
}

export async function getlatestPrice(symbol: string) {
    const r = getRedis();
    const s = await r.get(priceKey(symbol));
    return s ? JSON.parse(s) as LatestPrice : null;
}