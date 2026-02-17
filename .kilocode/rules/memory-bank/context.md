# Active Context: Museum of Bad Decisions

## Current State

**Project Status**: ✅ COMPLETE - Ultra-Hostility V3 + Maximum Hostility Everywhere mode implemented (phase-free fixed max values across all routes), while preserving one completion path.

A deliberately awful website that masquerades as an interactive museum of terrible ideas. The core functionality (Tour Wizard) works perfectly while every aspect of UX/UI is designed to frustrate, confuse, and amuse users.

## Recently Completed

- [x] Grain veil reduction pass (2026-02-17):
  - Reduced `SignalNoiseVeil` grain opacity in normal and pulse states to make fake-browser content less obscured while keeping the hostile signal aesthetic.
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
- [x] Global visit music queue pass (Run Both):
  - Moved `1.mp3`..`5.mp3` from workspace root into `public/audio/playlist/`
  - Added `src/components/VisitMusicQueue.tsx` and mounted it in `src/app/layout.tsx`
  - Queue shuffles once per full document load, starts immediately when the glitch gate releases, loops continuously, and survives internal route navigation
  - Added autoplay-block fallback via first user interaction (`pointerdown`/`keydown`/`touchstart`) while preserving queue order
  - Exposed runtime diagnostics on `window.__mobdVisitMusic` for live verification of queue/index/state/errors
  - Retuned startup timing so both queue music and synthetic soundscape key off the gate visual-release moment (`closing`) instead of delayed random bootstrap
  - Fixed gate-blocked gesture propagation issue by moving unlock/resume listeners to capture phase and prewarming media during gate-time interactions
- [x] Global glitch entry gate + ambient shell break/rebuild pass:
  - Added `src/components/GlobalGlitchGate.tsx` and mounted it in `src/app/layout.tsx`
  - Gate is unskippable and blocks pointer/keyboard/scroll while active
  - Gate intentionally false-completes/regresses/stalls and always releases in finite 8-15s window
  - Added gate styles/animations/lock classes in `src/app/globals.css`
  - Extended `MAXIMUM_HOSTILITY` with `entryGate` and `shellAmbientCycle` config blocks
  - Extended `ResonanceShellCorruptor` with `triggerMode` + `ambientBreakChance`
  - Ambient scheduler now runs real shell break->heal corruption cycles
  - Route usage updated to ambient-only shell corruption across home/tour/exhibits/help/settings/certificate
- [x] Glitch gate visual clarity pass:
  - Increased gate legibility/contrast and made loader intent explicit (`LOADING BAD DECISIONS`, large percent, ETA)
  - Added animated spinner line, three sub-progress meters, and release reassurance copy
  - Reworked gate panel styling to avoid "blank grid" appearance and read clearly as an active loading screen
- [x] Glitch gate fail-safe readability patch:
  - Added giant low-alpha `LOADING` watermark and strengthened contrast of panel typography/borders
  - Enforced gate layer stacking (`isolation` + explicit z-index for scanline/background vs panel)
  - Hardened duration start logic so the gate consistently runs within configured timing window
- [x] Favicon reliability fix:
  - Added static icon assets in `public/` (`favicon.png`, `apple-touch-icon.png`)
  - Updated layout metadata icon links to point to `public` paths instead of app-local icon filename
  - Removed dependency on malformed/volatile favicon route resolution
- [x] Loader clarity + cache-resilient rendering v2:
  - Added a critical inline-styled HUD inside `GlobalGlitchGate` so loading intent remains obvious even when class CSS is stale/degraded
  - Added gate revision stamp (`gate rev: v2`) and version class token (`gate-v2`) for quick visual verification after rebuild/reload
  - Strengthened gate visual hierarchy (noise lowest, failsafe mid, HUD highest) and reduced background camouflage
  - Repositioned gate content stack with stronger near-center offset (left/down) via inline transform after debugging that earlier offset looked visually centered
  - Hardened stack visibility by moving key stack layout/offset onto inline styles so cached class-css cannot collapse panel width
