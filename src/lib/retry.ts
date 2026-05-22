export type IsTransientFn = (err: unknown) => boolean;

export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  isTransient: IsTransientFn = (err) => {
    try {
      if (typeof DOMException !== 'undefined' && err instanceof DOMException) {
        return err.name === 'AbortError';
      }
    } catch {}
    const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : JSON.stringify(err || '');
    return /Lock broken|AbortError/.test(msg);
  },
) {
  let lastErr: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err)) throw err;
      const backoff = 150 * (i + 1);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

export const isAbortLike: IsTransientFn = (err) => {
  try {
    if (typeof DOMException !== 'undefined' && err instanceof DOMException) {
      return err.name === 'AbortError';
    }
  } catch {}
  const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : JSON.stringify(err || '');
  return /Lock broken|AbortError/.test(msg);
};
