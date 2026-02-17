# Active Context: Museum of Bad Decisions

## Current State

**Project Status**: ✅ COMPLETE - Ultra-Hostility V3 + Maximum Hostility Everywhere mode implemented (phase-free fixed max values across all routes), while preserving one completion path.

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
- [x] Resonance Layer ("Intrusive Thought" visual pass) implemented:
  - Added `ResonanceFractureLayer.tsx` - cracks, seam tears, panel drift in peripheral zones
  - Added `ResonancePulseLayer.tsx` - red resonance bands, ghost duplication, chromatic bursts
  - Added `UIFragmentDebris.tsx` - fake detached UI fragments floating in whitespace
  - Added `SignalNoiseVeil.tsx` - scanlines, noise texture, low-alpha flicker
  - Extended `globals.css` with resonance tokens, classes, keyframes, and intensity modifiers
  - Wired resonance layers into all pages (tour, home, exhibits, help, settings, certificate)
  - Layers are decorative-only (pointer-events: none) and respect z-index hierarchy
- [x] Resonance Fix (merge pass) implemented on top of snap 4 redesign:
  - Added `src/lib/resonancePulseBus.ts` (`emitPulse`) and `pulseKey` retrigger wiring on all pages
  - Updated resonance components to support `pulseKey`, `safeZones`, and `coverage` (`peripheral|mixed|full`) with backward-compatible `eventPulse`
  - Introduced layer contract classes (`res-interaction-root`, `res-layer-stack`, `res-shell`, `res-control-safe`) for "above shells, below controls"
  - Raised visibility/intensity and widened fracture/debris distribution into mixed interior coverage while preserving control-safe zones
- [x] Resonance Shell Corruption pass implemented:
  - Added `src/components/ResonanceShellCorruptor.tsx` to animate real `.res-shell` panels through break -> heal cycles on every `pulseKey`
  - Added shell rupture/repair CSS states in `src/app/globals.css` (`res-shell-breaking`, `res-shell-crack-snap`, `res-shell-fault-warp`, `res-shell-healing`, `res-shell-ambient`)
  - Added control-safe halo flashes via `.res-control-halo-active .res-control-safe::after` to keep effects near controls without blocking input
  - Wired shell corruption into Tour/Home/Exhibits/Help/Settings/Certificate with per-page intensity profiles
- [x] Resonance light-profile tuning pass:
  - Increased `light` shell profile cadence/duration/targets in `src/components/ResonanceShellCorruptor.tsx`
  - Added profile-scaled intensity amplification for `light`/`medium`
  - Increased Settings resonance baseline and reduced safe-zone footprint in `src/app/settings/page.tsx`
  - Expanded Settings shell corruption coverage by marking the settings grid section as `res-shell`
- [x] Maximum Hostility Everywhere pass (phase-free, no scaling):
  - Added `src/data/maximumHostility.ts` fixed constants and `src/lib/useMaximumHeartbeatPulse.ts`
  - Added `HOSTILITY_MODE = 'maximum'` and normalized primitive phase maps to identical max values
  - Tour now uses `scheduleTourEventMaximum(...)` and fixed max chances/lockouts/penalty additive
  - Removed phase-based runtime scaling from tour visuals/interactions and UI copy
  - Home/Exhibits/Help/Settings/Certificate all wired to maximum mode overlays/cursor/shell layers
  - Living overlay gained center-cross rift bands + fracture notices; shell break/halo contrast strengthened in CSS
- [x] Dark Weird Palette pass:
  - Replaced bright global palette variables with darker, muddy neon tones in `src/app/globals.css`
  - Added global void tint/fog layers (`body::before/::after`) and muted rainbow cycles
  - Added override map for common hardcoded Tailwind arbitrary bright classes (bg/border/text)
  - Darkened hardcoded navigation colors in `src/components/Navigation.tsx` (top/side/footer/floating)
- [x] Readability rollback (~15%):
  - Reduced opacity/intensity of global fog and scanline blockers
  - Moved `.res-interaction-root` tint overlays behind shell/content layer (`z-index: 9`)
  - Slightly increased base text luminance while preserving dark/weird tone
- [x] Popup diversity expansion:
  - `PopupManager` now supports popup stacking (up to 3 concurrent) instead of single-popup lock
  - Added multiple popup skins (`classic`, `terminal`, `hazard`, `sticky`) with distinct visuals
  - Added multiple popup interactions (`countdown`, `confirm-twice`, `teleport-button`) in addition to existing annoying/impossible behavior
  - Added stacked toast handling and increased spawn chaining/trigger density