- [x] Favicon pipeline hardening v2:
  - Added valid multi-entry `public/favicon.ico` with `16x16`, `32x32`, and `48x48` icon records
  - Regenerated `public/favicon.png` at `32x32` and `public/apple-touch-icon.png` at `180x180`
  - Updated metadata icon order to prioritize `.ico` first, then explicit PNG variants
  - Removed ambiguous `src/app/icon-error.png` artifact to avoid icon routing confusion
- [x] Gate visibility + autoplay reliability hardening (dev/runtime):
  - Added deterministic gate reset helpers and a dev-only HMR rearm path so loading HUD reliably reappears after Fast Refresh
  - Upgraded gate presentation token to `gate-v3` and moved the primary HUD anchor to inline fixed positioning (near center, intentionally offset)
  - Added `window.__mobdGateDebug` diagnostics (`active`, `closing`, `hmrRearmCount`, `lastMountedAt`, `lastReleasedAt`)
  - Reworked `VisitMusicQueue` autoplay flow to use muted pre-roll fallback when unmuted autoplay is blocked, then auto-promote to audible with retry
  - Extended `window.__mobdVisitMusic` diagnostics with `autoplayPath`, `isMutedNow`, `lastUnmuteAttemptAt`, and `unlockGestureSeen`
  - Added `mobd:visit-music-started` signaling and soundscape resume probes so SFX startup tracks gate/music release timing instead of waiting on random hover/click side-effects
- [x] Intro-synced gate runtime pass:
  - Moved `intro.mp3` from project root to `public/audio/intro/intro.mp3`
  - Extended `MAXIMUM_HOSTILITY.entryGate` with intro-track config (`introTrackUrl`, `fadeOutLeadMs`, `fallbackDurationMs`, `introVolume`)
  - Refactored `GlobalGlitchGate` to drive duration from intro metadata with fallback, and run deterministic 5s synced fade (intro volume + gate opacity)
  - Fixed dev gate loop/reset behavior by converting HMR rearm to mount-only logic (no render-loop dependency churn)
  - Updated gate token to `gate-v4` and revision marker to `gate rev: v4`
  - Shifted release contract timing: `mobd:glitch-gate-released` now fires after full gate teardown, not at fade start
  - Updated queue/SFX gate checks so `VisitMusicQueue` and `AnnoyingSoundscape` begin only after full gate release
  - Expanded `window.__mobdGateDebug` with intro lifecycle fields (`introDurationMs`, `remainingMs`, `fadeLeadMs`, `introState`)
- [x] Loader visibility + SFX bootstrap hardening v5:
  - Removed top-left `LOADING... PLEASE WAIT.` strip entirely so it cannot mask loader regressions
  - Added inline core loader card watchdog in `GlobalGlitchGate`; if visibility check fails, a centered fallback card renders automatically
  - Upgraded gate token/revision to `gate-v5` / `gate rev: v5`
  - Extended `window.__mobdGateDebug` with `mainPanelVisible` and `fallbackMode`
  - Added intro lifecycle events: `mobd:intro-audio-started`, `mobd:intro-audio-audible`, `mobd:intro-audio-blocked`
  - Updated `AnnoyingSoundscape` for best-effort no-click bootstrap from intro lifecycle events while keeping gesture fallback for strict autoplay policies
  - Added `window.__mobdSoundscapeDebug` (`ctxState`, `started`, `startPath`, `lastResumeAttemptAt`, `resumeAttempts`) for runtime verification
- [x] Loader + autoplay hardening v6 (build/start parity):
  - Upgraded gate token/revision to `gate-v6` / `gate rev: v6`
  - Added portal-based centered fallback loader card (`data-gate-fallback-card`) with repeated visibility probing so the large loader remains visible if the main panel fails runtime visibility checks
  - Added gate lifecycle phase diagnostics in `window.__mobdGateDebug` (`phase`, `fadeProgress`) and ensured intro audio metadata load is explicitly kicked with `audio.load()`
  - Corrected soundscape gate-lock check to require both `html/body` locks be released before treating gate as complete
  - Extended best-effort audio bootstrap listeners/probes (`pointermove` + intro pre-prime hooks) in `VisitMusicQueue` and `AnnoyingSoundscape` while preserving queue order/loop semantics
