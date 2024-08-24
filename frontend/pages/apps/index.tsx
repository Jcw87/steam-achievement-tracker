
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Container, Spinner, Stack } from "react-bootstrap";
import { fetchApps } from "../../api";
import { AppList } from "../../components/AppList";
import { PaginationGroup } from "../../components/PaginationGroup";
import { usePage, useTitle } from "../../hooks";

export default function Apps() {
  const [page, setPage] = usePage();
  const [totalPages, setTotalPages] = useState(page);
  const apps = useQuery({
    queryFn: async () => {
      const data = await fetchApps(page);
      setTotalPages(data.totalPages);
      return data;
    },
    queryKey: ["Apps", page],
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      totalPages: totalPages,
      results: [],
    }
  });
  useTitle("Games");
  return (
    <Container>
      <Stack style={{alignItems: "center"}}>
        <h1>Games</h1>
        <PaginationGroup current={page} total={apps.data.totalPages} onPage={setPage}/>
        <AppList apps={apps.data.results}/>
        {apps.isPlaceholderData ? <Spinner/> : null}
        <PaginationGroup current={page} total={apps.data.totalPages} onPage={setPage}/>
      </Stack>
    </Container>
  );
}
