export interface VersionedValue<T> {
  value: T;
  version: number;
}

export async function optimisticMutation<T>(options: {
  read: () => Promise<VersionedValue<T>>;
  compareAndSet: (expectedVersion: number, updated: T) => Promise<boolean>;
  update: (current: T) => T;
  maxAttempts?: number;
}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 12;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const current = await options.read();
    const updated = options.update(current.value);
    if (await options.compareAndSet(current.version, updated)) return updated;
  }

  throw new Error('Concurrent updates did not settle');
}
