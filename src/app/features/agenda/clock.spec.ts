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

  it('R1 (SPEC 84): a mitad de minuto se alinea al segundo 0 y luego cada 60 s', () => {
    vi.setSystemTime(new Date(2026, 9, 22, 10, 0, 30));
    const clock = TestBed.inject(Clock);
    vi.advanceTimersByTime(29_999);
    expect(clock.now()).toEqual(new Date(2026, 9, 22, 10, 0, 30));
    vi.advanceTimersByTime(1);
    expect(clock.now()).toEqual(new Date(2026, 9, 22, 10, 1, 0));
    vi.advanceTimersByTime(60_000);
    expect(clock.now()).toEqual(new Date(2026, 9, 22, 10, 2, 0));
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

  it('R1 (SPEC 84): al destruir tras alinearse limpia el intervalo', () => {
    TestBed.inject(Clock);
    vi.advanceTimersByTime(60_000);
    expect(vi.getTimerCount()).toBe(1);
    TestBed.resetTestingModule();
    expect(vi.getTimerCount()).toBe(0);
  });
});
