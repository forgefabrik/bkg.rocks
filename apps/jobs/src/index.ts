import { Worker } from "bullmq";
import IORedis from "ioredis";

if (process.env.NODE_ENV !== "production") {
  import("dotenv").then(({ default: dotenv }) => dotenv.config());
}

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379");

const worker = new Worker(
  "bkg-jobs",
  async (job) => {
    console.log(`Processing job: ${job.name}`, job.data);
    return { success: true };
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job?.id}`, err);
});

console.log("BKG Jobs worker started");