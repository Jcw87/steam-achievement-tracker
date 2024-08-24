
import { ACHIEVEMENT_ICON_REGEX, steam } from "../clients/steam/index.js";
import { Achievement } from "../models/achievement.js";
import { App } from "../models/app.js";
import { AppScrapeJob, store_queue, StoreScrapeNames } from "./index.js";

function split_every<T>(array: Array<T>, count: number) {
    const result: Array<Array<T>> = [];
    for (let i = 0; i < array.length; i += count) {
        result.push(array.slice(i, i + count));
    }
    return result;
}

export async function scrapeAppDetails(app_id: number) {
    const app = await steam.getStoreDetails(app_id);
    await App.update({app_id: app_id}, {
        has_achievements: app.achievements ? app.achievements.total > 0 : false,
        updated: new Date(),
    });
}

export async function scrapeAppHasAchievements(app_id: number) {
    try {
        const has_achievements = await steam.getGameHasAchievements(app_id);
        await App.update({app_id: app_id}, {has_achievements: has_achievements});
    } catch (error) {
        const job: AppScrapeJob = {app_id: app_id};
        await store_queue.add(StoreScrapeNames.App, job, {
            jobId: `app-${app_id}-store`,
            priority: 1,
        });
        throw error;
    }
}

export async function scrapeAppSchema(app_id: number) {
    const schema = await steam.getGameSchema(app_id);
    const achievements = schema?.achievements;
    if (achievements){
        for (const split_achievements of split_every(achievements, 1000)) {
            await Achievement.upsert(split_achievements.map(achievement => ({
                app_id: app_id,
                name: achievement.name,
                display_name: achievement.displayName,
                description: achievement.description ?? "",
                hidden: Boolean(achievement.hidden),
                icon: achievement.icon.replace(ACHIEVEMENT_ICON_REGEX, '$1'),
                icon_locked: achievement.icongray.replace(ACHIEVEMENT_ICON_REGEX, '$1'),
            })), {
                conflictPaths: ["app_id", "name"],
                skipUpdateIfNoValuesChanged: true,
            });
        }
        await App.update({app_id: app_id}, {achievements_updated: new Date()});
    }
}
