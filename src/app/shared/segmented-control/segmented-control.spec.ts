import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField } from '@angular/forms/signals';
import { SegmentedControl, SegmentedOption } from './segmented-control';

const views: SegmentedOption[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'sem', label: 'Esta semana' },
  { value: 'prox', label: 'Próxima semana' },
];

function render(inputs: Record<string, unknown>): ComponentFixture<SegmentedControl> {
  const fixture = TestBed.createComponent(SegmentedControl);
  fixture.componentRef.setInput('label', 'Vista');
  fixture.componentRef.setInput('options', views);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function buttons(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
}

function pressed(fixture: ComponentFixture<unknown>): string[] {
  return buttons(fixture)
    .filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.textContent!.trim());
}

function focusOut(from: HTMLElement, to: EventTarget | null): void {
  from.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: to }));
}

@Component({
  imports: [SegmentedControl],
  template: `<app-segmented-control label="Vista" [options]="options" disabled />`,
})
class BareDisabled {
  readonly options = views;
}

@Component({
  imports: [SegmentedControl, FormField],
  template: `<app-segmented-control
    label="Prioridad"
    [options]="options"
    [formField]="taskForm.priority"
  />`,
})
class SignalFormHost {
  readonly options: SegmentedOption[] = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
  ];
  readonly model = signal({ priority: 'media' });
  readonly locked = signal(false);
  readonly taskForm = form(this.model, (path) => {
    disabled(path.priority, () => this.locked());
  });
}

describe('SegmentedControl', () => {
  it('R1: host .segmented con role=group y aria-label = label', () => {
    const host = render({}).nativeElement as HTMLElement;
    expect(host.classList).toContain('segmented');
    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Vista');
  });

  it('R2: un button.segmented__option type=button por opción, en orden', () => {
    const list = buttons(render({}));
    expect(list.map((b) => b.textContent!.trim())).toEqual([
      'Hoy',
      'Esta semana',
      'Próxima semana',
    ]);
    for (const b of list) {
      expect(b.type).toBe('button');
      expect(b.classList).toContain('segmented__option');
    }
  });

  it('R3: solo la opción con value igual al model tiene aria-pressed=true', () => {
    const fixture = render({ value: 'sem' });
    expect(buttons(fixture).map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
      'false',
    ]);
  });

  it('R4: sin valor coincidente ninguna marcada y value no se escribe', () => {
    const empty = render({ value: '' });
    expect(pressed(empty)).toEqual([]);
    expect(empty.componentInstance.value()).toBe('');

    const unknown = render({ value: 'mes' });
    expect(pressed(unknown)).toEqual([]);
    expect(unknown.componentInstance.value()).toBe('mes');
  });

  it('R5: activar un botón pone value al de la opción', () => {
    // Espacio/Enter son activación nativa de <button> (dispara click); se verifica en Playwright
    const fixture = render({ value: 'sem' });
    buttons(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('hoy');
    expect(pressed(fixture)).toEqual(['Hoy']);
  });

  it('R6: opción disabled tiene disabled nativo y no cambia value', () => {
    const fixture = render({
      value: 'sem',
      options: [...views, { value: 'anio', label: 'Año', disabled: true }],
    });
    const list = buttons(fixture);
    expect(list.map((b) => b.disabled)).toEqual([false, false, false, true]);
    list[3].click();
    expect(fixture.componentInstance.value()).toBe('sem');
  });

  it('R7: disabled deshabilita todos los botones', () => {
    expect(buttons(render({ disabled: true })).every((b) => b.disabled)).toBe(true);
    expect(buttons(render({})).some((b) => b.disabled)).toBe(false);
  });

  it('R8: disabled como atributo suelto cuenta como true', () => {
    const fixture = TestBed.createComponent(BareDisabled);
    fixture.detectChanges();
    expect(buttons(fixture).every((b) => b.disabled)).toBe(true);
  });

  it('R9: touched solo cuando el foco sale del grupo', () => {
    const fixture = render({});
    const [first, second] = buttons(fixture);
    focusOut(first, second);
    expect(fixture.componentInstance.touched()).toBe(false);

    focusOut(second, document.body);
    expect(fixture.componentInstance.touched()).toBe(true);

    const toNull = render({});
    focusOut(buttons(toNull)[0], null);
    expect(toNull.componentInstance.touched()).toBe(true);
  });

  it('R11: no declara estilos de componente', () => {
    const host = render({}).nativeElement as HTMLElement;
    expect(Array.from(host.attributes).some((a) => a.name.startsWith('_nghost'))).toBe(false);
  });
});

describe('SegmentedControl con Signal Forms', () => {
  it('R10: sincroniza value, touched y disabled con el campo', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    expect(pressed(fixture)).toEqual(['Media']);

    const [baja, media] = buttons(fixture);
    baja.click();
    fixture.detectChanges();
    expect(host.model().priority).toBe('baja');
    expect(pressed(fixture)).toEqual(['Baja']);

    host.model.set({ priority: 'alta' });
    fixture.detectChanges();
    expect(pressed(fixture)).toEqual(['Alta']);

    focusOut(baja, media);
    expect(host.taskForm.priority().touched()).toBe(false);
    focusOut(media, document.body);
    expect(host.taskForm.priority().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(buttons(fixture).every((b) => b.disabled)).toBe(true);
  });
});
