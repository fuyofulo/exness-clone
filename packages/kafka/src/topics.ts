import { kafka } from './index';
import { Admin } from 'kafkajs';

let admin: Admin | null = null;

export async function getAdmin(): Promise<Admin> {
  if (!admin) {
    admin = kafka.admin();
    await admin.connect();
    console.log('🔧 Kafka admin connected');
  }
  return admin;
}

export async function createTopic(
  topic: string,
  partitions = 3,
  replicationFactor = 1
): Promise<void> {
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
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log(`🔧 Topic ${topic} already exists`);
    } else {
      console.error(`❌ Failed to create topic ${topic}:`, error);
      throw error;
    }
  }
}

export async function listTopics(): Promise<string[]> {
  const adm = await getAdmin();
  return await adm.listTopics();
}

export async function deleteTopic(topic: string): Promise<void> {
  const adm = await getAdmin();
  await adm.deleteTopics({ topics: [topic] });
  console.log(`🔧 Deleted topic: ${topic}`);
}