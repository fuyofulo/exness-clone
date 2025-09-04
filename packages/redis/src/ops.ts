import { getRedis } from "./index";

// publish
export async function rPublish(channel: string, data: any) {
    const r = getRedis();
    return r.publish(channel, JSON.stringify(data));
}

// subscribe (uses a dedicated subscriber connection)
export async function rSubscribe(channel: string, callback: (message: string) => void) {
    const base = getRedis();
    const sub = base.duplicate();
    await sub.connect();
    await sub.subscribe(channel, (message) => {
        callback(message);
    });
    // optional: return an unsubscribe/cleanup function
    return async () => {
        try {
            await sub.unsubscribe(channel);
        } finally {
            await sub.quit();
        }
    };
}
