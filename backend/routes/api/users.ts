import { Router } from "express";
import { ProfileVisibility } from "../../clients/steam/user.js";
import { AppDataSource } from "../../database.js";
import { ApiScrapeNames, AppScrapeJob, MetaScrapeNames, StoreScrapeNames, UserAppScrapeJob, UserScrapeJob, UserStepScrapeJob, UsersScrapeJob, api_queue, meta_queue, store_queue } from "../../jobs/index.js";
import { Achievement, Group, User, UserAchievement, UserApp } from "../../models/index.js";
import { HOUR, PaginationQuery, PaginationResponse, RankedGroup, RankedUser, paginate } from "./index.js";


interface UserParam {
    steam_id: string;
}

interface UserAppParam {
    steam_id: string;
    app_id: string;
}

const RARITY_QUERY = `
SELECT *
FROM (
    VALUES
    (0.1, 2, 'common'),
    (2, 4, 'uncommon'),
    (4, 10, 'rare'),
    (10, 20, 'epic'),
    (20, 2147483647, 'legendary')
) AS ranges(r_begin,r_end,rarity)
`;

export const users_router = Router();

users_router.get<undefined, PaginationResponse<User>>("/", async (req, res) => {
    const { skip, take } = paginate(req, 50);
    const [users, userCount] = await User.findAndCount<RankedUser>({
        order: { points: "DESC", app_count: "DESC", steam_id: "ASC"},
        skip: skip,
        take: take,
    });
    users.forEach((user, idx) => user.rank = skip + idx + 1);
    res.send({
        totalPages: Math.ceil(userCount / take),
        results: users,
    });
});

users_router.get<UserParam, User>("/:steam_id", async (req, res) => {
    const user = await User.findOneBy({steam_id: req.params.steam_id});
    if (req.user) {
        const now = Date.now();
        if (!user?.updated || user.updated < new Date(now - HOUR)) {
            const job: UserScrapeJob = {steam_id: req.params.steam_id};
            const self = (user && user.steam_id === req.user.steam_id);
            await api_queue.add(ApiScrapeNames.User, job, {
                jobId: `user-${req.params.steam_id}`,
                priority: self ? 4 : 5,
            });
        }
    }
    if (!user) {
        return res.status(404).send();
    }
    return res.send(user);
});

users_router.get<UserParam>("/:steam_id/achievements", async (req, res) => {
    const { skip, take } = paginate(req, 50);
    const [achievements, achievementCount] = await UserAchievement.findAndCount({
        where: {user_id: req.params.steam_id, achieved: true},
        relations: {achievement: true},
        order: {achievement: {points: "DESC"}, app_id: "ASC", name: "ASC"},
        skip: skip,
        take: take,
    });
    res.send({
        totalPages: Math.ceil(achievementCount / take),
        results: achievements,
    });
});

users_router.get<UserParam>("/:steam_id/achievement_summary", async (req, res) => {
    const recentPromise = UserAchievement.find({
        where: {user_id: req.params.steam_id, achieved: true},
        relations: {achievement: {app: true}},
        order: {unlock_time: {direction: "DESC", nulls: "LAST"}, name: "ASC"},
        take: 20,
    });
    const valuablePromise = UserAchievement.find({
        where: {user_id: req.params.steam_id, achieved: true},
        relations: {achievement: {app: true}},
        order: {achievement: {points: "DESC"}, name: "ASC"},
        take: 20,
    });
    const rarityQuery = AppDataSource.createQueryBuilder()
        .select("ranges.rarity")
        .addSelect("COUNT(ua.name)::int", "count")
        .from(UserAchievement, "ua")
        .leftJoin(Achievement, "a", "ua.app_id = a.app_id AND ua.name = a.name")
        .leftJoin("(" + RARITY_QUERY + ")", "ranges", "a.points >= ranges.r_begin AND a.points < ranges.r_end")
        .where("ua.user_id = :steam_id", {steam_id: req.params.steam_id})
        .andWhere("ua.achieved = TRUE")
        .groupBy("ranges.rarity");
    const rarity = await rarityQuery.getRawMany<{rarity: string, count: number}>();
    const rarity_map = Object.fromEntries(rarity.map(r => [r.rarity, r.count]));
    const result = {
        recent: await recentPromise,
        valuable: await valuablePromise,
        rarity: {
            common: rarity_map.common ?? 0,
            uncommon: rarity_map.uncommon ?? 0,
            rare: rarity_map.rare ?? 0,
            epic: rarity_map.epic ?? 0,
            legendary: rarity_map.legendary ?? 0,
        }
    };
    if (req.user) {
        const user = await User.findOneBy({steam_id: req.params.steam_id});
        if (user && user.profile_visibility != ProfileVisibility.Private) {
            const now = Date.now();
            if (!user?.achievements_updated || user.achievements_updated < new Date(now - HOUR)) {
                const self = (user && user.steam_id === req.user.steam_id);
                const job: UserStepScrapeJob = {steam_id: req.params.steam_id, self: self, step: 1};
                await meta_queue.add(MetaScrapeNames.UserAchievements, job, {
                    jobId: `user-${req.params.steam_id}-achievements`,
                    priority: self ? 4 : 5,
                });
            }
        }
    }
    res.send(result);
});

