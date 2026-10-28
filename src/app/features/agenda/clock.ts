import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Current time, ticking every minute in the browser; fixed at request time on the server. */
@Injectable({ providedIn: 'root' })
export class Clock {
  private readonly nowState = signal(new Date());
  readonly now = this.nowState.asReadonly();

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const id = setInterval(() => this.nowState.set(new Date()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
