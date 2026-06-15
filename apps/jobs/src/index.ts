import { Worker } from "bullmq";

const worker = new Worker(
  "jobs",
  async (job) => {
    console.log(`Processing job ${job.id}:`, job.data);
  },
  { connection: { host: "localhost", port: 6379 } }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});
