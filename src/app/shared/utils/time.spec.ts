import {
  addDays,
  addMonths,
  dayTitle,
  isIsoDay,
  isoWeek,
  monthTitle,
  slotEnd,
  addMinutes,
  weekRangeLabel,
  weekStart,
} from './time';

describe('addDays', () => {
  it('suma dentro del mes', () => expect(addDays('2026-10-22', 1)).toBe('2026-10-23'));
  it('cruza fin de mes', () => expect(addDays('2026-10-31', 1)).toBe('2026-11-01'));
  it('cruza fin de año', () => expect(addDays('2026-12-28', 7)).toBe('2027-01-04'));
  it('resta y cruza al mes anterior', () => expect(addDays('2026-03-01', -1)).toBe('2026-02-28'));
});

describe('addMonths', () => {
  it('recorta al último día de febrero', () =>
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28'));
  it('recorta al 29 en bisiesto', () => expect(addMonths('2028-01-31', 1)).toBe('2028-02-29'));
  it('resta y recorta', () => expect(addMonths('2026-03-31', -1)).toBe('2026-02-28'));
  it('cruza fin de año', () => expect(addMonths('2026-12-15', 1)).toBe('2027-01-15'));
  it('resta y cruza al año anterior', () => expect(addMonths('2026-01-10', -1)).toBe('2025-12-10'));
});

describe('weekStart', () => {
  it('lunes es su propio inicio', () => expect(weekStart('2026-10-26')).toBe('2026-10-26'));
  it('domingo vuelve al lunes anterior', () => expect(weekStart('2026-11-01')).toBe('2026-10-26'));
  it('cruza fin de año', () => expect(weekStart('2027-01-01')).toBe('2026-12-28'));
});

describe('isIsoDay', () => {
  it('R8: acepta una fecha real', () => expect(isIsoDay('2026-10-22')).toBe(true));
  it('R8: rechaza vacío, null y undefined', () => {
    expect(isIsoDay('')).toBe(false);
    expect(isIsoDay(null)).toBe(false);
    expect(isIsoDay(undefined)).toBe(false);
  });
  it('R8: rechaza mes y día inexistentes', () => {
    expect(isIsoDay('2026-13-01')).toBe(false);
    expect(isIsoDay('2026-02-30')).toBe(false);
  });
  it('R8: rechaza otro formato', () => expect(isIsoDay('22-10-2026')).toBe(false));
});

describe('isoWeek', () => {
  it('R6: semana 43 de 2026', () => expect(isoWeek('2026-10-22')).toBe(43));
  it('R6: 1 de enero de 2026 es semana 1', () => expect(isoWeek('2026-01-01')).toBe(1));
  it('R6: 1 de enero de 2027 es semana 53 de 2026', () => expect(isoWeek('2027-01-01')).toBe(53));
});

describe('weekRangeLabel', () => {
  it('R7: mismo mes', () => expect(weekRangeLabel('2026-10-19')).toBe('19 – 25 de octubre, 2026'));
  it('R7: cruza mes', () =>
    expect(weekRangeLabel('2026-10-26')).toBe('26 de octubre – 1 de noviembre, 2026'));
  it('R7: cruza año', () =>
    expect(weekRangeLabel('2026-12-28')).toBe('28 de diciembre, 2026 – 3 de enero, 2027'));
});

describe('slotEnd', () => {
  it('R8: hora siguiente', () => expect(slotEnd('10:00')).toBe('11:00'));
  it('R8: último hueco acaba a las 23:59', () => expect(slotEnd('23:00')).toBe('23:59'));
});

describe('dayTitle', () => {
  it('día de la semana con mayúscula y sin coma', () =>
    expect(dayTitle('2026-10-22')).toBe('Jueves 22 de octubre'));
});

describe('monthTitle', () => {
  it('mes con mayúscula y año', () => expect(monthTitle('2026-10-22')).toBe('Octubre 2026'));
});

describe('addMinutes', () => {
  it('SPEC 73 R6: suma minutos cruzando la hora', () =>
    expect(addMinutes('09:45', 30)).toBe('10:15'));
  it('SPEC 73 R6: no pasa de 23:59', () => expect(addMinutes('23:30', 60)).toBe('23:59'));
});
