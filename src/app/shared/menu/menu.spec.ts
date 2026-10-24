import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Menu, MenuEntry, MenuItem } from './menu';

const actions: MenuEntry[] = [
  { icon: 'edit', label: 'Editar', shortcut: 'E' },
  { label: 'Duplicar' },
  { divider: true },
  { section: 'Más' },
  { icon: 'archive', label: 'Archivar', disabled: true },
  { icon: 'delete_outline', label: 'Eliminar cita', tone: 'danger' },
];

const view: MenuEntry[] = [
  { label: 'Día', selected: false },
  { label: 'Semana', selected: true },
];

async function render(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(Menu);
  const all = { items: actions, ...inputs };
  for (const [key, value] of Object.entries(all)) fixture.componentRef.setInput(key, value);
  await fixture.whenStable();
  const el: HTMLElement = fixture.nativeElement;
  return { fixture, el };
}

// Atributo sin valor `static`, `[(open)]` y salidas necesitan un host.
@Component({
  imports: [Menu],
  template: `
    <app-menu label="Vista" [items]="items" [(open)]="open" (itemSelected)="last = $event" />
    <app-menu static [items]="items" (itemSelected)="last = $event" />
    <button id="outside" type="button">Fuera</button>
  `,
})
class Host {
  items = actions;
  open = false;
  last?: MenuItem;
}

async function renderHost() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const [menu, staticMenu] = Array.from<HTMLElement>(
    fixture.nativeElement.querySelectorAll('app-menu'),
  );
  const trigger = menu.querySelector<HTMLButtonElement>('.icon-button')!;
  const openMenu = async () => {
    trigger.click();
    await fixture.whenStable();
  };
  return { fixture, host: fixture.componentInstance, menu, staticMenu, trigger, openMenu };
}

const buttons = (el: HTMLElement) => [...el.querySelectorAll<HTMLButtonElement>('.menu__item')];

function press(el: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
}

