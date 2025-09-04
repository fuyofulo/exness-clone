import { Producer } from 'kafkajs';
export declare function getProducer(): Promise<Producer>;
export declare function sendMessage(topic: string, message: any, key?: string): Promise<void>;
export declare function disconnectProducer(): Promise<void>;
//# sourceMappingURL=producer.d.ts.map