# Technical Context: Next.js Starter Template

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| React Compiler | 1.0.x | Automatic React memoization compiler |
| TypeScript   | 5.9.x   | Type-safe JavaScript            |
| Tailwind CSS | 4.x     | Utility-first CSS               |
| Bun          | Latest  | Package manager & runtime       |

## Development Environment

### Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Node.js 20+ (for compatibility)

### Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun build          # Production build
bun start          # Start production server
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
npm run lint       # ESLint (current workflow)
npm run typecheck  # TypeScript no-emit check
npm run build      # Next production build
```

## Project Configuration

### Next.js Config (`next.config.ts`)

- App Router enabled
- React Compiler enabled via `reactCompiler: true`
- Default settings for flexibility

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path alias: `@/*` → `src/*`
- Target: ESNext

### Tailwind CSS 4 (`postcss.config.mjs`)

- Uses `@tailwindcss/postcss` plugin
- CSS-first configuration (v4 style)

### ESLint (`eslint.config.mjs`)

- Uses `eslint-config-next`
- Flat config format

## Key Dependencies

### Production Dependencies

```json
{
  "next": "^16.1.3", // Framework
  "react": "^19.2.3", // UI library
  "react-dom": "^19.2.3" // React DOM
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.9.3",
  "@types/node": "^24.10.2",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@tailwindcss/postcss": "^4.1.17",
  "babel-plugin-react-compiler": "^1.0.0",
  "tailwindcss": "^4.1.17",
  "eslint": "^9.39.1",
  "eslint-config-next": "^16.0.0"
}
```

## File Structure

```
/
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── bun.lock                # Bun lockfile
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs      # PostCSS (Tailwind) config
├── eslint.config.mjs       # ESLint configuration
├── public/                 # Static assets
│   └── .gitkeep
└── src/                    # Source code
    └── app/                # Next.js App Router
        ├── layout.tsx      # Root layout
        ├── page.tsx        # Home page
        ├── globals.css     # Global styles
        └── favicon.ico     # Site icon
```

## Technical Constraints

### Starting Point

- Minimal structure - expand as needed
- No database by default (use recipe to add)
- No authentication by default (add when needed)

### Browser Support

- Modern browsers (ES2020+)
- No IE11 support

## Performance Considerations

### Image Optimization

- Use Next.js `Image` component for optimization
- Place images in `public/` directory

### Bundle Size

- Tree-shaking enabled by default
- Tailwind CSS purges unused styles

### Core Web Vitals

- Server Components reduce client JavaScript
- Streaming and Suspense for better UX

## Deployment

### Build Output

- Server-rendered pages by default
- Can be configured for static export

### Environment Variables

- None required for base template
- Add as needed for features
- Use `.env.local` for local development

## Hostility Primitive Runtime (2026-02-16)

- Added `src/data/hostilityPrimitives.ts` with phase probabilities, cooldowns, and guardrail defaults.
- Added client interaction components:
  - `src/components/TargetedCursorLayer.tsx`
  - `src/components/FakeBrowserChrome.tsx`
  - `src/components/FocusSaboteur.tsx`
  - `src/components/ClipboardSaboteur.tsx`
  - `src/components/DragFrictionField.tsx`
- Extended `src/data/tourEvents.ts` with primitive effects:
  - `cursor-trap`, `focus-trap`, `clipboard-trap`, `drag-friction`, `chrome-mislead`

## Ultra-Hostility V3 Runtime (2026-02-16)

- Expanded tour content model in `src/data/questions.ts` to 18 steps with required minigame metadata (`minigameId`, `requiredWinCondition`) and mutation hooks.
- Added V3 data modules:
  - `src/data/skinPacks.ts` (8 skin packs + mutation cooldown rules + module map helpers)
  - `src/data/minigames.ts` (minigame IDs/spec metadata)
- Extended `src/data/tourEvents.ts` effects with:
  - `cursor-global-shift`, `cursor-desync`
  - `loading-loop`, `loading-regress`, `loading-stall`
  - `skin-mutate`, `minigame-interrupt`
- Added V3 runtime components:
  - `src/components/CursorCorruptionLayer.tsx`
  - `src/components/LoadingLabyrinthButton.tsx`
  - `src/components/BureaucracyQueue.tsx`
  - `src/components/MazeOfConsent.tsx`
  - `src/components/CaptchaGauntlet.tsx`
- `src/app/tour/page.tsx` now wires:
  - required minigame gates (steps 6/11/16)
  - loading labyrinth commit button
  - global cursor corruption + targeted cursor traps
  - focus/clipboard/drag sabotage layers
  - per-module skin roulette + mutation pulses
  - extended session payload diagnostics (`cursorMetrics`, `loadingMetrics`, `skinMetrics`, `minigameMetrics`)
- `src/app/page.tsx`, `src/app/exhibits/page.tsx`, `src/app/help/page.tsx`, and `src/app/settings/page.tsx` now run lighter global cursor + skin roulette mutations.
- `src/app/globals.css` includes:
  - cursor corruption visuals
  - loading labyrinth styles
  - minigame shell/grid styles
  - skin-pack and pulse animation classes
- Verification performed:
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅

## Resonance Visual Layer (2026-02-16)

- Added decorative "intrusive thought" visual components for UI-breaking-apart aesthetic:
  - `src/components/ResonanceFractureLayer.tsx` - cracks, seam tears, panel drift in peripheral zones
  - `src/components/ResonancePulseLayer.tsx` - red resonance bands, ghost duplication, chromatic bursts
  - `src/components/UIFragmentDebris.tsx` - fake detached UI fragments floating in whitespace
  - `src/components/SignalNoiseVeil.tsx` - scanlines, noise texture, low-alpha flicker
- Extended `src/app/globals.css` with:
  - Resonance CSS tokens (`--res-danger`, `--res-void`, `--res-paper`, `--res-cyan`, `--res-fracture-alpha`, `--res-noise-alpha`, `--res-pulse-alpha`, `--res-ghost-offset`)
  - Resonance keyframes (`res_pulse`, `res_fault_shift`, `res_scanline_drift`, `res_ghost_snap`, `res_fragment_float`, `res_crack_glow`, `res_seam_tear`, `res_chromatic_burst`, `res_panel_drift`)
  - Resonance classes (`.res-fracture-layer`, `.res-crack`, `.res-seam`, `.res-pulse-layer`, `.res-pulse-band`, `.res-ghost-offset`, `.res-noise-veil`, `.res-scanline`, `.res-fragment-layer`, `.res-fragment`)
  - Intensity modifiers (`.res-low`, `.res-mid`, `.res-high`, `.res-extreme`)
  - Safety utility (`.res-decorative { pointer-events:none; user-select:none; }`)
- Wired resonance layers into all pages:
  - Tour: intensity driven by phase, strikes, instability, suspicion, loading debt
  - Home: lighter intensity driven by incident index and skin pulses
  - Exhibits: intensity driven by incident tape and random switches
  - Help/Settings/Certificate: minimal decorative-only intensity
- All resonance layers are decorative-only (pointer-events: none) and respect z-index hierarchy

## Resonance Fix Merge Pass (2026-02-17)

- Added `src/lib/resonancePulseBus.ts`:
  - `ResonancePulseKind`
  - `ResonancePulseState`
  - `emitPulse(prev, kind, strength)` timestamp-key retrigger helper
- Updated resonance components (`ResonanceFractureLayer`, `ResonancePulseLayer`, `SignalNoiseVeil`, `UIFragmentDebris`) to support:
  - `pulseKey?: number` (preferred trigger)
  - `safeZones?: Array<{x,y,w,h}>`
  - `coverage?: 'peripheral' | 'mixed' | 'full'`
  - Backward-compatible `eventPulse?: boolean`
- Added global resonance layering contract in `src/app/globals.css`:
  - `.res-interaction-root`
  - `.res-layer-stack` (above shells, non-interactive)
  - `.res-shell`
  - `.res-control-safe` (critical controls above resonance)
- Applied `pulseKey` wiring and layer contract across:
  - `src/app/tour/page.tsx`
  - `src/app/page.tsx`
  - `src/app/exhibits/page.tsx`
  - `src/app/help/page.tsx`
  - `src/app/settings/page.tsx`
  - `src/app/certificate/page.tsx`
- Increased resonance readability/coverage:
  - higher base intensity with phase-aware boosts
  - mixed interior+edge fracture/debris placement
  - pulse-band center crossing and stronger pulse-only scanline contrast
- Verification performed after merge pass:
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅

## Resonance Shell Corruption Pass (2026-02-17)

- Added `src/components/ResonanceShellCorruptor.tsx`:
  - Pulse-driven shell corruption state machine (break -> heal)
  - Profile tuning (`light|medium|heavy`) by page scope
  - Ambient micro-corruption cadence for organic instability
- Extended `src/app/globals.css` with shell corruption primitives:
  - keyframes: `res_shell_break`, `res_shell_heal`, `res_shell_overlay_tear`, `res_shell_ambient`, `res_control_halo`
  - classes: `res-shell-breaking`, `res-shell-crack-snap`, `res-shell-fault-warp`, `res-shell-shear`, `res-shell-healing`, `res-shell-ambient`, `res-control-halo-active`
- Wired shell corruption to existing pulse bus on all routed pages:
  - `src/app/tour/page.tsx` (heavy profile)
  - `src/app/page.tsx` + `src/app/exhibits/page.tsx` (medium)
  - `src/app/help/page.tsx` + `src/app/settings/page.tsx` (light)
  - `src/app/certificate/page.tsx` (light, ambient disabled)
- Verification performed:
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅

## Resonance Light-Profile Tuning (2026-02-17)

- Tuned `light` profile in `src/components/ResonanceShellCorruptor.tsx`:
  - Increased break/heal windows and ambient cadence frequency
  - Increased max target count and added profile-scaled intensity amplification
- Tuned Settings route visibility in `src/app/settings/page.tsx`:
  - Raised resonance baseline intensity
  - Reduced safe-zone footprint for stronger visible activity
  - Marked settings grid section as `res-shell` so break/heal applies beyond header
- Re-verified:
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅

## Maximum Hostility Everywhere (2026-02-17)

- Added `src/data/maximumHostility.ts`:
  - fixed decision-complete max constants for visuals, shell corruption, heartbeat, overlays, primitives, and tour event chances
  - `fixedPhaseRecord(...)` helper to preserve phase-shaped interfaces without runtime scaling
- Added `src/lib/useMaximumHeartbeatPulse.ts`:
  - continuous base/spike pulse emission independent of user input
- Updated `src/data/hostilityPrimitives.ts`:
  - `HostilityMode` + `HOSTILITY_MODE = 'maximum'`
  - all phase maps normalized to equal max values
- Updated `src/data/tourEvents.ts`:
  - `scheduleTourEventMaximum(params)` for phase-free scheduling by trigger + cooldown + catastrophic guardrail
- Updated `src/app/tour/page.tsx`:
  - swapped to `scheduleTourEventMaximum(...)`
  - removed phase-scaling formulas from runtime chance/lockout/intensity behavior
  - fixed back-button hostility rule and fixed validation additive term
  - removed phase escalation copy; UI now shows max-mode copy
- Updated route pages (`/`, `/exhibits`, `/help`, `/settings`, `/certificate`):
  - wired `HOSTILITY_MODE` + `MAXIMUM_HOSTILITY` + `useMaximumHeartbeatPulse`
  - fixed max resonance/overlay/shell/cursor layers on all routes
- Updated `src/components/LivingOverlay.tsx` + `src/app/globals.css`:
  - added max-mode rift bands and fracture notices
  - strengthened shell breaking and control halo contrast
- Re-verified:
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
