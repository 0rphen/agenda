import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskFormValue } from '@shared/interfaces';
import { localIso } from '@shared/utils';
import { AgendaCommands } from '../agenda/agenda-commands';
import { AgendaDialogs } from '../agenda/agenda-dialogs';
import { Task } from '../agenda/domain/task.model';
import { AgendaStore } from '../agenda/store/agenda.store';
import { TaskFilter, TaskGroup, TaskGroupKey, TasksProgress } from './domain/tasks-view.model';

@Injectable()
export class TasksFacade {
  private readonly store = inject(AgendaStore);
  private readonly commands = inject(AgendaCommands);
  private readonly dialogs = inject(AgendaDialogs);
  private readonly router = inject(Router);
  // Query params are shared by the whole tree, so the root route injected here is enough.
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  private readonly selectedId = signal<string | undefined>(undefined);
  private readonly detailErrorState = signal(false);

  private readonly headings: Record<TaskGroupKey, string> = {
    late: 'Vencidas',
    today: 'Hoy',
    next: 'Próximas',
    done: 'Completadas',
  };
  private readonly filterGroups: Record<TaskFilter, TaskGroupKey[]> = {
    todas: ['late', 'today', 'next', 'done'],
    hoy: ['today'],
    pendientes: ['late', 'today', 'next'],
    hechas: ['done'],
  };

  readonly today = localIso(new Date());
  readonly status = this.store.status;
  readonly saveError = this.commands.saveError;
  readonly filter = computed<TaskFilter>(() => {
    const filtro = this.params().get('filtro') ?? '';
    return Object.hasOwn(this.filterGroups, filtro) ? (filtro as TaskFilter) : 'todas';
  });
  readonly detailError = this.detailErrorState.asReadonly();

  readonly selectedTask = computed(() =>
    this.store.tasks().find((task) => task.id === this.selectedId()),
  );

  readonly groups = computed<TaskGroup[]>(() => {
    // ISO dates sort as strings; tasks without due go last.
    const tasks = [...this.store.tasks()].sort((a, b) =>
      (a.due ?? '9999-12-31').localeCompare(b.due ?? '9999-12-31'),
    );
    return this.filterGroups[this.filter()]
      .map((key) => ({
        key,
        heading: this.headings[key],
        tasks: tasks.filter((task) => this.groupOf(task) === key),
      }))
      .filter((group) => group.tasks.length);
  });

  readonly pendingCount = computed(() => this.store.tasks().filter((task) => !task.done).length);

  readonly dueTodayCount = computed(
    () => this.store.tasks().filter((task) => this.groupOf(task) === 'today').length,
  );

  readonly progress = computed<TasksProgress>(() => {
    const total = this.store.tasks().length;
    const done = total - this.pendingCount();
    return { done, total, value: total ? Math.round((done / total) * 100) : 0 };
  });

  load(): Promise<void> {
    return this.commands.load();
  }

  setFilter(filter: TaskFilter): Promise<boolean> {
    return this.router.navigate([], {
      queryParams: { filtro: filter === 'todas' ? null : filter },
      queryParamsHandling: 'merge',
    });
  }

  toggleTask(id: string, done: boolean): Promise<void> {
    return this.commands.toggleTask(id, done);
  }

  dismissSaveError(): void {
    this.commands.dismissSaveError();
  }

  async addTask(title: string): Promise<void> {
    if (!title.trim()) return;
    const task = await this.commands.createTask(title, this.today);
    if (task) this.selectTask(task.id);
  }

  selectTask(id: string): void {
    this.detailErrorState.set(false);
    this.selectedId.set(id);
  }

  clearSelection(): void {
    this.detailErrorState.set(false);
    this.selectedId.set(undefined);
  }

  askDeleteTask(id: string): void {
    this.dialogs.askDeleteTask(id);
  }

  async saveTask(value: TaskFormValue): Promise<void> {
    const id = this.selectedId();
    if (!id) return;
    this.detailErrorState.set(false);
    try {
      await this.commands.updateTask(id, value);
    } catch {
      this.detailErrorState.set(true);
    }
  }

  private groupOf(task: Task): TaskGroupKey {
    if (task.done) return 'done';
    if (!task.due || task.due > this.today) return 'next';
    return task.due < this.today ? 'late' : 'today';
  }
}
