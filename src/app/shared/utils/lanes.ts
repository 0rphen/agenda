import { Placed } from '@shared/interfaces';
import { toMin } from './time';

// Port of the DS dayLanes: overlapping events form a cluster and share its lane count
export function dayLanes<T extends { start: string; end: string }>(events: T[]): Placed<T>[] {
  const list = events
    .map((event) => ({
      event,
      start: toMin(event.start),
      end: toMin(event.end),
      lane: 0,
      lanes: 1,
    }))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  let cluster: Placed<T>[] = [];
  let laneEnds: number[] = [];
  let end = -1;
  const close = () => {
    cluster.forEach((x) => (x.lanes = laneEnds.length || 1));
    cluster = [];
    laneEnds = [];
  };
  for (const x of list) {
    if (cluster.length && x.start >= end) {
      close();
      end = -1;
    }
    let lane = 0;
    while (laneEnds[lane] !== undefined && laneEnds[lane] > x.start) lane++;
    laneEnds[lane] = x.end;
    x.lane = lane;
    end = Math.max(end, x.end);
    cluster.push(x);
  }
  close();
  return list;
}
