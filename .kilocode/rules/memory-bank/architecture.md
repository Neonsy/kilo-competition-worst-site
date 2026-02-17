# System Patterns: Next.js Starter Template

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Home page
│   ├── globals.css         # Tailwind imports + global styles
├── public/
│   ├── favicon.ico         # Multi-size site icon (16/32/48)
│   ├── favicon.png         # Explicit 32x32 PNG fallback icon
│   ├── apple-touch-icon.png# Explicit 180x180 Apple touch icon
│   ├── audio/
│       ├── intro/          # Intro gate sync track
│       └── playlist/       # Route-global music queue mp3 assets
│   └── media/
│       └── hostility/
│           └── gifs/       # LivingOverlay hostile GIF assets (1.gif..5.gif)
└── (expand as needed)
    ├── components/         # React components (add when needed)
    ├── lib/                # Utilities and helpers (add when needed)
    └── db/                 # Database files (add via recipe)
```

## Project-Specific Architecture (Museum of Bad Decisions)

```
src/
├── app/
│   ├── page.tsx                    # Home with incident rail + living overlay
│   ├── exhibits/page.tsx           # Exhibits with unstable shift + maintenance waves
│   ├── tour/page.tsx               # 18-step hostility runtime + required minigame gates + loading labyrinth
│   ├── certificate/page.tsx        # Certificate + survival diagnostics
│   ├── help/page.tsx               # Help/FAQ chaos page
│   └── settings/page.tsx           # Meaningless settings page
├── components/
│   ├── LivingOverlay.tsx           # Shared overlay engine for ribbons/ghosts/rifts + randomized GIF madness
│   ├── CursorCorruptionLayer.tsx   # Global cursor corruption with personas/desync/ghost cursors
│   ├── LoadingLabyrinthButton.tsx  # Staged loop/regress/false-complete loading gate
│   ├── BureaucracyQueue.tsx        # Required minigame A
│   ├── MazeOfConsent.tsx           # Required minigame B
│   ├── CaptchaGauntlet.tsx         # Required minigame C
│   ├── TargetedCursorLayer.tsx     # Zone-targeted cursor traps + mobile tap delay
│   ├── FakeBrowserChrome.tsx       # Deceptive browser strip and fake control interruptions
│   ├── FocusSaboteur.tsx           # Enter/focus nuisance layer with guardrails
│   ├── ClipboardSaboteur.tsx       # Copy/paste perturbation with field safety valve
│   ├── DragFrictionField.tsx       # Drag dampening and single snap-back behavior
│   ├── ResonanceFractureLayer.tsx  # Cracks, seam tears, panel drift (decorative)
│   ├── ResonancePulseLayer.tsx     # Red resonance bands, ghost bursts, chromatic flashes (decorative)
│   ├── UIFragmentDebris.tsx        # Fake detached UI fragments floating in whitespace (decorative)
│   ├── SignalNoiseVeil.tsx         # Scanlines, noise texture, low-alpha flicker (decorative)
│   ├── ResonanceShellCorruptor.tsx # Trigger-mode shell break/heal corruption (`pulse|ambient|both`) on `.res-shell`
│   ├── GlobalGlitchGate.tsx        # Full-load unskippable glitch gate mounted in root layout
│   ├── VisitMusicQueue.tsx         # Shuffled mp3 queue that starts immediately after glitch gate release
│   ├── Navigation.tsx              # Multi-nav mismatch + misroutes
│   ├── Popups.tsx                  # Aggressive popup triggers/chains
│   ├── ProgressBar.tsx             # Lying progress + penalty telemetry
│   ├── HellButton.tsx              # Hostile buttons and fake processing
│   └── HostileForm.tsx             # Hostile form controls
├── data/
    ├── questions.ts                # 18 questions + minigame/skin/mutation metadata
    ├── tourEvents.ts               # Phase-scoped deterministic hostility events
    ├── hostilityPrimitives.ts      # Primitive config probabilities/cooldowns/guardrails
    ├── skinPacks.ts                # Module skin roulette packs + mutation rules
    ├── minigames.ts                # Minigame specs/rules/win conditions
    └── ...                         # badges/exhibits/disclaimers/validations
└── lib/
    └── resonancePulseBus.ts        # Timestamp pulse state helper (`emitPulse`) for retriggerable resonance bursts
