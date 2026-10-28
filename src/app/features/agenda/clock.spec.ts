import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Clock } from './clock';

describe('Clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 22, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('R1: en el navegador emite la hora al crear y cada 60 s', () => {
    const clock = TestBed.inject(Clock);
    expect(clock.now()).toEqual(new Date(2026, 9, 22, 10, 0));
    vi.advanceTimersByTime(60_000);
    expect(clock.now()).toEqual(new Date(2026, 9, 22, 10, 1));
  });

  it('R1: en el servidor no crea temporizadores', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const clock = TestBed.inject(Clock);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(60_000);
    expect(clock.now()).toEqual(new Date(2026, 9, 22, 10, 0));
  });

  it('R2: al destruir el injector limpia el temporizador', () => {
    TestBed.inject(Clock);
    expect(vi.getTimerCount()).toBe(1);
    TestBed.resetTestingModule();
    expect(vi.getTimerCount()).toBe(0);
  });
});
