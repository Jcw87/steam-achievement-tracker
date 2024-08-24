
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { ProfileVisibility } from "../clients/steam/user.js";
import { UserAchievement } from "./user_achievement.js";
import { UserApp } from "./user_app.js";
import { UserFriend } from "./user_friend.js";
import { UserGroup } from "./user_group.js";

export enum UserRole {
    User = "user",
    Moderator = "moderator",
    Admin = "admin",
}

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn("bigint", {primaryKeyConstraintName: "user_pk"})
    steam_id: string;

    @Column("varchar", {nullable: true})
    name: string | null;

    @Column("varchar", {nullable: true})
    avatar: string | null;

    @Column("int8", {nullable: true})
    profile_visibility: ProfileVisibility | null;

    @Column("char", {nullable: true, length: 2})
    country_code: string;

    @Column("timestamptz", {nullable: true})
    updated: Date | null;

    @Column("timestamptz", {nullable: true})
    friends_updated: Date | null;

    @Column("timestamptz", {nullable: true})
    groups_updated: Date | null;

    @Column("timestamptz", {nullable: true})
    games_updated: Date | null;

    @Column("timestamptz", {nullable: true})
    achievements_updated: Date | null;

    @Column("enum", {enum: UserRole, default: UserRole.User})
    role: UserRole;

    @Column("int", {default: 0})
    friend_count: number;

    @Column("int", {default: 0})
    group_count: number;

    @Column("int", {default: 0})
    app_count: number;

    @Column("int", {default: 0})
    achievement_count: number;

    @Column("int", {default: 0})
    points: number;

    @OneToMany(() => UserFriend, user_friend => user_friend.user1)
    friends: UserFriend[];

    @OneToMany(() => UserFriend, user_friend => user_friend.user2)
    reverse_friends: UserFriend[];

    @OneToMany(() => UserGroup, user_group => user_group.user)
    groups: UserGroup[];

    @OneToMany(() => UserApp, user_app => user_app.user)
    apps: UserApp[];

    @OneToMany(() => UserAchievement, user_achievement => user_achievement.user)
    achievements: UserAchievement[];
}
