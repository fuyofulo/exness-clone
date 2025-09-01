import { Kafka, Producer, Partitioners} from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID } from 'secrets';

if (!KAFKA_BROKERS) {
    throw new Error('KAFKA_BROKERS is not set');
}
if (!KAFKA_CLIENT_ID) {
    throw new Error('KAFKA_CLIENT_ID is not set');
}

console.log(KAFKA_BROKERS, KAFKA_CLIENT_ID);

const kafka = new Kafka({
    clientId: KAFKA_CLIENT_ID,
    brokers: [KAFKA_BROKERS],
});

let producer: Producer;

export async function connectToKafka() {
    producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
    await producer.connect();
    console.log('Kafka connected');
}

export async function pushTradeData(topic: string, data: any) {
    try {
        await producer.send({
            topic,
            messages: [
                {
                    key: data.asset ?? data.symbol,
                    value: JSON.stringify(data)
                }
            ]
        });
        console.log(`Sent data to Kafka: ${topic}`);
    } catch (error) {
        console.error(`Error sending data to Kafka: ${error}`);
    }
}

