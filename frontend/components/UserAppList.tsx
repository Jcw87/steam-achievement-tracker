
import { Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { UserApp } from "../api";
import { AppImage, AppImageType } from "./AppImage";

const percent_format = new Intl.NumberFormat('default', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export interface UserAppListProps {
  user_apps: UserApp[];
}

export function UserAppList({user_apps}: UserAppListProps) {
  const params = useParams();

  return (
    <Table striped bordered variant="dark">
      <colgroup>
        <col style={{width: "1%"}}/>
        <col style={{width: "100%"}}/>
      </colgroup>
      <thead>
        <tr role="row">
          <th>Logo</th>
          <th>Name</th>
          <th>Gained 🏆</th>
          <th>Total 🏆</th>
          <th>Percent</th>
          <th>To Go</th>
          <th>Gained Points</th>
          <th>Total Points</th>
        </tr>
      </thead>
      <tbody>
        {user_apps.map(ua => (
          <tr key={ua.app_id}>
            <td><AppImage app_id={ua.app_id.toString()} type={AppImageType.CapsuleSmall}/></td>
            <td><Link to={`/users/${params.steam_id}/apps/${ua.app_id}`}>{ua.app.name}</Link></td>
            <td>{ua.achievement_count.toLocaleString()}</td>
            <td>{ua.app.achievement_count.toLocaleString()}</td>
            <td>{ua.app.achievement_count ? percent_format.format(ua.achievement_count / ua.app.achievement_count) : ""}</td>
            <td>{ua.app.achievement_count - ua.achievement_count}</td>
            <td>{ua.points}</td>
            <td>{ua.app.points}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
