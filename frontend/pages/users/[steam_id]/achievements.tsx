import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Container, Spinner, Stack } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { fetchUser, fetchUserAchievements } from "../../../api";
import { AchievementList } from "../../../components/AchievementList";
import { Avatar, AvatarSize } from "../../../components/Avatar";
import { PaginationGroup } from "../../../components/PaginationGroup";
import { usePage, useTitle } from "../../../hooks";

export default function Achievements() {
  const params = useParams();
  const user = useQuery({
    queryFn: () => fetchUser(params.steam_id),
    queryKey: ["User", params.steam_id],
    staleTime: 1000 * 60 * 5,
  });
  const [page, setPage] = usePage();
  const [totalPages, setTotalPages] = useState(page);
  const achievements = useQuery({
    queryFn: async () => {
      const data = await fetchUserAchievements(params.steam_id, page);
      setTotalPages(Math.max(1, data.totalPages));
      return data;
    },
    queryKey: ["UserAchievements", params.steam_id, page],
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      totalPages: totalPages,
      results: [],
    },
  });
  useTitle(`${user.data?.name ?? "User"} - Achievements`);

  return (
    <Container>
      <Stack gap={2} className="align-items-center">
        <h1>Achievements for</h1>
        <Link to={`/users/${params.steam_id}`}>{user.data?.name}</Link>
        <Link to={`/users/${params.steam_id}`}><Avatar avatar={user.data?.avatar} size={AvatarSize.Medium}/></Link>
        <PaginationGroup current={page} total={achievements.data.totalPages} onPage={setPage}/>
        <AchievementList user_achievements={achievements.data.results} show_app/>
        {achievements.isPlaceholderData ? <Spinner/> : null}
        <PaginationGroup current={page} total={achievements.data.totalPages} onPage={setPage}/>
      </Stack>
    </Container>
  );
}