- [x] Gate + audio interaction stabilization pass:
  - Added tab-session gate visibility config in `MAXIMUM_HOSTILITY.entryGate` (`showOncePerTab`, `sessionKey`)
  - Hardened gate lifecycle so timeline is authoritative (starts immediately from fallback duration and metadata only retimes within min/max bounds)
  - Removed intro-track `ended` as a gate teardown trigger; gate now finalizes only on timeline completion with minimum-visible-duration satisfied
  - Added gate diagnostics in `window.__mobdGateDebug`: `startReason`, `finalizeReason`, `timelineStartedAt`, `minVisibleSatisfied`
  - Removed `pointermove` wake/unlock triggers from `AnnoyingSoundscape` and `VisitMusicQueue` to stop cursor-move audio spam
  - Added gesture-trigger cooldown in soundscape wake path to prevent rapid click/keydown one-shot spam
  - Updated visit music startup to prefer muted preroll on non-interaction boot, then promote to audible on real interaction (with in-flight unlock guard)
- [x] Explicit pre-entry orchestration + deterministic gate/audio start:
  - Added `GlobalEntryOrchestrator` full-screen pre-entry overlay (`Click to Enter Museum`) and mounted it in layout ahead of the global gate
  - `GlobalGlitchGate` now arms only after entry confirmation, renders one deterministic center loader card, and removed fragile visibility watchdog/portal fallback branches
  - Entry click now confirms user intent and pre-primes intro audio in the same gesture, then gate timeline/audio lifecycle starts from that path
  - Visit music and soundscape startup paths are entry-confirmed gated; pointermove remains removed and discrete gesture unlock paths stay guarded/cooldown-limited
- [x] Gate blank-screen hard failsafe patch:
  - Added runtime core-card visibility probe in `GlobalGlitchGate`
  - Added fixed-position inline `data-gate-failsafe-card` that appears automatically when the main gate card is not visibly rendered
  - Keeps loading text/progress visible even if gate layout/CSS path degrades in dev runtime
- [x] Entry overflow/scroll lock hardening:
  - `GlobalEntryOrchestrator` now gates app mounting (`children`) until entry is confirmed, instead of rendering full page under the pre-entry overlay
  - Added `global-entry-lock` root/body class while pre-entry is active to guarantee no giant document scroll before click
- [x] Intro-aligned timing/audio ordering pass:
  - Gate timeline now adopts intro metadata duration directly when available so loading progress length matches intro track length
  - Reduced gate fade lead to 2s (`fadeOutLeadMs`)
  - Removed intro-event bootstrap paths from `AnnoyingSoundscape` and `VisitMusicQueue` so SFX/loop queue begin only after gate release
- [x] Entry sequencing + release-contract hardening pass:
  - `GlobalEntryOrchestrator` now keeps full app content unmounted until gate release (`showChildren`) and holds `global-entry-lock` until release to prevent pre-gate overflow/scroll flicker
  - Added class-based animated consent entry UI (grid/noise/card pulse/chips + accessible CTA/focus + reduced-motion support) replacing inline static overlay styles
  - Added explicit gate lifecycle contract (`window.__mobdGateLifecycle`: `idle|arming|active|released`) and synced transitions in `GlobalGlitchGate`
  - Tightened post-transition audio gating: `VisitMusicQueue` and `AnnoyingSoundscape` now use strict released-state checks (lifecycle + lock + gate node) and never start queue/SFX before release
  - Hardened gate card visibility fallback: failsafe starts visible, hides only after confirmed core-card visibility frames, and uses aligned `data-gate-fallback-card` selector
- [x] Entry + gate chaos/timing lock pass:
  - Extended `MAXIMUM_HOSTILITY.entryGate` with `progressHoldAt100Ms` (`600`) and `chaosProfile` (`aggressive-readable`)
  - `GlobalGlitchGate` now computes explicit milestones (`fadeStartAtMs`, `progressCompleteAtMs`) and latches progress at `100%` before fade, preventing post-100 regressions
  - Fade starts only at `fadeStartAtMs`; release contract remains timeline-authoritative and unchanged
  - Added aggressive-readable kinetics for both consent and gate cards: split glitching title lines, marquee/sway text tracks, animated status rail, and non-interactive fake gate controls (`REROUTE`/`RETRY`/`HOLD`) with `prefers-reduced-motion` fallbacks
  - Retuned aggressive profile into volatile spatial+temporal instability (burst shears/desync spikes) and enabled chaotic consent CTA hitbox drift while preserving a medium readability floor
