import { Type, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { SETTINGS_DEFAULTS } from '../domain/settings-options';
import { UserSettings } from '../domain/settings.model';
import { SettingsAppearance } from './settings-appearance/settings-appearance';
import { SettingsCalendar } from './settings-calendar/settings-calendar';
import { SettingsNotifications } from './settings-notifications/settings-notifications';
import { SettingsProfile } from './settings-profile/settings-profile';
import { SettingsSecurity } from './settings-security/settings-security';

function render(section: Type<unknown>, group: keyof UserSettings) {
  const model = signal(structuredClone(SETTINGS_DEFAULTS));
  const settingsForm = TestBed.runInInjectionContext(() => form(model));
  const fixture = TestBed.createComponent(section);
  fixture.componentRef.setInput('fields', settingsForm[group]);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, model };
}

const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, ' ').trim();
const cards = (el: HTMLElement) => [...el.querySelectorAll('.card__title')].map(text);
const labels = (el: HTMLElement) => [...el.querySelectorAll('.setting-row__label')].map(text);

describe('Secciones de configuración', () => {
  it('R13: Perfil con avatar, campos, correo bloqueado y cuenta conectada', () => {
    const { fixture, el, model } = render(SettingsProfile, 'profile');
    expect(cards(el)).toEqual(['Tu perfil', 'Cuenta conectada']);
    expect(el.querySelector('[data-size="xl"]')).not.toBeNull();
    expect(text(el.querySelector('strong'))).toBe('César Hohner');
    expect(el.textContent).toContain('Foto o iniciales · JPG o PNG, máx. 2 MB');
    const buttons = [...el.querySelectorAll('app-button')].map(text);
    expect(buttons[0]).toContain('Cambiar foto');
    expect(buttons[1]).toContain('Quitar');
    const inputs = [...el.querySelectorAll('input:not([type="file"])')] as HTMLInputElement[];
    expect(inputs.map((i) => i.value)).toEqual(['César', 'Hohner', 'hohner.rojas@gmail.com']);
    expect(inputs[2].disabled).toBe(true);
    expect(el.textContent).toContain('El correo de la cuenta no se puede cambiar aquí.');
    expect([...el.querySelectorAll('select')].map((s) => s.value)).toEqual([
      'GMT-5 · Bogotá',
      'Español',
    ]);
    expect(text(el.querySelector('app-badge'))).toContain('Conectada');

    inputs[0].value = 'Ana';
    inputs[0].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(model().profile.firstName).toBe('Ana');
    expect(text(el.querySelector('strong'))).toBe('Ana Hohner');
  });

  it('R14: Seguridad con acceso, sesiones y zona de peligro', () => {
    const { el } = render(SettingsSecurity, 'security');
    expect(cards(el)).toEqual(['Acceso', 'Sesiones activas', 'Zona de peligro']);
    expect(el.querySelector('button.setting-row')?.textContent).toContain('Cambiar');
    expect(labels(el)).toEqual([
      'Contraseña',
      'Verificación en dos pasos',
      'MacBook · Chrome',
      'iPhone · Agenda móvil',
      'Exportar mis datos',
      'Eliminar cuenta',
    ]);
    expect(el.querySelectorAll('app-card')[2].getAttribute('data-tone')).toBe('danger');
    expect(el.querySelectorAll('.setting-row')[5].getAttribute('data-tone')).toBe('danger');
  });

  it('R15: Calendario con vista, formato, horario y duración', () => {
    const { fixture, el, model } = render(SettingsCalendar, 'calendar');
    expect(cards(el)).toEqual(['Vista y formato', 'Horario y citas nuevas']);
    expect(labels(el)).toEqual([
      'Vista por defecto',
      'La semana empieza el',
      'Formato de hora',
      'Mostrar fines de semana',
      'Mostrar citas canceladas',
      'Horario laboral',
      'Duración predeterminada',
      'Añadir enlace de videollamada',
    ]);
    const times = [...el.querySelectorAll('input[type="time"]')] as HTMLInputElement[];
    expect(times.map((t) => t.value)).toEqual(['08:00', '18:00']);
    expect(el.querySelector('.l-cluster[data-nowrap]')).not.toBeNull();
    const pressed = [...el.querySelectorAll('[aria-pressed="true"], [aria-checked="true"]')].map(
      text,
    );
    expect(pressed.join(' ')).toContain('Semana');

    const weekend = el.querySelector(
      'input[aria-label="Mostrar fines de semana"]',
    ) as HTMLInputElement;
    expect(weekend.checked).toBe(true);
    weekend.click();
    fixture.detectChanges();
    expect(model().calendar.showWeekends).toBe(false);
  });

  it('R16: Notificaciones con aviso de permiso, recordatorios y canales', () => {
    const { el } = render(SettingsNotifications, 'notifications');
    expect(text(el.querySelector('app-alert'))).toContain('Permiso de notificaciones');
    expect(text(el.querySelector('app-alert'))).toContain('Permitir en el navegador');
    expect(cards(el)).toEqual(['Recordatorios', 'Canales']);
    expect(labels(el)).toEqual([
      'Recordatorio de citas',
      'Tareas con vencimiento',
      'Resumen diario',
      'Navegador',
      'Correo',
      'Notificaciones en el móvil',
    ]);
    expect((el.querySelector('select') as HTMLSelectElement).value).toBe('15 min antes');
    expect(el.textContent).toContain('07:30');
  });

  it('R17: Apariencia con densidad, tamaño del texto y animaciones', () => {
    const { fixture, el, model } = render(SettingsAppearance, 'appearance');
    expect(cards(el)).toEqual(['Apariencia']);
    expect(labels(el)).toEqual(['Densidad', 'Tamaño del texto', 'Reducir animaciones']);
    const compact = [...el.querySelectorAll('button')].find((b) => text(b) === 'Compacta')!;
    compact.click();
    fixture.detectChanges();
    expect(model().appearance.density).toBe('Compacta');
  });

  it('SPEC 70 R3: «Horario laboral» con «Inicio»/«Fin» sin label visible', () => {
    const { el } = render(SettingsCalendar, 'calendar');
    const fields = [...el.querySelectorAll('app-time-field')];
    expect(fields.length).toBe(2);
    for (const [i, name] of ['Inicio', 'Fin'].entries()) {
      const label = fields[i].querySelector<HTMLLabelElement>('label')!;
      expect(text(label)).toBe(name);
      expect(label.classList).toContain('u-visually-hidden');
      expect(label.htmlFor).toBe(fields[i].querySelector('input')!.id);
    }
  });

  describe('acciones de cuenta (SPEC 74)', () => {
    const pick = (el: HTMLElement, file: File) => {
      const input = el.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', { value: [file], configurable: true });
      input.dispatchEvent(new Event('change'));
    };
    const button = (el: HTMLElement, label: string) =>
      [...el.querySelectorAll('button')].find((b) => text(b)?.endsWith(label)) as HTMLButtonElement;

    it('R1: elegir un PNG guarda el dataURL y lo muestra en el Avatar', async () => {
      const { fixture, el, model } = render(SettingsProfile, 'profile');
      const input = el.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.accept).toBe('image/png,image/jpeg');
      expect(input.hidden).toBe(true);
      const click = vi.spyOn(input, 'click').mockImplementation(() => {});
      button(el, 'Cambiar foto').click();
      expect(click).toHaveBeenCalled();
      pick(el, new File(['png'], 'yo.png', { type: 'image/png' }));
      await vi.waitFor(() => expect(model().profile.photo).toMatch(/^data:image\/png;base64,/));
      fixture.detectChanges();
      expect(el.querySelector('app-avatar img')?.getAttribute('src')).toBe(model().profile.photo);
    });

    it('R2: tipo o tamaño no válido no cambia el draft y muestra Alert', () => {
      const { fixture, el, model } = render(SettingsProfile, 'profile');
      pick(el, new File(['gif'], 'yo.gif', { type: 'image/gif' }));
      fixture.detectChanges();
      expect(model().profile.photo).toBe('');
      const alert = el.querySelector('app-alert[data-tone="danger"]')!;
      expect(text(alert)).toContain('La foto debe ser JPG o PNG de hasta 2 MB.');
      const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'yo.jpg', { type: 'image/jpeg' });
      pick(el, big);
      fixture.detectChanges();
      expect(model().profile.photo).toBe('');
      expect(el.querySelector('app-alert[data-tone="danger"]')).not.toBeNull();
    });

    it('R3: «Quitar» deshabilitado sin foto; con foto la borra', () => {
      const { fixture, el, model } = render(SettingsProfile, 'profile');
      expect(button(el, 'Quitar').disabled).toBe(true);
      model.update((m) => ({ ...m, profile: { ...m.profile, photo: 'data:image/png;base64,AA' } }));
      fixture.detectChanges();
      button(el, 'Quitar').click();
      fixture.detectChanges();
      expect(model().profile.photo).toBe('');
      expect(el.querySelector('app-avatar img')).toBeNull();
      expect(button(el, 'Quitar').disabled).toBe(true);
    });

    it('R8: «Cambiar» y «Cerrar sesión» avisan «No disponible» en su Card', () => {
      const { fixture, el } = render(SettingsSecurity, 'security');
      const cardsEl = el.querySelectorAll('app-card');
      (el.querySelector('button.setting-row') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(text(cardsEl[0].querySelector('app-alert'))).toContain(
        'No disponible en esta versión.',
      );
      button(el, 'Cerrar sesión').click();
      fixture.detectChanges();
      expect(cardsEl[0].querySelector('app-alert')).toBeNull();
      const alert = cardsEl[1].querySelector('app-alert')!;
      expect(text(alert)).toContain('No disponible en esta versión.');
      (alert.querySelector('button') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(el.querySelector('app-alert')).toBeNull();
    });

    it('R4 y R6: «Exportar» y «Eliminar cuenta» emiten sus outputs', () => {
      const { fixture, el } = render(SettingsSecurity, 'security');
      const component = fixture.componentInstance as SettingsSecurity;
      const exported = vi.fn();
      const deleted = vi.fn();
      component.exportClicked.subscribe(exported);
      component.deleteClicked.subscribe(deleted);
      button(el, 'Exportar').click();
      button(el, 'Eliminar cuenta').click();
      expect(exported).toHaveBeenCalledTimes(1);
      expect(deleted).toHaveBeenCalledTimes(1);
    });

    it('R9 y R10: el Alert de permiso sigue el estado del navegador', () => {
      const { fixture, el } = render(SettingsNotifications, 'notifications');
      const component = fixture.componentInstance as SettingsNotifications;
      const requested = vi.fn();
      component.permissionRequested.subscribe(requested);
      button(el, 'Permitir en el navegador').click();
      expect(requested).toHaveBeenCalled();
      const cases = [
        ['granted', 'success', 'Notificaciones permitidas en este navegador.'],
        [
          'denied',
          'warning',
          'Bloqueaste las notificaciones. Actívalas en los ajustes del navegador.',
        ],
        ['unsupported', null, 'Tu navegador no admite notificaciones.'],
      ] as const;
      for (const [permission, tone, copy] of cases) {
        fixture.componentRef.setInput('permission', permission);
        fixture.detectChanges();
        const alert = el.querySelector('app-alert')!;
        expect(alert.getAttribute('data-tone')).toBe(tone);
        expect(text(alert)).toContain(copy);
        expect(alert.querySelector('app-button')).toBeNull();
      }
    });
  });
});
