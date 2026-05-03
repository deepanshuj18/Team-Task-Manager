export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isValidDate(date?: string | null) {
  if (!date) {
    return true;
  }

  return !Number.isNaN(new Date(date).getTime());
}