import { SegmentedOption, SelectOption, TaskFormValue } from '@shared/interfaces';

export const TASK_LISTS: SelectOption[] = ['Personal', 'Trabajo', 'Casa'].map((label) => ({
  value: label,
  label,
}));
export const TASK_PRIORITIES: SegmentedOption[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];
export const TASK_TAGS = ['Urgente', 'Cliente', 'Revisión', 'Personal'];
export const TASK_FORM_DEFAULTS: TaskFormValue = {
  title: '',
  notes: '',
  list: 'Personal',
  due: '',
  priority: 'media',
  tags: [],
  subtasks: [],
};
