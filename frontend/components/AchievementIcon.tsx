import { Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Achievement } from "../api";

export interface AchievementIconProps {
  achievement: Achievement;
  unlocked?: boolean;
  tooltip?: boolean;
}

function getRarity(value: number) {
  if (value >= 20) return "legendary";
  if (value >= 10) return "epic";
  if (value >= 4) return "rare";
  if (value >= 2) return "uncommon";
  if (value > 0) return "common";
  return "broken";
}

export function AchievementIcon({achievement, unlocked, tooltip}: AchievementIconProps) {
  const imageName = unlocked ? achievement.icon : achievement.icon_locked;
  const imageUrl = `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${achievement.app_id}/${imageName}.jpg`;
  const linkUrl = `/apps/${achievement.app_id}/achievements/${achievement.name}`;
  const className = ["achievement-box", `achievement-${getRarity(achievement.points)}`].join(" ");
  const title = [
    achievement.app?.name ?? "",
    achievement.display_name,
    `Value: ${achievement.points}`,
  ];
  return (
    <div className={className}>
      <Link to={linkUrl}>
        <Image src={imageUrl} width={64} height={64} title={tooltip ? title.join("\n") : undefined}/>
      </Link>
    </div>
  );
}
