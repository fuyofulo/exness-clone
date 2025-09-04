import { kafka } from './index';
import { Consumer, ConsumerConfig } from 'kafkajs';

export async function createConsumer(
    groupId: string,
    config?: Partial<ConsumerConfig>
): Promise<Consumer> {
    const consumer = kafka.consumer({
        groupId,
        ...config
    })

    await consumer.connect();
    console.log(`kafka consumer connected (group: ${groupId})`);
    return consumer;
}

export async function subscribeToTopic(
    consumer: Consumer,
    topic: string,
    fromBeginning: boolean
): Promise<void> {
    await consumer.subscribe({ topic, fromBeginning });
    console.log(`kafka consumer subscribed to topic: ${topic}`);
}

export async function startConsuming(
    consumer: Consumer,
    handler: (message: any) => Promise<void>
): Promise<void> {
    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const parsedMessage = JSON.parse(message.value?.toString() || '{}');
                await handler(parsedMessage);
            } catch (error) {
                console.error('error processing message', error);
                throw error;
            }
        }
    })
};

export async function disconnectConsumer(consumer: Consumer): Promise<void> {
    await consumer.disconnect();
    console.log('📥 Kafka consumer disconnected');
}