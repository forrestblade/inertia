// Resolve a spacing value: plain digits map to --val-space-N tokens,
// anything else passes through as raw CSS.
export function resolveSpace (value: string | null): string {
  if (value === null || value === '') return ''
  if (/^\d+$/.test(value)) return `var(--val-space-${value})`
  return value
}
