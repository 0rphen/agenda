import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Avatar, initials, tintFor } from './avatar';

function setup(inputs: Record<string, unknown>): ComponentFixture<Avatar> {
  const fixture = TestBed.createComponent(Avatar);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return fixture;
}

function render(inputs: Record<string, unknown>): HTMLElement {
  return setup(inputs).nativeElement;
}

describe('initials', () => {
  it('una palabra: primera letra', () => expect(initials('Ana')).toBe('A'));
  it('varias palabras: primera y última', () => expect(initials('Ana María López')).toBe('AL'));
  it('ignora espacios sobrantes', () => expect(initials('  Ana   López  ')).toBe('AL'));
  it('vacío o solo espacios da ?', () => {
    expect(initials('')).toBe('?');
    expect(initials('   ')).toBe('?');
  });
  it('pasa a mayúsculas', () => expect(initials('ana lópez')).toBe('AL'));
});

describe('tintFor', () => {
  it('es estable para el mismo nombre', () => expect(tintFor('Ana')).toBe(tintFor('Ana')));
  it('da el valor del DS', () => {
    expect(tintFor('Adrian Murillo')).toBe('rose');
    expect(tintFor('Ana')).toBe('lime');
  });
});

describe('Avatar', () => {
  it('R1: host .avatar con u-tint', () => {
    const el = render({ name: 'Ana' });
    expect(el.classList).toContain('avatar');
    expect(el.classList).toContain('u-tint');
  });

  it('R2: role img y aria-label con name', () => {
    const el = render({ name: 'Adrian Murillo' });
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Adrian Murillo');
  });

  it('R3: data-tint calculado del nombre', () => {
    expect(render({ name: 'Adrian Murillo' }).getAttribute('data-tint')).toBe('rose');
    expect(render({ name: 'Ana' }).getAttribute('data-tint')).toBe('lime');
  });

  it('R4: muestra iniciales sin src', () => {
    const el = render({ name: 'Adrian Murillo' });
    expect(el.textContent?.trim()).toBe('AM');
    expect(el.querySelector('img')).toBeNull();
  });

  it('R5: name vacío muestra ?', () => {
    expect(render({ name: '' }).textContent?.trim()).toBe('?');
    expect(render({ name: '   ' }).textContent?.trim()).toBe('?');
  });

  it('R6: con src renderiza img decorativa en lugar de iniciales', () => {
    const el = render({ name: 'Ana', src: '/ana.jpg' });
    const img = el.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/ana.jpg');
    expect(img?.getAttribute('alt')).toBe('');
    expect(el.textContent?.trim()).toBe('');
  });

  it('R7: si la imagen falla, quita la img y muestra iniciales', () => {
    const fixture = setup({ name: 'Ana López', src: '/rota.jpg' });
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent?.trim()).toBe('AL');
  });

  it('R8: al cambiar src reintenta la imagen nueva', () => {
    const fixture = setup({ name: 'Ana', src: '/rota.jpg' });
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    fixture.componentRef.setInput('src', '/nueva.jpg');
    fixture.detectChanges();
    expect(el.querySelector('img')?.getAttribute('src')).toBe('/nueva.jpg');
  });

  it('R9: data-size solo cuando size no es m', () => {
    expect(render({ name: 'Ana' }).hasAttribute('data-size')).toBe(false);
    expect(render({ name: 'Ana', size: 'm' }).hasAttribute('data-size')).toBe(false);
    for (const size of ['s', 'l', 'xl']) {
      expect(render({ name: 'Ana', size }).getAttribute('data-size')).toBe(size);
    }
  });
});
