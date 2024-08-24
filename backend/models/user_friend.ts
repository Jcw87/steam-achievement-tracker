
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.js";

@Entity()
export class UserFriend extends BaseEntity {
    @PrimaryColumn("bigint", {primaryKeyConstraintName: "user_friend_pk"})
    user1_id: string;

    @PrimaryColumn("bigint", {primaryKeyConstraintName: "user_friend_pk"})
    user2_id: string;

    @ManyToOne(() => User, user => user.friends)
    @JoinColumn({ name: "user1_id", foreignKeyConstraintName: "user_friend_user1_fk"})
    user1: User;

    @ManyToOne(() => User, user => user.reverse_friends)
    @JoinColumn({ name: "user2_id", foreignKeyConstraintName: "user_friend_user2_fk"})
    user2: User;
}
