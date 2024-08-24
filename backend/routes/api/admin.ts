import { JobType, Queue } from "bullmq";
import { Request, Router } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { api_queue, community_queue, meta_queue, store_queue } from "../../jobs/index.js";
import { BadRequestError } from "../../middleware/error.js";
import { UserRole } from "../../models/user.js";
import { PaginationQuery, PaginationResponse } from "./index.js";

interface QueueQuery extends PaginationQuery {
    type?: JobType
}

const queues: Record<string, Queue> = {
    api: api_queue,
    community: community_queue,
    meta: meta_queue,
    store: store_queue,
};

function paginate<P = ParamsDictionary, ResBody = unknown, ReqBody = unknown>(req: Request<P, ResBody, ReqBody, PaginationQuery>, count: number) {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    if (isNaN(page)) {
        throw new BadRequestError("page is not a number");
    }
    const start = (page - 1) * count;
    const end = start + 50;
    return { page, start, end };
}

export const admin_router = Router();
admin_router.use((req, res, next) => {
    if (!req.user) {
        return res.sendStatus(401).send();
    }
    if (req.user.role !== UserRole.Admin) {
        return res.sendStatus(403).send();
    }
    next();
});

admin_router.get<{name: string}, PaginationResponse<unknown>, undefined, QueueQuery>("/queues/:name", async (req, res) => {
    const queue = queues[req.params.name];
    if (!queue) {
        return res.sendStatus(404);
    }
    const {page, start, end} = paginate(req, 50);
    const type = req.query.type ?? "failed";
    const jobs = await queue.getJobs(type, start, end);

    res.send({
        totalPages: jobs.length === 50 ? page + 1 : page,
        results: jobs,
    });
});

admin_router.post("/queues/:name/:job_id/retry", async (req, res) => {
    const queue = queues[req.params.name];
    if (!queue) {
        return res.sendStatus(404);
    }
    const job = await queue.getJob(req.params.job_id);
    if (!job) {
        return res.sendStatus(404);
    }
    if (!await job.isFailed()) {
        return res.sendStatus(400);
    }
    await job.retry();
    res.send();
});

admin_router.delete("/queues/:name/:job_id", async (req, res) => {
    const queue = queues[req.params.name];
    if (!queue) {
        return res.sendStatus(404);
    }
    const result = await queue.remove(req.params.job_id);
    if (result != 1) {
        return res.sendStatus(400);
    }
    res.send();
});
