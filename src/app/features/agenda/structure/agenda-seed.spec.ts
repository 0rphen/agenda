import { TASK_TAGS } from '@shared/utils';
import { seedTasks } from './agenda-seed';

describe('seedTasks', () => {
  it('SPEC 69 R4: t1, t4 y t6 traen tags de TASK_TAGS; el resto sin tags', () => {
    const tags = Object.fromEntries(seedTasks('2026-10-22').map((t) => [t.id, t.tags]));
    expect(tags).toEqual({
      t1: ['Revisión'],
      t2: undefined,
      t3: undefined,
      t4: ['Cliente', 'Urgente'],
      t5: undefined,
      t6: ['Personal'],
    });
    for (const tag of Object.values(tags).flat().filter(Boolean)) {
      expect(TASK_TAGS).toContain(tag);
    }
  });
});
