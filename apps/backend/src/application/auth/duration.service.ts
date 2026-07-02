export function parseDuration(value: string): number {
  const trimmed = value.trim();
  const unit = trimmed.slice(-1);
  const amount = Number(trimmed.slice(0, -1));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid duration format: ${value}`);
  }

  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      return Number(trimmed) * 1000;
  }
}
