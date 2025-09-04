"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertLatestPrice = upsertLatestPrice;
exports.getlatestPrice = getlatestPrice;
const index_1 = require("./index");
const PRICE_CHANNEL = 'price_updates';
function priceKey(symbol) {
    return `price:${symbol}`;
}
async function upsertLatestPrice(payload, ttlSeconds = 15) {
    const r = (0, index_1.getRedis)();
    const key = priceKey(payload.symbol);
    const json = JSON.stringify(payload);
    const tx = r.multi();
    tx.publish(PRICE_CHANNEL, json);
    tx.setEx(key, ttlSeconds, json);
    const result = await tx.exec();
    return result;
}
async function getlatestPrice(symbol) {
    const r = (0, index_1.getRedis)();
    const s = await r.get(priceKey(symbol));
    return s ? JSON.parse(s) : null;
}
//# sourceMappingURL=price.js.map