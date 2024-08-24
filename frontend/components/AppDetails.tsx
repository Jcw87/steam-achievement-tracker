import { Card, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { App } from "../api";
import { AppImage, AppImageType } from "./AppImage";

export interface AppDetailsProps {
    app: App
}

export function AppDetails({app}: AppDetailsProps) {
  const app_id = app.app_id.toString();

  return (
    <>
      <Stack direction="horizontal" className="justify-content-evenly">
        <Link to={`/apps/${app_id}`}>
          <AppImage app_id={app_id} type={AppImageType.Header}/>
        </Link>
        <Stack className="flex-grow-0">
          <a>Links</a>
          <a href={`steam://run/${app_id}`}>Launch with Steam</a>
          <a href={`http://store.steampowered.com/app/${app_id}`}>Steam store</a>
          <a href={`http://storefront.steampowered.com/v/forums.php?AppId=${app_id}`}>Steam forum</a>
          <a href={`http://steamcommunity.com/profiles/${app_id}/stats/AppID/${app_id}/?tab=achievements`}>Achievement Page</a>
        </Stack>
      </Stack>
      <Card className="align-self-stretch">
        <Card.Header>
          {app.name ?? "<unknown app>"}
        </Card.Header>
        <Card.Body>
          <Stack direction="horizontal">
            <Stack>
              <Card.Title>Owners</Card.Title>
              <Card.Text>{app.owner_count}</Card.Text>
              <Card.Title>Players</Card.Title>
              <Card.Text>{app.player_count}</Card.Text>
            </Stack>
            <Stack>
              <Card.Title>Achievements</Card.Title>
              <Card.Text>{app.achievement_count}</Card.Text>
              <Card.Title>Points</Card.Title>
              <Card.Text>{app.points}</Card.Text>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>
    </>
  );
}
