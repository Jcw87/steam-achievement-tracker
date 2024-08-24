
import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Achievement } from "./achievement.js";
import { UserAchievement } from "./user_achievement.js";
import { UserApp } from "./user_app.js";

@Entity()
export class App extends BaseEntity {
    @PrimaryColumn("int", {primaryKeyConstraintName: "app_pk"})
    app_id: number;

    @Column("varchar")
    name: string;

    @Column("boolean", {nullable: true})
    has_community_visible_stats: boolean | null;

    @Column("boolean", {nullable: true})
    has_achievements: boolean | null;

    @Column("timestamptz", {nullable: true})
    updated: Date | null;

    @Column("timestamptz", {nullable: true})
    achievements_updated: Date | null;

    @Column("int", {default: 0})
    achievement_count: number;

    @Column("int", {default: 0})
    owner_count: number;

    @Column("int", {default: 0})
    player_count: number;

    @Index("app_points_idx")
    @Column("int", {default: 0})
    points: number;

    @OneToMany(() => Achievement, achievement => achievement.app)
    achievements: Achievement[];

    @OneToMany(() => UserApp, user_app => user_app.app)
    users: UserApp[];

    @OneToMany(() => UserAchievement, user_achievement => user_achievement.app)
    user_achievements: UserAchievement[];
}
