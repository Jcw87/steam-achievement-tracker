
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { DEFAULT_NAME, RankedGroup } from "../api";
import { Avatar, AvatarSize } from "./Avatar";

export interface RankedGroupListProps {
  groups: RankedGroup[];
}

export function RankedGroupList({groups}: RankedGroupListProps) {
  return (
    <Table striped bordered variant="dark">
      <colgroup>
        <col style={{width: "7.4%"}}/>
        <col style={{width: "6.4%"}}/>
        <col style={{width: "73.4%"}}/>
        <col style={{width: "10.9%"}}/>
      </colgroup>
      <thead>
        <tr role="row">
          <th>Rank</th>
          <th>Icon</th>
          <th>Name</th>
          <th>Member Count</th>
        </tr>
      </thead>
      <tbody>
        {groups.map(group => (
          <tr key={group.group_id}>
            <td>{group.rank.toLocaleString()}</td>
            <td><Avatar avatar={group.avatar} size={AvatarSize.Icon}/></td>
            <td><Link to={`/groups/${group.group_id}` }>{group.name ?? DEFAULT_NAME}</Link></td>
            <td>{group.member_count ? group.member_count.toLocaleString() : 0}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
