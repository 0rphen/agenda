import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from '@shared/components/button/button';
import { Menu } from '@shared/components/menu/menu';
import { TextField } from '@shared/components/text-field/text-field';
import { Dialog, DialogFooter } from './dialog';

// jsdom no implementa showModal/show/close de <dialog>.
const calls: string[] = [];
beforeEach(() => {
  calls.length = 0;
  const proto = HTMLDialogElement.prototype;
  proto.showModal = function (this: HTMLDialogElement) {
    calls.push('showModal');
    this.setAttribute('open', '');
  };
  proto.show = function (this: HTMLDialogElement) {
    calls.push('show');
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    calls.push('close');
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

function render(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(Dialog);
  fixture.componentRef.setInput('heading', 'Nueva cita');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

// Cuerpo, pie y [(open)] necesitan un host.
@Component({
  imports: [Dialog, DialogFooter, Button, TextField, Menu],
  template: `
    <app-dialog
      heading="Nueva cita"
      [contained]="contained()"
      [closable]="closable()"
      [(open)]="open"
    >
      <app-text-field label="Título" />
      <app-menu label="Acciones" [items]="[{ label: 'Editar' }]" />
      <app-button dialogFooter variant="ghost">Cancelar</app-button>
      <app-button dialogFooter icon="check">Guardar cita</app-button>
    </app-dialog>
  `,
})
class Host {
  readonly open = signal(false);
  readonly contained = signal(false);
  readonly closable = signal(true);
}

// SPEC 61: form con submit proyectado en el Dialog.
@Component({
  imports: [Dialog],
  template: `
    <app-dialog heading="Editar tarea" [(open)]="open">
      <form (submit)="$event.preventDefault(); submits = submits + 1">
        <button type="submit">Guardar</button>
      </form>
    </app-dialog>
  `,
})
class FormHost {
  readonly open = signal(true);
  submits = 0;
}

async function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { host: fixture.componentInstance, fixture, el, dialog: el.querySelector('dialog')! };
}

describe('Dialog', () => {
  it('R1: cabecera con h2.dialog__title y descripción solo si hay description', () => {
    const { el } = render();
    const title = el.querySelector('.dialog > .dialog__head > div > h2.dialog__title');
    expect(title?.textContent?.trim()).toBe('Nueva cita');
    expect(el.querySelector('.dialog__description')).toBeNull();
    const desc = render({ description: 'Agenda una reunión' }).el.querySelector(
      'h2 + p.dialog__description',
    );
    expect(desc?.textContent?.trim()).toBe('Agenda una reunión');
  });

  it('R2: proyecta el contenido en .dialog__body.l-stack tras la cabecera', async () => {
    const { el } = await renderHost();
    expect(el.querySelector('.dialog__head + .dialog__body.l-stack app-text-field')).not.toBeNull();
  });

  it('R3: proyecta el pie en .dialog__foot.l-cluster[data-justify=end]; sin pie no lo pinta', async () => {
    expect(render().el.querySelector('.dialog__foot')).toBeNull();
    const { el } = await renderHost();
    const foot = el.querySelector('.dialog__body + .dialog__foot.l-cluster[data-justify="end"]');
    expect(foot?.querySelectorAll('app-button').length).toBe(2);
  });

  it('R4: envuelve .dialog en <dialog class="scrim"> con aria-label', () => {
    const { el } = render();
    const scrim = el.querySelector('dialog.scrim');
    expect(scrim?.getAttribute('aria-label')).toBe('Nueva cita');
    expect(scrim?.querySelector(':scope > .dialog')).not.toBeNull();
  });

  it('R5: con static pinta solo .dialog con role="dialog" y aria-label, visible sin open', () => {
    const { el } = render({ static: true });
    expect(el.querySelector('dialog')).toBeNull();
    const box = el.querySelector('.dialog');
    expect(box?.getAttribute('role')).toBe('dialog');
    expect(box?.getAttribute('aria-label')).toBe('Nueva cita');
    expect(calls).toEqual([]);
  });

  it('R6: al abrir usa showModal(); con contained usa show() y data-contained', async () => {
    const { host, fixture, dialog } = await renderHost();
    expect(dialog.hasAttribute('data-contained')).toBe(false);
    host.open.set(true);
    await fixture.whenStable();
    expect(calls).toEqual(['showModal']);
    expect(dialog.open).toBe(true);

    const other = await renderHost();
    calls.length = 0;
    other.host.contained.set(true);
    other.host.open.set(true);
    await other.fixture.whenStable();
    expect(calls).toEqual(['show']);
    expect(other.dialog.hasAttribute('data-contained')).toBe(true);
  });

  it('R7: al pasar open a falso llama a close()', async () => {
    const { host, fixture, dialog } = await renderHost();
    host.open.set(true);
    await fixture.whenStable();
    host.open.set(false);
    await fixture.whenStable();
    expect(calls).toEqual(['showModal', 'close']);
    expect(dialog.open).toBe(false);
  });

  it('R8: el evento close y Escape ponen open a falso', async () => {
    const { host, fixture, dialog } = await renderHost();
    host.open.set(true);
    await fixture.whenStable();
    dialog.removeAttribute('open');
    dialog.dispatchEvent(new Event('close'));
    expect(host.open()).toBe(false);
    await fixture.whenStable();

    host.open.set(true);
    await fixture.whenStable();
    dialog
      .querySelector('input')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(host.open()).toBe(false);
  });

  it('R9: al abrir enfoca el primer control del cuerpo, no el botón Cerrar', async () => {
    const { host, fixture, el } = await renderHost();
    host.open.set(true);
    await fixture.whenStable();
    expect(document.activeElement).toBe(el.querySelector('.dialog__body input'));
  });

  it('R10: botón «Cerrar» size s al final de la cabecera que pone open a falso; closable=false lo quita', async () => {
    expect(render({ closable: false }).el.querySelector('app-icon-button')).toBeNull();
    const { host, fixture, el } = await renderHost();
    host.open.set(true);
    await fixture.whenStable();
    const button = el.querySelector<HTMLButtonElement>(
      '.dialog__head > app-icon-button:last-child button',
    )!;
    expect(button.getAttribute('aria-label')).toBe('Cerrar');
    expect(button.getAttribute('data-size')).toBe('s');
    expect(button.textContent).toContain('close');
    button.click();
    expect(host.open()).toBe(false);
  });

  it('R11: variant pone data-variant en el scrim y en .dialog', () => {
    expect(render().el.querySelector('[data-variant]')).toBeNull();
    const { el } = render({ variant: 'full' });
    expect(el.querySelector('dialog.scrim')?.getAttribute('data-variant')).toBe('full');
    expect(el.querySelector('.dialog')?.getAttribute('data-variant')).toBe('full');
  });

  it('R12: con sheet el asa es el primer hijo de .dialog y aria-hidden', () => {
    expect(render().el.querySelector('.dialog__grabber')).toBeNull();
    const grabber = render({ variant: 'sheet' }).el.querySelector(
      '.dialog > span.dialog__grabber:first-child',
    );
    expect(grabber?.getAttribute('aria-hidden')).toBe('true');
  });

  it('SPEC 48 R3–R5: clic en el scrim cierra; dentro de .dialog o con closable=false no', async () => {
    const { host, fixture, dialog } = await renderHost();
    host.open.set(true);
    await fixture.whenStable();
    dialog.querySelector<HTMLElement>('.dialog__body')!.click();
    expect(host.open()).toBe(true);
    dialog.click();
    expect(host.open()).toBe(false);

    host.closable.set(false);
    host.open.set(true);
    await fixture.whenStable();
    dialog.click();
    expect(host.open()).toBe(true);
  });

  it('SPEC 61 R2: clic en un botón submit dentro del Dialog emite submit del form', async () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('form button')!.click();
    expect(fixture.componentInstance.submits).toBe(1);
  });

  it('SPEC 61 R4: clic dentro de .dialog no cierra ni queda defaultPrevented', async () => {
    const { host, fixture, dialog } = await renderHost();
    host.open.set(true);
    await fixture.whenStable();
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    dialog.querySelector('.dialog__body')!.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(host.open()).toBe(true);
  });

  it('SPEC 48 R7: Escape en un menú abierto lo cierra y el diálogo sigue abierto', async () => {
    const { host, fixture, el } = await renderHost();
    host.open.set(true);
    await fixture.whenStable();
    const trigger = el.querySelector<HTMLButtonElement>('app-menu .icon-button')!;
    trigger.click();
    await fixture.whenStable();
    el.querySelector('.menu__item')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(el.querySelector('.menu__panel')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(host.open()).toBe(true);
  });
});
