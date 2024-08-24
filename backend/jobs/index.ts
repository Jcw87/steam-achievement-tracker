
import { Job, Queue, QueueOptions } from "bullmq";
import { Redis } from 'ioredis';

import { scrapeAppDetails, scrapeAppHasAchievements, scrapeAppSchema } from "./app.js";
import { scrapeGroup } from "./group.js";
import { scrapeUserAchievements, scrapeUserAppAchievements, scrapeUserApps, scrapeUserFriends, scrapeUserGroups, scrapeUserProfiles } from "./user.js";

export enum ApiScrapeNames {
    AppAchievements = "app-achievements",
    User = "user",
    Users = "users",
    UserFriends = "user-friends",
    UserGroups = "user-groups",
    UserApps = "user-apps",
    UserAppAchievements = "user-app-achievements",
}

export enum CommunityScrapeNames {
    AppHasAchievements = "app-has-achievements",
    Group = "group",
}

export enum MetaScrapeNames {
    UserAchievements = "user-achievements",
}

export enum StoreScrapeNames {
    App = "app",
}

export interface AppScrapeJob {
    app_id: number;
}

export interface GroupScrapeJob {
    group_id: string;
}

export interface UserScrapeJob {
    steam_id: string;
}

export interface UsersScrapeJob {
    steam_ids: string[];
}

export interface UserAppScrapeJob {
    steam_id: string;
    app_id: number;
}

export interface UserStepScrapeJob {
    steam_id: string;
    self: boolean;
    step: number;
}

export const redis = new Redis({
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
});

const queue_options: QueueOptions = {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
    }
};

export const api_queue = new Queue<unknown, void, ApiScrapeNames>("scrape-api", queue_options);
export const community_queue = new Queue<unknown, void, CommunityScrapeNames>("scrape-community", queue_options);
export const meta_queue = new Queue<unknown, void, MetaScrapeNames>("meta", queue_options);
export const store_queue = new Queue<unknown, void, StoreScrapeNames>("scrape-store", queue_options);

export async function apiProcessor(job: Job<unknown, void, ApiScrapeNames>) {
    switch (job.name) {
        case ApiScrapeNames.AppAchievements: {
            const data = job.data as AppScrapeJob;
            console.log("Fetching app %s achievements", data.app_id);
            await scrapeAppSchema(data.app_id);
            break;
        }
        case ApiScrapeNames.User: {
            const data = job.data as UserScrapeJob;
            console.log("Fetching user %s", data.steam_id);
            await scrapeUserProfiles([data.steam_id]);
            break;
        }
        case ApiScrapeNames.Users: {
            const data = job.data as UsersScrapeJob;
            console.log("Fetching %d users", data.steam_ids.length);
            await scrapeUserProfiles(data.steam_ids);
            break;
        }
        case ApiScrapeNames.UserFriends: {
            const data = job.data as UserScrapeJob;
            console.log("Fetching friends for user %s", data.steam_id);
            await scrapeUserFriends(data.steam_id);
            break;
        }
        case ApiScrapeNames.UserGroups: {
            const data = job.data as UserScrapeJob;
            console.log("Fetching groups for user %s", data.steam_id);
            await scrapeUserGroups(data.steam_id);
            break;
        }
        case ApiScrapeNames.UserApps: {
            const data = job.data as UserScrapeJob;
            console.log("Fetching apps for user %s", data.steam_id);
            await scrapeUserApps(data.steam_id);
            break;
        }
        case ApiScrapeNames.UserAppAchievements: {
            const data = job.data as UserAppScrapeJob;
            console.log("Fetching achievements for user %s and app %s", data.steam_id, data.app_id);
            await scrapeUserAppAchievements(data.steam_id, data.app_id);
            break;
        }
    }
}

export async function communityProcessor(job: Job<unknown, void, CommunityScrapeNames>) {
    switch (job.name) {
        case CommunityScrapeNames.AppHasAchievements: {
            const data = job.data as AppScrapeJob;
            console.log("Fetching app %s has achievements", data.app_id);
            await scrapeAppHasAchievements(data.app_id);
            break;
        }
        case CommunityScrapeNames.Group: {
            const data = job.data as GroupScrapeJob;
            console.log("Fetching group %s", data.group_id);
            await scrapeGroup(data.group_id);
            break;
        }
    }
}

export async function metaProcessor(job: Job<unknown, void, MetaScrapeNames>, token?: string) {
    switch (job.name) {
        case MetaScrapeNames.UserAchievements: {
            await scrapeUserAchievements(job, token);
            break;
        }
    }
}

export async function storeProcessor(job: Job<unknown, void, StoreScrapeNames>) {
    switch (job.name) {
        case StoreScrapeNames.App: {
            const data = job.data as AppScrapeJob;
            console.log("Fetching app %s store details", data.app_id);
            await scrapeAppDetails(data.app_id);
            break;
        }
    }
}