```

## Runtime Hostility Pattern

- `tour/page.tsx` uses reducer-driven `TourRunState` for stateful penalties:
  - `strikes`, `instability`, `suspicion`
  - `lockouts`, `freeze bursts`, `input corruption`
  - `interactionState` slice:
    - `cursorMode`, `cursorHotspotOffset`, `cursorDecoyVisibleUntil`
    - `focusLockUntil`, `selectionCorruptUntil`
    - `dragResistance`, `chromeNoiseLevel`
    - `cursorPersona`, desync/jitter/ghost windows
    - loading metrics (`loadingDebt`, `loadingLoops`, `loadingRegressions`, `loadingFalseCompletes`, `loadingBypassTokens`)
    - skin roulette state (`themeSeed`, `activeSkinMap`, `mutationCooldownUntil`)
    - minigame telemetry (`minigameStats`, interruption count)
  - `recovery tokens`, `pity-pass threshold`, `hard regression cap`
- Event scheduling in maximum mode uses `scheduleTourEventMaximum(...)` from `tourEvents.ts` (trigger/cooldown-based, ignores phase).
- Hostility constants are centralized in `src/data/maximumHostility.ts` and reused across routes/components.
- `MAXIMUM_HOSTILITY.overlay.gifMadness` now defines aggressive-lite GIF runtime behavior:
  - weighted asset pool (`/media/hostility/gifs/1.gif`..`5.gif`)
  - spawn cadence + burst behavior
  - desktop/mobile concurrent caps (4/3)
  - opacity/size/rotation/TTL ranges + anchor selector list
- `LivingOverlay.tsx` now runs a max-mode GIF scheduler:
  - random target anchoring via visible DOM selector candidates
  - fallback random dead-space placement when no anchors match
  - strict non-blocking rendering (`pointer-events: none`)
  - disabled under `prefers-reduced-motion: reduce`
- Primitive runtime behavior uses `hostilityPrimitives.ts` defaults and reducer/event hooks.
- Hostility mode contract:
  - `HOSTILITY_MODE = 'maximum'` in `hostilityPrimitives.ts`
  - existing phase-shaped interfaces retained for compatibility, but phase maps are normalized to identical max values.
- Resonance visuals use a timestamp pulse bus (`resonancePulseBus.ts`) and `pulseKey` props so bursts retrigger on every hostile incident rather than one-shot boolean gates.
- Continuous heartbeat pulses (`useMaximumHeartbeatPulse`) run on all major routes and emit pulses even while idle.
- Layering contract keeps visuals readable and interactive:
  - `.res-layer-stack` renders resonance overlays above shells (`.res-shell`)
  - `.res-control-safe` keeps primary controls above resonance overlays
- Shell corruption architecture:
  - `ResonanceShellCorruptor.tsx` supports `triggerMode` (`pulse`, `ambient`, `both`) and `ambientBreakChance`
  - Ambient mode now performs real break->heal cycles on random shell subsets, not only subtle ambient twitch
  - Route-level wiring currently uses ambient-only mode to create continuous autonomous shell failure/recovery loops
  - Root-level `.res-control-halo-active` pulses edge halos around `.res-control-safe` controls without intercepting pointer events
- Global entry gate architecture:
  - `GlobalGlitchGate.tsx` is mounted once in `src/app/layout.tsx` so it appears on each full document load
  - Gate does not persist via storage; it naturally reruns on refresh/new tab/direct entry
  - While active, it applies `global-glitch-lock` to `html/body` and traps pointer/keyboard/scroll at overlay level
  - Gate now includes a critical inline HUD fallback (`Loading Bad Decisions` + live percent/progress) so loading state remains visible even if stylesheet chunks are stale/degraded
  - `gate-v6` class token and `gate rev: v6` marker are applied at runtime for cache-bust verification in dev QA
  - Gate duration is intro-driven from `MAXIMUM_HOSTILITY.entryGate.introTrackUrl` metadata with fallback duration guardrails
  - Final 5s (`fadeOutLeadMs`) synchronizes intro volume fade and gate opacity fade; fake stalls/regressions are visual-only and do not extend total runtime
  - Top-left emergency strip was removed; centered inline core card is always rendered and watchdog-verified, with portal fallback card (`data-gate-fallback-card`) if runtime visibility checks fail
  - Gate exposes `window.__mobdGateDebug` (`active`, `phase`, `closing`, `fadeProgress`, `hmrRearmCount`, `lastMountedAt`, `lastReleasedAt`, `introDurationMs`, `remainingMs`, `fadeLeadMs`, `introState`, `mainPanelVisible`, `fallbackMode`) and uses mount-only dev HMR rearm to prevent render-loop resets
  - Gate emits intro lifecycle events (`mobd:intro-audio-started`, `mobd:intro-audio-audible`, `mobd:intro-audio-blocked`) for downstream audio bootstrap coordination
  - Gate emits `mobd:glitch-gate-released` only after full fade + teardown (inactive), not at fade-start
- Global music queue architecture:
  - `VisitMusicQueue.tsx` is mounted in `src/app/layout.tsx` and starts playback only after full gate release/unmount (event + polling fallback)
  - Track URLs are static (`/audio/playlist/1.mp3`..`/audio/playlist/5.mp3`) and are shuffled once per visit via Fisher-Yates
  - Queue/runtime state is kept in-memory on `window` so internal client navigation does not reshuffle or restart playback
  - Autoplay strategy is unmuted-first with muted pre-roll fallback; queue begins immediately at gate release in muted mode when policy blocks unmuted start, then auto-promotes to audible with retry
  - Unlock listeners (`pointerdown`, `pointermove`, `keydown`, `touchstart`) are attached from initial mount and can prime media before gate release without reshuffling queue order
  - Runtime diagnostics are mirrored to `window.__mobdVisitMusic` including autoplay path and mute lifecycle (`autoplayPath`, `isMutedNow`, `lastUnmuteAttemptAt`, `unlockGestureSeen`)
  - Music component emits `mobd:visit-music-started`/`mobd:visit-music-audible`; `AnnoyingSoundscape.tsx` listens for startup alignment and resume probing, and now also attempts best-effort no-click bootstrap from intro-audio lifecycle events
  - `AnnoyingSoundscape.tsx` now writes `window.__mobdSoundscapeDebug` (`ctxState`, `started`, `startPath`, `lastResumeAttemptAt`, `resumeAttempts`) for autoplay troubleshooting
- Maximum hostility constants now include:
  - `entryGate` timing/regression/stall release config
  - `shellAmbientCycle` ambient interval/chance/target control config
- Required minigame gates are embedded directly in tour question steps:
  - Step 6: Bureaucracy Queue
  - Step 11: Maze of Consent
  - Step 16: Captcha Gauntlet
- Escalation phase fields remain in data/types for compatibility only; runtime currently operates in a phase-free maximum mode.

## Key Design Patterns

### 1. App Router Pattern

Uses Next.js App Router with file-based routing:
```
src/app/
├── page.tsx           # Route: /
├── about/page.tsx     # Route: /about
├── blog/
│   ├── page.tsx       # Route: /blog
│   └── [slug]/page.tsx # Route: /blog/:slug
└── api/
    └── route.ts       # API Route: /api
