import { Queue } from 'bullmq';

const connection = { host: process.env.REDIS_HOST!, port: Number(process.env.REDIS_PORT) || 6379 };

export const jobQueue = new Queue('bkg-jobs', { connection });
