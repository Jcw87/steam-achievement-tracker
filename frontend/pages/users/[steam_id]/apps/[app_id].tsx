
import { useQuery } from "@tanstack/react-query";
import { Container, Spinner, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { fetchApp, fetchUser, fetchUserAppAchievements } from "../../../../api";
import { AchievementList } from "../../../../components/AchievementList";
import { AppDetails } from "../../../../components/AppDetails";
import { useAppBackground, useTitle } from "../../../../hooks";

export default function UserAppAchievements() {
  const params = useParams();
  const user = useQuery({
    queryFn: () => fetchUser(params.steam_id),
    queryKey: ["User", params.steam_id],
    staleTime: 1000 * 60 * 5,
  });
  const app = useQuery({
    queryFn: () => fetchApp(params.app_id),
    queryKey: ["App", params.app_id],
    staleTime: 1000 * 60 * 5,
  });
  const achievements = useQuery({
    queryFn: () => fetchUserAppAchievements(params.steam_id, params.app_id),
    queryKey: ["UserAppAchievements", params.steam_id, params.app_id],
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });
  useTitle(`${user.data?.name ?? "User"} - ${app.data?.name ?? "Game"} - Achievements`);
  useAppBackground(params.app_id);

  return (
    <Container>
      <Stack gap={2} className="align-items-center">
        {app.isPending ? <Spinner/> : <AppDetails app={app.data}/>}
        <AchievementList user_achievements={achievements.data}/>
        {achievements.isPlaceholderData ? <Spinner/> : null}
      </Stack>
    </Container>
  );
}
