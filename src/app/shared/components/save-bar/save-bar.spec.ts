import { TestBed } from '@angular/core/testing';
import { SaveBar } from './save-bar';

function render(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(SaveBar);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const buttons = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLButtonElement>('button'));

describe('SaveBar', () => {
  it('R1: sin dirty, saved ni static no renderiza nada', () => {
    const { el } = render();
    expect(el.childElementCount).toBe(0);
  });

  it('R2: div.save-bar con role="region" y aria-label="Cambios"', () => {
    const bar = render({ dirty: true }).el.querySelector('div.save-bar');
    expect(bar?.getAttribute('role')).toBe('region');
    expect(bar?.getAttribute('aria-label')).toBe('Cambios');
    expect(bar?.hasAttribute('data-state')).toBe(false);
  });

  it('R3: mensaje con ícono edit y texto por defecto o message', () => {
    const { fixture, el } = render({ dirty: true });
    const msg = () => el.querySelector('.save-bar__msg')!;
    expect(msg().querySelector('.icon')?.textContent).toBe('edit');
    expect(msg().textContent).toContain('Tienes cambios sin guardar');
    fixture.componentRef.setInput('message', 'Hay 2 cambios');
    fixture.detectChanges();
    expect(msg().textContent).toContain('Hay 2 cambios');
  });

  it('R4: l-cluster con Descartar ghost y Guardar cambios con ícono check', () => {
    const { fixture, el } = render({ dirty: true });
    const cluster = el.querySelector('span.l-cluster');
    expect(cluster?.getAttribute('data-gap')).toBe('2xs');
    const [cancel, save] = buttons(el);
    expect(cancel.dataset['variant']).toBe('ghost');
    expect(cancel.textContent?.trim()).toBe('Descartar');
    expect(save.dataset['variant']).toBeUndefined();
    expect(save.querySelector('.icon')?.textContent).toBe('check');
    expect(save.textContent).toContain('Guardar cambios');
    fixture.componentRef.setInput('saveLabel', 'Guardar ajustes');
    fixture.detectChanges();
    expect(buttons(el)[1].textContent).toContain('Guardar ajustes');
  });

  it('R5: Descartar emite cancelClicked y guardar emite saveClicked', () => {
    const { fixture, el } = render({ dirty: true });
    const cancel = vi.fn();
    const save = vi.fn();
    fixture.componentInstance.cancelClicked.subscribe(cancel);
    fixture.componentInstance.saveClicked.subscribe(save);
    const [cancelBtn, saveBtn] = buttons(el);
    cancelBtn.click();
    saveBtn.click();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('R6: con saving, Descartar disabled y guardar en loading sin emitir', () => {
    const { fixture, el } = render({ dirty: true, saving: true });
    const save = vi.fn();
    fixture.componentInstance.saveClicked.subscribe(save);
    const [cancelBtn, saveBtn] = buttons(el);
    expect(cancelBtn.disabled).toBe(true);
    expect(saveBtn.hasAttribute('data-loading')).toBe(true);
    saveBtn.click();
    expect(save).not.toHaveBeenCalled();
  });

  it('R7: saved pone data-state, ícono check_circle, savedMessage y sin botones', () => {
    const { fixture, el } = render({ dirty: true, saved: true });
    const bar = el.querySelector('div.save-bar')!;
    expect(bar.getAttribute('data-state')).toBe('saved');
    const msg = bar.querySelector('.save-bar__msg')!;
    expect(msg.querySelector('.icon')?.textContent).toBe('check_circle');
    expect(msg.textContent).toContain('Cambios guardados');
    expect(buttons(el)).toHaveLength(0);
    expect(bar.querySelectorAll('.save-bar__msg')).toHaveLength(1);
    fixture.componentRef.setInput('savedMessage', 'Ajustes guardados');
    fixture.detectChanges();
    expect(msg.textContent).toContain('Ajustes guardados');
  });

  it('R8: static renderiza la barra sin dirty ni saved', () => {
    expect(render({ static: true }).el.querySelector('div.save-bar')).not.toBeNull();
  });

  it('SPEC 50 R4–R7: saved se oculta a los 1800 ms, no con savedTimeout=0 y vuelve al repetir', () => {
    vi.useFakeTimers();
    const { fixture, el } = render({ saved: true });
    const bar = () => el.querySelector('div.save-bar');
    vi.advanceTimersByTime(1799);
    fixture.detectChanges();
    expect(bar()).not.toBeNull();
    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(bar()).toBeNull();

    fixture.componentRef.setInput('saved', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('saved', true);
    fixture.detectChanges();
    expect(bar()?.getAttribute('data-state')).toBe('saved');

    const persistent = render({ saved: true, savedTimeout: 0 });
    vi.advanceTimersByTime(5000);
    persistent.fixture.detectChanges();
    expect(persistent.el.querySelector('div.save-bar')).not.toBeNull();
    vi.useRealTimers();
  });

  it('SPEC 70 R9: con saving, el botón dice «Guardando» y su spinner lo anuncia', () => {
    const { el } = render({ dirty: true, saving: true });
    const saveBtn = buttons(el)[1];
    expect(saveBtn.textContent!.replace(/\s+/g, ' ')).toContain('Guardando');
    expect(saveBtn.textContent).not.toContain('Guardar cambios');
    expect(saveBtn.querySelector('app-spinner')!.getAttribute('aria-label')).toBe('Guardando');
    expect(buttons(render({ dirty: true }).el)[1].textContent).toContain('Guardar cambios');
  });
});
