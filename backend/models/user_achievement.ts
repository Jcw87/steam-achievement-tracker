
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Achievement } from "./achievement.js";
import { App } from "./app.js";
import { User } from "./user.js";

@Entity()
export class UserAchievement extends BaseEntity {
    @PrimaryColumn("bigint", {primaryKeyConstraintName: "user_achievement_pk"})
    user_id: string;

    @PrimaryColumn("int", {primaryKeyConstraintName: "user_achievement_pk"})
    app_id: number;

    @PrimaryColumn("varchar", {primaryKeyConstraintName: "user_achievement_pk"})
    name: string;

    @Column("boolean")
    achieved: boolean;

    @Column("timestamptz", {nullable: true})
    unlock_time: Date | null;

    @ManyToOne(() => Achievement, achievement => achievement.user_achievements)
    @JoinColumn([
        {name: "app_id", referencedColumnName: "app_id", foreignKeyConstraintName: "user_achievement_achievement_fk"},
        {name: "name", referencedColumnName: "name", foreignKeyConstraintName: "user_achievement_achievement_fk"},
    ])
    achievement: Achievement;

    @ManyToOne(() => App, app => app.user_achievements)
    @JoinColumn({ name: "app_id", foreignKeyConstraintName: "user_achievement_app_fk"})
    app: App;

    @ManyToOne(() => User, user => user.achievements)
    @JoinColumn({ name: "user_id", foreignKeyConstraintName: "user_achievement_user_fk"})
    user: User;
}
