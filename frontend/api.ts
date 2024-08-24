
export const DEFAULT_NAME = "<unknown>";
export const DEFAULT_AVATAR = "b5bd56c1aa4644a474a2e4972be27ef9e82e517e";

export interface Achievement {
    app_id: number;
    name: string;
    display_name: string;
    description: string;
    icon: string | null;
    icon_locked: string | null;
    hidden: boolean | null;
    achiever_count: number;
    points: number;
    app?: App
}

export interface App {
    app_id: number;
    name: string;
    has_achievements: boolean;
    achievement_count: number;
    owner_count: number;
    player_count: number;
    points: number;
}

export interface Group {
    group_id: string;
    name: string;
    avatar: string;
    member_count: number;
}

export interface User {
    steam_id: string;
    name: string;
    avatar: string;
    country_code: string;
    friend_count: number;
    group_count: number;
    app_count: number;
    achievement_count: number;
    points: number;
}

export interface UserAchievement {
    app_id: number;
    name: string;
    user_id: string;
    achieved: boolean;
    unlock_time: string;
    achievement: Achievement;
}

export interface UserApp {
    user_id: string;
    app_id: number;
    last_played: string;
    achievement_count: number;
    points: number;
    app: App;
}

export interface AchievementRarity {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
}

export interface AchievementSummary {
    recent: UserAchievement[];
    valuable: UserAchievement[];
    rarity: AchievementRarity;
}

export interface RankedGroup extends Group {
    rank: number;
}

export interface Job {
    id: string;
    name: string;
    failedReason: string;
}

export interface PaginationResponse<T> {
    totalPages: number;
    results: Array<T>;
}

export async function fetchAccount() {
    const url = "/api/account";
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Fetch account HTTP ${response.status}`);
    }
    return await response.json() as User;
}

export async function fetchApps(page: number = 1) {
    const params = new URLSearchParams({page: page.toString()});
    const url = `/api/apps?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch apps HTTP ${response.status}`);
    }
    return await response.json() as PaginationResponse<App>;
}

export async function fetchApp(app_id: string) {
    const url = `/api/apps/${app_id}`;
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Fetch app HTTP ${response.status}`);
    }
    return await response.json() as App;
}

export async function fetchAppAchievements(app_id: string) {
    const url = `/api/apps/${app_id}/achievements`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch app achievements HTTP ${response.status}`);
    }
    return await response.json() as Achievement[];
}

export async function fetchAppAchievement(app_id: string, name: string) {
    const url = `/api/apps/${app_id}/achievements/${name}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch app achievement HTTP ${response.status}`);
    }
    return await response.json() as Achievement;
}

export async function fetchGroup(group_id: string) {
    const url = `/api/groups/${group_id}`;
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Fetch group HTTP ${response.status}`);
    }
    return await response.json() as Group;
}

export async function fetchUsers(page: number = 1) {
    const params = new URLSearchParams({page: page.toString()});
    const url = `/api/users?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch users HTTP ${response.status}`);
    }
    return await response.json() as PaginationResponse<User>;
}

export async function fetchGroupMembers(group_id: string, page: number = 1) {
    const params = new URLSearchParams({page: page.toString()});
    const url = `/api/groups/${group_id}/members?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch group members HTTP ${response.status}`);
    }
    return await response.json() as PaginationResponse<User>;
}

export async function fetchUser(steam_id: string) {
    const url = `/api/users/${steam_id}`;
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Fetch user HTTP ${response.status}`);
    }
    return await response.json() as User;
}

export async function fetchUserAchievements(steam_id: string, page: number = 1) {
    const params = new URLSearchParams();
    if (page) {
        params.append("page", page.toString());
    }
    const url = `/api/users/${steam_id}/achievements?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch user HTTP ${response.status}`);
    }
    return await response.json() as PaginationResponse<UserAchievement>;
}

export async function fetchUserAchievementSummary(steam_id: string) {
    const url = `/api/users/${steam_id}/achievement_summary`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch user achievement summary HTTP ${response.status}`);
    }
    return await response.json() as AchievementSummary;
}

export async function fetchUserFriends(steam_id: string, page: number = 1) {
    const params = new URLSearchParams();
    if (page) {
        params.append("page", page.toString());
    }
    const url = `/api/users/${steam_id}/friends?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch user friends HTTP ${response.status}`);
    }
    return await response.json() as PaginationResponse<User>;
}

export async function fetchUserGroups(steam_id: string, page: number = 1) {
    const params = new URLSearchParams();
    if (page) {
        params.append("page", page.toString());
    }
    const url = `/api/users/${steam_id}/groups?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch user groups HTTP ${response.status}`);
    }
    return await response.json() as PaginationResponse<RankedGroup>;
}

export async function fetchUserApps(steam_id: string, page: number = 1) {
    const params = new URLSearchParams();
    if (page) {
        params.append("page", page.toString());
    }
    const url = `/api/users/${steam_id}/apps?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch user apps HTTP ${response.status}`);
    }
    return await response.json() as PaginationResponse<UserApp>;
}

export async function fetchUserAppAchievements(steam_id: string, app_id: string) {
    const url = `/api/users/${steam_id}/apps/${app_id}/achievements`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fetch user apps HTTP ${response.status}`);
    }
    return await response.json() as UserAchievement[];
}
