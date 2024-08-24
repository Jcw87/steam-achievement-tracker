
import { Router } from "express";
import { Achievement, App } from "../../models/index.js";
import { paginate } from "./index.js";

interface AppParam {
    app_id: string;
}

interface AppAchievementParam {
    app_id: string;
    name: string;
}

export const apps_router = Router();

apps_router.get("/", async (req, res) => {
    const { skip, take } = paginate(req, 50);
    const [apps, appCount] = await App.findAndCount({
        order: { points: "DESC", app_id: "ASC" },
        skip: skip,
        take: take,
    });
    res.send({
        totalPages: Math.ceil(appCount / take),
        results: apps,
    });
});

apps_router.get<AppParam, App>("/:app_id", async (req, res) => {
    const app_id = parseInt(req.params.app_id, 10);
    const app = await App.findOneBy({app_id: app_id});
    if (!app) {
        return res.sendStatus(404);
    }
    return res.send(app);
});

apps_router.get<AppParam, Achievement[]>("/:app_id/achievements", async (req, res) => {
    const app_id = parseInt(req.params.app_id, 10);
    const achievements = await Achievement.find({
        where: { app_id: app_id },
        order: { points: "ASC", name: "ASC"}
    });
    res.send(achievements);
});

apps_router.get<AppAchievementParam, Achievement>("/:app_id/achievements/:name", async (req, res) => {
    const app_id = parseInt(req.params.app_id, 10);
    const achievement = await Achievement.findOneBy({
        app_id: app_id,
        name: req.params.name,
    });
    if (!achievement) {
        return res.sendStatus(404);
    }
    res.send(achievement);
});
