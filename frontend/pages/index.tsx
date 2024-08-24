import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Container, Spinner, Stack } from "react-bootstrap";
import { fetchUsers } from "../api";
import { PaginationGroup } from "../components/PaginationGroup";
import { RankedUserList } from "../components/RankedUserList";
import { usePage, useTitle } from "../hooks";

export default function Home() {
  const [page, setPage] = usePage();
  const [totalPages, setTotalPages] = useState(page);
  const users = useQuery({
    queryFn: async () => {
      const data = await fetchUsers(page);
      setTotalPages(Math.max(1, data.totalPages));
      return data;
    },
    queryKey: ["Users", page],
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      totalPages: totalPages,
      results: [],
    },
  });
  useTitle("Home");

  return (
    <Container>
      <Stack style={{alignItems: "center"}}>
        <h1>Global Leaderboard</h1>
        <PaginationGroup current={page} total={users.data.totalPages} onPage={setPage}/>
        <RankedUserList users={users.data.results}/>
        {users.isPlaceholderData ? <Spinner/> : null}
        <PaginationGroup current={page} total={users.data.totalPages} onPage={setPage}/>
      </Stack>
    </Container>
  );
}
