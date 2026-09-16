/**
 * Anchor-Date module for relative timestamp computation.
 *
 * All seed data timestamps are stored as relative offsets to the anchor date.
 * This ensures the demo always appears current regardless of when it's started.
 */

/**
 * Represents a time offset relative to an anchor date.
 * Negative values represent the past, positive values the future.
 */
export interface SeedOffset {
  days: number;
  hours?: number;
  minutes?: number;
}

/**
 * Computes an ISO 8601 timestamp from an anchor date and a relative offset.
 *
 * @param anchorDate - The reference date (typically the current date at demo start)
 * @param offset - The relative offset to apply
 * @returns An ISO 8601 formatted timestamp string
 */
export function computeTimestamp(anchorDate: Date, offset: SeedOffset): string {
  const offsetMs =
    offset.days * 24 * 60 * 60 * 1000 +
    (offset.hours ?? 0) * 60 * 60 * 1000 +
    (offset.minutes ?? 0) * 60 * 1000;
  return new Date(anchorDate.getTime() + offsetMs).toISOString();
}

/**
 * Computes the relative offset between an anchor date and a timestamp.
 * This is the inverse of computeTimestamp.
 *
 * @param anchorDate - The reference date
 * @param timestamp - An ISO 8601 formatted timestamp string
 * @returns The relative offset from the anchor date to the timestamp
 */
export function computeOffset(anchorDate: Date, timestamp: string): SeedOffset {
  const target = new Date(timestamp);
  const diffMs = target.getTime() - anchorDate.getTime();

  const totalMinutes = Math.round(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const remainingMinutes = totalMinutes - days * 60 * 24;
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes - hours * 60;

  const result: SeedOffset = { days };
  if (hours !== 0) result.hours = hours;
  if (minutes !== 0) result.minutes = minutes;
  return result;
}
