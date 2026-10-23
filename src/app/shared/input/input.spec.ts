import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { disabled, form, FormField } from '@angular/forms/signals';
import { InputField } from './input';

function render(inputs: Record<string, unknown>): ComponentFixture<InputField> {
  const fixture = TestBed.createComponent(InputField);
  fixture.componentRef.setInput('label', 'Título');
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function q<T extends Element>(fixture: ComponentFixture<unknown>, selector: string): T {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector)!;
}

@Component({
  imports: [InputField],
  template: `<app-input label="Título" /><app-input label="Título" />`,
})
class TwoInputs {}

@Component({
  imports: [InputField, FormField],
  template: `<app-input label="Título" [formField]="eventForm.title" />`,
})
class SignalFormHost {
  readonly model = signal({ title: 'Revisión de sprint' });
  readonly locked = signal(false);
  readonly eventForm = form(this.model, (path) => {
    disabled(path.title, () => this.locked());
  });
}

describe('InputField', () => {
  it('R5: host es .field con label asociado al control por for/id', () => {
    const fixture = render({ id: 'titulo' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList).toContain('field');
    expect(host.hasAttribute('id')).toBe(false);
    const label = q<HTMLLabelElement>(fixture, 'label.field__label');
    expect(label.textContent?.trim()).toBe('Título');
    expect(label.htmlFor).toBe('titulo');
    expect(q(fixture, 'input.input__control').id).toBe('titulo');
  });

  it('R6: sin id genera app-input-N distinto por instancia', () => {
    const fixture = TestBed.createComponent(TwoInputs);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [a, b] = Array.from(el.querySelectorAll('input'));
    expect(a.id).toMatch(/^app-input-\d+$/);
    expect(b.id).toMatch(/^app-input-\d+$/);
    expect(a.id).not.toBe(b.id);
    for (const label of Array.from(el.querySelectorAll('label'))) {
      expect(el.querySelector(`#${label.htmlFor}`)?.tagName).toBe('INPUT');
    }
  });

  it('R7: renderiza input.input__control con el type indicado (text por defecto)', () => {
    expect(q<HTMLInputElement>(render({}), 'input.input__control').type).toBe('text');
    for (const type of ['search', 'date', 'time']) {
      expect(q<HTMLInputElement>(render({ type }), 'input.input__control').type).toBe(type);
    }
  });

  it('R14: escribir actualiza value', () => {
    const fixture = render({});
    const control = q<HTMLInputElement>(fixture, 'input');
    control.value = 'Revisión de sprint';
    control.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('Revisión de sprint');
  });

  it('R8: con options renderiza select, data-select y expand_more al final', () => {
    const options = [
      { value: 'marketing', label: 'Marketing' },
      { value: 'estrategia', label: 'Estrategia' },
    ];
    const fixture = render({ options, value: 'estrategia' });
    const select = q<HTMLSelectElement>(fixture, 'select.input__control');
    expect(Array.from(select.options).map((o) => [o.value, o.textContent?.trim()])).toEqual([
      ['marketing', 'Marketing'],
      ['estrategia', 'Estrategia'],
    ]);
    expect(select.value).toBe('estrategia');
    expect(q(fixture, '.input').hasAttribute('data-select')).toBe(true);
    expect(q(fixture, '.input > :last-child').textContent?.trim()).toBe('expand_more');

    select.value = 'marketing';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.value()).toBe('marketing');
  });

  it('R9: multiline renderiza textarea con rows (3 por defecto) y data-multiline', () => {
    let fixture = render({ multiline: true });
    expect(q<HTMLTextAreaElement>(fixture, 'textarea.input__control').rows).toBe(3);
    expect(q(fixture, '.input').hasAttribute('data-multiline')).toBe(true);
    expect(q(fixture, 'input')).toBeNull();

    fixture = render({ multiline: true, rows: 5 });
    expect(q<HTMLTextAreaElement>(fixture, 'textarea').rows).toBe(5);

    const textarea = q<HTMLTextAreaElement>(fixture, 'textarea');
    textarea.value = 'Notas';
    textarea.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value()).toBe('Notas');
  });

  it('R10: icon antes del control salvo en multiline', () => {
    const fixture = render({ icon: 'search' });
    const first = q(fixture, '.input > :first-child');
    expect(first.tagName).toBe('APP-ICON');
    expect(first.textContent?.trim()).toBe('search');
    expect(q(render({ icon: 'search', multiline: true }), 'app-icon')).toBeNull();
    expect(q(render({}), 'app-icon')).toBeNull();
  });

  it('R11: hint en .field__hint con id <id>-hint referenciado por aria-describedby', () => {
    const fixture = render({ id: 'titulo', hint: 'Máximo 500 caracteres' });
    const hint = q(fixture, '.field__hint');
    expect(hint.id).toBe('titulo-hint');
    expect(hint.textContent?.trim()).toBe('Máximo 500 caracteres');
    expect(q(fixture, 'input').getAttribute('aria-describedby')).toBe('titulo-hint');

    const bare = render({});
    expect(q(bare, '.field__hint')).toBeNull();
    expect(q(bare, 'input').hasAttribute('aria-describedby')).toBe(false);

    const error = render({ id: 'lugar', error: 'Esa sala está ocupada a esa hora' });
    expect(q(error, '.field__hint').id).toBe('lugar-hint');
    expect(q(error, 'input').getAttribute('aria-describedby')).toBe('lugar-hint');
  });

  it('R12: error marca data-invalid, aria-invalid, error_outline y sustituye al hint', () => {
    const fixture = render({ hint: 'Ayuda', error: 'Esa sala está ocupada a esa hora' });
    expect((fixture.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-invalid')).toBe(true);
    expect(q(fixture, 'input').getAttribute('aria-invalid')).toBe('true');
    const icon = q(fixture, '.field__hint app-icon');
    expect(icon.textContent?.trim()).toBe('error_outline');
    expect(icon.getAttribute('data-size')).toBe('s');
    expect(q(fixture, '.field__hint').textContent).toContain('Esa sala está ocupada a esa hora');
    expect(q(fixture, '.field__hint').textContent).not.toContain('Ayuda');

    const valid = render({ hint: 'Ayuda', error: '' });
    expect((valid.nativeElement as HTMLElement).hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, '.input').hasAttribute('data-invalid')).toBe(false);
    expect(q(valid, 'input').hasAttribute('aria-invalid')).toBe(false);
    expect(q(valid, '.field__hint app-icon')).toBeNull();
  });

  it('R13: disabled deshabilita el control (input, select, textarea) y marca data-disabled', () => {
    const options = [{ value: 'a', label: 'A' }];
    for (const extra of [{}, { options }, { multiline: true }]) {
      const fixture = render({ ...extra, disabled: true });
      expect(q<HTMLInputElement>(fixture, '.input__control').disabled).toBe(true);
      expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);
    }
    const enabled = render({});
    expect(q<HTMLInputElement>(enabled, '.input__control').disabled).toBe(false);
    expect(q(enabled, '.input').hasAttribute('data-disabled')).toBe(false);
  });

  it('R15: perder el foco pone touched en true', () => {
    const fixture = render({});
    expect(fixture.componentInstance.touched()).toBe(false);
    q(fixture, 'input').dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.touched()).toBe(true);
  });
});

describe('InputField con Signal Forms', () => {
  it('R16: refleja value y disabled del campo en ambos sentidos', () => {
    const fixture = TestBed.createComponent(SignalFormHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const control = q<HTMLInputElement>(fixture, 'input');
    expect(control.value).toBe('Revisión de sprint');

    control.value = 'Planificación';
    control.dispatchEvent(new Event('input'));
    expect(host.model().title).toBe('Planificación');

    host.model.set({ title: 'Retro' });
    fixture.detectChanges();
    expect(control.value).toBe('Retro');

    control.dispatchEvent(new Event('blur'));
    expect(host.eventForm.title().touched()).toBe(true);

    host.locked.set(true);
    fixture.detectChanges();
    expect(control.disabled).toBe(true);
    expect(q(fixture, '.input').hasAttribute('data-disabled')).toBe(true);
  });
});
