
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Container, Spinner, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { fetchUser, fetchUserApps } from "../../../../api";
import { PaginationGroup } from "../../../../components/PaginationGroup";
import { UserAppList } from "../../../../components/UserAppList";
import { usePage, useTitle } from "../../../../hooks";

export default function UserApps() {
  const params = useParams();
  const user = useQuery({
    queryFn: () => fetchUser(params.steam_id),
    queryKey: ["User", params.steam_id],
    staleTime: 1000 * 60 * 5,
  });
  const [page, setPage] = usePage();
  const [totalPages, setTotalPages] = useState(page);
  const apps = useQuery({
    queryFn: async () => {
      const data = await fetchUserApps(params.steam_id, page);
      setTotalPages(data.totalPages);
      return data;
    },
    queryKey: ["UserApps", params.steam_id, page],
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      totalPages: totalPages,
      results: [],
    }
  });
  useTitle(`${user.data?.name ?? "User"} - Games`);

  return (
    <Container>
      <Stack style={{alignItems: "center"}}>
        <h1>User Games</h1>
        <PaginationGroup current={page} total={apps.data.totalPages} onPage={setPage}/>
        <UserAppList user_apps={apps.data.results}/>
        {apps.isPlaceholderData ? <Spinner/> : null}
        <PaginationGroup current={page} total={apps.data.totalPages} onPage={setPage}/>
      </Stack>
    </Container>
  );
}
