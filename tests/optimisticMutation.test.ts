import { describe, expect, it } from 'vitest';
import { optimisticMutation } from '@/lib/optimisticMutation';

describe('optimisticMutation', () => {
  it('preserves all concurrent appends after conflicts', async () => {
    let state: string[] = [];
    let version = 0;

    const append = (value: string) => optimisticMutation({
      maxAttempts: 100,
      read: async () => ({ value: [...state], version }),
      compareAndSet: async (expectedVersion, updated) => {
        await Promise.resolve();
        if (version !== expectedVersion) return false;
        state = updated;
        version += 1;
        return true;
      },
      update: (current) => [...current, value],
    });

    await Promise.all(Array.from({ length: 50 }, (_, index) => append(`record-${index}`)));

    expect(state).toHaveLength(50);
    expect(new Set(state).size).toBe(50);
  });
});
