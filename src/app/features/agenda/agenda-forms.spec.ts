import { EVENT_FORM_DEFAULTS } from '@shared/utils';
import { eventToForm, formToEvent, formToTask, taskToForm } from './agenda-forms';
import { CalendarEvent } from './domain/calendar-event.model';
import { Task } from './domain/task.model';

const task: Task = { id: 't1', title: 'Informe', done: true };

describe('agenda-forms', () => {
  it('R6: taskToForm rellena lo que falta', () => {
    expect(taskToForm(task)).toEqual({
      title: 'Informe',
      notes: '',
      list: '',
      due: '',
      priority: 'media',
      tags: [],
      subtasks: [],
    });
  });

  it('R6: taskToForm copia los campos presentes', () => {
    const full: Task = {
      ...task,
      notes: 'n',
      list: 'Casa',
      due: '2026-10-22',
      priority: 'alta',
      tags: ['Urgente'],
      subtasks: [{ title: 'Paso', done: false }],
    };
    expect(taskToForm(full)).toEqual({
      title: 'Informe',
      notes: 'n',
      list: 'Casa',
      due: '2026-10-22',
      priority: 'alta',
      tags: ['Urgente'],
      subtasks: [{ title: 'Paso', done: false }],
    });
  });

  it('R7: formToTask conserva id y done, due vacío como undefined y color por lista', () => {
    const value = { ...taskToForm(task), title: 'Nuevo', list: 'Trabajo' };
    expect(formToTask(task, value)).toEqual(
      expect.objectContaining({ id: 't1', done: true, title: 'Nuevo', due: undefined }),
    );
    expect(formToTask(task, value).listColor).toBe('blue');
    expect(formToTask(task, { ...value, list: 'Personal' }).listColor).toBe('orange');
    expect(formToTask(task, { ...value, list: 'Casa', due: '2026-10-23' })).toEqual(
      expect.objectContaining({ listColor: 'green', due: '2026-10-23' }),
    );
  });

  it('R8: formToEvent con horas, categoría y personas', () => {
    expect(
      formToEvent({
        ...EVENT_FORM_DEFAULTS,
        title: 'Kickoff',
        date: '2026-10-22',
        category: 'Estrategia',
        people: 'Ana López, , Luis Pérez ,',
        location: 'Sala 2',
      }),
    ).toEqual({
      title: 'Kickoff',
      date: '2026-10-22',
      start: '09:00',
      end: '10:00',
      category: 'violet',
      categoryLabel: 'Estrategia',
      location: 'Sala 2',
      people: ['Ana López', 'Luis Pérez'],
      confirmed: false,
      notes: undefined,
      reminder: '15 min antes',
      repeat: 'No se repite',
    });
  });

  it('R8: todo el día sin horas; textos vacíos como undefined', () => {
    const event = formToEvent({
      ...EVENT_FORM_DEFAULTS,
      title: 'Viaje',
      date: '2026-10-22',
      allDay: true,
      category: 'Finanzas',
      reminder: '',
      repeat: '',
    });
    expect(event).not.toHaveProperty('id');
    expect(event).toEqual(
      expect.objectContaining({
        start: undefined,
        end: undefined,
        category: 'mustard',
        location: undefined,
        people: [],
        reminder: undefined,
        repeat: undefined,
      }),
    );
  });

  it('R8: cada categoría del form tiene color', () => {
    const colors = ['Marketing', 'Descubrimiento', 'Desarrollo', 'Personal', 'Clientes'].map(
      (category) => formToEvent({ ...EVENT_FORM_DEFAULTS, category }).category,
    );
    expect(colors).toEqual(['orange', 'cyan', 'blue', 'red', 'green']);
  });

  it('SPEC 71: eventToForm ida y vuelta con formToEvent conserva la cita', () => {
    const event: CalendarEvent = {
      id: 'e1',
      title: 'Kickoff',
      date: '2026-10-22',
      start: '10:00',
      end: '11:00',
      category: 'violet',
      categoryLabel: 'Estrategia',
      location: 'Sala 302',
      people: ['Ana', 'Luis'],
      confirmed: false,
      notes: 'Llevar portátil',
      reminder: '15 min antes',
      repeat: 'Cada semana',
    };
    const form = eventToForm(event);
    expect(form).toEqual(
      expect.objectContaining({ allDay: false, people: 'Ana, Luis', category: 'Estrategia' }),
    );
    expect({ id: 'e1', ...formToEvent(form) }).toEqual(event);
  });

  it('SPEC 71: eventToForm de todo el día marca allDay con horas por defecto', () => {
    const form = eventToForm({
      id: 'x',
      title: 'Viaje',
      date: '2026-10-22',
      people: [],
      confirmed: false,
    });
    expect(form).toEqual(
      expect.objectContaining({
        allDay: true,
        start: '09:00',
        end: '10:00',
        category: 'Marketing',
      }),
    );
  });
});
