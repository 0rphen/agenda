import { booleanAttribute, Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, validate } from '@angular/forms/signals';
import { Button } from '@shared/components/button/button';
import { DateField } from '@shared/components/date-field/date-field';
import { Icon } from '@shared/components/icon/icon';
import { IconButton } from '@shared/components/icon-button/icon-button';
import { SegmentedControl } from '@shared/components/segmented-control/segmented-control';
import { SelectField } from '@shared/components/select/select';
import { TaskItem } from '@shared/components/task-item/task-item';
import { TextareaField } from '@shared/components/textarea/textarea';
import { TextField } from '@shared/components/text-field/text-field';
import { TaskFormValue } from '@shared/interfaces';
import { TASK_FORM_DEFAULTS, TASK_LISTS, TASK_PRIORITIES, TASK_TAGS } from '@shared/utils';

@Component({
  selector: 'app-task-form',
  imports: [
    Button,
    DateField,
    FormField,
    Icon,
    IconButton,
    SegmentedControl,
    SelectField,
    TaskItem,
    TextareaField,
    TextField,
  ],
  templateUrl: './task-form.html',
})
export class TaskForm {
  readonly defaultValues = input<Partial<TaskFormValue>>({});
  readonly showErrors = input(false, { transform: booleanAttribute });
  readonly deletable = input(false, { transform: booleanAttribute });
  readonly cancelable = input(false, { transform: booleanAttribute });

  readonly saved = output<TaskFormValue>();
  readonly deleted = output<void>();
  readonly cancelled = output<void>();

  protected readonly lists = TASK_LISTS;
  protected readonly priorities = TASK_PRIORITIES;
  protected readonly tagOptions = TASK_TAGS;

  protected readonly value = linkedSignal(() => ({
    ...TASK_FORM_DEFAULTS,
    ...this.defaultValues(),
  }));
  // the DS shows errors only after the first save, not on blur
  protected readonly submitted = linkedSignal(() => {
    this.defaultValues();
    return this.showErrors();
  });
  protected readonly newSubtask = linkedSignal(() => {
    this.defaultValues();
    return '';
  });

  protected readonly taskForm = form(this.value, (path) => {
    validate(path.title, ({ value }) =>
      value().trim() ? null : { kind: 'required', message: 'La tarea necesita un título' },
    );
  });

  protected titleError(): string | undefined {
    return this.submitted() ? this.taskForm.title().errors()[0]?.message : undefined;
  }

  protected toggleTag(tag: string): void {
    this.value.update((v) => ({
      ...v,
      tags: v.tags.includes(tag) ? v.tags.filter((t) => t !== tag) : [...v.tags, tag],
    }));
  }

  protected setSubtaskDone(index: number, done: boolean): void {
    this.value.update((v) => ({
      ...v,
      subtasks: v.subtasks.map((s, i) => (i === index ? { ...s, done } : s)),
    }));
  }

  protected addSubtask(): void {
    const title = this.newSubtask().trim();
    if (!title) return;
    this.value.update((v) => ({ ...v, subtasks: [...v.subtasks, { title, done: false }] }));
    this.newSubtask.set('');
  }

  protected addSubtaskOnEnter(event: Event): void {
    event.preventDefault();
    this.addSubtask();
  }

  protected removeSubtask(index: number): void {
    this.value.update((v) => ({ ...v, subtasks: v.subtasks.filter((_, i) => i !== index) }));
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.taskForm().valid()) this.saved.emit(this.value());
  }
}
