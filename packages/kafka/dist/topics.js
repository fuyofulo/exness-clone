"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdmin = getAdmin;
exports.createTopic = createTopic;
exports.listTopics = listTopics;
exports.deleteTopic = deleteTopic;
const index_1 = require("./index");
let admin = null;
async function getAdmin() {
    if (!admin) {
        admin = index_1.kafka.admin();
        await admin.connect();
        console.log('🔧 Kafka admin connected');
    }
    return admin;
}
async function createTopic(topic, partitions = 3, replicationFactor = 1) {
    const adm = await getAdmin();
    try {
        await adm.createTopics({
            topics: [{
                    topic,
                    numPartitions: partitions,
                    replicationFactor
                }]
        });
        console.log(`🔧 Created topic: ${topic}`);
    }
    catch (error) {
        if (error.message.includes('already exists')) {
            console.log(`🔧 Topic ${topic} already exists`);
        }
        else {
            console.error(`❌ Failed to create topic ${topic}:`, error);
            throw error;
        }
    }
}
async function listTopics() {
    const adm = await getAdmin();
    return await adm.listTopics();
}
async function deleteTopic(topic) {
    const adm = await getAdmin();
    await adm.deleteTopics({ topics: [topic] });
    console.log(`🔧 Deleted topic: ${topic}`);
}
//# sourceMappingURL=topics.js.map