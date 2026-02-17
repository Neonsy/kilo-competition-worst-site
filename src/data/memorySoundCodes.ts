export const MEMORY_SOUND_CODES = ['nails', 'alarm', 'chew', 'baby', 'dialup'] as const;

export type MemorySoundCode = (typeof MEMORY_SOUND_CODES)[number];

export function normalizeMemorySoundCode(value: unknown): MemorySoundCode | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (MEMORY_SOUND_CODES.includes(normalized as MemorySoundCode)) {
    return normalized as MemorySoundCode;
  }
  return null;
}
