import { Worker } from 'bullmq';
import { jobQueue } from './queues';

const worker = new Worker('bkg-jobs', async (job) => {
  console.log(`Processing job ${job.id}`);
}, { connection: { host: process.env.REDIS_HOST!, port: Number(process.env.REDIS_PORT) || 6379 } });

worker.on('ready', () => console.log('Worker ready'));
worker.on('error', (err) => console.error('Worker error', err));

process.on('SIGINT', async () => { await worker.close(); process.exit(0); });
