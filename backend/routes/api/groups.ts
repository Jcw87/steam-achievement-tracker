
import { Router } from "express";
import { ApiScrapeNames, CommunityScrapeNames, GroupScrapeJob, UsersScrapeJob, api_queue, community_queue } from "../../jobs/index.js";
import { Group, User } from "../../models/index.js";
import { PaginationResponse, RankedUser, WEEK, paginate } from "./index.js";

interface GroupParam {
    group_id: string;
}

export const groups_router = Router();

groups_router.get<GroupParam, Group>("/:group_id", async (req, res) => {
    const group = await Group.findOneBy({group_id: req.params.group_id});
    if (req.user) {
        const now = Date.now();
        if (!group?.updated || group.updated < new Date(now - WEEK)) {
            const job: GroupScrapeJob = {group_id: req.params.group_id};
            await community_queue.add(CommunityScrapeNames.Group, job, {
                jobId: `group-${req.params.group_id}`,
                priority: 10,
            });
        }
    }
    if (!group) {
        return res.status(404).send();
    }
    return res.send(group);
});

groups_router.get<GroupParam, PaginationResponse<User>>("/:group_id/members", async (req, res) => {
    const { skip, take } = paginate(req, 50);
    const [users, userCount] = await User.findAndCount<RankedUser>({
        where: { groups: { group_id: req.params.group_id } },
        order: { points: "DESC", app_count: "DESC", steam_id: "ASC" },
        skip: skip,
        take: take,
    });
    users.forEach((user, idx) => user.rank = skip + idx + 1);
    if (req.user) {
        const unknown_users = users.filter(u => !u.updated);
        if (unknown_users.length > 0) {
            const job: UsersScrapeJob = {steam_ids: unknown_users.map(u => u.steam_id)};
            await api_queue.add(ApiScrapeNames.Users, job, {
                jobId: `group-${req.params.group_id}-members`,
                priority: 20,
            });
        }
    }
    res.send({
        totalPages: Math.ceil(userCount / take),
        results: users,
    });
});
