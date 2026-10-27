import { Injectable } from '@angular/core';
import { localIso } from '@shared/utils';
import { seedEvents, seedTasks } from './agenda-seed';

export type ApiPath = '/events' | '/tasks';

/** API simulada: cada recurso es un array JSON en `agenda:v3:<path>`. Lanza si localStorage falla. */
@Injectable({ providedIn: 'root' })
export class LocalStorageApi {
  private readonly seeds: Record<ApiPath, (today: string) => unknown[]> = {
    '/events': seedEvents,
    '/tasks': seedTasks,
  };

  async get<T>(path: ApiPath): Promise<T[]> {
    const raw = localStorage.getItem(this.key(path));
    if (raw !== null) return JSON.parse(raw) as T[];
    const seed = this.seeds[path](localIso(new Date())) as T[];
    this.write(path, seed);
    return seed;
  }

  async patch<T extends { id: string }>(
    path: ApiPath,
    id: string,
    changes: Partial<T>,
  ): Promise<T> {
    const items = await this.get<T>(path);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error(`${path}/${id} no existe`);
    items[index] = { ...items[index], ...changes };
    this.write(path, items);
    return items[index];
  }

  async post<T extends { id: string }>(path: ApiPath, item: Omit<T, 'id'>): Promise<T> {
    const items = await this.get<T>(path);
    const created = { ...item, id: crypto.randomUUID() } as T;
    this.write(path, [...items, created]);
    return created;
  }

  private key(path: ApiPath): string {
    return `agenda:v3:${path}`;
  }

  private write(path: ApiPath, items: unknown[]): void {
    localStorage.setItem(this.key(path), JSON.stringify(items));
  }
}
