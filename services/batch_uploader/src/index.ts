import { Kafka } from 'kafkajs';
import { Pool } from 'pg';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID, DATABASE_URL } from 'secrets';

const pool = new Pool({ connectionString: DATABASE_URL });
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID || 'batch-uploader',
  brokers: (KAFKA_BROKERS || 'localhost:9092').split(',').map(b => b.trim())
});

const consumer = kafka.consumer({ groupId: 'batch-uploader-group' });
let tickBuffer: any[] = [];
const BATCH_SIZE = 1000;  // Increased for better performance
const FLUSH_INTERVAL = 5000; // 5 seconds instead of 2

// Performance monitoring
let totalTicksReceived = 0;
let totalTicksInserted = 0;
let totalBatchesProcessed = 0;

// Insert function
async function batchInsertTicks(rows: any[]) {
  if (rows.length === 0) return;

  const client = await pool.connect();
  try {
    const placeholders = rows.map((_, i) => {
      const base = i * 7;
      return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7})`;
    }).join(',');

    const values = rows.flatMap(r => [
      r.time,
      r.symbol,
      r.price,
      r.qty,
      r.decimals,
      r.trade_id,
      r.is_buyer_maker 
    ]);
    // console.log(values);

    const sql = `
    INSERT INTO ticks (time, symbol, price, qty, decimals, trade_id, is_buyer_maker)
    VALUES ${placeholders}
      ON CONFLICT (symbol, trade_id, time) DO NOTHING
    `;
    await client.query(sql, values);
    totalTicksInserted += rows.length;
    totalBatchesProcessed += 1;

    const avgBatchSize = Math.round(totalTicksInserted / totalBatchesProcessed);
    console.log(`✅ Batch inserted ${rows.length} ticks | Total received: ${totalTicksReceived} | Total inserted: ${totalTicksInserted} | Avg batch: ${avgBatchSize}`);
  } finally {
    client.release();
  }
}

// Flush buffer
async function flushBuffer() {
  if (tickBuffer.length > 0) {
    await batchInsertTicks([...tickBuffer]);
    tickBuffer = [];
  }
}

// Start consumer
async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'ticks', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const tick = JSON.parse(message.value!.toString());
        totalTicksReceived += 1; // Count incoming ticks

        tickBuffer.push({
          symbol: tick.symbol,
          trade_id: tick.trade_id,
          price: tick.price,
          qty: tick.qty,
          decimals: tick.decimals,
          time: new Date(tick.time),
          is_buyer_maker: tick.is_buyer_maker
        });

        if (tickBuffer.length >= BATCH_SIZE) {
          await flushBuffer();
        }
      } catch (error) {
        console.error('Error processing message:', error);
        console.error('Raw message:', message.value?.toString());
      }
    }
  });

  setInterval(flushBuffer, FLUSH_INTERVAL);

  // Performance status every 60 seconds
  setInterval(() => {
    const avgBatchSize = totalBatchesProcessed > 0 ? Math.round(totalTicksInserted / totalBatchesProcessed) : 0;
    console.log(`📊 Status: ${totalTicksReceived} received, ${totalTicksInserted} inserted, ${totalBatchesProcessed} batches, avg batch size: ${avgBatchSize}`);
  }, 60000);
}

start().catch(console.error);
