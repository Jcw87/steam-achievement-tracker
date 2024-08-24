
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Container, Spinner, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { fetchUser, fetchUserFriends } from "../../../api";
import { PaginationGroup } from "../../../components/PaginationGroup";
import { RankedUserList } from "../../../components/RankedUserList";
import { usePage, useTitle } from "../../../hooks";

export default function UserFriends() {
  const params = useParams();
  const user = useQuery({
    queryFn: () => fetchUser(params.steam_id),
    queryKey: ["User", params.steam_id],
    staleTime: 1000 * 60 * 5,
  });
  const [page, setPage] = usePage();
  const [totalPages, setTotalPages] = useState(page);
  const users = useQuery({
    queryFn: async () => {
      const data = await fetchUserFriends(params.steam_id, page);
      setTotalPages(Math.max(1, data.totalPages));
      return data;
    },
    queryKey: ["UserFriends", params.steam_id, page],
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      totalPages: totalPages,
      results: [],
    },
  });
  useTitle(`${user.data?.name ?? "User"} - Friends`);

  return (
    <Container>
      <Stack gap={2} className="align-items-center">
        <h1>Friends Leaderboard</h1>
        <PaginationGroup current={page} total={users.data.totalPages} onPage={setPage}/>
        <RankedUserList users={users.data.results}/>
        {users.isPlaceholderData ? <Spinner/> : null}
        <PaginationGroup current={page} total={users.data.totalPages} onPage={setPage}/>
      </Stack>
    </Container>
  );
}
