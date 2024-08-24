
import "dotenv/config";
import "express-async-errors"; // needed until express 5

import assert from "assert";
import fs from "fs/promises";
import { join } from "path";

import ConnectPgSimple from "connect-pg-simple";
import express from "express";
import session from "express-session";
import passport from "passport";
import SteamStrategy from "passport-steam";
import serveStatic from "serve-static";

import { AVATAR_REGEX } from "./clients/steam/index.js";
import { AppDataSource, POSTGRES_URL } from "./database.js";
import { handleErrorsJson } from "./middleware/error.js";
import { User, UserRole } from "./models/index.js";
import { api_router, auth_router } from "./routes/index.js";

declare global {
    namespace Express {
        interface User {
            steam_id: string,
            name: string | null,
            role?: UserRole
        }
    }
}

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

assert(process.env.HOST);
assert(process.env.SESSION_SECRET);
assert(process.env.STEAM_API_KEY);

const PORT = parseInt(process.env.BACKEND_PORT ?? "3000", 10);
const PRODUCTION = process.env.NODE_ENV === "production";
const STATIC_PATH = PRODUCTION ? `${process.cwd()}/../frontend/dist` : `${process.cwd()}/../frontend`;

try {
    await AppDataSource.initialize();
    console.log(`Data Source has been initialized with ${AppDataSource.entityMetadatas.length} entities!`);
} catch (err) {
    console.error("Error during Data Source initialization: %s", err);
}

try {
    await AppDataSource.synchronize(false);
    console.log("Schema synchronized");
} catch (err) {
    console.log("Error while synchronizing schema: %s", err);
}

passport.use(new SteamStrategy({
    returnURL: `${process.env.HOST}/auth/steam/return`,
    realm: process.env.HOST,
    apiKey: process.env.STEAM_API_KEY,
}, (_identifier, profile, done) => {
    const data = profile._json;
    const user = {
        steam_id: data.steamid,
        name: data.personaname,
        avatar: data.avatar.replace(AVATAR_REGEX, '$1'),
        profile_visibility: data.communityvisibilitystate,
        country_code: data.loccountrycode,
        updated: new Date(),
    };
    User.upsert(user, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ["steam_id"],
    }).then(() => {
        done(null, user);
    }).catch(err => {
        done(err, null);
    });
}));
passport.serializeUser((user, done) => {
    done(null, user.steam_id);
});
passport.deserializeUser((steam_id: string, done) => {
    User.findOneByOrFail({steam_id: steam_id}).then(user => {
        done(null, user);
    }).catch(err => {
        done(err, null);
    });
});

const app = express();

// Simple request logger
app.use((req, res, next) => {
    const remoteIp = req.ip;
    const method = req.method;
    const url = req.originalUrl;
    const start = process.hrtime();
    res.on('finish', () => {
        const elapsed = process.hrtime(start);
        const elapsedSeconds = elapsed[0] + (elapsed[1] / 1000 / 1000 / 1000);
        const timestamp = new Date().toISOString();
        const statusCode = res.statusCode;
        console.log(`${timestamp} - ${remoteIp} - "${method} ${url}" ${statusCode} - ${elapsedSeconds.toFixed(3)}`);
    });
    next();
});

const PgSession = ConnectPgSimple(session);
app.set('trust proxy', 'loopback');
app.use(session({
    store: new PgSession({
        conString: POSTGRES_URL,
        createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    cookie: {
        httpOnly: true,
        sameSite: true,
        secure: PRODUCTION,
        maxAge: WEEK,
    },
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.session());

app.use("/auth", auth_router);
app.use("/api", api_router);

app.use(handleErrorsJson);

app.use(serveStatic(STATIC_PATH, { index: false }));
app.use("/*", async (req, res) => {
    const html = (await fs.readFile(join(STATIC_PATH, "index.html"))).toString('utf8');
    return res.set("Content-Type", "text/html").send(html);
});

app.listen(PORT);
