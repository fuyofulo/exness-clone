import { kafka } from './index';
import { Producer, Partitioners } from 'kafkajs';

let producer: Producer | null = null

export async function getProducer(): Promise<Producer> {
    if(!producer) {
        producer = kafka.producer({
            createPartitioner: Partitioners.LegacyPartitioner
        });
        await producer.connect();
        console.log('kafka producer connected');
    }
    return producer;
}

export async function sendMessage(
    topic: string,
    message: any,
    key?: string
): Promise<void> {
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
    } catch (error) {
        console.error('error sending message', error);
        throw error;
    }
}

export async function disconnectProducer(): Promise<void> {
    if(producer) {
        await producer.disconnect();
        producer = null;
        console.log('kafka producer disconnected');
    }
}