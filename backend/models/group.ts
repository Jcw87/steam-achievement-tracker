
import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { UserGroup } from "./user_group.js";

@Entity()
export class Group extends BaseEntity {
    @PrimaryColumn("bigint", {primaryKeyConstraintName: "group_pk"})
    group_id: string;

    @Column("varchar", {nullable: true})
    name: string | null;

    @Column("varchar", {nullable: true})
    avatar: string | null;

    get avatar_icon() {
        return this.avatar ? `https://avatars.akamai.steamstatic.com/${this.avatar}.jpg` : null;
    }

    get avatar_medium() {
        return this.avatar ? `https://avatars.akamai.steamstatic.com/${this.avatar}_medium.jpg` : null;
    }

    get avatar_full() {
        return this.avatar ? `https://avatars.akamai.steamstatic.com/${this.avatar}_full.jpg` : null;
    }

    @Index("group_member_count_idx")
    @Column("int", {nullable: true})
    member_count: number;

    @Column("timestamptz", {nullable: true})
    updated: Date | null;

    @OneToMany(() => UserGroup, user_group => user_group.group)
    members: UserGroup[];
}
