import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

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
      b.getAttribute('aria-label'),
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
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
  });

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

    it('R4: /calendario redirige a /calendario/dia', async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/calendario');
      expect(TestBed.inject(Router).url).toBe('/calendario/dia');
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
    expect(router.url).toBe('/calendario/dia');
    await click('.l-shell__rail .sidebar-nav__item', 3);
    expect(router.url).toBe('/configuracion');
    await click('.l-shell__bottom .bottom-nav__item', 1);
    expect(router.url).toBe('/calendario/mes');
    await click('.l-shell__bottom .bottom-nav__item', 2);
    expect(router.url).toBe('/tareas');
  });
});
