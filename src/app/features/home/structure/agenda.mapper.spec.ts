import { AgendaMapper } from './agenda.mapper';

describe('AgendaMapper', () => {
  it('convierte un evento snake_case a modelo', () => {
    expect(
      AgendaMapper.toEvent({
        id: 'e1',
        title: 'Dentista',
        date: '2026-10-22',
        start: '10:00',
        end: '11:00',
        all_day: false,
        category: 'blue',
        category_label: 'Salud',
        people: [],
        confirmed: false,
      }),
    ).toEqual({
      id: 'e1',
      title: 'Dentista',
      date: '2026-10-22',
      start: '10:00',
      end: '11:00',
      category: 'blue',
      categoryLabel: 'Salud',
      tint: undefined,
      location: undefined,
      people: [],
      confirmed: false,
    });
  });

  it('un evento de todo el día no lleva horas', () => {
    const event = AgendaMapper.toEvent({
      id: 'e2',
      title: 'Viaje',
      date: '2026-10-22',
      start: '00:00',
      all_day: true,
      people: [],
      confirmed: false,
    });
    expect(event.start).toBeUndefined();
    expect(event.end).toBeUndefined();
  });

  it('convierte una tarea con list_color', () => {
    expect(
      AgendaMapper.toTask({
        id: 't1',
        title: 'Fruta',
        done: true,
        list: 'Casa',
        list_color: 'green',
      }),
    ).toEqual({
      id: 't1',
      title: 'Fruta',
      done: true,
      due: undefined,
      list: 'Casa',
      listColor: 'green',
      subtasks: undefined,
    });
  });
});
