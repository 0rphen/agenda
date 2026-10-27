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

describe('SettingsPage', () => {
  const key = 'agenda:v2:/settings';

  async function setup(url = '/configuracion') {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: 'configuracion', children: SETTINGS_ROUTES }],
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

  it('R1: /configuracion redirige a perfil; cada sección con layout settings y título', async () => {
    const { harness } = await setup();
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/configuracion/perfil');
    const children = SETTINGS_ROUTES[0].children!.filter((route) => route.component);
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
});
