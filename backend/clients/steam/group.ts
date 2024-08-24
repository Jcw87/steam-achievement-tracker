
export interface GroupDetails {
    groupName: string;
    groupUrl: string;
    headline: string;
    summary: string;
    avatarIcon: string;
    avatarMedium: string;
    avatarFull: string;
    memberCount: number;
    membersInChar: number;
    membersInGame: number;
    membersOnline: number;
}

export interface GroupMemberList {
    groupID64: string | number;
    groupDetails: GroupDetails;
    memberCount: number;
    totalPages: number;
    currentPage: number;
    startingMember: number;
    nextPageLink: string;
    members: {
        steamID64: Array<string | number>;
    }
}

export interface GroupMemberListResponse {
    memberList: GroupMemberList
}
