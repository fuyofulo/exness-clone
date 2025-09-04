"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducer = getProducer;
exports.sendMessage = sendMessage;
exports.disconnectProducer = disconnectProducer;
const index_1 = require("./index");
const kafkajs_1 = require("kafkajs");
let producer = null;
async function getProducer() {
    if (!producer) {
        producer = index_1.kafka.producer({
            createPartitioner: kafkajs_1.Partitioners.LegacyPartitioner
        });
        await producer.connect();
        console.log('kafka producer connected');
    }
    return producer;
}
async function sendMessage(topic, message, key) {
    const prod = await getProducer();
    try {
        await prod.send({
            topic,
            messages: [{
                    key: key || message.symbol || message.id || 'default',
                    value: JSON.stringify(message)
                }]
        });
        console.log(`sent message to topic ${topic}`);
    }
    catch (error) {
        console.error('error sending message', error);
        throw error;
    }
}
async function disconnectProducer() {
    if (producer) {
        await producer.disconnect();
        producer = null;
        console.log('kafka producer disconnected');
    }
}
//# sourceMappingURL=producer.js.map