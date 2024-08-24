import { AppDataSource } from "../database.js";

const APP_ACHIEVEMENT_COUNT = `
UPDATE app
SET achievement_count = g.achievement_count
FROM (
    SELECT app_id, COUNT(name) AS achievement_count
    FROM achievement
    GROUP BY app_id
) AS g
WHERE app.app_id = g.app_id
`;

const USER_APP_ACHIEVEMENT_COUNT = `
UPDATE user_app
SET achievement_count = g.achievement_count
FROM (
    SELECT ua.user_id, ua.app_id, COUNT(ua.name) AS achievement_count
    FROM user_achievement AS ua
    WHERE ua.achieved = TRUE
    GROUP BY ua.user_id, ua.app_id
) AS g
WHERE user_app.user_id = g.user_id AND user_app.app_id = g.app_id
`;

const APP_OWNER_COUNT = `
UPDATE app
SET owner_count = g.owner_count
FROM (
	SELECT app_id, COUNT(user_id) AS owner_count
	FROM user_app
	GROUP BY app_id
) AS g
WHERE app.app_id = g.app_id
`;

const APP_PLAYER_COUNT = `
UPDATE app
SET player_count = g.player_count
FROM (
    SELECT app_id, COUNT(user_id) AS player_count
    FROM user_app
    WHERE achievement_count > 0
    GROUP BY app_id
) AS g
WHERE app.app_id = g.app_id
`;

// TODO: optimize?
const ACHIEVEMENT_ACHIEVER_COUNT = `
UPDATE achievement
SET achiever_count = g.achiever_count
FROM (
    SELECT app_id, name, COUNT(user_id) AS achiever_count
    FROM user_achievement
    WHERE user_achievement.achieved = TRUE
    GROUP BY app_id, name
) AS g
WHERE achievement.app_id = g.app_id AND achievement.name = g.name
`;

// TODO: optimize?
const ACHIEVEMENT_POINTS = `
UPDATE achievement
SET points = ROUND(app.player_count::decimal / GREATEST(achievement.achiever_count, 1), 1)
FROM app
WHERE achievement.app_id = app.app_id
`;

const USER_ACHIEVEMENT_COUNT = `
UPDATE "user"
SET achievement_count = g.achievement_count
FROM (
    SELECT user_id, SUM(achievement_count) AS achievement_count
    FROM user_app
    GROUP BY user_id
) AS g
WHERE "user".steam_id = g.user_id
`;

const APP_POINTS = `
UPDATE app
SET points = g.points
FROM (
    SELECT app_id, SUM(achievement.points) AS points
    FROM achievement
    GROUP BY achievement.app_id
) AS g
WHERE app.app_id = g.app_id
`;

const USER_APP_POINTS = `
UPDATE user_app
SET points = g.points
FROM (
    SELECT ua.user_id, ua.app_id, SUM(a.points) AS points
    FROM user_achievement AS ua
    LEFT JOIN achievement AS a ON ua.app_id = a.app_id AND ua.name = a.name
    WHERE ua.achieved = TRUE
    GROUP BY ua.user_id, ua.app_id
) AS g
WHERE user_app.user_id = g.user_id AND user_app.app_id = g.app_id
`;

const USER_POINTS = `
UPDATE "user"
SET points = g.points
FROM (
    SELECT user_id, SUM(user_app.points) AS points
    FROM user_app
    GROUP BY user_id
) AS g
WHERE "user".steam_id = g.user_id
`;

export async function updateStats() {
    console.log("update 1");
    await Promise.all([
        AppDataSource.query(APP_ACHIEVEMENT_COUNT),
        AppDataSource.query(USER_APP_ACHIEVEMENT_COUNT),
    ]);
    console.log("update 2");
    await Promise.all([
        AppDataSource.query(APP_OWNER_COUNT),
        AppDataSource.query(APP_PLAYER_COUNT),
        AppDataSource.query(ACHIEVEMENT_ACHIEVER_COUNT),
    ]);
    console.log("update 3");
    await Promise.all([
        AppDataSource.query(ACHIEVEMENT_POINTS),
        AppDataSource.query(USER_ACHIEVEMENT_COUNT),
    ]);
    console.log("update 4");
    await Promise.all([
        AppDataSource.query(APP_POINTS),
        AppDataSource.query(USER_APP_POINTS),
    ]);
    console.log("update 5");
    await AppDataSource.query(USER_POINTS);
    console.log("done");
}
