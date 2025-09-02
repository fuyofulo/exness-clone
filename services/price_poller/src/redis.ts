// import {createClient} from 'redis';
// import { REDIS_URL } from 'secrets';

// if (!REDIS_URL) {
//     throw new Error('REDIS_URL is not set');
// }

// let redis: any;

// export async function connectToRedis() {
//     redis = createClient({ url: REDIS_URL as any });
//     redis.on('error', (err: any) => console.error('Redis client error:', err));
//     await redis.connect();
//     console.log('Redis connected');
// }


// export async function publishPrice(channel: string, data: any) {
//     await redis.publish(channel, JSON.stringify(data));
//     console.log(`Published price to Redis: ${channel}`);
// }
