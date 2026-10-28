import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SETTINGS_DEFAULTS } from './domain/settings-options';
import { UserSettingsStore } from './store/user-settings.store';
import { TimeFormatPipe } from './time-format.pipe';

@Component({
  imports: [TimeFormatPipe],
  template: `<span>{{ '13:05' | timeFormat }}</span
    ><i>{{ undefined | timeFormat }}</i>`,
})
class Host {}

describe('TimeFormatPipe', () => {
  it('R9/R12: sigue «Formato de hora» del store sin recargar', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('span')!.textContent).toBe('13:05');
    expect(el.querySelector('i')!.textContent).toBe('');
    const store = TestBed.inject(UserSettingsStore);
    store.set({
      ...SETTINGS_DEFAULTS,
      calendar: { ...SETTINGS_DEFAULTS.calendar, timeFormat: '12 h' },
    });
    await fixture.whenStable();
    expect(el.querySelector('span')!.textContent).toBe('1:05 PM');
  });
});