- [x] Favicon source update:
  - Updated `src/app/layout.tsx` metadata icons to use `https://upload.wikimedia.org/wikipedia/commons/c/c4/Icon_Error.png` for icon/shortcut/apple
- [x] Global annoyance additions:
  - Added `src/components/AnnoyingSoundscape.tsx` for random auto-playing WebAudio error beeps/buzz/glitch chirps
  - Added `src/components/MysteryMeatNav.tsx` for icon-only ambiguous navigation with reroute/deny behavior
  - Wired both globally in `src/app/layout.tsx` and added styles in `src/app/globals.css`
  - Tuned soundscape cadence for higher annoyance: shorter random intervals + burst clusters and slight gain jitter
  - Expanded sound variety with additional alarm/modem/static/click patterns and increased loudness range with compressor safety

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
| `src/app/globals.css` | Chaos styles + resonance tokens/classes/keyframes | ✅ Complete |

## Key Features Implemented

### Visual Chaos
- 10+ different fonts (Comic Neue, Bangers, VT323, Press Start 2P, etc.)
- Conflicting color schemes (neon green, hot pink, cyan, brown)
- Mixed alignment everywhere
- Multiple border styles (dotted, double, bevel, inset)
- Animated elements (blinking text, scrolling marquee, pulsing badges)
- Tiled backgrounds, gradients, drop shadows
- **Resonance layer**: cracks, seams, pulse bands, ghost offsets, fragment debris, signal noise

### UX Torture
- Navigation in 4 places with different labels
- Navigation links occasionally redirect to wrong pages
- Fake menu items that go nowhere
- Phase-free fixed-max tour penalties: strikes, lockouts, freeze bursts, regressions, input corruption
- Targeted cursor traps in critical zones with fixed max offset (8px), decoy cursor, and mobile tap delay
- Fake browser chrome with deceptive controls, noise ribbons, and short-lived interruption masks
- Focus sabotage (drift + Enter reroute + temporary decoy tab targets) with struggle cooldown guardrails
- Clipboard traps (copy suffix perturbation + paste mismatch windows) with per-field disable safety valve
- Drag friction dampening/snap-back on slider controls with retry-based relaxation
- Pity-pass and recovery token mechanics keep completion possible despite hostility
- Living overlays create continuous motion/noise and occasional temporary occlusion
- Home and Exhibits now have incident rails, countdown disruption, and unstable movement waves
- Aggressive popups with exit-intent/scroll triggers and follow-up chains

### Core Feature (Functional)
- 18-question Tour Wizard (phase-free max hostility + required minigames)
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
| 2026-02-16 | Added Resonance Layer ("Intrusive Thought" visual pass): fracture, pulse, debris, and noise veil components for UI-breaking-apart aesthetic |
| 2026-02-17 | Resonance Fix merge pass: timestamp pulse bus retriggers, z-layer contract (above shells/below controls), stronger mixed-coverage fractures/debris, and per-page `pulseKey` wiring |
| 2026-02-17 | Resonance Shell Corruption pass: actual shell break-and-repair animations with organic ambient twitches and control-safe halo pulses |
| 2026-02-17 | Resonance light-profile tuning: stronger light shell effects and broader settings-page shell coverage |
| 2026-02-17 | Maximum Hostility Everywhere pass: phase-free fixed max values, tour event scheduler swap (`scheduleTourEventMaximum`), route-wide heartbeat + max resonance/overlay/cursor wiring |
| 2026-02-17 | Dark weird visual retune: global palette inversion from bright pastel to muddy-dark tones plus nav hardcoded color replacement and full-page void tint overlays |
| 2026-02-17 | Minor readability rollback: reduced global blocker strength and moved route tint overlays below content to recover legibility without reverting theme |
| 2026-02-17 | Popup pass: introduced concurrent popup stack, skin variants, and new interaction mechanics for more varied hostile interruptions |
| 2026-02-17 | Favicon switched to Wikimedia error icon URL via metadata |
| 2026-02-17 | Added global random annoying soundscape and fixed-position mystery-meat glyph navigation |
| 2026-02-17 | Increased soundscape trigger frequency and added random burst clusters |
| 2026-02-17 | Expanded sound palette to 8 SFX patterns and raised output level with compression |
