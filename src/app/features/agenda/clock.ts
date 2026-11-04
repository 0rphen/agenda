import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Current time, ticking at second 0 of every minute in the browser; fixed at request time on the server. */
@Injectable({ providedIn: 'root' })
export class Clock {
  private readonly nowState = signal(new Date());
  readonly now = this.nowState.asReadonly();

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const tick = () => this.nowState.set(new Date());
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(
      () => {
        tick();
        intervalId = setInterval(tick, 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    });
  }
}
