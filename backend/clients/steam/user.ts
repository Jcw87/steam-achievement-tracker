
export enum ProfileVisibility {
    Unknown = 0,
    Private = 1,
    FriendsOnly = 2,
    Public = 3,
}

export enum ProfileState {
    NotConfigured = 0,
    Configured = 1,
}

export enum ProfileStatus {
    Offline = 0,
    Online = 1,
    Busy = 2,
    Away = 3,
    Snooze = 4,
    LookingToTrade = 5,
    LookingToPlay = 6,
}

export enum FriendRelationship {
    Friend = "friend",
}

export interface UserSummary {
    steamid: string;
    communityvisibilitystate: ProfileVisibility;
    profilestate: ProfileState;
    personaname: string;
    commentpermission: number;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    avatarhash: string;
    lastlogoff: number;
    personastate: ProfileStatus;
    primaryclanid: string;
    timecreated: number;
    personastateflags: number;
    loccountrycode: string;
    locstatecode: string;
}

export interface UserSummaryResponse {
    response: {
        players: UserSummary[];
    }
}

export interface UserFriend {
    steamid: string;
    relationship: FriendRelationship;
    friend_since: number;
}

export interface UserFriendResponse {
    friendslist: {
        friends: UserFriend[];
    }
}

export interface UserGroup {
    gid: string;
}

export interface UserGroupResponse {
    response: {
        success: boolean;
        groups: UserGroup[];
    }
}

export interface UserGame {
    appid: number;
    name?: string;
    playtime_forever: number;
    img_icon_url?: string;
    /** does not reliably distinguish whether an app has achievements or not */
    has_community_visible_stats?: boolean
    playtime_windows_forever?: number;
    playtime_mac_forever?: number
    playtime_linux_forever?: number;
    playtime_deck_forever?: number;
    /** only available for the profile that owns the API key */
    rtime_last_played?: number;
    content_descriptor_ids?: number[];
    playtime_disconnected?: number;
}

export interface UserGameResponse {
    response: {
        game_count: number;
        games: UserGame[];
    }
}

export interface UserAchievement {
    apiname: string;
    achieved: number;
    unlocktime: number;
    name?: string;
    description?: string;
}

export interface UserAchievementResponse {
    playerstats: {
        steamid: string;
        gameName: string;
        achievements: UserAchievement[];
        success: boolean;
    }
}
