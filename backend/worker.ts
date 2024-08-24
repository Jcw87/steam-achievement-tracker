
import "dotenv/config";
import process from "process";

import { Job, Worker } from "bullmq";

import { AppDataSource } from "./database.js";
import { api_queue, apiProcessor, community_queue, communityProcessor, meta_queue, metaProcessor, redis, store_queue, storeProcessor } from "./jobs/index.js";

await AppDataSource.initialize();
console.log(`Data Source has been initialized with ${AppDataSource.entityMetadatas.length} entities!`);

function job_failed<DataType, ResultType, NameType extends string>(_job: Job<DataType, ResultType, NameType> | undefined, error: Error) {
    console.error(error);
}

const api_worker = new Worker(api_queue.name, apiProcessor, {
    connection: redis,
    limiter: {
        max: 1,
        duration: 500,
    }
});
api_worker.on("failed", job_failed);

const community_worker = new Worker(community_queue.name, communityProcessor, {
    connection: redis,
    limiter: {
        max: 1,
        duration: 2000,
    }
});
community_worker.on("failed", job_failed);

const meta_worker = new Worker(meta_queue.name, metaProcessor, {
    connection: redis,
});
meta_worker.on("failed", job_failed);

const store_worker = new Worker(store_queue.name, storeProcessor, {
    connection: redis,
    limiter: {
        max: 1,
        duration: 2000,
    }
});
store_worker.on("failed", job_failed);

const shutdown = async () => {
    console.log("shutting down workers");
    await Promise.all([api_worker.close(), community_worker.close(), meta_worker.close(), store_worker.close()]);
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
