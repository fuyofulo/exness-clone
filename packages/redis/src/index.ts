import { createClient, RedisClientType } from 'redis';
import { REDIS_URL } from 'secrets';

let redisclient: RedisClientType | null = null;
let isConnected = false;

export async function connectRedis() {

    if (isConnected && redisclient) return;

    redisclient = createClient({ url: REDIS_URL as any });
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

export function getRedis(): RedisClientType {
    if(!redisclient) throw new Error('redis not initialized, call connectRedis() first');
    return redisclient;
}

export * from './ops';
export * from './price';