import { addDays } from './time';

describe('addDays', () => {
  it('suma dentro del mes', () => expect(addDays('2026-10-22', 1)).toBe('2026-10-23'));
  it('cruza fin de mes', () => expect(addDays('2026-10-31', 1)).toBe('2026-11-01'));
  it('cruza fin de año', () => expect(addDays('2026-12-28', 7)).toBe('2027-01-04'));
  it('resta y cruza al mes anterior', () => expect(addDays('2026-03-01', -1)).toBe('2026-02-28'));
});
