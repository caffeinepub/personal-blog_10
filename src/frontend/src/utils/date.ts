/**
 * Format a bigint nanosecond timestamp to a human-readable date string.
 */
export function formatPostDate(ts: bigint): string {
  // ICP timestamps are in nanoseconds
  const ms = Number(ts / BigInt(1_000_000));
  const date = new Date(ms);

  // If the timestamp seems invalid or 0, return empty
  if (Number.isNaN(date.getTime()) || ms === 0) return "";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
