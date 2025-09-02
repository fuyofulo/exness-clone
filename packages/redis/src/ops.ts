import { getRedis } from "./index";


// used in price poller to publish price
export async function rPublish(channel: string, data: any) {
    const r = getRedis();
    return r.publish(channel, JSON.stringify(data));
}

