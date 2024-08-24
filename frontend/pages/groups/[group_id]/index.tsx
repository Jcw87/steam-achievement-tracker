import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Container, Spinner, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { fetchGroup, fetchGroupMembers } from "../../../api";
import { Avatar, AvatarSize } from "../../../components/Avatar";
import { PaginationGroup}  from "../../../components/PaginationGroup";
import { RankedUserList } from "../../../components/RankedUserList";
import { usePage, useTitle } from "../../../hooks";

export default function Group() {
  const params = useParams();
  const group = useQuery({
    queryKey: ["Groups", params.group_id],
    queryFn: () => fetchGroup(params.group_id),
    staleTime: 1000 * 60 * 5,
  });
  const [page, setPage] = usePage();
  const [totalPages, setTotalPages] = useState(page);
  const users = useQuery({
    queryFn: async () => {
      const data = await fetchGroupMembers(params.group_id, page);
      setTotalPages(Math.max(1, data.totalPages));
      return data;
    },
    queryKey: ["GroupMembers", params.group_id, page],
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      totalPages: totalPages,
      results: [],
    },
  });
  useTitle(group.data?.name ?? `Group ${params.group_id}`);

  return (
    <Container>
      <Stack gap={20} style={{alignItems: "center"}}>
        <h1>{group.data?.name ?? "Group"} Leaderboard</h1>
        <Avatar avatar={group.data?.avatar} size={AvatarSize.Medium} width={64} height={64}/>
        <PaginationGroup current={page} total={users.data.totalPages} onPage={setPage}/>
        <RankedUserList users={users.data.results}/>
        {users.isPlaceholderData ? <Spinner/> : null}
        <PaginationGroup current={page} total={users.data.totalPages} onPage={setPage}/>
      </Stack>
    </Container>
  );
}
