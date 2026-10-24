import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SettingRow, SettingRowControl } from './setting-row';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(SettingRow);
  const all = { label: 'Formato de hora', ...inputs };
  for (const [key, value] of Object.entries(all)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

// `button[app-setting-row]`, control proyectado y `(clicked)` necesitan un host.
@Component({
  imports: [SettingRow, SettingRowControl],
  template: `
    <app-setting-row id="static" label="Avisos" value="Sí" disabled (clicked)="clicks = clicks + 1">
      <input settingRowControl type="checkbox" aria-label="Avisos" />
    </app-setting-row>
    <button
      app-setting-row
      id="nav"
      label="Calendario"
      value="Semana"
      (clicked)="last = $event"
    ></button>
    <button app-setting-row id="plain" label="Cerrar sesión" noChevron></button>
    <button
      app-setting-row
      id="off"
      label="Archivo"
      disabled
      (clicked)="clicks = clicks + 1"
    ></button>
  `,
})
class Host {
  clicks = 0;
  last?: MouseEvent;
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const get = (id: string) => el.querySelector<HTMLElement>(`#${id}`)!;
  return {
    host: fixture.componentInstance,
    staticRow: get('static'),
    nav: get('nav'),
    plain: get('plain'),
    off: get('off'),
  };
}

const trailParts = (row: HTMLElement) =>
  Array.from(row.querySelector('.setting-row__trail')!.children).map((c) =>
    c.classList.contains('setting-row__value') ? 'value' : c.tagName.toLowerCase(),
  );

describe('SettingRow', () => {
  it('R1: host .setting-row con inner, text y label', () => {
    const row = render();
    expect(row.classList).toContain('setting-row');
    const inner = row.firstElementChild!;
    expect(inner.matches('span.setting-row__inner')).toBe(true);
    const text = inner.querySelector('.setting-row__text')!;
    expect(text.children).toHaveLength(1);
    expect(text.firstElementChild!.outerHTML).toBe(
      '<span class="setting-row__label">Formato de hora</span>',
    );
  });

  it('R2: description añade .setting-row__desc tras el título', () => {
    expect(render().querySelector('.setting-row__desc')).toBeNull();
    const desc = render({ description: 'Afecta al calendario.' }).querySelector(
      '.setting-row__desc',
    )!;
    expect(desc.textContent).toBe('Afecta al calendario.');
    expect(desc.previousElementSibling!.classList).toContain('setting-row__label');
  });

  it('R3: icon añade lead decorativo antes del texto y data-lead', () => {
    const bare = render();
    expect(bare.querySelector('.setting-row__lead')).toBeNull();
    expect(bare.querySelector('.setting-row__inner')!.hasAttribute('data-lead')).toBe(false);
    const row = render({ icon: 'schedule' });
    const inner = row.querySelector('.setting-row__inner')!;
    expect(inner.getAttribute('data-lead')).toBe('');
    const lead = inner.firstElementChild!;
    expect(lead.classList).toContain('setting-row__lead');
    const glyph = lead.querySelector('app-icon')!;
    expect(glyph.textContent).toBe('schedule');
    expect(glyph.getAttribute('aria-hidden')).toBe('true');
    expect(lead.nextElementSibling!.classList).toContain('setting-row__text');
  });

  it('R4: trail con valor, control y flecha según el caso; ausente sin nada', () => {
    expect(render().querySelector('.setting-row__trail')).toBeNull();
    expect(trailParts(render({ value: 'Semana' }))).toEqual(['value']);
    const { staticRow, nav, plain } = renderHost();
    expect(trailParts(staticRow)).toEqual(['value', 'input']);
    expect(trailParts(nav)).toEqual(['value', 'app-icon']);
    const chevron = nav.querySelector('.setting-row__trail app-icon')!;
    expect(chevron.textContent).toBe('chevron_right');
    expect(chevron.getAttribute('aria-hidden')).toBe('true');
    expect(trailParts(plain)).toEqual([]);
  });

  it('R5: wide pone data-wide en inner', () => {
    expect(render().querySelector('.setting-row__inner')!.hasAttribute('data-wide')).toBe(false);
    expect(
      render({ wide: true }).querySelector('.setting-row__inner')!.getAttribute('data-wide'),
    ).toBe('');
  });

  it('R6: button[app-setting-row] con type="button" y data-interactive; estática sin ellos', () => {
    const { staticRow, nav } = renderHost();
    expect(nav.tagName).toBe('BUTTON');
    expect(nav.getAttribute('type')).toBe('button');
    expect(nav.getAttribute('data-interactive')).toBe('');
    expect(staticRow.hasAttribute('type')).toBe(false);
    expect(staticRow.hasAttribute('data-interactive')).toBe(false);
  });

  it('R7: clic emite clicked solo en button[app-setting-row]', () => {
    const { host, staticRow, nav } = renderHost();
    nav.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
    staticRow.click();
    expect(host.clicks).toBe(0);
  });

  it('R8: disabled pone disabled nativo solo en botón y no emite', () => {
    const { host, staticRow, off } = renderHost();
    expect(off.hasAttribute('disabled')).toBe(true);
    off.dispatchEvent(new MouseEvent('click'));
    expect(host.clicks).toBe(0);
    expect(staticRow.hasAttribute('disabled')).toBe(false);
  });

  it('R9: tone y state escriben data-tone y data-force', () => {
    const row = render();
    expect(row.hasAttribute('data-tone')).toBe(false);
    expect(row.hasAttribute('data-force')).toBe(false);
    expect(render({ tone: 'danger' }).getAttribute('data-tone')).toBe('danger');
    expect(render({ state: 'focus' }).getAttribute('data-force')).toBe('focus');
  });
});
