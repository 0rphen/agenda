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
      notes: dto.notes,
      reminder: dto.reminder,
      repeat: dto.repeat,
    };
  },

  fromEvent(event: Omit<CalendarEvent, 'id'>): Omit<CalendarEventDto, 'id'> {
    return {
      title: event.title,
      date: event.date,
      start: event.start,
      end: event.end,
      all_day: !event.start,
      category: event.category,
      category_label: event.categoryLabel,
      tint: event.tint,
      location: event.location,
      people: event.people,
      confirmed: event.confirmed,
      notes: event.notes,
      reminder: event.reminder,
      repeat: event.repeat,
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
      notes: dto.notes,
      priority: dto.priority,
      tags: dto.tags,
      subtasks: dto.subtasks,
    };
  },

  fromTask(task: Task): TaskDto {
    return {
      id: task.id,
      title: task.title,
      done: task.done,
      due: task.due,
      list: task.list,
      list_color: task.listColor,
      notes: task.notes,
      priority: task.priority,
      tags: task.tags,
      subtasks: task.subtasks,
    };
  },
};
