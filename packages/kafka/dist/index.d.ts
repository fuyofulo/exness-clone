import { Kafka } from 'kafkajs';
declare const kafka: Kafka;
export { kafka };
export declare function connectKafka(): Promise<void>;
export declare function isKafkaConnected(): boolean;
export * from './producer';
export * from './consumer';
export * from './topics';
//# sourceMappingURL=index.d.ts.map