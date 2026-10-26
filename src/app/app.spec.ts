import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('R6: l-shell > l-shell__grid > (l-shell__rail, router-outlet) en ese orden', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const shell = host.firstElementChild!;
    expect(shell.matches('div.l-shell')).toBe(true);
    expect(shell.children.length).toBe(1);
    const grid = shell.firstElementChild!;
    expect(grid.matches('div.l-shell__grid')).toBe(true);
    const [rail, outlet] = Array.from(grid.children);
    expect(rail.matches('div.l-shell__rail')).toBe(true);
    expect(rail.children.length).toBe(0);
    expect(outlet.localName).toBe('router-outlet');
  });
});
