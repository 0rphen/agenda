import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField } from '@angular/forms/signals';
import { SelectField, SelectOption } from './select';

const options: SelectOption[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'estrategia', label: 'Estrategia' },
];

function render(inputs: Record<string, unknown>): ComponentFixture<SelectField> {
  const fixture = TestBed.createComponent(SelectField);
  fixture.componentRef.setInput('label', 'Proyecto');
  fixture.componentRef.setInput('options', options);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

@Component({
  imports: [SelectField],
  template: `
    <app-select label="Proyecto" [options]="options" />
    <app-select label="Proyecto" [options]="options" />
  `,
})
class TwoFields {
  readonly options = options;
}

@Component({
  imports: [SelectField, FormField],
  template: `<app-select label="Proyecto" [options]="options" [formField]="eventForm.project" />`,
})
class SignalFormHost {
  readonly options = options;
  readonly model = signal({ project: 'estrategia' });
  readonly locked = signal(false);
  readonly eventForm = form(this.model, (path) => {
    disabled(path.project, () => this.locked());
  });
}

describe('SelectField', () => {
  it('R1: host es .field con label asociado al control por for/id', () => {
    const fixture = render({ id: 'proyecto' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    expect(host.hasAttribute('id')).toBe(false);
    const label = q<HTMLLabelElement>(fixture, 'label.field__label');
    expect(label.textContent?.trim()).toBe('Proyecto');
    expect(label.htmlFor).toBe('proyecto');
    expect(q(fixture, 'select.input__control').id).toBe('proyecto');
  });

  it('R2: sin id genera app-select-N distinto por instancia', () => {
    const fixture = TestBed.createComponent(TwoFields);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [a, b] = Array.from(el.querySelectorAll('select'));
    expect(a.id).toMatch(/^app-select-\d+$/);
    expect(b.id).toMatch(/^app-select-\d+$/);
    expect(a.id).not.toBe(b.id);
    for (const label of Array.from(el.querySelectorAll('label'))) {
      expect(el.querySelector(`#${label.htmlFor}`)?.tagName).toBe('SELECT');
    }
  });

  it('R3: hint en .field__hint con id <id>-hint referenciado por aria-describedby', () => {
    const fixture = render({ id: 'proyecto', hint: 'Elige un proyecto' });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('proyecto-hint');
    expect(hint.textContent?.trim()).toBe('Elige un proyecto');
    expect(q(fixture, 'select').getAttribute('aria-describedby')).toBe('proyecto-hint');

    const bare = render({});
    expect(q(bare, '.field__hint')).toBeNull();
    expect(q(bare, 'select').hasAttribute('aria-describedby')).toBe(false);

    const error = render({ id: 'proyecto', error: 'Proyecto archivado' });
    expect(q(error, '.field__hint').id).toBe('proyecto-hint');
    expect(q(error, 'select').getAttribute('aria-describedby')).toBe('proyecto-hint');
  });

  it('R4: error marca data-invalid, aria-invalid, error_outline y sustituye al hint', () => {
    const fixture = render({ hint: 'Ayuda', error: 'Proyecto archivado' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, 'select').getAttribute('aria-invalid')).toBe('true');
    const icon = q(fixture, '.field__hint app-icon');
    expect(icon.textContent?.trim()).toBe('error_outline');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(q(fixture, '.field__hint').textContent).toContain('Proyecto archivado');
    expect(q(fixture, '.field__hint').textContent).not.toContain('Ayuda');

    const valid = render({ hint: 'Ayuda', error: '' });
    expect((valid.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, '.input').hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, 'select').hasAttribute('aria-invalid')).toBe(false);
    expect(q(valid, '.field__hint app-icon')).toBeNull();
  });

  it('R5: disabled deshabilita el control y marca data-disabled', () => {
    const fixture = render({ disabled: true });
    expect(q<HTMLSelectElement>(fixture, 'select').disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);

    const enabled = render({});
    expect(q<HTMLSelectElement>(enabled, 'select').disabled).toBe(false);
    expect(q(enabled, '.input').hasAttribute('data-disabled')).toBe(false);
  });

  it('R6: elegir una opción actualiza value', () => {
    const fixture = render({ value: 'estrategia' });
    const select = q<HTMLSelectElement>(fixture, 'select');
    select.value = 'marketing';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.value()).toBe('marketing');
  });

  it('R7: perder el foco pone touched en true', () => {
    const fixture = render({});
    expect(fixture.componentInstance.touched()).toBe(false);
    q(fixture, 'select').dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('R9: no declara estilos de componente', () => {
    const fixture = render({});
    const host = fixture.nativeElement as HTMLElement;
    expect(Array.from(host.attributes).some((a) => a.name.startsWith('_nghost'))).toBe(false);
  });

  it('R10: name se expone en el control solo si se pasa', () => {
    expect(q(render({ name: 'proyecto' }), 'select').getAttribute('name')).toBe('proyecto');
    expect(q(render({}), 'select').hasAttribute('name')).toBe(false);
  });

  it('R17: renderiza una option por elemento y selecciona la que coincide con value', () => {
    const select = q<HTMLSelectElement>(render({ value: 'estrategia' }), 'select.input__control');
    expect(Array.from(select.options).map((o) => [o.value, o.textContent?.trim()])).toEqual([
      ['marketing', 'Marketing'],
      ['estrategia', 'Estrategia'],
    ]);
    expect(select.value).toBe('estrategia');
  });

  it('SPEC 15: sin value que coincida no muestra la primera opción como elegida y elegirla emite', () => {
    const fixture = render({});
    const select = q<HTMLSelectElement>(fixture, 'select.input__control');
    expect(select.value).toBe('');
    select.value = 'marketing';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.value()).toBe('marketing');
  });

  it('R18 (SPEC 16 R6): data-select en .input, flecha sin app-icon', () => {
    const fixture = render({});
    expect(q(fixture, '.input').hasAttribute('data-select')).toBe(true);
    expect(q(fixture, '.input app-icon')).toBeNull();
  });

  it('R19 (SPEC 16 R3, R4): icon como data-icon en .input, sin app-icon', () => {
    const fixture = render({ icon: 'folder' });
    expect(q(fixture, '.input').getAttribute('data-icon')).toBe('folder');
    expect(q(fixture, '.input app-icon')).toBeNull();
    expect(q(render({}), '.input').hasAttribute('data-icon')).toBe(false);
  });
  it('SPEC 36 R10: ariaLabel sin label omite la etiqueta y pone aria-label en el select', () => {
    const bare = render({ label: undefined, ariaLabel: 'Inicio de semana' });
    expect(q(bare, '.field__label')).toBeNull();
    expect(q(bare, 'select').getAttribute('aria-label')).toBe('Inicio de semana');
    const labelled = render({ ariaLabel: 'Inicio de semana' });
    expect(q(labelled, '.field__label').textContent).toBe('Proyecto');
    expect(q(labelled, 'select').hasAttribute('aria-label')).toBe(false);
  });
});

describe('SelectField con Signal Forms', () => {
  it('R8: refleja value y disabled del campo en ambos sentidos', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const select = q<HTMLSelectElement>(fixture, 'select');
    expect(select.value).toBe('estrategia');

    select.value = 'marketing';
    select.dispatchEvent(new Event('change'));
    expect(host.model().project).toBe('marketing');
    // the app runs change detection after the DOM event; the test does it by hand
    fixture.detectChanges();

    host.model.set({ project: 'estrategia' });
    fixture.detectChanges();
    expect(select.value).toBe('estrategia');

    select.dispatchEvent(new Event('blur'));
    expect(host.eventForm.project().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(select.disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);
  });
});
