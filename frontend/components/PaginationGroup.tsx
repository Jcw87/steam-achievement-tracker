
import { Pagination, PaginationProps} from "react-bootstrap";

export interface PaginationGroupProps extends PaginationProps {
  current: number;
  total: number;
  width?: number;
  onPage: (page: number) => void
}

function range(size: number, startAt: number = 0): ReadonlyArray<number> {
  return [...Array(size).keys()].map(i => i + startAt);
}

export function PaginationGroup({current, total, width, onPage, ...props}: PaginationGroupProps) {
  width = width ?? 3;
  const totalWidth = width * 2 + 1;

  const prev = current > 1;
  const middle = total > 2;
  const last = total > 1;
  const next = current < total;

  let begin, end;
  if (current <= 2 + width) {
    begin = 2;
    end = Math.min(totalWidth + 1, total - 1);
  } else if (current >= total - 1 - width) {
    end = total - 1;
    begin = Math.max(2, total - totalWidth);
  } else {
    begin = current - width;
    end = current + width;
  }

  const ellipsis1 = begin > 2;
  const ellipsis2 = end < total - 1;
  const middleElements = middle ? range(end - begin + 1, begin).map(i => (
    <Pagination.Item
      key={i}
      active={current === i}
      onClick={() => onPage(i)}
    >
      {i}
    </Pagination.Item>
  )) : null;

  return (
    <Pagination {...props}>
      <Pagination.Prev
        disabled={!prev}
        onClick={() => onPage(current - 1)}
      />
      <Pagination.Item
        active={current === 1}
        onClick={() => onPage(1)}
      >
        {1}
      </Pagination.Item>
      {ellipsis1 ? <Pagination.Ellipsis/> : null}
      {middleElements}
      {ellipsis2 ? <Pagination.Ellipsis/> : null}
      {last ? (
        <Pagination.Item
          active={current === total}
          onClick={() => onPage(total)}
        >
          {total}
        </Pagination.Item>
      ) : null}
      <Pagination.Next
        disabled={!next}
        onClick={() => onPage(current + 1)}
      />
    </Pagination>
  );
}
