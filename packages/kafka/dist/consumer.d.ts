import { Consumer, ConsumerConfig } from 'kafkajs';
export declare function createConsumer(groupId: string, config?: Partial<ConsumerConfig>): Promise<Consumer>;
export declare function subscribeToTopic(consumer: Consumer, topic: string, fromBeginning: boolean): Promise<void>;
export declare function startConsuming(consumer: Consumer, handler: (message: any) => Promise<void>): Promise<void>;
export declare function disconnectConsumer(consumer: Consumer): Promise<void>;
//# sourceMappingURL=consumer.d.ts.map