- [x] Aggressive-lite GIF overlay madness pass:
  - Moved root GIF assets (`1.gif`..`5.gif`) into `public/media/hostility/gifs/`
  - Extended `MAXIMUM_HOSTILITY.overlay` with `gifMadness` config (asset weights, spawn cadence, burst behavior, size/opacity/rotation ranges, anchor selectors, desktop/mobile caps)
  - Extended `LivingOverlay` with randomized max-mode GIF overlays anchored to random visible UI targets and fallback dead-space placement
  - Added non-blocking GIF overlay CSS in `globals.css` with blend/noise styling and reduced-motion disable path
- [x] Cursor visibility chaos + skill-chaos expansion pass:
  - Reworked global cursor corruption from always-hidden native cursor to mostly-visible mode with brief hide bursts (`cursor-corruption-hide-brief`) during desync windows
  - Added 3-second blur trailer nodes + smear streaks + burst flash artifacts in `CursorCorruptionLayer` with desktop/mobile caps and reduced-motion suppression
  - Added global heavy ambient chaos to `LivingOverlay` via non-blocking chromatic smear fields and warning pings tied to runtime pulse pressure
  - Extended tour state with `skillChaos` contracts/combo/score/token metrics and added token-based catastrophic event downgrade to instability
  - Added active contract panel + combo telemetry in tour UI and persisted `skillChaosMetrics` into certificate diagnostics with backward-compatible optional rendering
- [x] Real-pointer trail + critical-control cursor corruption hardening pass:
  - Reworked `CursorCorruptionLayer` to render pointer-sprite trails/ghosts/primary cursor using inline SVG data-URI variants (`pointer/text/wait/not-allowed/crosshair`)
  - Added 3s real-pointer trail overlap confusion with per-node scale/rotation, desktop-only live decoy pointer activations during desync, and trap-zone click offset interventions
  - Added periodic critical-control remap loop in `TargetedCursorLayer` for `[data-trap-zone]` interactives (`wait/not-allowed/progress/crosshair`) with config-driven cadence/chance
  - Extended tour and certificate diagnostics with optional cursor chaos metrics (`trailNodesSpawned`, `decoyActivations`, `clickOffsetInterventions`) and live remap telemetry panel lines
- [x] Cursor hard-visibility pass + gate text cleanup:
  - Removed `gate rev: v7` text from both `GlobalGlitchGate` primary and failsafe cards
  - Switched desktop corruption policy to hide native cursor whenever `cursor-corruption-active` is present (non-reduced-motion only)
  - Raised cursor corruption layer priority and changed pointer sprite compositing to `mix-blend-mode: normal` so custom pointers remain visually dominant over effect noise
- [x] Certificate victory audio scene override pass:
  - Added shared scene bus contract in `src/lib/audioSceneBus.ts` with `mobd:audio-scene-lock` and `mobd:audio-scene-release` events
  - Updated `VisitMusicQueue` to pause immediately during certificate lock, suppress queue auto-advance while locked, and resume from the next queued track on release
  - Updated `AnnoyingSoundscape` to hard-suppress output while certificate lock is active and resume normal cadence after release
  - Updated `src/app/certificate/page.tsx` to enforce direct-access guard (`router.replace('/tour')` when `tourResults` is missing/invalid) and play `public/audio/victory/victory.mp3` once per valid visit
- [x] Tour persistence-assist + minigame reliability rebalance:
  - Added adaptive fail-streak tracking in `src/app/tour/page.tsx` (`stepFailStreak`, `minigameFailStreak`) and derived assist tiers (`0|1|2`)
  - Added persistence-based difficulty scaling: reduced random validation fail pressure, moderated non-idle event trigger pressure, and sabotage softening during minigame struggle
  - Added explicit minigame status strip and persistence-assist telemetry in the tour UI
  - Extended minigame component contracts (`assistTier`, `onStatus`) for live run/reset reporting
  - Fixed Maze path solvability in phase 3 by excluding decoy-dependent routes
  - Fixed Captcha timeout reset loop by forcing timer reset on timeout and added adaptive timer extension hints
  - Improved Bureaucracy Queue clarity (rule-mode copy/status/reset reason) and added tier-2 first-slot lock assistance after failed submit
