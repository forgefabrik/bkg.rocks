import { Worker } from "bullmq";
import { config } from "@bkg/config";

async function start() {
  const worker = new Worker(
    "bkg",
    async (job) => {
      console.log(`Processing job ${job.id}:`, job.name);
    },
    {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  console.log("BKG Jobs worker started");
}

start().catch(console.error);
