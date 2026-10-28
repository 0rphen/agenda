import { booleanAttribute, Component, input, linkedSignal, output } from '@angular/core';
import { FieldTree, form, FormField, validate } from '@angular/forms/signals';
import { Button } from '@shared/components/button/button';
import { DateField } from '@shared/components/date-field/date-field';
import { SelectField } from '@shared/components/select/select';
import { Switch } from '@shared/components/switch/switch';
import { TextareaField } from '@shared/components/textarea/textarea';
import { TextField } from '@shared/components/text-field/text-field';
import { TimeField } from '@shared/components/time-field/time-field';
import { EventFormValue } from '@shared/interfaces';
import {
  EVENT_CATEGORIES,
  EVENT_FORM_DEFAULTS,
  EVENT_REMINDERS,
  EVENT_REPEATS,
  toMin,
} from '@shared/utils';

@Component({
  selector: 'app-event-form',
  imports: [Button, DateField, FormField, SelectField, Switch, TextareaField, TextField, TimeField],
  templateUrl: './event-form.html',
})
export class EventForm {
  readonly defaultValues = input<Partial<EventFormValue>>({});
  readonly saveLabel = input('Guardar cita');
  readonly showErrors = input(false, { transform: booleanAttribute });
  readonly deletable = input(false, { transform: booleanAttribute });
  readonly cancelable = input(false, { transform: booleanAttribute });

  readonly saved = output<EventFormValue>();
  readonly deleted = output<void>();
  readonly cancelled = output<void>();

  protected readonly categories = EVENT_CATEGORIES;
  protected readonly reminders = EVENT_REMINDERS;
  protected readonly repeats = EVENT_REPEATS;

  protected readonly value = linkedSignal(() => ({
    ...EVENT_FORM_DEFAULTS,
    ...this.defaultValues(),
  }));
  // the DS shows errors only after the first save, not on blur
  protected readonly submitted = linkedSignal(() => {
    this.defaultValues();
    return this.showErrors();
  });

  protected readonly eventForm = form(this.value, (path) => {
    validate(path.title, ({ value }) =>
      value().trim() ? null : { kind: 'required', message: 'Escribe un título para la cita' },
    );
    validate(path.date, ({ value }) =>
      value() ? null : { kind: 'required', message: 'Elige una fecha' },
    );
    validate(path.end, ({ value, valueOf }) => {
      const start = valueOf(path.start);
      return !valueOf(path.allDay) && start && value() && toMin(value()) <= toMin(start)
        ? { kind: 'endBeforeStart', message: 'La hora de fin debe ser posterior al inicio' }
        : null;
    });
  });

  protected error(field: FieldTree<unknown>): string | undefined {
    return this.submitted() ? field().errors()[0]?.message : undefined;
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.eventForm().valid()) this.saved.emit(this.value());
  }
}
