import { Col, Container, Row } from "react-bootstrap";
import { UserAchievement } from "../api";
import { AchievementIcon } from "./AchievementIcon";

export interface AchievementGridProps {
  achievements: UserAchievement[];
  width: number;
}

function split_every<T>(array: Array<T>, count: number) {
  const result: Array<Array<T>> = [];
  for (let i = 0; i < array.length; i += count) {
    result.push(array.slice(i, i + count));
  }
  return result;
}

export function AchievementGrid({achievements, width}: AchievementGridProps) {
  const achievement_rows = split_every(achievements, width);

  return (
    <Container>
      {achievement_rows.map((row, i) => (
        <Row key={i} className="flex-nowrap">
          {row.map(col => (
            <Col key={col.name} className="achievement-cell">
              <AchievementIcon achievement={col.achievement} unlocked={col.achieved} tooltip/>
            </Col>
          ))}
        </Row>
      ))}
    </Container>
  );
}
