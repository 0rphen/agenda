import { addDays, localIso, SHORT_DAY, toMin, weekStart } from '@shared/utils';
import { ListProgress } from './domain/agenda-view.model';
import { CalendarEvent } from './domain/calendar-event.model';
import { Task } from './domain/task.model';

/** Completion per list for tasks due in the week of `day` (starting Monday, or Sunday with `firstDay` 0). */
export function weekProgress(tasks: Task[], day: string, firstDay: 0 | 1 = 1): ListProgress[] {
  const from = weekStart(day, firstDay);
  const to = addDays(from, 6);
  const lists = new Map<string, { done: number; total: number }>();
  for (const task of tasks) {
    if (!task.list || !task.due || task.due < from || task.due > to) continue;
    const counts = lists.get(task.list) ?? { done: 0, total: 0 };
    lists.set(task.list, { done: counts.done + Number(task.done), total: counts.total + 1 });
  }
  return [...lists]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([list, { done, total }]) => ({ list, value: Math.round((done / total) * 100) }));
}

export function isOverdue(task: Task, today: string): boolean {
  return !task.done && !!task.due && task.due < today;
}

/** Duration in minutes; 0 for all-day events. */
export function eventMinutes(event: CalendarEvent): number {
  return event.start && event.end ? toMin(event.end) - toMin(event.start) : 0;
}

export function startsIn(event: CalendarEvent, now: Date): string {
  const today = localIso(now);
  if (event.date === addDays(today, 1)) return 'Mañana';
  if (event.date !== today) return SHORT_DAY.format(new Date(`${event.date}T00:00:00Z`));
  const minutes = Math.max(
    0,
    toMin(event.start ?? '00:00') - now.getHours() * 60 - now.getMinutes(),
  );
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h && m ? `En ${h} h ${m} min` : h ? `En ${h} h` : `En ${m} min`;
}
