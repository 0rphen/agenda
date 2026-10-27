import { eventMinutes, isOverdue, startsIn, weekProgress } from './agenda-queries';
import { CalendarEvent } from './domain/calendar-event.model';
import { Task } from './domain/task.model';

const event = (date: string, start?: string, end?: string): CalendarEvent => ({
  id: 'e',
  title: 'e',
  date,
  start,
  end,
  people: [],
  confirmed: false,
});
const task = (due: string | undefined, list: string | undefined, done = false): Task => ({
  id: 't',
  title: 't',
  due,
  list,
  done,
});

describe('agenda-queries', () => {
  it('weekProgress counts tasks due in the week of the day, per list, sorted', () => {
    const tasks = [
      task('2026-10-19', 'Trabajo', true),
      task('2026-10-25', 'Trabajo'),
      task('2026-10-22', 'Casa', true),
      task('2026-10-26', 'Casa'), // next week
      task(undefined, 'Casa'),
      task('2026-10-22', undefined),
    ];
    expect(weekProgress(tasks, '2026-10-22')).toEqual([
      { list: 'Casa', value: 100 },
      { list: 'Trabajo', value: 50 },
    ]);
  });

  it('isOverdue only for pending tasks due before today', () => {
    expect(isOverdue(task('2026-10-21', 'x'), '2026-10-22')).toBe(true);
    expect(isOverdue(task('2026-10-22', 'x'), '2026-10-22')).toBe(false);
    expect(isOverdue(task('2026-10-21', 'x', true), '2026-10-22')).toBe(false);
    expect(isOverdue(task(undefined, 'x'), '2026-10-22')).toBe(false);
  });

  it('eventMinutes returns duration, 0 for all-day', () => {
    expect(eventMinutes(event('2026-10-22', '09:00', '10:30'))).toBe(90);
    expect(eventMinutes(event('2026-10-22'))).toBe(0);
  });

  it('startsIn formats relative start from now', () => {
    const now = new Date(2026, 9, 22, 8, 40);
    expect(startsIn(event('2026-10-22', '10:00'), now)).toBe('En 1 h 20 min');
    expect(startsIn(event('2026-10-22', '09:00'), now)).toBe('En 20 min');
    expect(startsIn(event('2026-10-22', '10:40'), now)).toBe('En 2 h');
    expect(startsIn(event('2026-10-23', '09:00'), now)).toBe('Mañana');
    expect(startsIn(event('2026-10-27', '09:00'), now)).toBe('27 oct');
  });
});
