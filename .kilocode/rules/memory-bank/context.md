# Active Context: Museum of Bad Decisions

## Current State

**Project Status**: ✅ COMPLETE - Ultra-Hostility V3 implemented (18-step tour + required triple minigames + global cursor corruption + loading labyrinth + per-module design roulette), while preserving one completion path.

A deliberately awful website that masquerades as an interactive museum of terrible ideas. The core functionality (Tour Wizard) works perfectly while every aspect of UX/UI is designed to frustrate, confuse, and amuse users.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration with custom chaos styles
- [x] 10+ Google Fonts loaded (Comic Neue, Press Start 2P, VT323, Creepster, etc.)
- [x] Global CSS with animations (blinking, marquee, pulse, shake, rainbow)
- [x] Navigation chaos (4 placements with different labels)
- [x] Popup system with aggressive interruptions
- [x] HellButton component (8+ variants, moving on hover)
- [x] HostileForm component (hostile validation, sliders that jump)
- [x] Home page with overwhelming hero section
- [x] Exhibits page with grid/list/chaos view modes
- [x] Tour Wizard with 8 hostile questions
- [x] Regret Certificate with fake download
- [x] Help page with unhelpful FAQ and broken contact form
- [x] Settings page with meaningless toggles
- [x] Controlled sabotage pass (2026-02-16): navigation misroutes, popup escalation, and tour friction increases
- [x] Progress button flow fixed to avoid permanent lock while preserving fake progress pain
- [x] Hostility Escalation implemented: 12-step tour with phase-based state machine penalties
- [x] Added `src/data/tourEvents.ts` with deterministic event scheduling and cooldowns
- [x] Added `src/components/LivingOverlay.tsx` and integrated overlays into Tour/Home/Exhibits
- [x] ProgressBar now shows phase + strike/instability/suspicion/lockout telemetry
- [x] Certificate page now reads and displays survival diagnostics from `runStats`
- [x] Hostility Expansion implemented: targeted cursor traps + fake browser chrome + focus sabotage + clipboard traps + drag friction
- [x] Added `src/data/hostilityPrimitives.ts` for phase probabilities/cooldowns and primitive guardrails
- [x] Added components: `TargetedCursorLayer`, `FakeBrowserChrome`, `FocusSaboteur`, `ClipboardSaboteur`, `DragFrictionField`
- [x] Wired primitives into `tour`, `home`, and `exhibits` routes with targeted trap zones and mobile tap delays
- [x] Tour state now tracks `interactionState` and stores final primitive metrics in certificate `runStats`
- [x] Ultra-Hostility V3 pass implemented:
  - 18-step tour with 3 required minigame gates (Steps 6, 11, 16)
  - Global cursor corruption layer active across pages
  - Loading labyrinth commit flow replacing direct next-action progression
  - Per-module design roulette skin packs + pulse mutations
  - Expanded event effects (`cursor-global-shift`, `cursor-desync`, `loading-loop`, `loading-regress`, `loading-stall`, `skin-mutate`, `minigame-interrupt`)
  - Certificate diagnostics expanded with cursor/loading/skin/minigame metrics

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page | ✅ Complete |
| `src/app/exhibits/page.tsx` | Exhibits listing | ✅ Complete |
| `src/app/tour/page.tsx` | Tour wizard (18-step + minigame gates + labyrinth) | ✅ Complete |
| `src/app/certificate/page.tsx` | Regret certificate | ✅ Complete |
| `src/app/help/page.tsx` | Help/FAQ | ✅ Complete |
| `src/app/settings/page.tsx` | Fake settings | ✅ Complete |
| `src/components/` | Shared chaos components | ✅ Complete |
| `src/data/` | Exhibits, questions, badges, hostility events/primitives/skins/minigames | ✅ Complete |
| `src/app/globals.css` | Chaos styles | ✅ Complete |

## Key Features Implemented

### Visual Chaos
- 10+ different fonts (Comic Neue, Bangers, VT323, Press Start 2P, etc.)
- Conflicting color schemes (neon green, hot pink, cyan, brown)
- Mixed alignment everywhere
- Multiple border styles (dotted, double, bevel, inset)
- Animated elements (blinking text, scrolling marquee, pulsing badges)
- Tiled backgrounds, gradients, drop shadows

### UX Torture
- Navigation in 4 places with different labels
- Navigation links occasionally redirect to wrong pages
- Fake menu items that go nowhere
- Phase-based tour penalties: strikes, lockouts, freeze bursts, regressions, input corruption
- Targeted cursor traps in critical zones with phase offsets (2px/4px/6px), decoy cursor, and mobile tap delay
- Fake browser chrome with deceptive controls, noise ribbons, and short-lived interruption masks
- Focus sabotage (drift + Enter reroute + temporary decoy tab targets) with struggle cooldown guardrails
- Clipboard traps (copy suffix perturbation + paste mismatch windows) with per-field disable safety valve
- Drag friction dampening/snap-back on slider controls with retry-based relaxation
- Pity-pass and recovery token mechanics keep completion possible despite hostility
- Living overlays create continuous motion/noise and occasional temporary occlusion
- Home and Exhibits now have incident rails, countdown disruption, and unstable movement waves
- Aggressive popups with exit-intent/scroll triggers and follow-up chains

### Core Feature (Functional)
- 18-question Tour Wizard (3 phases, escalating hostility + required minigames)
- Tour remains finishable with explicit guardrails (max hard regressions + pity pass threshold)
- Personalized tour route generation
- Nonsensical Regret Score calculation (0-10,000)
- Certificate with badges and survival diagnostics
- Fake download/share functionality

## Session History

| Date | Changes |
|------|---------|
| 2026-02-16 | Complete Museum of Bad Decisions built from scratch |
| 2026-02-16 | Added hostile UX escalation pass while preserving one valid completion path |
| 2026-02-16 | Implemented 12-step stateful hostility engine + living overlays across Tour/Home/Exhibits |
| 2026-02-16 | Implemented targeted cursor traps and four anti-UX primitives; integrated with phase events and interaction state metrics |
| 2026-02-16 | Implemented Ultra-Hostility V3: 18-step tour, global cursor corruption, loading labyrinth, required triple minigames, and per-module design roulette with pulse mutations |
