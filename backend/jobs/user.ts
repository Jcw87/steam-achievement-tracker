
import assert from "node:assert";

import { Job, WaitingChildrenError } from "bullmq";
import { In, IsNull, Not, Or, Raw } from "typeorm";

import { AVATAR_REGEX, HttpStatusError, steam } from "../clients/steam/index.js";
import { Achievement, App, Group, User, UserAchievement, UserApp, UserFriend, UserGroup } from "../models/index.js";
import { api_queue, ApiScrapeNames, AppScrapeJob, community_queue, CommunityScrapeNames, MetaScrapeNames, UserScrapeJob, UserStepScrapeJob } from "./index.js";

const SECOND = 1000;
const MINUTE = SECOND * 60;

function split_every<T>(array: Array<T>, count: number) {
    const result: Array<Array<T>> = [];
    for (let i = 0; i < array.length; i += count) {
        result.push(array.slice(i, i + count));
    }
    return result;
}

export async function scrapeUserProfiles(steam_ids: string[]) {
    assert(steam_ids.length <= 100);
    const users = await steam.getUserSummary(steam_ids);
    await User.upsert(users.map(user => ({
        steam_id: user.steamid,
        name: user.personaname,
        avatar: user.avatar.replace(AVATAR_REGEX, '$1'),
        profile_visibility: user.communityvisibilitystate,
        country_code: user.loccountrycode,
        updated: new Date(),
    })), {
        conflictPaths: ["steam_id"],
        skipUpdateIfNoValuesChanged: true,
    });
}

export async function scrapeUserFriends(steam_id: string) {
    const friends = await steam.getUserFriends(steam_id);
    const friend_ids = friends.map(friend => friend.steamid);
    await User.upsert(friend_ids.map(friend_id => ({
        steam_id: friend_id
    })), {
        conflictPaths: ["steam_id"],
        skipUpdateIfNoValuesChanged: true,
    });
    await UserFriend.upsert(friend_ids.map(friend_id => ({
        user1_id: steam_id,
        user2_id: friend_id,
    })), {
        conflictPaths: ["user1_id", "user2_id"],
        skipUpdateIfNoValuesChanged: true,
    });
    await UserFriend.delete({user1_id: steam_id, user2_id: Not(In(friend_ids))});
    await User.update({ steam_id }, {
        friend_count: friends.length,
        friends_updated: new Date(),
    });
}

export async function scrapeUserGroups(steam_id: string) {
    const groups = await steam.getUserGroups(steam_id);
    const group_ids = groups.map(group => group.gid);
    await Group.upsert(group_ids.map(group_id => ({
        group_id: group_id
    })), {
        conflictPaths: ["group_id"],
        skipUpdateIfNoValuesChanged: true,
    });
    await UserGroup.upsert(group_ids.map(group_id => ({
        user_id: steam_id,
        group_id: group_id
    })), {
        conflictPaths: ["user_id", "group_id"],
        skipUpdateIfNoValuesChanged: true,
    });
    await UserGroup.delete({user_id: steam_id, group_id: Not(In(group_ids))});
    await User.update({ steam_id }, {
        group_count: groups.length,
        groups_updated: new Date(),
    });
}

export async function scrapeUserApps(steam_id: string) {
    const apps = await steam.getUserApps(steam_id);
    for (const split_apps of split_every(apps, 1000)) {
        await App.upsert(split_apps.map(game => ({
            app_id: game.appid,
            name: game.name,
            has_community_visible_stats: game.has_community_visible_stats ?? false,
        })), {
            conflictPaths: ["app_id"],
            skipUpdateIfNoValuesChanged: true,
        });
        await UserApp.upsert(split_apps.map(game => ({
            user_id: steam_id,
            app_id: game.appid,
            last_played: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null,
        })), {
            conflictPaths: ["user_id", "app_id"],
            skipUpdateIfNoValuesChanged: true,
        });
    }

    const app_count = await UserApp.countBy({user_id: steam_id});
    await User.update({ steam_id }, {
        app_count: app_count,
        games_updated: new Date(),
    });
    const unknown_achievement = await UserApp.findBy({
        user_id: steam_id,
        app: {has_achievements: IsNull()},
    });
    if (unknown_achievement.length > 0) {
        await community_queue.addBulk(unknown_achievement.map(app => ({
            name: CommunityScrapeNames.AppHasAchievements,
            data: {app_id: app.app_id},
            opts: {
                jobId: `app-${app.app_id}-has-achievements`,
                priority: 1,
            },
        })));
    }
}

