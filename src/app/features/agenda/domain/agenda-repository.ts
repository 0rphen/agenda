import { CalendarEvent } from './calendar-event.model';
import { Task } from './task.model';

export abstract class AgendaRepository {
  abstract listEvents(): Promise<CalendarEvent[]>;
  abstract listTasks(): Promise<Task[]>;
  abstract setTaskDone(id: string, done: boolean): Promise<void>;
}
