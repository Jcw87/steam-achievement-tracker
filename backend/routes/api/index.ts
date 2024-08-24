
import { Request, Router, json } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { steam } from "../../clients/steam/index.js";
import { BadRequestError } from "../../middleware/error.js";
import { Group, User } from "../../models/index.js";
import { admin_router } from "./admin.js";
import { apps_router } from "./apps.js";
import { groups_router } from "./groups.js";
import { users_router } from "./users.js";

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;

export interface RankedGroup extends Group {
    rank?: number;
}

export interface RankedUser extends User {
    rank?: number;
}

export interface PaginationQuery {
    page?: string;
}

export interface PaginationResponse<T> {
    totalPages: number;
    results: Array<T>;
}

export function paginate<P = ParamsDictionary, ResBody = unknown, ReqBody = unknown>(req: Request<P, ResBody, ReqBody, PaginationQuery>, count: number) {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    if (isNaN(page)) {
        throw new BadRequestError("page is not a number");
    }
    return { skip: (page - 1) * count, take: count };
}

export const api_router = Router();
api_router.use(json());
api_router.get("/account", (req, res) => {
    if (!req.user) {
        res.send(404);
    }
    res.send(req.user);
});
api_router.post<undefined, {steam_id: string}, {query: string}>("/add_user", async (req, res) => {
    const steam_id = await steam.resolveSteamId(req.body.query);
    res.send({steam_id});
});
api_router.use("/admin", admin_router);
api_router.use("/apps", apps_router);
api_router.use("/groups", groups_router);
api_router.use("/users", users_router);
