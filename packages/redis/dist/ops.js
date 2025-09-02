"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rPublish = rPublish;
const index_1 = require("./index");
// used in price poller to publish price
async function rPublish(channel, data) {
    const r = (0, index_1.getRedis)();
    return r.publish(channel, JSON.stringify(data));
}
//# sourceMappingURL=ops.js.map