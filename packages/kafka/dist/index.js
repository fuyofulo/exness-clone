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
exports.kafka = void 0;
exports.connectKafka = connectKafka;
exports.isKafkaConnected = isKafkaConnected;
const kafkajs_1 = require("kafkajs");
const secrets_1 = require("secrets");
if (!secrets_1.KAFKA_BROKERS) {
    throw new Error('KAFKA_BROKERS environment variable is not set');
}
// Create the Kafka instance
const kafkaConfig = {
    clientId: secrets_1.KAFKA_CLIENT_ID || 'default-client',
    brokers: (secrets_1.KAFKA_BROKERS || 'localhost:9092').split(',').map(b => b.trim())
};
const kafka = new kafkajs_1.Kafka(kafkaConfig);
exports.kafka = kafka;
// Connection state
let isConnected = false;
// Export connection function
async function connectKafka() {
    if (isConnected) {
        console.log('📡 Kafka already connected');
        return;
    }
    try {
        // Test connection by creating a producer
        const testProducer = kafka.producer();
        await testProducer.connect();
        await testProducer.disconnect();
        isConnected = true;
        console.log('✅ Kafka connected successfully');
    }
    catch (error) {
        console.error('❌ Failed to connect to Kafka:', error);
        throw error;
    }
}
// Export connection status
function isKafkaConnected() {
    return isConnected;
}
__exportStar(require("./producer"), exports);
__exportStar(require("./consumer"), exports);
__exportStar(require("./topics"), exports);
//# sourceMappingURL=index.js.map