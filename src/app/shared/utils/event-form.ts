import { EventFormValue, SelectOption } from '@shared/interfaces';

const options = (labels: string[]): SelectOption[] =>
  labels.map((label) => ({ value: label, label }));

export const EVENT_CATEGORIES = options([
  'Marketing',
  'Estrategia',
  'Descubrimiento',
  'Desarrollo',
  'Personal',
  'Finanzas',
  'Clientes',
]);
export const EVENT_REMINDERS = options([
  'Sin recordatorio',
  '5 min antes',
  '15 min antes',
  '1 hora antes',
  '1 día antes',
]);
export const EVENT_REPEATS = options(['No se repite', 'Todos los días', 'Cada semana', 'Cada mes']);
export const EVENT_FORM_DEFAULTS: EventFormValue = {
  title: '',
  category: 'Marketing',
  date: '',
  start: '09:00',
  end: '10:00',
  allDay: false,
  location: '',
  people: '',
  notes: '',
  reminder: '15 min antes',
  repeat: 'No se repite',
};
