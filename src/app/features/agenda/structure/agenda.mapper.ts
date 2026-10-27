import { CalendarEvent } from '../domain/calendar-event.model';
import { Task } from '../domain/task.model';
import { CalendarEventDto, TaskDto } from './agenda.dto';

export const AgendaMapper = {
  toEvent(dto: CalendarEventDto): CalendarEvent {
    return {
      id: dto.id,
      title: dto.title,
      date: dto.date,
      start: dto.all_day ? undefined : dto.start,
      end: dto.all_day ? undefined : dto.end,
      category: dto.category,
      categoryLabel: dto.category_label,
      tint: dto.tint,
      location: dto.location,
      people: dto.people ?? [],
      confirmed: dto.confirmed,
    };
  },

  toTask(dto: TaskDto): Task {
    return {
      id: dto.id,
      title: dto.title,
      done: dto.done,
      due: dto.due,
      list: dto.list,
      listColor: dto.list_color,
      subtasks: dto.subtasks,
    };
  },
};
