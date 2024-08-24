import { useQuery } from "@tanstack/react-query";
import { Card, Container, Spinner, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { fetchApp, fetchAppAchievement } from "../../../../api";
import { AchievementIcon } from "../../../../components/AchievementIcon";
import { AppDetails } from "../../../../components/AppDetails";
import { useAppBackground, useTitle } from "../../../../hooks";

export default function AchievementPage() {
  const params = useParams();
  const app = useQuery({
    queryFn: () => fetchApp(params.app_id),
    queryKey: ["App", params.app_id],
    staleTime: 1000 * 60 * 5,
  });
  const achievement = useQuery({
    queryFn: () => fetchAppAchievement(params.app_id, params.name),
    queryKey: ["AppAchievement", params.app_id, params.name],
    staleTime: 1000 * 60 * 5,
  });
  useTitle(`${app.data?.name ?? "Game"} - ${achievement.data?.display_name}`);
  useAppBackground(params.app_id);

  return (
    <Container>
      <Stack gap={2} className="align-items-center">
        {app.isPending ? <Spinner/> : <AppDetails app={app.data}/>}
        {achievement.isPending ? <Spinner/> : (
          <>
            <Stack direction="horizontal">
              <AchievementIcon achievement={achievement.data} unlocked/>
              <Stack>
                <a>{achievement.data?.display_name}</a>
                <a>{achievement.data?.description}</a>
              </Stack>
              <AchievementIcon achievement={achievement.data}/>
            </Stack>
            <Card className="align-self-stretch">
              <Card.Header>Basic Info</Card.Header>
              <Card.Body>
                <table>
                  <tbody>
                    <tr>
                      <td>Achievers:</td>
                      <td>{achievement.data.achiever_count}</td>
                    </tr>
                    <tr>
                      <td>Players:</td>
                      <td>{app.data?.player_count}</td>
                    </tr>
                    <tr>
                      <td>Points:</td>
                      <td>{achievement.data.points}</td>
                    </tr>
                    <tr>
                      <td>API Name:</td>
                      <td>{achievement.data.name}</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  );
}
