import { Stack, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Achievement, UserAchievement } from "../api";
import { AchievementIcon } from "./AchievementIcon";
import { AppImage, AppImageType } from "./AppImage";


interface AchievementRowProps {
  achievement?: Achievement;
  user_achievement?: UserAchievement;
  show_app?: boolean;
}

function AchievementRow({achievement, user_achievement, show_app}: AchievementRowProps) {
  achievement = achievement ?? user_achievement.achievement;

  return (
    <tr>
      {show_app ? <td><AppImage app_id={achievement.app_id} type={AppImageType.CapsuleSmall}/></td> : null}
      <td><AchievementIcon achievement={achievement} unlocked={user_achievement ? user_achievement.achieved : true}/></td>
      <td>
        <Stack>
          <Link to={`/apps/${achievement.app_id}/achievements/${achievement.name}`}>{achievement.display_name}</Link>
          <a>{achievement.description}</a>
        </Stack>
      </td>
      <td>{achievement.achiever_count.toLocaleString()}</td>
      <td>{achievement.points.toLocaleString()}</td>
      <td></td>
      {user_achievement ? <td>{user_achievement.achieved ? user_achievement.unlock_time : ""}</td> : null}
    </tr>
  );
}

export interface AchievementListProps {
  achievements?: Achievement[];
  user_achievements?: UserAchievement[];
  show_app?: boolean;
}

export function AchievementList({achievements, user_achievements, show_app}: AchievementListProps) {
  return (
    <Table striped bordered variant="dark">
      <colgroup>
        <col width="1%"/>
      </colgroup>
      <thead>
        <tr role="row">
          {show_app ? <th>Game</th> : null}
          <th>Icon</th>
          <th>Name</th>
          <th>Achievers</th>
          <th>Value</th>
          <th>Tag</th>
          {user_achievements ? <th>Date</th> : null}
        </tr>
      </thead>
      <tbody>
        {user_achievements ? (
          user_achievements.map(a => <AchievementRow key={a.name} user_achievement={a} show_app={show_app}/>)
        ) : (
          achievements.map(a => <AchievementRow key={a.name} achievement={a} show_app={show_app}/>)
        )}
      </tbody>
    </Table>
  );
}