export async function scrapeUserAchievements(job: Job<unknown, void, MetaScrapeNames>, token?: string) {
    const data = job.data as UserStepScrapeJob;
    switch (data.step) {
        case 1: {
            const user = await User.findOneBy({steam_id: data.steam_id});
            const now = Date.now();
            if (!user?.games_updated || user.games_updated < new Date(now - MINUTE * 10)) {
                const user_apps_job: UserScrapeJob = {steam_id: data.steam_id};
                await api_queue.add(ApiScrapeNames.UserApps, user_apps_job, {
                    jobId: `user-${data.steam_id}-apps`,
                    priority: data.self ? 4 : 5,
                    parent: {
                        id: job.id!,
                        queue: job.queueQualifiedName,
                    },
                    failParentOnFailure: true,
                });
                if (await job.moveToWaitingChildren(token!)) {
                    data.step = 2;
                    await job.updateData(data);
                    throw new WaitingChildrenError();
                }
            }
            data.step = 2;
            await job.updateData(data);
            // falls through
        }
        case 2: {
            const user_apps = await UserApp.findBy({
                user_id: data.steam_id,
                app: { has_achievements: true },
                achievements_updated: Or(IsNull(), Raw((alias) => `${alias} < "last_played"`))
            });
            await api_queue.addBulk(user_apps.map(app => ({
                name: ApiScrapeNames.UserAppAchievements,
                data: {steam_id: data.steam_id, app_id: app.app_id},
                opts: {
                    jobId: `user-${data.steam_id}-app-${app.app_id}`,
                    priority: data.self ? 4 : 5,
                    parent: {
                        id: job.id!,
                        queue: job.queueQualifiedName,
                    },
                    failParentOnFailure: true,
                },
            })));
            if (await job.moveToWaitingChildren(token!)) {
                data.step = 3;
                await job.updateData(data);
                throw new WaitingChildrenError();
            }
            data.step = 3;
            await job.updateData(data);
            // falls through
        }
        case 3: {
            const apps = await UserApp.findBy({
                user_id: data.steam_id
            });
            await User.update({ steam_id: data.steam_id }, {
                achievements_updated: new Date(),
                achievement_count: apps.reduce((sum, app) => sum + app.achievement_count, 0),
                points: apps.reduce((sum, app) => sum + app.points, 0),
            });
        }
    }
}

export async function scrapeUserAppAchievements(steam_id: string, app_id: number) {
    try {
        const achievements = await steam.getUserAchievements(steam_id, app_id);
        for (const split_achievements of split_every(achievements, 1000)) {
            await Achievement.upsert(split_achievements.map(achievement => ({
                app_id: app_id,
                name: achievement.apiname,
                display_name: achievement.name,
                description: achievement.description,
            })), {
                conflictPaths: ["app_id", "name"],
                skipUpdateIfNoValuesChanged: true,
            });
            await UserAchievement.upsert(split_achievements.map(achievement => ({
                app_id: app_id,
                name: achievement.apiname,
                user_id: steam_id,
                achieved: Boolean(achievement.achieved),
                unlock_time: achievement.unlocktime > 0 ? new Date(achievement.unlocktime * 1000) : null,
            })), {
                conflictPaths: ["app_id", "name", "user_id"],
                skipUpdateIfNoValuesChanged: true,
            });
        }
        const unlocked = await UserAchievement.find({
            where: {
                user_id: steam_id,
                app_id: app_id,
                achieved: true,
            },
            relations: {achievement: true}
        });
        await UserApp.update({user_id: steam_id, app_id: app_id}, {
            achievements_updated: new Date(),
            achievement_count: unlocked.length,
            points: Math.floor(unlocked.reduce((sum, ua) => sum + ua.achievement.points, 0)),
        });
        const missing_icons = await Achievement.countBy({
            app_id: app_id,
            icon: IsNull(),
        });
        if (missing_icons > 0) {
            const job: AppScrapeJob = {app_id: app_id};
            await api_queue.add(ApiScrapeNames.AppAchievements, job, {
                jobId: `app-${app_id}-achievements`,
                priority: 1,
            });
        }
    } catch (error) {
        if (error instanceof HttpStatusError && error.status === 403) {
            const jobs = await api_queue.getJobs("prioritized", 0, 10000);
            const cancelJobs = jobs.filter(job => job.id?.startsWith(`user-${steam_id}-app-`));
            for (const job of cancelJobs) {
                await api_queue.remove(job.id!);
            }
        }
        throw error;
    }
}
