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
      notes: undefined,
      reminder: undefined,
      repeat: undefined,
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
      notes: undefined,
      priority: undefined,
      tags: undefined,
      subtasks: undefined,
    });
  });

  it('SPEC 60 R1: fromTask y toTask son inversas con todos los campos', () => {
    const task = {
      id: 't1',
      title: 'Informe',
      done: false,
      due: '2026-10-22',
      list: 'Trabajo',
      listColor: 'blue' as const,
      notes: 'Para el lunes',
      priority: 'alta',
      tags: ['q4'],
      subtasks: [{ title: 'Datos', done: true }],
    };
    const dto = AgendaMapper.fromTask(task);
    expect(dto).toEqual(expect.objectContaining({ list_color: 'blue', priority: 'alta' }));
    expect(AgendaMapper.toTask(dto)).toEqual(task);
  });

  it('SPEC 60 R1: fromEvent marca all_day sin start y conserva notas', () => {
    const dto = AgendaMapper.fromEvent({
      title: 'Viaje',
      date: '2026-10-22',
      category: 'violet',
      categoryLabel: 'Estrategia',
      people: [],
      confirmed: false,
      notes: 'Tren',
      reminder: '1 día antes',
      repeat: 'No se repite',
    });
    expect(dto).toEqual(
      expect.objectContaining({
        all_day: true,
        category_label: 'Estrategia',
        notes: 'Tren',
        reminder: '1 día antes',
        repeat: 'No se repite',
      }),
    );
    expect(AgendaMapper.toEvent({ ...dto, id: 'e9' })).toEqual(
      expect.objectContaining({ id: 'e9', start: undefined, reminder: '1 día antes' }),
    );
  });
});
