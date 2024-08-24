
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { DEFAULT_NAME, User } from "../api";
import { Avatar, AvatarSize } from "./Avatar";
import { CountryIcon } from "./CountryIcon";

export interface RankedUser extends User {
  rank?: number;
}

export interface RankedUserListProps {
  users: RankedUser[];
}

export function RankedUserList({users}: RankedUserListProps) {
  return (
    <Table striped bordered variant="dark">
      <colgroup>
        <col style={{width: "4.8%"}}/>
        <col style={{width: "4.2%"}}/>
        <col style={{width: "51.4%"}}/>
        <col style={{width: "2.9%"}}/>
        <col style={{width: "6.3%"}}/>
        <col style={{width: "6.5%"}}/>
        <col style={{width: "7.4%"}}/>
        <col style={{width: "5.9%"}}/>
        <col style={{width: "4.2%"}}/>
      </colgroup>
      <thead>
        <tr role="row">
          <th>Rank</th>
          <th>Icon</th>
          <th>Name</th>
          <th></th>
          <th>Points</th>
          <th>Games total</th>
          <th>Total 🏆</th>
          <th>100% total</th>
          <th>Flag</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.steam_id}>
            <td>{user.rank ?? 0}</td>
            <td><Avatar avatar={user.avatar} size={AvatarSize.Icon}/></td>
            <td><Link to={`/users/${user.steam_id}` }>{user.name ?? DEFAULT_NAME}</Link></td>
            <td></td>
            <td>{user.points.toLocaleString()}</td>
            <td>{user.app_count.toLocaleString()}</td>
            <td>{user.achievement_count.toLocaleString()}</td>
            <td>0</td>
            <td><CountryIcon code={user.country_code}/></td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
