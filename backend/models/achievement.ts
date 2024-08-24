import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { App } from "./app.js";
import { UserAchievement } from "./user_achievement.js";

@Entity()
export class Achievement extends BaseEntity {
    @PrimaryColumn("int", {primaryKeyConstraintName: "achievement_pk"})
    app_id: number;

    @PrimaryColumn("varchar", {primaryKeyConstraintName: "achievement_pk"})
    name: string;

    @Column("varchar")
    display_name: string;

    @Column("varchar")
    description: string;

    @Column("varchar", {nullable: true})
    icon: string;

    @Column("varchar", {nullable: true})
    icon_locked: string;

    @Column("boolean", {nullable: true})
    hidden: boolean;

    @Column("int", {default: 0})
    achiever_count: number;

    @Column("double precision", {default: 1})
    points: number;

    @ManyToOne(() => App, app => app.achievements)
    @JoinColumn({ name: "app_id", foreignKeyConstraintName: "achievement_app_fk"})
    app: App;

    @OneToMany(() => UserAchievement, user_achievement => user_achievement.achievement)
    user_achievements: UserAchievement[];
}
