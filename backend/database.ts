

import { DataSource } from "typeorm";

import { Achievement, App, Group, User, UserAchievement, UserApp, UserFriend, UserGroup } from "./models/index.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Achievement, App, Group, User, UserAchievement, UserApp, UserFriend, UserGroup],
    logging: true,
});

function create_postgres_url(host: string | undefined, port: string | undefined, user: string | undefined, password: string | undefined, db: string | undefined) {
    const parts = ["postgres://"];
    if (user || password) {
        parts.push(user ?? "", ":", password ?? "", "@");
    }
    parts.push(host ?? "localhost");
    if (port) {
        parts.push(":", port);
    }
    if (db) {
        parts.push("/", db);
    }
    return parts.join("");
}

export const POSTGRES_URL = create_postgres_url(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);
