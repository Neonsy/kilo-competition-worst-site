export type SkinModule =
  | 'nav'
  | 'hero'
  | 'question-card'
  | 'side-panel'
  | 'buttons'
  | 'inputs'
  | 'modals'
  | 'footer';

export interface SkinPack {
  id:
    | 'retro-os'
    | 'corporate-gray'
    | 'festival-neon'
    | 'terminal-crash'
    | 'print-flyer'
    | 'medical-form'
    | 'infomercial'
    | 'broken-admin';
  className: string;
  pulseClassName: string;
}

export interface MutationRule {
  minIntervalMs: number;
  pulseChanceByPhase: Record<1 | 2 | 3, number>;
}

export type ModuleSkinMap = Record<SkinModule, SkinPack['id']>;

export const skinPacks: SkinPack[] = [
  { id: 'retro-os', className: 'skin-retro-os', pulseClassName: 'skin-pulse-retro-os' },
  { id: 'corporate-gray', className: 'skin-corporate-gray', pulseClassName: 'skin-pulse-corporate-gray' },
  { id: 'festival-neon', className: 'skin-festival-neon', pulseClassName: 'skin-pulse-festival-neon' },
  { id: 'terminal-crash', className: 'skin-terminal-crash', pulseClassName: 'skin-pulse-terminal-crash' },
  { id: 'print-flyer', className: 'skin-print-flyer', pulseClassName: 'skin-pulse-print-flyer' },
  { id: 'medical-form', className: 'skin-medical-form', pulseClassName: 'skin-pulse-medical-form' },
  { id: 'infomercial', className: 'skin-infomercial', pulseClassName: 'skin-pulse-infomercial' },
  { id: 'broken-admin', className: 'skin-broken-admin', pulseClassName: 'skin-pulse-broken-admin' },
];

export const mutationRule: MutationRule = {
  minIntervalMs: 2200,
  pulseChanceByPhase: { 1: 0.2, 2: 0.34, 3: 0.49 },
};

const skinModules: SkinModule[] = ['nav', 'hero', 'question-card', 'side-panel', 'buttons', 'inputs', 'modals', 'footer'];

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 9301 + 49297) * 233280;
  return value - Math.floor(value);
}

export function createModuleSkinMap(seed: number): ModuleSkinMap {
  const map = {} as ModuleSkinMap;
  skinModules.forEach((module, index) => {
    const roll = seededRandom(seed + index * 37);
    map[module] = skinPacks[Math.floor(roll * skinPacks.length)]?.id || skinPacks[0].id;
  });
  return map;
}

export function mutateModuleSkinMap(
  current: ModuleSkinMap,
  module: SkinModule,
  seed = Date.now()
): ModuleSkinMap {
  const next = { ...current };
  const currentId = current[module];
  const alternatives = skinPacks.map(pack => pack.id).filter(id => id !== currentId);
  if (alternatives.length === 0) return next;
  const roll = seededRandom(seed + module.length * 97);
  next[module] = alternatives[Math.floor(roll * alternatives.length)] || alternatives[0];
  return next;
}

export function randomModule(seed = Date.now()): SkinModule {
  const roll = Math.abs(Math.sin(seed * 17));
  return skinModules[Math.floor(roll * skinModules.length)] || 'hero';
}

export function getSkinClass(id: SkinPack['id']): string {
  return skinPacks.find(pack => pack.id === id)?.className || 'skin-retro-os';
}

export function getSkinPulseClass(id: SkinPack['id']): string {
  return skinPacks.find(pack => pack.id === id)?.pulseClassName || 'skin-pulse-retro-os';
}

