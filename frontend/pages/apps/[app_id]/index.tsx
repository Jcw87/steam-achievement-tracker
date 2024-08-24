import { useQuery } from "@tanstack/react-query";
import { Container, Spinner, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { fetchApp, fetchAppAchievements } from "../../../api";
import { AchievementList } from "../../../components/AchievementList";
import { AppDetails } from "../../../components/AppDetails";
import { useAppBackground, useTitle } from "../../../hooks";

export default function App() {
  const params = useParams();
  const app = useQuery({
    queryFn: () => fetchApp(params.app_id),
    queryKey: ["App", params.app_id],
    staleTime: 1000 * 60 * 5,
  });
  const achievements = useQuery({
    queryFn: () => fetchAppAchievements(params.app_id),
    queryKey: ["AppAchievements", params.app_id],
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });
  useTitle(`${app.data?.name ?? "Game"} - Achievements`);
  useAppBackground(params.app_id);

  return (
    <Container>
      <Stack gap={2} className="align-items-center">
        {app.isPending ? <Spinner/> : <AppDetails app={app.data}/>}
        <AchievementList achievements={achievements.data}/>
        {achievements.isPlaceholderData ? <Spinner/> : null}
      </Stack>
    </Container>
  );
}
