
import assert from "node:assert";
import querystring from "node:querystring";

import { XMLParser } from "fast-xml-parser";
import { parse as htmlParse } from "node-html-parser";
import SteamID from 'steamid';

import { AppResponse, AppSchemaResponse } from "./app.js";
import { GroupMemberListResponse } from "./group.js";
import { FriendRelationship, UserAchievementResponse, UserFriendResponse, UserGameResponse, UserGroupResponse, UserSummaryResponse } from "./user.js";

interface ResolveVanityFail {
    success: 42;
    message: string;
}

interface ResolveVanitySuccess {
    success: 1;
    steamid: string;
}

type ResolveVanityResponse = {
    response: ResolveVanityFail | ResolveVanitySuccess;
}

export class HttpStatusError extends Error {
    status: number;
    constructor(status: number, message?: string, options?: ErrorOptions) {
        super(message, options);
        this.status = status;
    }
}

export const AVATAR_REGEX = /https?:\/\/.+steamstatic.com\/([0-9a-z]+)\.jpg/;
export const ACHIEVEMENT_ICON_REGEX = /https?:\/\/steamcdn-a.akamaihd.net\/steamcommunity\/public\/images\/apps\/\d+\/([0-9A-Za-z_]+).jpg/;

export function steamApi(key: string) {
    const reProfileBase = String.raw `(?:(?:(?:(?:https?)?:\/\/)?(?:www\.)?steamcommunity\.com)?)?\/?`;
    const reCommunityID = RegExp(String.raw `^(\d{17})$`, 'i');
    const reSteamID2 = RegExp(String.raw `^(STEAM_\d+:\d+:\d+)$`, 'i');
    const reSteamID3 = RegExp(String.raw `^(\[U:\d+:\d+\])$`, 'i');
    const reProfileURL = RegExp(String.raw `${reProfileBase}profiles\/(\d{17})`, 'i');
    const reProfileID = RegExp(String.raw `${reProfileBase}id\/([a-z0-9_-]{2,32})`, 'i');

    const default_headers = {
        'User-Agent': `untitled-steam-achievement-tracker`,
    };

    function checkError(response: Response) {
        if (!response.ok) {
            throw new HttpStatusError(response.status, `HTTP ${response.status}: ${response.statusText}`);
        }
    }
    async function getJson<T>(url: string, params: Record<string, string>) {
        const response = await fetch(`${url}?${querystring.stringify(params)}`, { headers: default_headers });
        checkError(response);
        return response.json() as T;
    }
    async function getJsonAuthenticated<T>(url: string, params: Record<string, string>) {
        const headers = Object.assign({}, default_headers, {"x-webapi-key": key});
        const response = await fetch(`${url}?${querystring.stringify(params)}`, { headers });
        checkError(response);
        return response.json() as T;
    }
    async function getXml<T>(url: string, params: Record<string, string>) {
        const response = await fetch(`${url}?${querystring.stringify(params)}`, { headers: default_headers });
        checkError(response);
        const parser = new XMLParser();
        const data = parser.parse(await response.text()) as T;
        // Steam incorrectly uses xml entities inside CDATA sections, so xml parsers won't parse them
        // Example group: 103582791461772386
        // TODO: apply a fix
        return data;
    }
    async function resolveVanityUrl(vanityurl: string) {
        const url = 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1';
        const response = await getJsonAuthenticated<ResolveVanityResponse>(url, { vanityurl });
        if (response.response.success !== 1) {
            throw new Error(response.response.message);
        }
        return response.response.steamid;
    }

    return {
        resolveSteamId: async (query: string) => {
            // community id match
            const communityIDMatch = query.match(reCommunityID);
            if (communityIDMatch !== null)
                return communityIDMatch[1];
            // url
            const urlMatch = query.match(reProfileURL);
            if (urlMatch !== null)
                return urlMatch[1];
            // Steam 2
            const steamID2Match = query.match(reSteamID2);
            if (steamID2Match !== null) {
                const sid = new SteamID(steamID2Match[1]);
                return sid.getSteamID64();
            }
            // Steam 3
            const steamID3Match = query.match(reSteamID3);
            if (steamID3Match !== null) {
                const sid = new SteamID(steamID3Match[1]);
                return sid.getSteamID64();
            }
            // vanity id
            const idMatch = query.match(reProfileID);
            if (idMatch !== null) {
                const id = idMatch[1];
                return await resolveVanityUrl(id);
            }
            throw new TypeError('Invalid format');
        },
        getUserSummary: async (ids: string[]) => {
            const url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/";
            const response = await getJsonAuthenticated<UserSummaryResponse>(url, {steamids: ids.join(",")});
            return response.response.players;
        },
        getUserFriends: async (steam_id: string) => {
            const url = "https://api.steampowered.com/ISteamUser/GetFriendList/v1/";
            const response = await getJsonAuthenticated<UserFriendResponse>(url, {steamid: steam_id, relationship: FriendRelationship.Friend});
            return response.friendslist.friends;
        },
        getUserGroups: async (steam_id: string) => {
            const url = "https://api.steampowered.com/ISteamUser/GetUserGroupList/v1/";
            const response = await getJsonAuthenticated<UserGroupResponse>(url, {steamid: steam_id });
            return response.response.groups;
        },
        getUserApps: async (steam_id: string) => {
            const url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/";
            const response = await getJsonAuthenticated<UserGameResponse>(url, {steamid: steam_id, include_appinfo: "true", include_played_free_games: "true"});
            return response.response.games;
        },
        getUserAchievements: async (steam_id: string, app_id: number, language: string = "en_us") => {
            const url = "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1";
            const response = await getJsonAuthenticated<UserAchievementResponse>(url, {steamid: steam_id, appid: app_id.toString(), l: language});
            if (!response.playerstats.success) {
                throw new Error("Fetch achievements failure");
            }
            return response.playerstats.achievements;
        },
        getGroupMembers: async (group_id: string, page: number) => {
            const url = `http://steamcommunity.com/gid/${group_id}/memberslistxml`;
            const response = await getXml<GroupMemberListResponse>(url, {xml: "1", p: page.toString()});
            return response.memberList;
        },
        getStoreDetails: async (app_id: number) => {
            const url = "https://store.steampowered.com/api/appdetails";
            const response = await getJson<AppResponse>(url, {appids: app_id.toString()});
            const appResponse = response[app_id.toString()];
            if (!appResponse.success) {
                throw new Error("Fetch app details failure");
            }
            return response[app_id.toString()].data;
        },
        getGameHasAchievements: async (app_id: number) => {
            const url = `http://steamcommunity.com/stats/${app_id}/achievements`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Fetch app has achievements HTTP ${response.status}`);
            }
            const html = await response.text();
            const document = htmlParse(html);
            if (document.querySelector("#achievementsTabOn")) {
                return true;
            }
            if (document.querySelector(".error_ctn")) {
                return false;
            }
            throw new Error("Fetch app has achievements unknown result");
        },
        getGameSchema: async (app_id: number) => {
            const url = "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2";
            const response = await getJsonAuthenticated<AppSchemaResponse>(url, {appid: app_id.toString()});
            return response.game?.availableGameStats ?? null;
        }
    };
}

assert(process.env.STEAM_API_KEY);

export const steam = steamApi(process.env.STEAM_API_KEY);
