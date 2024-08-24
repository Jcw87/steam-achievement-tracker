
import { AVATAR_REGEX, steam } from "../clients/steam/index.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { UserGroup } from "../models/user_group.js";

function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export async function scrapeGroup(group_id: string) {
    let group = await steam.getGroupMembers(group_id, 1);
    await Group.upsert({
        group_id: group_id,
        name: group.groupDetails.groupName,
        avatar: group.groupDetails.avatarIcon.replace(AVATAR_REGEX, '$1'),
        member_count: group.memberCount,
    }, {
        conflictPaths: ["group_id"],
        skipUpdateIfNoValuesChanged: true,
    });
    async function updateGroupMembers(steam_ids: string[]) {
        await User.upsert(steam_ids.map(steam_id => ({
            steam_id: steam_id,
        })), {
            conflictPaths: ["steam_id"],
            skipUpdateIfNoValuesChanged: true,
        });
        await UserGroup.upsert(steam_ids.map(steam_id => ({
            user_id: steam_id,
            group_id: group_id,
        })), {
            conflictPaths: ["user_id", "group_id"],
            skipUpdateIfNoValuesChanged: true,
        });
    }
    await updateGroupMembers(group.members.steamID64.map(steam_id => steam_id.toString()));
    await sleep(2 * 1000);
    const totalPages = group.totalPages;
    for (let i = 2; i <= totalPages; i++) {
        group = await steam.getGroupMembers(group_id, i);
        await updateGroupMembers(group.members.steamID64.map(steam_id => steam_id.toString()));
    }
    await Group.update({group_id: group_id}, {updated: new Date()});
}
