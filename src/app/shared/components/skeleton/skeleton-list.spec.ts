import { TestBed } from '@angular/core/testing';
import { SkeletonList } from './skeleton-list';

function render(inputs: Record<string, unknown> = {}): HTMLElement {
  const fixture = TestBed.createComponent(SkeletonList);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture.nativeElement;
}

function rows(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(':scope > .skeleton-list__row'));
}

// Hijos directos de un elemento: clase de la columna o «skeleton», con data-fixed si lo hay.
function structure(el: Element): string[] {
  return Array.from(el.children).map((child) =>
    child.classList.contains('skeleton')
      ? 'skeleton'
      : child.className + (child.hasAttribute('data-fixed') ? '[fixed]' : ''),
  );
}

// Piezas en orden de documento como «shape|--w|--h».
function pieces(row: Element): string[] {
  return Array.from(row.querySelectorAll<HTMLElement>('app-skeleton')).map(
    (s) =>
      `${s.getAttribute('data-shape') ?? ''}|${s.style.getPropertyValue('--w')}|${s.style.getPropertyValue('--h')}`,
  );
}

describe('SkeletonList', () => {
  it('R5: host skeleton-list con role status, aria-busy y data-variant', () => {
    const el = render({ variant: 'task' });
    expect(el.classList).toContain('skeleton-list');
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-busy')).toBe('true');
    expect(el.getAttribute('data-variant')).toBe('task');
  });

  it('R6: aria-label con label; sin label, Cargando', () => {
    expect(render().getAttribute('aria-label')).toBe('Cargando');
    expect(render({ label: 'Cargando tareas' }).getAttribute('aria-label')).toBe('Cargando tareas');
  });

  it('R7: variant por defecto agenda', () => {
    expect(render().getAttribute('data-variant')).toBe('agenda');
  });

  it('R8: rows normalizado con floor; no finito o < 1 da 4; por defecto 4', () => {
    expect(rows(render())).toHaveLength(4);
    expect(rows(render({ rows: 2 }))).toHaveLength(2);
    expect(rows(render({ rows: 2.7 }))).toHaveLength(2);
    expect(rows(render({ rows: 0 }))).toHaveLength(4);
    expect(rows(render({ rows: -3 }))).toHaveLength(4);
    expect(rows(render({ rows: NaN }))).toHaveLength(4);
  });

  it('R9: una fila div.skeleton-list__row por fila normalizada', () => {
    const list = rows(render({ rows: 3 }));
    expect(list).toHaveLength(3);
    for (const row of list) expect(row.tagName).toBe('DIV');
  });

  it('R10: fila agenda con columna fija, barra y columna con ancho alterno', () => {
    const [row0, row1] = rows(render({ variant: 'agenda', rows: 2 }));
    expect(structure(row0)).toEqual([
      'skeleton-list__col[fixed]',
      'skeleton',
      'skeleton-list__col',
    ]);
    expect(row0.children[0].tagName).toBe('SPAN');
    expect(row0.children[2].tagName).toBe('SPAN');
    expect(pieces(row0)).toEqual([
      '|3rem|1.25em',
      '|2rem|0.75em',
      'block|var(--space-3xs)|var(--control-m)',
      '|30%|0.75em',
      '|80%|',
    ]);
    expect(pieces(row1)[4]).toBe('|60%|');
  });

  it('R11: fila task con icono bloque y columna con ancho alterno', () => {
    const [row0, row1] = rows(render({ variant: 'task', rows: 2 }));
    expect(structure(row0)).toEqual(['skeleton', 'skeleton-list__col']);
    expect(pieces(row0)).toEqual(['block|var(--icon-l)|var(--icon-l)', '|75%|', '|35%|0.75em']);
    expect(pieces(row1)[1]).toBe('|55%|');
  });

  it('R12: fila card con una columna, tres líneas y dos círculos', () => {
    const [row0, row1] = rows(render({ variant: 'card', rows: 2 }));
    for (const row of [row0, row1]) {
      expect(structure(row)).toEqual(['skeleton-list__col']);
      expect(structure(row.children[0])).toEqual([
        'skeleton',
        'skeleton',
        'skeleton',
        'skeleton-list__line',
      ]);
      expect(row.querySelector('.skeleton-list__line')?.tagName).toBe('SPAN');
      expect(pieces(row)).toEqual([
        '|40%|0.75em',
        '|70%|',
        '|50%|0.75em',
        'circle|var(--icon-xl)|',
        'circle|var(--icon-xl)|',
      ]);
    }
  });
});
