import { Admin } from 'kafkajs';
export declare function getAdmin(): Promise<Admin>;
export declare function createTopic(topic: string, partitions?: number, replicationFactor?: number): Promise<void>;
export declare function listTopics(): Promise<string[]>;
export declare function deleteTopic(topic: string): Promise<void>;
//# sourceMappingURL=topics.d.ts.map