describe('Menu', () => {
  it('R1: host class menu, data-static con static y data-align solo con start', async () => {
    const { el } = await render();
    expect(el.classList).toContain('menu');
    expect(el.hasAttribute('data-static')).toBe(false);
    expect(el.hasAttribute('data-align')).toBe(false);
    expect((await render({ align: 'end' })).el.hasAttribute('data-align')).toBe(false);
    expect((await render({ align: 'start' })).el.getAttribute('data-align')).toBe('start');
    expect((await renderHost()).staticMenu.getAttribute('data-static')).toBe('');
  });

  it('R2: disparador app-icon-button con icon, triggerLabel, variant, size y ARIA', async () => {
    const def = (await render()).el.querySelector('.icon-button')!;
    expect(def.parentElement!.tagName).toBe('APP-ICON-BUTTON');
    expect(def.textContent!.trim()).toBe('more_horiz');
    expect(def.getAttribute('aria-label')).toBe('Más acciones');
    expect(def.getAttribute('aria-haspopup')).toBe('menu');
    expect(def.getAttribute('aria-expanded')).toBe('false');

    const custom = (
      await render({ icon: 'tune', triggerLabel: 'Opciones', variant: 'tonal', size: 's', open: true })
    ).el.querySelector('.icon-button')!;
    expect(custom.textContent!.trim()).toBe('tune');
    expect(custom.getAttribute('aria-label')).toBe('Opciones');
    expect(custom.getAttribute('data-variant')).toBe('tonal');
    expect(custom.getAttribute('data-size')).toBe('s');
    expect(custom.getAttribute('aria-expanded')).toBe('true');
  });

  it('R3: static sin disparador y con panel visible', async () => {
    const { staticMenu } = await renderHost();
    expect(staticMenu.querySelector('app-icon-button')).toBeNull();
    expect(staticMenu.querySelector('.menu__panel')).not.toBeNull();
  });

  it('R4: sin static y cerrado no hay panel', async () => {
    expect((await render()).el.querySelector('.menu__panel')).toBeNull();
  });

  it('R5: clic en el disparador alterna open', async () => {
    const { host, menu, trigger, openMenu, fixture } = await renderHost();
    await openMenu();
    expect(host.open).toBe(true);
    expect(menu.querySelector('.menu__panel')).not.toBeNull();
    trigger.click();
    await fixture.whenStable();
    expect(host.open).toBe(false);
    expect(menu.querySelector('.menu__panel')).toBeNull();
  });

  it('R6: panel div.menu__panel role menu con aria-label', async () => {
    const panel = (await render({ open: true })).el.querySelector('.menu__panel')!;
    expect(panel.tagName).toBe('DIV');
    expect(panel.getAttribute('role')).toBe('menu');
    expect(panel.getAttribute('aria-label')).toBe('Acciones');
    const { menu, openMenu } = await renderHost();
    await openMenu();
    expect(menu.querySelector('.menu__panel')!.getAttribute('aria-label')).toBe('Vista');
  });

  it('R7: ítems como button.menu__item con icono, label, atajo, tono y disabled', async () => {
    const [edit, duplicate, archive, remove] = buttons((await render({ open: true })).el);
    for (const b of [edit, duplicate, archive, remove]) {
      expect(b.getAttribute('type')).toBe('button');
      expect(b.getAttribute('role')).toBe('menuitem');
      expect(b.hasAttribute('aria-checked')).toBe(false);
    }
    expect(edit.children[0].matches('app-icon')).toBe(true);
    expect(edit.children[0].textContent!.trim()).toBe('edit');
    expect(edit.children[1].outerHTML).toBe('<span>Editar</span>');
    expect(edit.querySelector('.menu__shortcut')!.textContent).toBe('E');
    expect(duplicate.querySelector('app-icon')).toBeNull();
    expect(duplicate.querySelector('.menu__shortcut')).toBeNull();
    expect(archive.disabled).toBe(true);
    expect(edit.disabled).toBe(false);
    expect(remove.getAttribute('data-tone')).toBe('danger');
    expect(edit.hasAttribute('data-tone')).toBe(false);
  });

  it('R8: divisor y sección', async () => {
    const panel = (await render({ open: true })).el.querySelector('.menu__panel')!;
    const kids = [...panel.children];
    expect(kids[2].matches('div.menu__divider[role="separator"]')).toBe(true);
    expect(kids[3].matches('div.menu__label[role="presentation"]')).toBe(true);
    expect(kids[3].textContent).toBe('Más');
  });

  it('R9: selected da menuitemradio, aria-checked, data-selected y check', async () => {
    const [day, week] = buttons((await render({ items: view, open: true })).el);
    expect(day.getAttribute('role')).toBe('menuitemradio');
    expect(day.getAttribute('aria-checked')).toBe('false');
    expect(day.hasAttribute('data-selected')).toBe(false);
    expect(day.querySelector('.menu__check')).toBeNull();
    expect(week.getAttribute('aria-checked')).toBe('true');
    expect(week.getAttribute('data-selected')).toBe('');
    const check = week.lastElementChild!;
    expect(check.matches('app-icon.menu__check')).toBe(true);
    expect(check.textContent!.trim()).toBe('check');
  });

  it('R10: clic en ítem emite itemSelected, cierra y devuelve foco; static sigue abierto', async () => {
    const { host, menu, staticMenu, trigger, openMenu, fixture } = await renderHost();
    await openMenu();
    buttons(menu)[1].click();
    await fixture.whenStable();
    expect(host.last).toBe(actions[1]);
    expect(host.open).toBe(false);
    expect(document.activeElement).toBe(trigger);

    buttons(staticMenu)[0].click();
    await fixture.whenStable();
    expect(host.last).toBe(actions[0]);
    expect(staticMenu.querySelector('.menu__panel')).not.toBeNull();
  });

  it('R11: al abrir, foco en el primer ítem habilitado', async () => {
    const { menu, openMenu, fixture } = await renderHost();
    fixture.componentInstance.items = [{ label: 'Bloqueado', disabled: true }, ...actions];
    await fixture.whenStable();
    await openMenu();
    expect(document.activeElement).toBe(buttons(menu)[1]);
  });

  it('R12: flechas, Inicio y Fin recorren los habilitados de forma cíclica', async () => {
    const { menu, openMenu } = await renderHost();
    await openMenu();
    const [edit, duplicate, , remove] = buttons(menu);
    expect(press(edit, 'ArrowDown').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(duplicate);
    press(duplicate, 'ArrowDown'); // salta Archivar (disabled)
    expect(document.activeElement).toBe(remove);
    press(remove, 'ArrowDown');
    expect(document.activeElement).toBe(edit);
    press(edit, 'ArrowUp');
    expect(document.activeElement).toBe(remove);
    press(remove, 'Home');
    expect(document.activeElement).toBe(edit);
    press(edit, 'End');
    expect(document.activeElement).toBe(remove);
  });

  it('R13: Esc cierra y devuelve el foco; Tab cierra; static ignora ambos', async () => {
    const { host, menu, staticMenu, trigger, openMenu, fixture } = await renderHost();
    await openMenu();
    press(buttons(menu)[0], 'Escape');
    await fixture.whenStable();
    expect(host.open).toBe(false);
    expect(document.activeElement).toBe(trigger);

    await openMenu();
    press(buttons(menu)[0], 'Tab');
    await fixture.whenStable();
    expect(host.open).toBe(false);

    press(buttons(staticMenu)[0], 'Escape');
    press(buttons(staticMenu)[0], 'Tab');
    await fixture.whenStable();
    expect(staticMenu.querySelector('.menu__panel')).not.toBeNull();
  });

  it('R14: mousedown fuera cierra; dentro no', async () => {
    const { host, menu, openMenu, fixture } = await renderHost();
    await openMenu();
    buttons(menu)[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await fixture.whenStable();
    expect(host.open).toBe(true);
    const outside: HTMLElement = fixture.nativeElement.querySelector('#outside');
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await fixture.whenStable();
    expect(host.open).toBe(false);
  });
});
