const UNITS = ["B", "KB", "MB", "GB"];

/** 1536 -> "1.5 KB". Sizes come off the API as raw bytes. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  // Whole bytes read oddly as "512.0 B", so only show a decimal above KB.
  const decimals = unit === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${UNITS[unit]}`;
}
