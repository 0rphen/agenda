import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Progress } from './progress';

function render(inputs: Record<string, unknown>): HTMLElement {
  const fixture = TestBed.createComponent(Progress);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

const track = (el: HTMLElement) => el.querySelector<HTMLElement>('.progress__track')!;
const fill = (el: HTMLElement) => el.querySelector<HTMLElement>('.progress__fill')!;
const valueNow = (value: unknown) => track(render({ value })).getAttribute('aria-valuenow');

// Atributo estático y binding necesitan un host para comprobar el atributo title.
@Component({
  imports: [Progress],
  template: `
    <app-progress id="static" [value]="40" heading="Tareas de la semana" />
    <app-progress id="bound" [value]="10" [heading]="heading" />
  `,
})
class Host {
  heading = 'Completado';
}

describe('Progress', () => {
  it('R1: host .progress con row > track > fill', () => {
    const el = render({ value: 50 });
    expect(el.classList).toContain('progress');
    expect(el.querySelector('.progress__row > .progress__track > .progress__fill')).not.toBeNull();
  });

  it('R2: normaliza value a entero 0–100 y no finito a 0', () => {
    expect(valueNow(33.4)).toBe('33');
    expect(valueNow(33.6)).toBe('34');
    expect(valueNow(-5)).toBe('0');
    expect(valueNow(140)).toBe('100');
    expect(valueNow(NaN)).toBe('0');
    expect(valueNow(Infinity)).toBe('0');
  });

  it('R3: track con role progressbar y aria-value*', () => {
    const t = track(render({ value: 72 }));
    expect(t.getAttribute('role')).toBe('progressbar');
    expect(t.getAttribute('aria-valuemin')).toBe('0');
    expect(t.getAttribute('aria-valuemax')).toBe('100');
    expect(t.getAttribute('aria-valuenow')).toBe('72');
  });

  it('R4: fill expone --value sin unidad', () => {
    expect(fill(render({ value: 72 })).style.getPropertyValue('--value')).toBe('72');
    expect(fill(render({ value: 33.6 })).style.getPropertyValue('--value')).toBe('34');
  });

  it('R5: aria-label con label, si no heading, si no Progreso', () => {
    const name = (inputs: Record<string, unknown>) =>
      track(render({ value: 10, ...inputs })).getAttribute('aria-label');
    expect(name({ label: 'Tareas', heading: 'Market Research' })).toBe('Tareas');
    expect(name({ heading: 'Market Research' })).toBe('Market Research');
    expect(name({})).toBe('Progreso');
  });

  it('R6: título antes de la fila solo con heading', () => {
    const el = render({ value: 10, heading: 'Market Research' });
    const title = el.querySelector('.progress__title')!;
    expect(title.tagName).toBe('SPAN');
    expect(title.textContent?.trim()).toBe('Market Research');
    expect(title.nextElementSibling?.classList).toContain('progress__row');
    expect(render({ value: 10 }).querySelector('.progress__title')).toBeNull();
  });

  it('SPEC 24 R3: heading estático o enlazado no deja atributo title en el host', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const byId = (id: string) => el.querySelector<HTMLElement>(`#${id}`)!;
    for (const bar of [byId('static'), byId('bound')]) expect(bar.hasAttribute('title')).toBe(false);
    expect(byId('static').querySelector('.progress__title')?.textContent?.trim()).toBe(
      'Tareas de la semana',
    );
    expect(track(byId('static')).getAttribute('aria-label')).toBe('Tareas de la semana');
    expect(byId('bound').querySelector('.progress__title')?.textContent?.trim()).toBe('Completado');
  });

  it('R7: etiqueta tras el track con valor, U+202F y %', () => {
    const label = render({ value: 72 }).querySelector('.progress__label')!;
    expect(label.tagName).toBe('SPAN');
    expect(label.previousElementSibling?.classList).toContain('progress__track');
    expect(label.textContent?.trim()).toBe('72 %');
  });

  it('R8: sin etiqueta cuando showLabel es false', () => {
    expect(render({ value: 72, showLabel: false }).querySelector('.progress__label')).toBeNull();
  });

  it('R9: data-tone con success o accent; brand sin data-tone', () => {
    expect(render({ value: 10, tone: 'success' }).getAttribute('data-tone')).toBe('success');
    expect(render({ value: 10, tone: 'accent' }).getAttribute('data-tone')).toBe('accent');
    expect(render({ value: 100, tone: 'accent' }).getAttribute('data-tone')).toBe('accent');
    expect(render({ value: 10, tone: 'brand' }).hasAttribute('data-tone')).toBe(false);
    expect(render({ value: 100, tone: 'brand' }).hasAttribute('data-tone')).toBe(false);
  });

  it('R10: sin tone y al 100 % expone data-tone success', () => {
    expect(render({ value: 100 }).getAttribute('data-tone')).toBe('success');
    expect(render({ value: 140 }).getAttribute('data-tone')).toBe('success');
  });

  it('R11: sin tone y por debajo de 100 no expone data-tone', () => {
    expect(render({ value: 99.4 }).hasAttribute('data-tone')).toBe(false);
    expect(render({ value: 0 }).hasAttribute('data-tone')).toBe(false);
  });
});
