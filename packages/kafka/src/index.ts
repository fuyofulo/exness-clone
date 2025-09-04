import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID } from 'secrets';

if (!KAFKA_BROKERS) {
  throw new Error('KAFKA_BROKERS environment variable is not set');
}

// Create the Kafka instance
const kafkaConfig: KafkaConfig = {
  clientId: KAFKA_CLIENT_ID || 'default-client',
  brokers: (KAFKA_BROKERS || 'localhost:9092').split(',').map(b => b.trim())
};

const kafka = new Kafka(kafkaConfig);

// Connection state
let isConnected = false;

// Export the Kafka instance
export { kafka };

// Export connection function
export async function connectKafka(): Promise<void> {
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
  } catch (error) {
    console.error('❌ Failed to connect to Kafka:', error);
    throw error;
  }
}

// Export connection status
export function isKafkaConnected(): boolean {
  return isConnected;
}

export * from './producer';
export * from './consumer';
export * from './topics';