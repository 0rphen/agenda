import { Injectable, inject } from '@angular/core';
import { AgendaUnavailableError } from '../domain/agenda-errors';
import { AgendaRepository } from '../domain/agenda-repository';
import { CalendarEvent } from '../domain/calendar-event.model';
import { Task } from '../domain/task.model';
import { CalendarEventDto, TaskDto } from './agenda.dto';
import { AgendaMapper } from './agenda.mapper';
import { LocalStorageApi } from './local-storage-api';

@Injectable()
export class AgendaLocalRepository extends AgendaRepository {
  private readonly api = inject(LocalStorageApi);

  listEvents(): Promise<CalendarEvent[]> {
    return this.call(async () =>
      (await this.api.get<CalendarEventDto>('/events')).map(AgendaMapper.toEvent),
    );
  }

  listTasks(): Promise<Task[]> {
    return this.call(async () => (await this.api.get<TaskDto>('/tasks')).map(AgendaMapper.toTask));
  }

  setTaskDone(id: string, done: boolean): Promise<void> {
    return this.call(async () => {
      await this.api.patch<TaskDto>('/tasks', id, { done });
    });
  }

  createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    return this.call(async () =>
      AgendaMapper.toEvent(
        await this.api.post<CalendarEventDto>('/events', AgendaMapper.fromEvent(event)),
      ),
    );
  }

  updateTask(task: Task): Promise<void> {
    return this.call(async () => {
      await this.api.patch<TaskDto>('/tasks', task.id, AgendaMapper.fromTask(task));
    });
  }

  // Mapping inside the try: valid JSON with the wrong shape is also unreadable storage.
  private async call<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (cause) {
      throw new AgendaUnavailableError('No se pudo acceder al almacenamiento', { cause });
    }
  }
}