```

### 2. Component Organization Pattern (When Expanding)

```
src/components/
├── ui/                # Reusable UI components (Button, Card, etc.)
├── layout/            # Layout components (Header, Footer)
├── sections/          # Page sections (Hero, Features, etc.)
└── forms/             # Form components
```

### 3. Server Components by Default

All components are Server Components unless marked with `"use client"`:
```tsx
// Server Component (default) - can fetch data, access DB
export default function Page() {
  return <div>Server rendered</div>;
}

// Client Component - for interactivity
"use client";
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 4. Layout Pattern

Layouts wrap pages and can be nested:
```tsx
// src/app/layout.tsx - Root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// src/app/dashboard/layout.tsx - Nested layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

## Styling Conventions

### Tailwind CSS Usage
- Utility classes directly on elements
- Component composition for repeated patterns
- Responsive: `sm:`, `md:`, `lg:`, `xl:`

### Common Patterns
```tsx
// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flexbox centering
<div className="flex items-center justify-center">
```

## File Naming Conventions

- Components: PascalCase (`Button.tsx`, `Header.tsx`)
- Utilities: camelCase (`utils.ts`, `helpers.ts`)
- Pages/Routes: lowercase (`page.tsx`, `layout.tsx`)
- Directories: kebab-case (`api-routes/`) or lowercase (`components/`)

## State Management

For simple needs:
- `useState` for local component state
- `useContext` for shared state
- Server Components for data fetching

For complex needs (add when necessary):
- Zustand for client state
- React Query for server state
