
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Container, Spinner, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { fetchUser, fetchUserGroups } from "../../../api";
import { PaginationGroup } from "../../../components/PaginationGroup";
import { RankedGroupList } from "../../../components/RankedGroupList";
import { usePage, useTitle } from "../../../hooks";

export default function UserGroups() {
  const params = useParams();
  const user = useQuery({
    queryFn: () => fetchUser(params.steam_id),
    queryKey: ["User", params.steam_id],
    staleTime: 1000 * 60 * 5,
  });
  const [page, setPage] = usePage();
  const [totalPages, setTotalPages] = useState(page);
  const groups = useQuery({
    queryFn: async () => {
      const data = await fetchUserGroups(params.steam_id, page);
      setTotalPages(Math.max(1, data.totalPages));
      return data;
    },
    queryKey: ["UserGroups", params.steam_id, page],
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      totalPages: totalPages,
      results: [],
    },
  });
  useTitle(`${user.data?.name ?? "User"} - Groups`);

  return (
    <Container>
      <Stack style={{alignItems: "center"}}>
        <h1>Groups</h1>
        <PaginationGroup current={page} total={groups.data.totalPages} onPage={setPage}/>
        <RankedGroupList groups={groups.data.results}/>
        {groups.isPlaceholderData ? <Spinner/> : null}
        <PaginationGroup current={page} total={groups.data.totalPages} onPage={setPage}/>
      </Stack>
    </Container>
  );
}
