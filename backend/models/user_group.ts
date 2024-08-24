
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Group } from "./group.js";
import { User } from "./user.js";

@Entity()
export class UserGroup extends BaseEntity {
    @PrimaryColumn("bigint", { primaryKeyConstraintName: "user_group_pk" })
    user_id: string;

    @PrimaryColumn("bigint", { primaryKeyConstraintName: "user_group_pk" })
    group_id: string;

    @ManyToOne(() => User, user => user.groups)
    @JoinColumn({ name: "user_id", foreignKeyConstraintName: "user_group_user_fk" })
    user: User;

    @ManyToOne(() => Group, group => group.members)
    @JoinColumn({ name: "group_id", foreignKeyConstraintName: "user_group_group_fk" })
    group: Group;
}
