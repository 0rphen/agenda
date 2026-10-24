import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Card, CardActions } from './card';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(Card);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

// Host <button>, acciones proyectadas y atributos sueltos necesitan un host.
@Component({
  imports: [Card, CardActions],
  template: `
    <app-card id="actions" heading="Notas recientes">
      <button cardActions type="button">Más</button>
      <p>Contenido</p>
    </app-card>
    <app-card id="only-actions"><button cardActions type="button">Más</button></app-card>
    <app-card id="flags" selected disabled (clicked)="clicks = clicks + 1">Contenido</app-card>
    <button app-card id="button" heading="Notas" (clicked)="last = $event">
      <span cardActions>Más</span>
      Contenido
    </button>
    <button app-card id="bound" [heading]="heading">Contenido</button>
    <button app-card id="button-flags" selected disabled (clicked)="clicks = clicks + 1">
      Contenido
    </button>
  `,
})
class Host {
  clicks = 0;
  last?: MouseEvent;
  heading = 'Hábitos';
}

function renderHost() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const byId = (id: string) => el.querySelector<HTMLElement>(`#${id}`)!;
  return {
    host: fixture.componentInstance,
    actions: byId('actions'),
    onlyActions: byId('only-actions'),
    flags: byId('flags'),
    button: byId('button') as HTMLButtonElement,
    bound: byId('bound'),
    buttonFlags: byId('button-flags') as HTMLButtonElement,
  };
}

describe('Card', () => {
  it('R1: host app-card con class card', () => {
    const { actions } = renderHost();
    expect(actions.tagName).toBe('APP-CARD');
    expect(actions.classList).toContain('card');
  });

  it('R2: button app-card con data-interactive, type button y class card', () => {
    const { button } = renderHost();
    expect(button.hasAttribute('data-interactive')).toBe(true);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.classList).toContain('card');
    expect(render().hasAttribute('data-interactive')).toBe(false);
  });

  it('R3: data-variant solo con elevated', () => {
    expect(render().hasAttribute('data-variant')).toBe(false);
    expect(render({ variant: 'default' }).hasAttribute('data-variant')).toBe(false);
    expect(render({ variant: 'elevated' }).getAttribute('data-variant')).toBe('elevated');
  });

  it('R4: u-tint y data-tint solo con tint', () => {
    const plain = render();
    expect(plain.classList).not.toContain('u-tint');
    expect(plain.hasAttribute('data-tint')).toBe(false);
    const tinted = render({ tint: 'mint' });
    expect(tinted.classList).toContain('u-tint');
    expect(tinted.getAttribute('data-tint')).toBe('mint');
  });

  it('R5: heading pinta card__head con h3.card__title', () => {
    const card = render({ heading: 'Notas recientes' });
    const title = card.querySelector('.card__head > h3.card__title');
    expect(title?.textContent?.trim()).toBe('Notas recientes');
  });

  it('R6: cardActions dentro de card__head tras el título, también sin heading', () => {
    const { actions, onlyActions } = renderHost();
    const head = actions.querySelector('.card__head')!;
    expect(head.children[0].matches('h3.card__title')).toBe(true);
    expect(head.children[1].matches('[cardActions]')).toBe(true);
    expect(onlyActions.querySelector('.card__head > [cardActions]')).not.toBeNull();
    expect(onlyActions.querySelector('.card__title')).toBeNull();
  });

  it('R7: sin heading ni cardActions no hay card__head', () => {
    expect(render().querySelector('.card__head')).toBeNull();
  });

  it('R8: button app-card no proyecta cardActions', () => {
    const { button } = renderHost();
    expect(button.querySelector('[cardActions]')).toBeNull();
    expect(button.querySelector('.card__title')?.textContent?.trim()).toBe('Notas');
  });

  it('SPEC 23 R3: heading estático o enlazado no deja atributo title en el host', () => {
    const { actions, button, bound } = renderHost();
    for (const card of [actions, button, bound]) expect(card.hasAttribute('title')).toBe(false);
    expect(bound.querySelector('.card__title')?.textContent?.trim()).toBe('Hábitos');
  });

  it('R9: el resto del contenido va en card__body', () => {
    const { actions, button } = renderHost();
    expect(actions.querySelector('.card__body > p')?.textContent).toBe('Contenido');
    expect(actions.querySelector('.card__body [cardActions]')).toBeNull();
    expect(button.querySelector('.card__body')?.textContent?.trim()).toBe('Contenido');
  });

  it('R10: selected pone data-selected y aria-current', () => {
    const plain = render();
    expect(plain.hasAttribute('data-selected')).toBe(false);
    expect(plain.hasAttribute('aria-current')).toBe(false);
    const selected = render({ selected: true });
    expect(selected.hasAttribute('data-selected')).toBe(true);
    expect(selected.getAttribute('aria-current')).toBe('true');
  });

  it('R11: disabled pone data-disabled y disabled nativo o aria-disabled según host', () => {
    const plain = render();
    expect(plain.hasAttribute('data-disabled')).toBe(false);
    expect(plain.hasAttribute('aria-disabled')).toBe(false);
    const { flags, button, buttonFlags } = renderHost();
    expect(button.disabled).toBe(false);
    expect(buttonFlags.hasAttribute('data-disabled')).toBe(true);
    expect(buttonFlags.disabled).toBe(true);
    expect(buttonFlags.hasAttribute('aria-disabled')).toBe(false);
    expect(flags.hasAttribute('data-disabled')).toBe(true);
    expect(flags.getAttribute('aria-disabled')).toBe('true');
    expect(flags.hasAttribute('disabled')).toBe(false);
  });

  it('R12: selected y disabled como atributo suelto valen true', () => {
    const { flags, buttonFlags } = renderHost();
    for (const card of [flags, buttonFlags]) {
      expect(card.hasAttribute('data-selected')).toBe(true);
      expect(card.hasAttribute('data-disabled')).toBe(true);
    }
  });

  it('R13: state pone data-force', () => {
    expect(render().hasAttribute('data-force')).toBe(false);
    for (const state of ['hover', 'active', 'focus']) {
      expect(render({ state }).getAttribute('data-force')).toBe(state);
    }
  });

  it('R14: clic en button app-card habilitado emite clicked con el MouseEvent', () => {
    const { host, button } = renderHost();
    button.click();
    expect(host.last).toBeInstanceOf(MouseEvent);
  });

  it('R15: button app-card deshabilitado no emite clicked', () => {
    const { host, buttonFlags } = renderHost();
    buttonFlags.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(host.clicks).toBe(0);
  });

  it('R16: app-card no emite clicked', () => {
    const { host, flags } = renderHost();
    flags.click();
    expect(host.clicks).toBe(0);
    const fixture = TestBed.createComponent(Card);
    let emitted = false;
    fixture.componentInstance.clicked.subscribe(() => (emitted = true));
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).click();
    expect(emitted).toBe(false);
  });

  it('SPEC 36 R11: tone danger pone data-tone', () => {
    expect(render().hasAttribute('data-tone')).toBe(false);
    expect(render({ tone: 'danger' }).getAttribute('data-tone')).toBe('danger');
  });
});
