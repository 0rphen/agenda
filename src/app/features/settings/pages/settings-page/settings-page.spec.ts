import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { RenderMode } from '@angular/ssr';
import { serverRoutes } from '../../../../app.routes.server';
import { SETTINGS_DEFAULTS } from '../../domain/settings-options';
import { SettingsRepository } from '../../domain/settings-repository';
import { SETTINGS_ROUTES } from '../../settings.routes';
import { SettingsFacade } from '../../settings.facade';
import { SettingsPage } from './settings-page';

@Component({ template: '' })
class Blank {}

describe('SettingsPage', () => {
  const key = 'agenda:v2:/settings';

  async function setup(url = '/configuracion') {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'configuracion', children: SETTINGS_ROUTES },
            { path: 'inicio', component: Blank },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    await settle(harness);
    return { harness, el: harness.routeNativeElement as HTMLElement };
  }

  async function settle(harness: RouterTestingHarness) {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim();
  const page = (el: HTMLElement) => el.querySelector('app-settings-page') as HTMLElement;

  beforeEach(() => localStorage.clear());

  it('R1: cada sección con layout settings y título', async () => {
    const { harness } = await setup();
    const children = SETTINGS_ROUTES[0].children!.filter((route) => route.path);
    expect(children.map((route) => route.path)).toEqual([
      'perfil',
      'seguridad',
      'calendario',
      'notificaciones',
      'apariencia',
    ]);
    for (const route of children) {
      expect(route.component).toBe(SettingsPage);
      expect(route.data).toEqual({ layout: 'settings', section: route.path });
    }
    expect(children[0].title).toBe('Perfil · Configuración · Agenda');
    expect(SETTINGS_ROUTES[0].providers).toContain(SettingsFacade);
    expect(harness.routeNativeElement).toBeTruthy();
  });

  it('R2: el servidor renderiza configuración en cada petición', () => {
    const mode = (path: string) => serverRoutes.find((route) => route.path === path)?.renderMode;
    expect(mode('configuracion')).toBe(RenderMode.Server);
    expect(mode('configuracion/**')).toBe(RenderMode.Server);
  });

  it('R2 y R11: no lee datos antes del primer render, que pinta el esqueleto; luego carga', async () => {
    const repository = {
      load: vi.fn().mockResolvedValue(structuredClone(SETTINGS_DEFAULTS)),
      save: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        SettingsFacade,
        { provide: SettingsRepository, useValue: repository },
      ],
    });
    const fixture = TestBed.createComponent(SettingsPage);
    const el = fixture.nativeElement as HTMLElement;
    expect(repository.load).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(el.querySelector('app-skeleton-list[data-variant="card"]')).not.toBeNull();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(repository.load).toHaveBeenCalledTimes(1);
    expect(el.querySelector('app-skeleton-list')).toBeNull();
    expect(el.querySelector('app-settings-profile')).not.toBeNull();
  });

  it('R9 y R10: menú con sección activa, breadcrumb, título, lead; elegir navega', async () => {
    const { harness } = await setup('/configuracion/perfil');
    const el = page(harness.fixture.nativeElement);
    const nav = el.querySelector('.l-shell__nav app-sidebar-nav nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Configuración');
    expect([...nav.querySelectorAll('.sidebar-nav__section')].map(text)).toEqual([
      'Cuenta',
      'Preferencias',
      'Soporte',
    ]);
    const items = [...nav.querySelectorAll('button')] as HTMLButtonElement[];
    expect(items.map((b) => text(b.querySelector('.sidebar-nav__label')))).toEqual([
      'Perfil',
      'Seguridad',
      'Calendario',
      'Notificaciones',
      'Apariencia',
      'Ayuda y contacto',
    ]);
    expect(items[0].getAttribute('aria-current')).toBe('page');
    expect(items[5].disabled).toBe(true);
    expect(text(nav.querySelector('.sidebar-nav__user'))).toContain('César Hohner');
    expect(text(nav.querySelector('.sidebar-nav__user'))).toContain('Organizador');

    const content = el.querySelector('.l-shell__content.panel.l-stack')!;
    expect(content.getAttribute('data-gap')).toBe('m');
    expect(text(content.querySelector('app-breadcrumb'))).toContain('Configuración');
    expect(content.querySelector('app-breadcrumb a.breadcrumb__link')?.getAttribute('href')).toBe(
      '/inicio',
    );
    expect(text(content.querySelector('h1.page-title'))).toBe('Perfil');
    expect(text(content.querySelector('p.page-lead'))).toBe(
      'Ajusta cómo se ve y se comporta tu agenda. Los cambios se aplican en todos tus dispositivos.',
    );

    items[3].click();
    await settle(harness);
    expect(TestBed.inject(Router).url).toBe('/configuracion/notificaciones');
    const next = page(harness.fixture.nativeElement);
    expect(text(next.querySelector('h1'))).toBe('Notificaciones');
    expect(text(next.querySelector('app-breadcrumb'))).toContain('Notificaciones');
    expect(next.querySelector('app-settings-notifications')).not.toBeNull();
    expect(next.querySelectorAll('.sidebar-nav__item')[3].getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('R18, R5–R8: cambiar muestra la SaveBar, se conserva al cambiar de sección, guardar persiste, descartar revierte', async () => {
    const { harness } = await setup('/configuracion/apariencia');
    let el = page(harness.fixture.nativeElement);
    expect(el.querySelector('.save-bar')).toBeNull();
    const reduce = el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement;
    reduce.click();
    harness.detectChanges();
    expect(text(el.querySelector('.save-bar'))).toContain('Tienes cambios sin guardar');

    await harness.navigateByUrl('/configuracion/perfil');
    await settle(harness);
    await harness.navigateByUrl('/configuracion/apariencia');
    await settle(harness);
    el = page(harness.fixture.nativeElement);
    expect(
      (el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement).checked,
    ).toBe(true);
    expect(el.querySelector('.save-bar')).not.toBeNull();

    const save = [...el.querySelectorAll('.save-bar button')].find((b) =>
      text(b)?.includes('Guardar cambios'),
    ) as HTMLButtonElement;
    save.click();
    await settle(harness);
    expect(text(el.querySelector('.save-bar'))).toContain('Cambios guardados');
    expect(JSON.parse(localStorage.getItem(key)!).appearance.reduceMotion).toBe(true);

    (el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement).click();
    harness.detectChanges();
    const discard = [...el.querySelectorAll('.save-bar button')].find((b) =>
      text(b)?.includes('Descartar'),
    ) as HTMLButtonElement;
    discard.click();
    harness.detectChanges();
    expect(
      (el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('R4 y R11: JSON corrupto muestra Alert y Reintentar recarga', async () => {
    localStorage.setItem(key, '{roto');
    const { harness } = await setup('/configuracion/perfil');
    const el = page(harness.fixture.nativeElement);
    expect(text(el.querySelector('app-alert'))).toContain('No se pudo cargar tu configuración');
    localStorage.removeItem(key);
    (el.querySelector('app-alert app-button button') as HTMLButtonElement).click();
    await settle(harness);
    expect(el.querySelector('app-settings-profile')).not.toBeNull();
  });

  it('R12: si guardar falla, Alert descartable', async () => {
    const { harness } = await setup('/configuracion/apariencia');
    const el = page(harness.fixture.nativeElement);
    (el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement).click();
    harness.detectChanges();
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const save = [...el.querySelectorAll('.save-bar button')].find((b) =>
      text(b)?.includes('Guardar cambios'),
    ) as HTMLButtonElement;
    save.click();
    await settle(harness);
    spy.mockRestore();
    const alert = el.querySelector('app-alert[data-tone="danger"]')!;
    expect(text(alert)).toContain('No se pudieron guardar los cambios.');
    expect(el.querySelector('.save-bar')).not.toBeNull();
    (alert.querySelector('button') as HTMLButtonElement).click();
    harness.detectChanges();
    expect(el.querySelector('app-alert[data-tone="danger"]')).toBeNull();
  });

  describe('móvil (SPEC 77)', () => {
    const rows = (el: Element) =>
      [...el.querySelectorAll('button.setting-row')] as HTMLButtonElement[];
    const parts = (row: Element) =>
      [
        ...row.querySelectorAll(
          '.setting-row__lead, .setting-row__label, .setting-row__desc, .setting-row__value, .setting-row__trail > app-icon',
        ),
      ]
        .map(text)
        .join(' ');

    it('R1: /configuracion pinta SettingsPage sin sección ni redirección', async () => {
      const { harness } = await setup();
      expect(TestBed.inject(Router).url).toBe('/configuracion');
      const index = SETTINGS_ROUTES[0].children!.find((route) => route.path === '')!;
      expect(index.redirectTo).toBeUndefined();
      expect(index.component).toBe(SettingsPage);
      expect(index.data).toEqual({ layout: 'settings' });
      expect(index.title).toBe('Configuración · Agenda');
      expect(page(harness.fixture.nativeElement)).not.toBeNull();
    });

    it('R2 y R9: sin sección, escritorio muestra Perfil; cuerpo y SaveBar solo escritorio', async () => {
      const { harness } = await setup();
      const el = page(harness.fixture.nativeElement);
      expect(text(el.querySelector('h1.page-title'))).toBe('Perfil');
      expect(el.querySelector('.sidebar-nav__item')?.getAttribute('aria-current')).toBe('page');
      const bodies = [...el.querySelectorAll('.settings-page__body')];
      expect(bodies).toHaveLength(2);
      for (const body of bodies) expect(body.classList).toContain('u-desktop-only');
      expect(bodies[0].querySelector('app-settings-profile')).not.toBeNull();
      expect(bodies[1].querySelector('app-save-bar')).not.toBeNull();
    });

    it('R3: host l-screen y piezas de escritorio con u-desktop-only', async () => {
      const { harness } = await setup('/configuracion/perfil');
      const el = page(harness.fixture.nativeElement);
      expect([...el.classList]).toEqual(
        expect.arrayContaining(['settings-page', 'screen', 'l-screen']),
      );
      expect(el.querySelector('.l-shell__nav')!.classList).toContain('u-desktop-only');
      for (const selector of ['app-breadcrumb', 'h1.page-title', 'p.page-lead'])
        expect(el.querySelector(selector)!.classList).toContain('u-desktop-only');
      expect(el.querySelector('.l-shell__content')!.classList).toContain('l-screen__main');
    });

    it('R6 y R7: lista con AppBar grande «Ajustes» y tres Cards', async () => {
      const { harness } = await setup();
      const el = page(harness.fixture.nativeElement);
      const bar = el.querySelector('.l-screen__top.u-mobile-only app-app-bar')!;
      expect(text(bar.querySelector('.app-bar__title'))).toBe('Ajustes');
      expect(bar.querySelector('.app-bar')?.getAttribute('data-size')).toBe('l');
      expect(bar.querySelector('button')).toBeNull();

      const list = el.querySelector('.l-screen__main > .u-mobile-only')!;
      const cards = list.querySelectorAll('app-card');
      expect(cards).toHaveLength(3);
      expect(rows(cards[0]).map(parts)).toEqual([
        'person_outline César Hohner hohner.rojas@gmail.com chevron_right',
      ]);
      expect(rows(cards[1]).map(parts)).toEqual([
        'calendar_month Calendario Semana chevron_right',
        'notifications_none Notificaciones Activas chevron_right',
        'tune Apariencia Cómoda chevron_right',
        'lock_outline Seguridad chevron_right',
      ]);
      const [help, logout] = rows(cards[2]);
      expect(parts(help)).toBe('help_outline Ayuda y contacto chevron_right');
      expect(help.disabled).toBe(true);
      expect(parts(logout)).toBe('logout Cerrar sesión');
      expect(logout.disabled).toBe(true);
      expect(logout.getAttribute('data-tone')).toBe('danger');
    });

    it('R7: «Notificaciones» dice «Desactivadas» sin canales activos', async () => {
      const { harness } = await setup();
      harness.routeDebugElement!.injector.get(SettingsFacade).draft.update((draft) => ({
        ...draft,
        notifications: { ...draft.notifications, browser: false, email: false, mobile: false },
      }));
      harness.detectChanges();
      const el = page(harness.fixture.nativeElement);
      expect(parts(rows(el.querySelector('.l-screen__main > .u-mobile-only')!)[2])).toBe(
        'notifications_none Notificaciones Desactivadas chevron_right',
      );
    });

    it('R8: cada fila navega a su sección', async () => {
      const { harness } = await setup();
      const router = TestBed.inject(Router);
      const expected = ['perfil', 'calendario', 'notificaciones', 'apariencia', 'seguridad'];
      for (const [index, section] of expected.entries()) {
        await harness.navigateByUrl('/configuracion');
        await settle(harness);
        const el = page(harness.fixture.nativeElement);
        rows(el.querySelector('.l-screen__main > .u-mobile-only')!)[index].click();
        await settle(harness);
        expect(router.url).toBe(`/configuracion/${section}`);
      }
    });

    it('R10–R12: detalle con AppBar y flecha; volver conserva el draft', async () => {
      const { harness } = await setup('/configuracion/apariencia');
      let el = page(harness.fixture.nativeElement);
      expect(el.querySelector('.l-screen__main > .u-mobile-only')).toBeNull();
      for (const body of el.querySelectorAll('.settings-page__body'))
        expect(body.classList).not.toContain('u-desktop-only');
      const bar = el.querySelector('.l-screen__top.u-mobile-only app-app-bar')!;
      expect(text(bar)).toContain('Apariencia');
      const back = bar.querySelector('button[aria-label="Volver a Ajustes"]') as HTMLButtonElement;
      expect(back).not.toBeNull();

      (el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement).click();
      harness.detectChanges();
      expect(el.querySelector('.save-bar')).not.toBeNull();

      back.click();
      await settle(harness);
      expect(TestBed.inject(Router).url).toBe('/configuracion');
      await harness.navigateByUrl('/configuracion/apariencia');
      await settle(harness);
      el = page(harness.fixture.nativeElement);
      expect(
        (el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement).checked,
      ).toBe(true);
    });

    it('R13: cargando, la lista muestra el esqueleto', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          SettingsFacade,
          { provide: SettingsRepository, useValue: { load: () => new Promise(() => {}) } },
        ],
      });
      const fixture = TestBed.createComponent(SettingsPage);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('app-skeleton-list[data-variant="card"]')).not.toBeNull();
      expect(el.querySelector('.l-screen__main > .u-mobile-only')).toBeNull();
      expect(text(el.querySelector('.l-screen__top app-app-bar'))).toContain('Ajustes');
    });
  });

  describe('salir con cambios sin guardar (SPEC 72)', () => {
    // jsdom no implementa showModal de <dialog>.
    beforeEach(() => {
      HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      };
    });

    async function dirtyPage() {
      const { harness } = await setup('/configuracion/apariencia');
      const el = page(harness.fixture.nativeElement);
      (el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement).click();
      harness.detectChanges();
      const router = TestBed.inject(Router);
      return { harness, el, router };
    }
    // whenStable() waits for the navigation the guard holds, so flush by hand
    async function flush(harness: RouterTestingHarness) {
      harness.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
      harness.detectChanges();
    }
    const dialog = () => document.querySelector('app-settings-page app-dialog');
    const button = (label: string) =>
      [...dialog()!.querySelectorAll('button')].find((b) => text(b) === label) as HTMLButtonElement;

    it('R7: salir de /configuracion abre el Dialog con tres acciones', async () => {
      const { harness, router } = await dirtyPage();
      router.navigateByUrl('/inicio');
      await flush(harness);
      expect(text(dialog()?.querySelector('.dialog__title') ?? null)).toBe(
        'Tienes cambios sin guardar',
      );
      const foot = [...dialog()!.querySelectorAll('.dialog__foot app-button')];
      expect(
        foot.map((b) => [text(b), b.querySelector('button')!.getAttribute('data-variant')]),
      ).toEqual([
        ['Seguir editando', 'ghost'],
        ['Descartar', 'ghost-danger'],
        ['Guardar y salir', 'accent'],
      ]);
      expect(router.url).toBe('/configuracion/apariencia');
    });

    it('R8: «Seguir editando» cancela y conserva los cambios', async () => {
      const { harness, router } = await dirtyPage();
      const nav = router.navigateByUrl('/inicio');
      await flush(harness);
      button('Seguir editando').click();
      expect(await nav).toBe(false);
      await settle(harness);
      expect(dialog()).toBeNull();
      expect(router.url).toBe('/configuracion/apariencia');
      expect(document.querySelector('.save-bar')).not.toBeNull();
    });

    it('R8: «Descartar» revierte y navega', async () => {
      const { harness, router } = await dirtyPage();
      const facade = harness.routeDebugElement!.injector.get(SettingsFacade);
      const nav = router.navigateByUrl('/inicio');
      await flush(harness);
      button('Descartar').click();
      expect(await nav).toBe(true);
      expect(facade.dirty()).toBe(false);
      expect(router.url).toBe('/inicio');
      expect(localStorage.getItem(key)).toBeNull();
    });

    it('R8: «Guardar y salir» guarda y navega', async () => {
      const { harness, router } = await dirtyPage();
      const nav = router.navigateByUrl('/inicio');
      await flush(harness);
      button('Guardar y salir').click();
      expect(await nav).toBe(true);
      expect(router.url).toBe('/inicio');
      expect(JSON.parse(localStorage.getItem(key)!).appearance.reduceMotion).toBe(true);
    });

    it('R8: si guardar falla, se queda con el Alert de error', async () => {
      const { harness, el, router } = await dirtyPage();
      const nav = router.navigateByUrl('/inicio');
      await flush(harness);
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      button('Guardar y salir').click();
      expect(await nav).toBe(false);
      spy.mockRestore();
      await settle(harness);
      expect(router.url).toBe('/configuracion/apariencia');
      expect(dialog()).toBeNull();
      expect(text(el.querySelector('app-alert[data-tone="danger"]'))).toContain(
        'No se pudieron guardar los cambios.',
      );
    });

    it('R7: sin cambios navega sin Dialog', async () => {
      const { harness } = await setup('/configuracion/apariencia');
      expect(await TestBed.inject(Router).navigateByUrl('/inicio')).toBe(true);
      await settle(harness);
      expect(dialog()).toBeNull();
    });

    it('R9: cambiar de sección o volver a la lista no abre el Dialog', async () => {
      const { harness, router } = await dirtyPage();
      expect(await router.navigateByUrl('/configuracion/perfil')).toBe(true);
      expect(await router.navigateByUrl('/configuracion')).toBe(true);
      await settle(harness);
      expect(dialog()).toBeNull();
    });

    it('R10: beforeunload avisa solo con cambios', async () => {
      const { harness } = await setup('/configuracion/apariencia');
      const unload = () => {
        const event = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      };
      expect(unload()).toBe(false);
      const el = page(harness.fixture.nativeElement);
      (el.querySelector('input[aria-label="Reducir animaciones"]') as HTMLInputElement).click();
      harness.detectChanges();
      expect(unload()).toBe(true);
    });
  });
});
