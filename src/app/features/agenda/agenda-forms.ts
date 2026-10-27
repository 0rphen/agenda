import { EventFormValue, TaskFormValue } from '@shared/interfaces';
import { Category } from '@shared/types';
import { CalendarEvent } from './domain/calendar-event.model';
import { Task } from './domain/task.model';

export const TASK_LIST_COLORS: Record<string, Category> = {
  Personal: 'orange',
  Trabajo: 'blue',
  Casa: 'green',
};

export const EVENT_CATEGORY_COLORS: Record<string, Category> = {
  Marketing: 'orange',
  Estrategia: 'violet',
  Descubrimiento: 'cyan',
  Desarrollo: 'blue',
  Personal: 'red',
  Finanzas: 'mustard',
  Clientes: 'green',
};

export function taskToForm(task: Task): TaskFormValue {
  return {
    title: task.title,
    notes: task.notes ?? '',
    list: task.list ?? '',
    due: task.due ?? '',
    priority: task.priority ?? 'media',
    tags: task.tags ?? [],
    subtasks: task.subtasks ?? [],
  };
}

export function formToTask(task: Task, value: TaskFormValue): Task {
  return {
    ...value,
    id: task.id,
    done: task.done,
    due: value.due || undefined,
    listColor: TASK_LIST_COLORS[value.list],
  };
}

export function formToEvent(value: EventFormValue): Omit<CalendarEvent, 'id'> {
  return {
    title: value.title,
    date: value.date,
    start: value.allDay ? undefined : value.start,
    end: value.allDay ? undefined : value.end,
    category: EVENT_CATEGORY_COLORS[value.category],
    categoryLabel: value.category,
    location: value.location || undefined,
    people: value.people
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
    confirmed: false,
    notes: value.notes || undefined,
    reminder: value.reminder || undefined,
    repeat: value.repeat || undefined,
  };
}