users_router.get<UserParam, PaginationResponse<User>, undefined, PaginationQuery>("/:steam_id/friends", async (req, res) => {
    const { skip, take } = paginate(req, 50);
    const [users, userCount] = await User.findAndCount<RankedUser>({
        where: [
            {reverse_friends: {user1_id: req.params.steam_id}},
            {steam_id: req.params.steam_id},
        ],
        order: {points: "DESC", app_count: "DESC", steam_id: "ASC"},
        skip: skip,
        take: take,
    });
    users.forEach((user, idx) => user.rank = skip + idx + 1);
    if (req.user) {
        const user = await User.findOneBy({steam_id: req.params.steam_id});
        if (user && user.profile_visibility != ProfileVisibility.Private) {
            const now = Date.now();
            const unknown_users = users.filter(u => !u.updated);
            if (!user?.friends_updated || user.friends_updated < new Date(now - HOUR)) {
                const job: UserScrapeJob = {steam_id: req.params.steam_id};
                const self = (user && user.steam_id === req.user.steam_id);
                await api_queue.add(ApiScrapeNames.UserFriends, job, {
                    jobId: `user-${req.params.steam_id}-friends`,
                    priority: self ? 4 : 10,
                });
            } else if (unknown_users.length > 0) {
                const job: UsersScrapeJob = {steam_ids: unknown_users.map(u => u.steam_id)};
                await api_queue.add(ApiScrapeNames.Users, job, {
                    jobId: `user-${req.params.steam_id}-friends`,
                    priority: 20,
                });
            }
        }
    }
    res.send({
        totalPages: Math.ceil(userCount / take),
        results: users,
    });
});

users_router.get<UserParam, PaginationResponse<Group>, undefined, PaginationQuery>("/:steam_id/groups", async (req, res) => {
    const { skip, take } = paginate(req, 50);
    const [groups, groupCount] = await Group.findAndCount<RankedGroup>({
        where: {members: {user_id: req.params.steam_id}},
        order: {member_count: {direction: "DESC", nulls: "LAST"}, group_id: "ASC"},
        skip: skip,
        take: take,
    });
    groups.forEach((group, idx) => group.rank = skip + idx + 1);
    if (req.user) {
        const user = await User.findOneBy({steam_id: req.params.steam_id});
        if (user && user.profile_visibility != ProfileVisibility.Private) {
            const now = Date.now();
            if (!user?.groups_updated || user.groups_updated < new Date(now - HOUR)) {
                const job: UserScrapeJob = {steam_id: req.params.steam_id};
                const self = (user && user.steam_id === req.user.steam_id);
                await api_queue.add(ApiScrapeNames.UserGroups, job, {
                    jobId: `user-${req.params.steam_id}-groups`,
                    priority: self ? 4 : 10,
                });
            }
        }
    }
    res.send({
        totalPages: Math.ceil(groupCount / take),
        results: groups,
    });
});

users_router.get<UserParam, PaginationResponse<UserApp>, undefined, PaginationQuery>("/:steam_id/apps", async (req, res) => {
    const { skip, take } = paginate(req, 50);
    const [apps, appCount] = await UserApp.findAndCount({
        where: {user_id: req.params.steam_id},
        relations: {app: true},
        order:  {last_played: {direction: "DESC", nulls: "LAST"}, app_id: "ASC"},
        skip: skip,
        take: take,
    });
    if (req.user) {
        const user = await User.findOneBy({steam_id: req.params.steam_id});
        if (user && user.profile_visibility != ProfileVisibility.Private) {
            const now = Date.now();
            if (!user?.games_updated || user.games_updated < new Date(now - HOUR)) {
                const job: UserScrapeJob = {steam_id: req.params.steam_id};
                const self = (user && user.steam_id === req.user.steam_id);
                await api_queue.add(ApiScrapeNames.UserApps, job, {
                    jobId: `user-${req.params.steam_id}-apps`,
                    priority: self ? 4 : 5,
                });
            }
            const missing_store_info = apps.filter(app => app.app.updated === null);
            if (missing_store_info.length > 0) {
                await store_queue.addBulk(missing_store_info.map(app => ({
                    name: StoreScrapeNames.App,
                    data: {app_id: app.app_id},
                    opts: {
                        jobId: `app-${app.app_id}`,
                        priority: 1,
                    }
                })));
            }
        }
    }
    res.send({
        totalPages: Math.ceil(appCount / take),
        results: apps,
    });
});

users_router.get<UserAppParam, UserAchievement[]>("/:steam_id/apps/:app_id/achievements", async (req, res) => {
    const app_id = parseInt(req.params.app_id);
    const achievements = await UserAchievement.find({
        where: {user_id: req.params.steam_id, app_id: app_id},
        relations: {achievement: true},
        order: { achievement: { points: "ASC", name: "ASC"} }
    });
    if (req.user) {
        const user = await User.findOneBy({steam_id: req.params.steam_id});
        if (user && user.profile_visibility != ProfileVisibility.Private) {
            const user_app = await UserApp.findOne({
                where: {user_id: req.params.steam_id, app_id: app_id},
                relations: {app: true},
            });
            if (user_app?.app.has_achievements) {
                const now = Date.now();
                if (!user_app?.achievements_updated || user_app.achievements_updated < new Date(now - HOUR)) {
                    const job: UserAppScrapeJob = {steam_id: req.params.steam_id, app_id: app_id};
                    const self = (user_app && user_app.user_id === req.user.steam_id);
                    await api_queue.add(ApiScrapeNames.UserAppAchievements, job, {
                        jobId: `user-${req.params.steam_id}-app-${app_id}`,
                        priority: self ? 4 : 5,
                    });
                }
                const missing_icons = achievements.filter(a => !a.achievement.icon);
                if (missing_icons.length > 1) {
                    const job: AppScrapeJob = {app_id: app_id};
                    await api_queue.add(ApiScrapeNames.AppAchievements, job, {
                        jobId: `app-${app_id}-achievements`,
                        priority: 1,
                    });
                }
            }
        }
    }
    res.send(achievements);
});
