"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.getRedis = getRedis;
const redis_1 = require("redis");
const secrets_1 = require("secrets");
let redisclient = null;
let isConnected = false;
async function connectRedis() {
    if (isConnected && redisclient)
        return;
    redisclient = (0, redis_1.createClient)({ url: secrets_1.REDIS_URL });
    redisclient.on('error', (err) => {
        console.error('redis client error', err);
        isConnected = false;
    });
    redisclient.on('connect', () => {
        console.log('redis connected');
        isConnected = true;
    });
    await redisclient.connect();
}
function getRedis() {
    if (!redisclient)
        throw new Error('redis not initialized, call connectRedis() first');
    return redisclient;
}
__exportStar(require("./ops"), exports);
//# sourceMappingURL=index.js.map