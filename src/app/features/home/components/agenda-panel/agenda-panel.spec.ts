import { TestBed } from '@angular/core/testing';
import { CalendarEvent } from '../../../agenda/domain/calendar-event.model';
import { AgendaStatus } from '../../../agenda/domain/agenda-view.model';
import { AgendaGroup } from '../../domain/home-view.model';
import { AgendaPanel } from './agenda-panel';

const base: CalendarEvent = {
  id: 'a',
  title: 'A',
  date: '2026-10-22',
  people: [],
  confirmed: false,
};
const groups: AgendaGroup[] = [
  {
    day: '2026-10-22',
    title: 'Jueves 22 octubre',
    events: [
      { ...base, id: 'todo', title: 'Viaje' },
      {
        ...base,
        id: 'item',
        title: 'Dentista',
        start: '10:00',
        end: '11:00',
        categoryLabel: 'Salud',
      },
      {
        ...base,
        id: 'card',
        title: 'Reunión',
        start: '12:00',
        end: '13:00',
        location: 'Sala 2',
        tint: 'mint',
        people: ['Ana López'],
        confirmed: true,
      },
      { ...base, id: 'card2', title: 'Café', start: '16:00', end: '16:30', people: ['Luis'] },
    ],
  },
];

function render(status: AgendaStatus, value: AgendaGroup[] = groups) {
  const fixture = TestBed.createComponent(AgendaPanel);
  fixture.componentRef.setInput('status', status);
  fixture.componentRef.setInput('groups', value);
  fixture.componentRef.setInput('range', 'day');
  fixture.componentRef.setInput('selectedDay', '2026-10-22');
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('AgendaPanel', () => {
  it('R22: cabecera con título y botones', () => {
    const { el } = render('ready');
    expect(el.querySelector('h2.section-title[data-tone="brand"]')?.textContent?.trim()).toBe(
      'Tu agenda',
    );
    const labels = [...el.querySelectorAll(':scope > .l-cluster app-icon-button button')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Buscar', 'Nueva cita']);
  });

  it('R16: mientras carga muestra skeleton agenda', () => {
    for (const status of ['idle', 'loading'] as const) {
      const { el } = render(status);
      expect(el.querySelector('app-skeleton-list')?.getAttribute('data-variant')).toBe('agenda');
      expect(el.querySelector('app-agenda-item')).toBeNull();
    }
  });

  it('R24: título de grupo', () => {
    expect(render('ready').el.querySelector('.agenda-group__title')?.textContent?.trim()).toBe(
      'Jueves 22 octubre',
    );
  });

  it('R25–R26: agenda-item sin personas, todo el día en lugar de horas', () => {
    const items = render('ready').el.querySelectorAll('app-agenda-item');
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('.agenda-item__start')?.textContent?.trim()).toBe('Todo el día');
    expect(items[0].querySelector('.agenda-item__end')).toBeNull();
    expect(items[1].querySelector('.agenda-item__time')?.textContent).toContain('11:00');
    expect(items[1].textContent).toContain('Salud');
  });

  it('R25: event-card con personas; badge solo si confirmed', () => {
    const cards = render('ready').el.querySelectorAll('app-event-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector('.event-card__time')?.textContent?.trim()).toBe('12:00 – 13:00');
    expect(cards[0].querySelector('.event-card__meta')?.textContent).toContain('Sala 2');
    expect(cards[0].querySelector('app-badge')?.textContent).toContain('Confirmada');
    expect(cards[1].querySelector('app-badge')).toBeNull();
  });

  it('R27: rango sin eventos muestra empty state', () => {
    const empty = render('ready', []).el.querySelector('app-empty-state')!;
    expect(empty.querySelector('.empty-state__title')?.textContent?.trim()).toBe('Sin citas');
    expect(empty.textContent).toContain('No tienes nada en estos días.');
    expect(empty.textContent).toContain('event_available');
  });

  it('R17: error muestra alert y Reintentar emite retry', () => {
    const { fixture, el } = render('error');
    const alert = el.querySelector('app-alert')!;
    expect(alert.getAttribute('data-tone')).toBe('danger');
    expect(alert.textContent).toContain('No se pudo cargar tu agenda');
    expect(alert.textContent).toContain(
      'Revisa el almacenamiento del navegador e inténtalo de nuevo.',
    );
    let retries = 0;
    fixture.componentInstance.retry.subscribe(() => retries++);
    alert.querySelector<HTMLButtonElement>('app-button button')!.click();
    expect(retries).toBe(1);
  });

  it('R35: clases de host', () => {
    const { el } = render('ready');
    expect([...el.classList]).toEqual(['l-shell__agenda', 'panel', 'l-stack']);
    expect(el.dataset['variant']).toBe('surface');
    expect(el.dataset['gap']).toBe('xs');
  });

  it('SPEC 60 R17, R21: «Nueva cita» emite newEvent', () => {
    const { fixture, el } = render('ready');
    const spy = vi.fn();
    fixture.componentInstance.newEvent.subscribe(spy);
    el.querySelector<HTMLButtonElement>('app-icon-button button[aria-label="Nueva cita"]')!.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('SPEC 79 R7: sin Menu; EventCard y AgendaItem emiten eventEdited con el id', () => {
    const { fixture, el } = render('ready');
    expect(el.querySelector('app-menu')).toBeNull();
    expect([
      ...el.querySelectorAll(':scope > app-agenda-item, :scope > app-event-card'),
    ]).toHaveLength(4);
    const edited = vi.fn();
    fixture.componentInstance.eventEdited.subscribe(edited);
    el.querySelectorAll<HTMLButtonElement>('app-agenda-item button')[1].click();
    el.querySelector<HTMLButtonElement>('app-event-card button')!.click();
    expect(edited.mock.calls).toEqual([['item'], ['card']]);
  });

  describe('SPEC 82: buscar', () => {
    const button = (el: HTMLElement, label: string) =>
      el.querySelector<HTMLButtonElement>(`app-icon-button button[aria-label="${label}"]`);
    const field = (el: HTMLElement) => el.querySelector<HTMLInputElement>('app-text-field input');
    const titles = (el: HTMLElement) =>
      [...el.querySelectorAll('.agenda-item__title, .event-card__title')].map((t) =>
        t.textContent?.trim(),
      );

    async function open(value: AgendaGroup[] = groups) {
      const result = render('ready', value);
      button(result.el, 'Buscar')!.click();
      await result.fixture.whenStable();
      return result;
    }

    async function type(
      fixture: { whenStable(): Promise<unknown> },
      el: HTMLElement,
      text: string,
    ) {
      const input = field(el)!;
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }

    it('R1–R3: la lupa abre el campo enfocado y la X; título y «Nueva cita» siguen', async () => {
      const { el } = await open();
      const input = field(el)!;
      expect(input.type).toBe('search');
      expect(input.placeholder).toBe('Buscar citas');
      expect(el.querySelector('app-text-field label')?.textContent?.trim()).toBe('Buscar citas');
      expect(document.activeElement).toBe(input);
      expect(button(el, 'Buscar')).toBeNull();
      expect(button(el, 'Cerrar búsqueda')).not.toBeNull();
      expect(button(el, 'Nueva cita')).not.toBeNull();
      expect(el.querySelector('h2')?.textContent?.trim()).toBe('Tu agenda');
    });

    it('R4: filtra por título, lugar y persona sin mayúsculas ni tildes', async () => {
      const { fixture, el } = await open();
      await type(fixture, el, ' REUNION ');
      expect(titles(el)).toEqual(['Reunión']);
      await type(fixture, el, 'sala');
      expect(titles(el)).toEqual(['Reunión']);
      await type(fixture, el, 'luis');
      expect(titles(el)).toEqual(['Café']);
      await type(fixture, el, 'cafe');
      expect(titles(el)).toEqual(['Café']);
    });

    it('R5–R6: oculta grupos sin coincidencias; texto vacío los muestra todos', async () => {
      const other: AgendaGroup = {
        day: '2026-10-23',
        title: 'Viernes 23 octubre',
        events: [{ ...base, id: 'b', date: '2026-10-23', title: 'Gimnasio' }],
      };
      const { fixture, el } = await open([...groups, other]);
      await type(fixture, el, 'gimnasio');
      const heads = () =>
        [...el.querySelectorAll('.agenda-group__title')].map((h) => h.textContent?.trim());
      expect(heads()).toEqual(['Viernes 23 octubre']);
      await type(fixture, el, '   ');
      expect(heads()).toEqual(['Jueves 22 octubre', 'Viernes 23 octubre']);
    });

    it('R7: sin coincidencias muestra «Sin resultados» con el texto', async () => {
      const { fixture, el } = await open();
      await type(fixture, el, 'zzz');
      const empty = el.querySelector('app-empty-state')!;
      expect(empty.querySelector('.empty-state__title')?.textContent?.trim()).toBe(
        'Sin resultados',
      );
      expect(empty.textContent).toContain('No hay citas que coincidan con «zzz».');
      expect(empty.textContent).toContain('search_off');
    });

    it('R8: sin citas y sin texto muestra «Sin citas»', async () => {
      const { el } = await open([]);
      expect(el.querySelector('.empty-state__title')?.textContent?.trim()).toBe('Sin citas');
    });

    it('R9: X y Esc cierran, vacían y enfocan la lupa', async () => {
      const { fixture, el } = await open();
      await type(fixture, el, 'reunion');
      button(el, 'Cerrar búsqueda')!.click();
      await fixture.whenStable();
      expect(field(el)).toBeNull();
      expect(document.activeElement).toBe(button(el, 'Buscar'));
      expect(titles(el)).toHaveLength(4);

      button(el, 'Buscar')!.click();
      await fixture.whenStable();
      expect(field(el)!.value).toBe('');
      await type(fixture, el, 'reunion');
      field(el)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expect(field(el)).toBeNull();
      expect(document.activeElement).toBe(button(el, 'Buscar'));
      expect(titles(el)).toHaveLength(4);
    });

    it('R10: cambiar range o selectedDay vacía y cierra', async () => {
      for (const [name, value] of [
        ['range', 'week'],
        ['selectedDay', '2026-10-23'],
      ] as const) {
        const { fixture, el } = await open();
        await type(fixture, el, 'reunion');
        fixture.componentRef.setInput(name, value);
        await fixture.whenStable();
        expect(field(el)).toBeNull();
        expect(button(el, 'Buscar')).not.toBeNull();
        expect(titles(el)).toHaveLength(4);
      }
    });

    it('R11: nuevos groups mantienen la búsqueda', async () => {
      const { fixture, el } = await open();
      await type(fixture, el, 'reunion');
      const extra = { ...base, id: 'new', title: 'Reunión de equipo' };
      fixture.componentRef.setInput('groups', [
        { ...groups[0], events: [...groups[0].events, extra] },
      ]);
      await fixture.whenStable();
      expect(field(el)!.value).toBe('reunion');
      expect(titles(el)).toEqual(['Reunión', 'Reunión de equipo']);
    });

    it('R13: pulsar una cita filtrada emite eventEdited con su id', async () => {
      const { fixture, el } = await open();
      await type(fixture, el, 'luis');
      const edited = vi.fn();
      fixture.componentInstance.eventEdited.subscribe(edited);
      el.querySelector<HTMLButtonElement>('app-event-card button')!.click();
      expect(edited).toHaveBeenCalledWith('card2');
    });
  });
});
