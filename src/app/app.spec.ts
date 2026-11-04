import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { AgendaCommands } from './features/agenda/agenda-commands';
import { AgendaRepository } from './features/agenda/domain/agenda-repository';
import { Task } from './features/agenda/domain/task.model';
import { AgendaLocalRepository } from './features/agenda/structure/agenda-local-repository';
import { routes } from './app.routes';
import { SETTINGS_DEFAULTS } from './features/settings/domain/settings-options';
import { SettingsRepository } from './features/settings/domain/settings-repository';
import { UserSettings } from './features/settings/domain/settings.model';
import { UserSettingsStore } from './features/settings/store/user-settings.store';
import { SettingsLocalRepository } from './features/settings/structure/settings-local-repository';

const saveSettings = (patch: Partial<UserSettings>) =>
  localStorage.setItem('agenda:v2:/settings', JSON.stringify({ ...SETTINGS_DEFAULTS, ...patch }));

async function renderApp(url: string) {
  const fixture = TestBed.createComponent(App);
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  await fixture.whenStable();
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  // Ámbito del shell: /demo trae sus propias navegaciones de muestra.
  const railLabels = (selector = '') =>
    Array.from(el.querySelectorAll(`.l-shell__rail .sidebar-nav__item${selector}`)).map((b) =>
      // without the SPEC 84 badge suffix, which depends on the seeded tasks
      b.getAttribute('aria-label')?.replace(/, \d+ pendientes?$/, ''),
    );
  const bottomLabels = (selector = '') =>
    Array.from(el.querySelectorAll(`.l-shell__bottom .bottom-nav__item${selector}`)).map((b) =>
      b.lastElementChild?.textContent?.trim(),
    );
  return {
    fixture,
    router,
    el,
    railLabels,
    bottomLabels,
    railActive: () => railLabels('[aria-current="page"]'),
    bottomActive: () => bottomLabels('[aria-current="page"]'),
  };
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: SettingsRepository, useClass: SettingsLocalRepository },
        { provide: AgendaRepository, useClass: AgendaLocalRepository },
      ],
    });
  });
  afterEach(() => localStorage.clear());

  describe('rutas', () => {
    it('SPEC 77 R1 y R2: /configuracion monta SettingsPage (Perfil en escritorio) con layout settings y título', async () => {
      const { el, router } = await renderApp('/configuracion');
      expect(router.url).toBe('/configuracion');
      expect(el.querySelector('.l-shell__grid')?.getAttribute('data-layout')).toBe('settings');
      expect(el.querySelector('app-settings-page h1.page-title')?.textContent?.trim()).toBe(
        'Perfil',
      );
      expect(TestBed.inject(Title).getTitle()).toBe('Configuración · Agenda');
    });

    it('SPEC 67 R1: /tareas monta TasksPage con título', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/tareas');
      expect(harness.routeNativeElement!.localName).toBe('app-tasks-page');
      expect(TestBed.inject(Title).getTitle()).toBe('Tareas · Agenda');
    });

    it('SPEC 73 R4: sin ajustes guardados /calendario redirige a la vista por defecto (Semana)', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/calendario');
      expect(TestBed.inject(Router).url).toBe('/calendario/semana');
    });

    it.each([
      ['Día', '/calendario/dia'],
      ['Semana', '/calendario/semana'],
      ['Mes', '/calendario/mes'],
    ])('SPEC 73 R4: con vista por defecto %s, /calendario redirige a %s', async (view, url) => {
      saveSettings({ calendar: { ...SETTINGS_DEFAULTS.calendar, defaultView: view } });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/calendario');
      expect(TestBed.inject(Router).url).toBe(url);
    });

    it.each(['/', '/no-existe'])('SPEC 57 R2: %s redirige a /inicio', async (url) => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(url);
      expect(TestBed.inject(Router).url).toBe('/inicio');
    });

    it('SPEC 59 R7: /resumen monta OverviewPage con título', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/resumen');
      expect(harness.routeNativeElement!.localName).toBe('app-overview-page');
      expect(TestBed.inject(Title).getTitle()).toBe('Resumen · Agenda');
    });

    it('SPEC 62 R5: /calendario/dia monta CalendarDayPage con título', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/calendario/dia');
      expect(harness.routeNativeElement!.localName).toBe('app-calendar-day-page');
      expect(TestBed.inject(Title).getTitle()).toBe('Día · Agenda');
    });

    it('SPEC 63 R9: /calendario/semana monta CalendarWeekPage con título', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/calendario/semana');
      expect(harness.routeNativeElement!.localName).toBe('app-calendar-week-page');
      expect(TestBed.inject(Title).getTitle()).toBe('Semana · Agenda');
    });

    it('SPEC 64 R4: /calendario/mes monta CalendarMonthPage con título', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/calendario/mes');
      expect(harness.routeNativeElement!.localName).toBe('app-calendar-month-page');
      expect(TestBed.inject(Title).getTitle()).toBe('Mes · Agenda');
    });

    it('SPEC 57 R1: /inicio monta HomePage con título', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/inicio');
      expect(harness.routeNativeElement!.localName).toBe('app-home-page');
      expect(TestBed.inject(Title).getTitle()).toBe('Inicio · Agenda');
    });
  });

  it('R9: l-shell > (l-shell__grid > (l-shell__rail > sidebar-nav rail, router-outlet), l-shell__bottom > bottom-nav)', async () => {
    const { el } = await renderApp('/resumen');
    const shell = el.firstElementChild!;
    expect(shell.matches('div.l-shell')).toBe(true);
    const [grid, bottom] = Array.from(shell.children);
    expect(shell.children.length).toBe(2);
    expect(grid.matches('div.l-shell__grid')).toBe(true);
    const [rail, outlet] = Array.from(grid.children);
    expect(rail.matches('div.l-shell__rail')).toBe(true);
    expect(rail.firstElementChild?.localName).toBe('app-sidebar-nav');
    expect(rail.querySelector('nav.sidebar-nav')?.getAttribute('data-variant')).toBe('rail');
    expect(outlet.localName).toBe('router-outlet');
    expect(bottom.matches('div.l-shell__bottom')).toBe(true);
    expect(bottom.firstElementChild?.localName).toBe('app-bottom-nav');
  });

  it.each([
    ['/resumen', 'week'],
    ['/calendario/dia', 'week'],
    ['/calendario/semana', 'week'],
    ['/calendario/mes', 'week'],
    ['/inicio', null],
  ])('SPEC 59 R5, R6: en %s .l-shell__grid lleva data-layout=%s', async (url, layout) => {
    const { el } = await renderApp(url);
    expect(el.querySelector('.l-shell__grid')?.getAttribute('data-layout')).toBe(layout);
  });

  it('R10: destinos del riel en orden', async () => {
    const { el, railLabels } = await renderApp('/resumen');
    const items = Array.from(el.querySelectorAll('.l-shell__rail .sidebar-nav__item'));
    expect(railLabels()).toEqual(['Resumen', 'Calendario', 'Tareas', 'Configuración']);
    expect(items.map((b) => b.querySelector('app-icon')?.textContent?.trim())).toEqual([
      'dashboard',
      'calendar_month',
      'task_alt',
      'settings',
    ]);
  });

  it('R11: destinos de la BottomNav en orden', async () => {
    const { el, bottomLabels } = await renderApp('/resumen');
    const items = Array.from(el.querySelectorAll('.l-shell__bottom .bottom-nav__item'));
    expect(bottomLabels()).toEqual(['Hoy', 'Mes', 'Tareas', 'Ajustes']);
    expect(items.map((b) => b.querySelector('app-icon')?.textContent?.trim())).toEqual([
      'today',
      'calendar_month',
      'task_alt',
      'settings',
    ]);
  });

  it.each([
    ['/resumen', 'Resumen', 'Hoy'],
    ['/calendario/dia', 'Calendario', 'Hoy'],
    ['/calendario/semana', 'Calendario', 'Hoy'],
    ['/calendario/mes', 'Calendario', 'Mes'],
    ['/tareas', 'Tareas', 'Tareas'],
    ['/configuracion', 'Configuración', 'Ajustes'],
  ])('R12, R13: en %s activos %s (riel) y %s (BottomNav)', async (url, rail, bottom) => {
    const { railActive, bottomActive } = await renderApp(url);
    expect(railActive()).toEqual([rail]);
    expect(bottomActive()).toEqual([bottom]);
  });

  it.each(['/demo', '/inicio'])('R14, SPEC 57 R4: en %s ningún destino activo', async (url) => {
    const { railActive, bottomActive } = await renderApp(url);
    expect(railActive()).toEqual([]);
    expect(bottomActive()).toEqual([]);
  });

  it('R15: pulsar un destino navega a su URL', async () => {
    const { el, fixture, router } = await renderApp('/resumen');
    const click = async (selector: string, index: number) => {
      el.querySelectorAll<HTMLButtonElement>(selector)[index].click();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    await click('.l-shell__rail .sidebar-nav__item', 1);
    expect(router.url).toBe('/calendario/semana');
    await click('.l-shell__rail .sidebar-nav__item', 3);
    expect(router.url).toBe('/configuracion');
    await click('.l-shell__bottom .bottom-nav__item', 1);
    expect(router.url).toBe('/calendario/mes');
    await click('.l-shell__bottom .bottom-nav__item', 2);
    expect(router.url).toBe('/tareas');
  });

  describe('SPEC 73: Apariencia en <html>', () => {
    const root = document.documentElement;
    const attributes = () => ({
      density: root.getAttribute('data-density'),
      textSize: root.getAttribute('data-text-size'),
      reduceMotion: root.hasAttribute('data-reduce-motion'),
    });

    it('R7–R10: con los defaults no pone atributos', async () => {
      await renderApp('/inicio');
      expect(attributes()).toEqual({ density: null, textSize: null, reduceMotion: false });
    });

    it('R7–R10: tras cargar aplica lo guardado y sigue a los cambios del store', async () => {
      saveSettings({ appearance: { density: 'Compacta', textSize: 'Grande', reduceMotion: true } });
      const { fixture } = await renderApp('/inicio');
      const store = TestBed.inject(UserSettingsStore);
      await store.load();
      fixture.detectChanges();
      expect(attributes()).toEqual({ density: 'compact', textSize: 'large', reduceMotion: true });
      store.set(SETTINGS_DEFAULTS);
      fixture.detectChanges();
      expect(attributes()).toEqual({ density: null, textSize: null, reduceMotion: false });
    });
  });

  describe('SPEC 84: badge de pendientes y aviso de guardado', () => {
    const task = (id: string, done = false): Task => ({ id, title: id, done });
    let setTaskDone: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      setTaskDone = vi.fn().mockResolvedValue(undefined);
      TestBed.overrideProvider(AgendaRepository, {
        useValue: {
          listEvents: vi.fn().mockResolvedValue([]),
          listTasks: vi.fn().mockResolvedValue([task('a'), task('b'), task('c', true)]),
          setTaskDone,
        },
      });
    });

    const railTasks = (el: HTMLElement) =>
      el.querySelectorAll('.l-shell__rail .sidebar-nav__item')[2].getAttribute('aria-label');
    const bottomBadge = (el: HTMLElement) =>
      el
        .querySelectorAll('.l-shell__bottom .bottom-nav__item')[2]
        .querySelector('.bottom-nav__badge')
        ?.textContent?.trim();

    it('R9: sin agenda cargada, «Tareas» no lleva badge', async () => {
      const { el, fixture } = await renderApp('/configuracion');
      const loading = TestBed.inject(AgendaCommands).load(); // status «loading» hasta que resuelve
      fixture.detectChanges();
      expect(railTasks(el)).toBe('Tareas');
      expect(bottomBadge(el)).toBeUndefined();
      await loading;
    });

    it('R7, R8: con la agenda cargada muestra las pendientes y sigue a los cambios', async () => {
      const { el, fixture } = await renderApp('/configuracion');
      const commands = TestBed.inject(AgendaCommands);
      await commands.load();
      fixture.detectChanges();
      expect(railTasks(el)).toBe('Tareas, 2 pendientes');
      expect(bottomBadge(el)).toBe('2');
      await commands.toggleTask('a', true);
      fixture.detectChanges();
      expect(railTasks(el)).toBe('Tareas, 1 pendiente');
      expect(bottomBadge(el)).toBe('1');
      await commands.toggleTask('b', true);
      fixture.detectChanges();
      expect(railTasks(el)).toBe('Tareas');
      expect(bottomBadge(el)).toBeUndefined();
    });

    it('R10: al terminar una navegación se limpia el error de guardado', async () => {
      const { router } = await renderApp('/configuracion');
      const commands = TestBed.inject(AgendaCommands);
      await commands.load();
      setTaskDone.mockRejectedValueOnce(new Error('falla'));
      await commands.toggleTask('a', true);
      expect(commands.saveError()).toBe(true);
      await router.navigateByUrl('/configuracion/calendario');
      expect(commands.saveError()).toBe(false);
    });
  });
});
