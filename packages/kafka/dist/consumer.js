"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsumer = createConsumer;
exports.subscribeToTopic = subscribeToTopic;
exports.startConsuming = startConsuming;
exports.disconnectConsumer = disconnectConsumer;
const index_1 = require("./index");
async function createConsumer(groupId, config) {
    const consumer = index_1.kafka.consumer({
        groupId,
        ...config
    });
    await consumer.connect();
    console.log(`kafka consumer connected (group: ${groupId})`);
    return consumer;
}
async function subscribeToTopic(consumer, topic, fromBeginning) {
    await consumer.subscribe({ topic, fromBeginning });
    console.log(`kafka consumer subscribed to topic: ${topic}`);
}
async function startConsuming(consumer, handler) {
    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const parsedMessage = JSON.parse(message.value?.toString() || '{}');
                await handler(parsedMessage);
            }
            catch (error) {
                console.error('error processing message', error);
                throw error;
            }
        }
    });
}
;
async function disconnectConsumer(consumer) {
    await consumer.disconnect();
    console.log('📥 Kafka consumer disconnected');
}
//# sourceMappingURL=consumer.js.map