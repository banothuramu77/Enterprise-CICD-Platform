export const logger = {
  info: (...args: unknown[]) => console.log('[webhook]', ...args),
  warn: (...args: unknown[]) => console.warn('[webhook]', ...args),
  error: (...args: unknown[]) => console.error('[webhook]', ...args),
};
