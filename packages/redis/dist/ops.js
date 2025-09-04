"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rPublish = rPublish;
exports.rSubscribe = rSubscribe;
const index_1 = require("./index");
// publish
async function rPublish(channel, data) {
    const r = (0, index_1.getRedis)();
    return r.publish(channel, JSON.stringify(data));
}
// subscribe (uses a dedicated subscriber connection)
async function rSubscribe(channel, callback) {
    const base = (0, index_1.getRedis)();
    const sub = base.duplicate();
    await sub.connect();
    await sub.subscribe(channel, (message) => {
        callback(message);
    });
    // optional: return an unsubscribe/cleanup function
    return async () => {
        try {
            await sub.unsubscribe(channel);
        }
        finally {
            await sub.quit();
        }
    };
}
//# sourceMappingURL=ops.js.map