- [x] Cursor body-portal coverage pass:
  - Updated `CursorCorruptionLayer` to render its visual layer through a `document.body` portal so trails/ghosts/primary cursor stay viewport-global even when local containers are transformed
  - Added `CursorCorruptionLayer` mount to `/tour` pre-start view so cursor corruption remains active before the run starts
  - Kept existing telemetry/event wiring unchanged for the started `/tour` branch
- [x] Captcha terminal pass + cursor scroll realignment pass:
  - Hardened `CaptchaGauntlet` so `mode: passed` is terminal for the mounted run and cannot be mutated by timer/timeout callbacks or extra submits
  - Hardened `CursorCorruptionLayer` scroll handling to snap to last pointer, suppress burst chaos briefly, and clear transient desync artifacts during scroll
- [x] Cursor footer alignment + memory-trap solvability hardening pass:
  - Moved global hum filter animation off `body` and onto fog overlay layers so fixed cursor rendering is no longer trapped when scrolling into footer regions
  - Added canonical memory sound-code contract (`MEMORY_SOUND_CODES` + `normalizeMemorySoundCode`) and wired both Step 3 and Step 7 to the shared values
  - Protected memory-critical answers from input corruption and added strict auto-heal fallback in memory-trap validation when legacy/corrupted baseline data is invalid

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
| 2026-02-17 | Entry/gate chaos + timing lock: aggressive-readable profile retuned to volatile spatial+temporal instability with chaotic consent CTA hitbox drift, fake gate controls, and deterministic `100%` hold (`600ms`) before fade start in `GlobalGlitchGate` |
| 2026-02-17 | Minor readability rollback: reduced global blocker strength and moved route tint overlays below content to recover legibility without reverting theme |
| 2026-02-17 | Popup pass: introduced concurrent popup stack, skin variants, and new interaction mechanics for more varied hostile interruptions |
| 2026-02-17 | Favicon switched to Wikimedia error icon URL via metadata |
| 2026-02-17 | Added global random annoying soundscape and fixed-position mystery-meat glyph navigation |
| 2026-02-17 | Increased soundscape trigger frequency and added random burst clusters |
| 2026-02-17 | Expanded sound palette to 8 SFX patterns and raised output level with compression |
| 2026-02-17 | Added unskippable global glitch entry gate on full loads and switched shell corruption to ambient-only real break/heal cycles |
| 2026-02-17 | Retuned glitch entry gate visuals to be unmistakably a loading process with stronger status feedback and ETA |
| 2026-02-17 | Fixed favicon fallback by serving icon assets from `public/` and updating metadata links |
| 2026-02-17 | Added gate-v2 critical inline HUD fallback + revision stamp, hardened gate visual hierarchy, and rebuilt favicon assets (`.ico` multi-size + correctly sized PNGs) |
| 2026-02-17 | Added global shuffled mp3 queue player (starts as soon as glitch gate unlocks, autoplay unlock fallback, endless loop) and relocated songs to `public/audio/playlist/` while keeping synthetic soundscape active |
| 2026-02-17 | Hardened gate runtime for dev visibility (`gate-v3` inline HUD + HMR rearm debug), implemented muted pre-roll autoplay promotion for visit music, and aligned soundscape startup with gate/music release events |
| 2026-02-17 | Moved `intro.mp3` to `public/audio/intro/`, rebuilt gate as intro-duration-driven (`gate-v4`) with 5s synced music+visual fade, fixed dev gate rearm loop, and shifted queue/SFX start to post-teardown release |
| 2026-02-17 | Removed top-left strip and hardened centered loader visibility with watchdog fallback (`gate-v5`); added intro-audio lifecycle events and best-effort no-click soundscape bootstrap diagnostics |
| 2026-02-17 | Promoted gate to `gate-v6` with portal fallback card + repeated visibility probing, tightened soundscape lock detection, and added extra intro/music pre-prime hooks for stronger no-click autoplay best-effort behavior |
| 2026-02-17 | Stabilized gate/audio runtime: tab-session gate visibility, timeline-authoritative release (no intro-ended teardown), removed pointermove audio triggers, added wake cooldown + unlock in-flight guard, and switched non-interaction visit music startup to muted preroll-first |
| 2026-02-17 | Added explicit click-to-enter orchestrator and refactored gate/audio startup to begin from that single gesture: deterministic center loader card rendering, entry-confirmed media priming, and maintained pointermove-free unlock behavior |
| 2026-02-17 | Hardened entry sequencing and audio start contract: delayed full app mount until gate release, added explicit gate lifecycle state, enforced strict post-release queue/SFX start checks, upgraded entry screen to animated-readable class-based UI, and strengthened gate fallback-card visibility behavior |
| 2026-02-17 | Added aggressive-lite GIF madness overlays across all LivingOverlay routes by moving GIF assets into `public/media/hostility/gifs`, adding weighted max-mode spawn config, and wiring non-blocking randomized UI-anchored GIF overlays with reduced-motion disable support |
| 2026-02-17 | Implemented cursor visibility chaos + tour skill-chaos expansion: native cursor now mostly visible with brief hide bursts, 3s blur trailers/smears/flashes, global ambient smear+warning overlay layers, and tour Chaos Contracts with combo/score/tokens plus certificate metrics |
| 2026-02-17 | Implemented real-pointer cursor trail pass: pointer-sprite trail/ghost rendering, live desync decoy pointer, trap-zone click-offset interventions, periodic critical-control cursor remaps, and optional persisted cursor chaos counters in tour/certificate diagnostics |
| 2026-02-17 | Removed gate revision copy from loader cards and enforced desktop non-reduced-motion native-cursor hiding under active corruption, with higher-priority normal-blend custom pointer rendering for stronger cursor confusion |
| 2026-02-17 | Implemented certificate audio scene override: `victory.mp3` plays on each valid certificate visit, certificate view suppresses queue+soundscape to silence after track end, queue resumes from next track on route exit, and invalid certificate access now auto-redirects to `/tour` |
| 2026-02-17 | Implemented adaptive persistence assist and minigame reliability rebalance: fail-streak-driven assist tiers, clearer minigame run/reset status, solvable phase-3 maze routing, captcha timeout reset fix + timer assist, and queue/maze/captcha progressive hint ramps |
| 2026-02-17 | Implemented cursor body-portal coverage fix: `CursorCorruptionLayer` now renders via `document.body` portal for full-viewport trails, and `/tour` pre-start now mounts cursor corruption so behavior is route-wide before run start |
| 2026-02-17 | Fixed Bureaucracy Queue tier-2 solvability bug: after failed submit, locked first slot now aligns to the *next* active rule mode/order instead of the previous one, preventing impossible alternating lock states |
| 2026-02-17 | Implemented tour readability + novice-completion pass: stable non-random core card/button rotations, memory-trap dropdown, click/tap help panel defaults, larger assist typography, minigame-specific coaching tiers (2/4 fail ramp), Bureau tier-2 two-slot lock assist, Maze tier-2 non-failing wrong-click guard, Captcha tier-2 delayed correct-option highlight, and noise safe-zone masking in `SignalNoiseVeil` |
| 2026-02-17 | Hardened timelock UX for reliability under hostility: auto-default timelock selection, explicit selected-action confirmation panel, deterministic timelock validation (no random fail), bypassed pre/post/before-transition event-chaos on timelock commit, and converted help panel from hover/absolute behavior to click/tap-friendly in-flow panel |
| 2026-02-17 | Hotfix: disabled disruptive popup spawning/rendering on `/tour` via `PopupManager` route suppression so core tour controls/help cannot be blocked by modal chaos during progression-critical steps |
| 2026-02-17 | Implemented captcha post-pass freeze + cursor scroll realignment: captcha pass now hard-freezes mounted run state (no post-pass timer timeout mutation), and cursor corruption now snaps/suppresses on scroll to prevent persistent trailer offset drift |
| 2026-02-17 | Implemented cursor footer alignment + memory-trap solvability fix: moved hum filter animation off `body` to preserve fixed cursor alignment at footer scroll extremes, introduced shared canonical memory sound codes, blocked corruption on memory-critical fields, and added strict auto-heal memory baseline recovery so Step 7 cannot become unwinnable |
