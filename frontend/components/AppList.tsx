
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { App } from "../api";
import { AppImage, AppImageType } from "./AppImage";

export interface AppListProps {
  apps: App[];
}

export function AppList({apps}: AppListProps) {
  return (
    <Table striped bordered variant="dark">
      <colgroup>
        <col style={{width: "1%"}}/>
        <col style={{width: "100%"}}/>
      </colgroup>
      <thead>
        <tr>
          <th>Logo</th>
          <th>Name</th>
          <th>Owners</th>
          <th>Players</th>
          <th>Total 🏆</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {apps.map(app => (
          <tr key={app.app_id}>
            <td><AppImage app_id={app.app_id.toString()} type={AppImageType.CapsuleSmall}/></td>
            <td><Link to={`/apps/${app.app_id}`}>{app.name}</Link></td>
            <td>{app.owner_count}</td>
            <td>{app.player_count}</td>
            <td>{app.achievement_count.toLocaleString()}</td>
            <td>{app.points}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
