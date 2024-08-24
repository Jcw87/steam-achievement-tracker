
export enum AppType {
    Game = "game",
}

export interface App {
    type: AppType;
    name: string;
    stead_appid: number;
    required_age: number;
    is_free: boolean;
    controller_support: string;
    dlc: number[];
    detailed_description: string;
    about_the_game: string;
    short_description: string;
    supported_languages: string;
    header_image: string;
    capsule_image: string;
    capsule_imagev5: string;
    website: string;
    //pc_requirements: {}
    //mac_requirements: {}
    //linux_requirements: {}
    developers: string[];
    publishers: string[];
    //demos: [];
    //price_overview: {}
    packages: number[];
    //package_groups: [];
    //platforms: {}
    metacritic: {
        score: number;
        url: string;
    }
    //categories: [];
    //genres: [];
    //screenshots: [];
    //movies: [];
    recommendations: {
        total: number;
    }
    achievements?: {
        total: number;
        //highlighted: [];
    }
    release_date: {
        coming_soon: boolean;
        date: string;
    }
    support_info: {
        url: string;
        email: string;
    }
    background: string;
    background_raw: string;
    //content_descriptors: {};
    //ratings: {};
}

export type AppResponse = Record<string, {success: boolean, data: App}>;

export interface AppStat {
    name: string;
    defaultvalue: number;
    displayName: string;
}

export interface AppAchievement extends AppStat {
    hidden: number;
    description?: string;
    icon: string;
    icongray: string;
}

export interface AppSchema {
    stats?: AppStat[];
    achievements: AppAchievement[];
}

export interface AppSchemaResponse {
    game: {
        gameName?: string;
        gameVersion?: string;
        availableGameStats?: AppSchema;
    }
}
