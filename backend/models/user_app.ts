
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { App } from "./app.js";
import { User } from "./user.js";

@Entity()
export class UserApp extends BaseEntity {
    @PrimaryColumn("bigint", {primaryKeyConstraintName: "user_app_pk"})
    user_id: string;

    @PrimaryColumn("int", {primaryKeyConstraintName: "user_app_pk"})
    app_id: number;

    @Column("timestamptz", {nullable: true})
    last_played: Date | null;

    @Column("timestamptz", {nullable: true})
    achievements_updated: Date | null;

    @Column("int", {default: 0})
    achievement_count: number;

    @Column("int", {default: 0})
    points: number;

    @ManyToOne(() => User, user => user.apps)
    @JoinColumn({ name: "user_id", foreignKeyConstraintName: "user_app_user_fk"})
    user: User;

    @ManyToOne(() => App, app => app.users)
    @JoinColumn({ name: "app_id", foreignKeyConstraintName: "user_app_app_fk"})
    app: App;
}
