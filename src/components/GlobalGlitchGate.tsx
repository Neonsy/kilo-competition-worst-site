"use client";

import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { MAXIMUM_HOSTILITY } from "@/data/maximumHostility";

interface GateState {
  progress: number;
  phase: string;
  incident: string;
  stalls: number;
  regressions: number;
  falseCompletes: number;
}

type IntroState = "idle" | "starting" | "playing" | "muted_playing" | "blocked" | "ended" | "error";
type GateLifecyclePhase = "booting" | "active" | "fading" | "released";
type GateStartReason = "idle" | "armed_entry";
type GateFinalizeReason = "none" | "timeline_complete" | "disarmed";
type GateLifecycleState = "idle" | "arming" | "active" | "released";

interface GlobalGlitchGateProps {
  armed: boolean;
  onReleased?: () => void;
}

const PHASES = [
  "Booting decorative infrastructure...",
  "Validating unnecessary dependencies...",
  "Defragmenting confidence matrix...",
  "Re-checking previous checks...",
  "Finalizing near-complete state...",
];

const INCIDENTS = [
  "Signal drift detected in loading corridor.",
  "Progress rollback approved by integrity monitor.",
  "False-complete accepted, then denied.",
  "Legacy cache layer refused to cooperate.",
  "Loading detour added for emotional realism.",
  "Handshake with unstable subsystem timed out.",
];

const SPINNER_FRAMES = ["[|]", "[/]", "[-]", "[\\]"];
const GATE_RELEASE_EVENT = "mobd:glitch-gate-released";
const INTRO_AUDIO_STARTED_EVENT = "mobd:intro-audio-started";
const INTRO_AUDIO_AUDIBLE_EVENT = "mobd:intro-audio-audible";
const INTRO_AUDIO_BLOCKED_EVENT = "mobd:intro-audio-blocked";
const INCIDENT_BADGES = ["UNSTABLE", "CHECKSUM", "REROUTE"];

const CORE_PANEL_STYLE: CSSProperties = {
  position: "relative",
  zIndex: 12,
  width: "min(980px, 94vw)",
  border: "6px double #efd9a8",
  boxShadow:
    "0 0 0 4px rgba(255, 0, 0, 0.46), 0 0 55px rgba(255, 0, 0, 0.53), 0 0 26px rgba(0, 255, 255, 0.26), 9px 9px 0 rgba(0, 0, 0, 0.68)",
  background: "linear-gradient(180deg, rgba(21, 7, 11, 0.98) 0%, rgba(44, 14, 20, 0.98) 100%)",
  padding: "16px 16px 14px",
  color: "#fff3d6",
  textTransform: "uppercase",
  fontFamily: "\"Arial Black\", \"Segoe UI\", sans-serif",
};

const TOPLINE_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  marginBottom: "9px",
  fontSize: "clamp(14px, 2.7vw, 22px)",
  fontWeight: 900,
  letterSpacing: "0.1em",
};

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "clamp(36px, 9vw, 78px)",
  lineHeight: 0.88,
  letterSpacing: "0.04em",
  textShadow: "3px 0 rgba(255, 0, 0, 0.55), -3px 0 rgba(0, 255, 255, 0.45), 0 0 20px rgba(255, 0, 0, 0.44)",
};

const METER_STYLE: CSSProperties = {
  marginTop: "8px",
  marginBottom: "8px",
  width: "100%",
  height: "18px",
  border: "2px solid #e9d2a0",
  background: "#100b0d",
  overflow: "hidden",
};

const FAILSAFE_PANEL_STYLE: CSSProperties = {
  position: "fixed",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 2147483647,
  width: "min(980px, 94vw)",
  border: "6px double #efd9a8",
  boxShadow:
    "0 0 0 4px rgba(255, 0, 0, 0.46), 0 0 55px rgba(255, 0, 0, 0.53), 0 0 26px rgba(0, 255, 255, 0.26), 9px 9px 0 rgba(0, 0, 0, 0.68)",
  background: "linear-gradient(180deg, rgba(21, 7, 11, 0.98) 0%, rgba(44, 14, 20, 0.98) 100%)",
  padding: "16px 16px 14px",
  color: "#fff3d6",
  textTransform: "uppercase",
  fontFamily: "\"Arial Black\", \"Segoe UI\", sans-serif",
  pointerEvents: "none",
};

function createInitialGateState(): GateState {
  return {
    progress: 2,
    phase: PHASES[0] || "Booting...",
    incident: INCIDENTS[0] || "Loading...",
    stalls: 0,
    regressions: 0,
    falseCompletes: 0,
  };
}

declare global {
  interface Window {
    __mobdGateIntroAudio?: HTMLAudioElement | null;
    __mobdGateLifecycle?: GateLifecycleState;
    __mobdGateDebug?: {
      armed: boolean;
      active: boolean;
      phase: GateLifecyclePhase;
      closing: boolean;
      progress: number;
      fadeProgress: number;
      releaseEventSent: boolean;
      introDurationMs: number | null;
      fadeLeadMs: number;
      progressHoldAt100Ms: number;
      fadeStartAtMs: number | null;
      progressCompleteAtMs: number | null;
      remainingMs: number | null;
      introState: IntroState;
      startReason: GateStartReason;
      finalizeReason: GateFinalizeReason;
      timelineStartedAt: number | null;
      minVisibleSatisfied: boolean;
    };
  }
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getTimingMilestones(durationMs: number, fadeLeadMs: number, progressHoldAt100Ms: number) {
  const safeDuration = Math.max(1000, durationMs);
  const effectiveFadeLead = Math.min(fadeLeadMs, safeDuration);
  const fadeStartAtMs = Math.max(0, safeDuration - effectiveFadeLead);
  const progressCompleteAtMs = Math.max(0, fadeStartAtMs - Math.max(0, progressHoldAt100Ms));

  return { safeDuration, effectiveFadeLead, fadeStartAtMs, progressCompleteAtMs };
}

function blockEvent(event: { preventDefault: () => void; stopPropagation: () => void }) {
  event.preventDefault();
  event.stopPropagation();
}

export function GlobalGlitchGate({ armed, onReleased }: GlobalGlitchGateProps) {
  const [active, setActive] = useState(false);
  const [gatePhase, setGatePhase] = useState<GateLifecyclePhase>("booting");
  const [closing, setClosing] = useState(false);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [state, setState] = useState<GateState>(createInitialGateState);
  const [introState, setIntroState] = useState<IntroState>("idle");
  const [introDurationMs, setIntroDurationMs] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [fadeProgress, setFadeProgress] = useState(0);
  const [showFailsafeCard, setShowFailsafeCard] = useState(true);

  const gateRef = useRef<HTMLDivElement | null>(null);
  const coreCardRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationMsRef = useRef<number>(MAXIMUM_HOSTILITY.entryGate.fallbackDurationMs);
  const startedAtRef = useRef<number | null>(null);
  const timelineStartedRef = useRef(false);
  const startedWithFallbackRef = useRef(false);
  const rollbackAtRef = useRef<number | null>(null);
  const progressTickRef = useRef<number | null>(null);
  const timelineTickRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const releaseEventSentRef = useRef(false);
  const completedRef = useRef(false);
  const introStateRef = useRef<IntroState>("idle");
  const fadeProgressRef = useRef(0);
  const closingRef = useRef(false);
  const introStartedEventSentRef = useRef(false);
  const introAudibleEventSentRef = useRef(false);
  const introBlockedEventSentRef = useRef(false);
  const startReasonRef = useRef<GateStartReason>("idle");
  const finalizeReasonRef = useRef<GateFinalizeReason>("none");
  const completionLatchedRef = useRef(false);
  const minVisibleSatisfiedRef = useRef(false);
  const hasActivatedRef = useRef(false);
  const prevArmedRef = useRef(false);
  const onReleasedRef = useRef<(() => void) | undefined>(onReleased);
  const coreCardVisibleFramesRef = useRef(0);

  const fadeLeadMs = MAXIMUM_HOSTILITY.entryGate.fadeOutLeadMs;
  const progressHoldAt100Ms = MAXIMUM_HOSTILITY.entryGate.progressHoldAt100Ms ?? 600;
  const chaosProfile = MAXIMUM_HOSTILITY.entryGate.chaosProfile ?? "aggressive-readable";
  const introVolume = MAXIMUM_HOSTILITY.entryGate.introVolume ?? 0.64;
  const fallbackDurationMs = MAXIMUM_HOSTILITY.entryGate.fallbackDurationMs;
  const fallbackMinDurationMs = Math.max(1000, MAXIMUM_HOSTILITY.entryGate.minDurationMs ?? 1000);
  const introDurationKnownRef = useRef(false);
  const minVisibleMsRef = useRef(fallbackMinDurationMs);

  const setGateLifecycle = useCallback((next: GateLifecycleState) => {
    window.__mobdGateLifecycle = next;
  }, []);

  const setIntroPlaybackState = useCallback((next: IntroState) => {
    introStateRef.current = next;
    setIntroState(next);

    if ((next === "playing" || next === "muted_playing") && !introStartedEventSentRef.current) {
      introStartedEventSentRef.current = true;
      window.dispatchEvent(new CustomEvent(INTRO_AUDIO_STARTED_EVENT));
    }

    if (next === "playing" && !introAudibleEventSentRef.current) {
      introAudibleEventSentRef.current = true;
      window.dispatchEvent(new CustomEvent(INTRO_AUDIO_AUDIBLE_EVENT));
    }

    if (next === "blocked" && !introBlockedEventSentRef.current) {
      introBlockedEventSentRef.current = true;
      window.dispatchEvent(new CustomEvent(INTRO_AUDIO_BLOCKED_EVENT));
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (progressTickRef.current !== null) {
      window.clearTimeout(progressTickRef.current);
      progressTickRef.current = null;
    }
    if (timelineTickRef.current !== null) {
      window.clearInterval(timelineTickRef.current);
      timelineTickRef.current = null;
    }
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const applyFadeToIntroAudio = useCallback((progress: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const target = introVolume * (1 - clamp(progress, 0, 1));
    if (introStateRef.current === "playing") {
      audio.muted = false;
      audio.volume = clamp(target, 0, 1);
      return;
    }

    if (introStateRef.current === "muted_playing" || introStateRef.current === "blocked") {
      audio.muted = true;
      audio.volume = 0;
    }
  }, [introVolume]);

  const syncGateDebug = useCallback(() => {
    const duration = Math.max(1000, durationMsRef.current);
    const milestones = getTimingMilestones(duration, fadeLeadMs, progressHoldAt100Ms);
    window.__mobdGateDebug = {
      armed,
      active,
      phase: gatePhase,
      closing,
      progress: Math.floor(Math.max(0, Math.min(100, state.progress))),
      fadeProgress,
      releaseEventSent: releaseEventSentRef.current,
      introDurationMs,
      fadeLeadMs,
      progressHoldAt100Ms,
      fadeStartAtMs: milestones.fadeStartAtMs,
      progressCompleteAtMs: milestones.progressCompleteAtMs,
      remainingMs,
      introState,
      startReason: startReasonRef.current,
      finalizeReason: finalizeReasonRef.current,
      timelineStartedAt: startedAtRef.current,
      minVisibleSatisfied: minVisibleSatisfiedRef.current,
    };
  }, [armed, active, gatePhase, closing, state.progress, fadeProgress, introDurationMs, fadeLeadMs, progressHoldAt100Ms, remainingMs, introState]);

  const emitReleaseEvent = useCallback(() => {
    if (releaseEventSentRef.current) return;
    releaseEventSentRef.current = true;
    setGateLifecycle("released");
    window.dispatchEvent(new CustomEvent(GATE_RELEASE_EVENT));
    onReleasedRef.current?.();
    syncGateDebug();
  }, [setGateLifecycle, syncGateDebug]);

  const startTimeline = useCallback((durationMs: number, source: "metadata" | "fallback") => {
    const rounded = Math.max(1000, Math.round(durationMs));
    const safeDuration = source === "metadata"
      ? rounded
      : Math.max(fallbackMinDurationMs, rounded);

    if (source === "metadata") {
      introDurationKnownRef.current = true;
      minVisibleMsRef.current = 0;
    }

    if (!timelineStartedRef.current) {
      timelineStartedRef.current = true;
      setGatePhase("active");
      setGateLifecycle("active");
      startedAtRef.current = Date.now();
      minVisibleSatisfiedRef.current = false;
      durationMsRef.current = safeDuration;
      startedWithFallbackRef.current = source === "fallback";
      setIntroDurationMs(safeDuration);
      setRemainingMs(safeDuration);
      return;
    }

    if (source === "metadata" && startedWithFallbackRef.current && !closingRef.current) {
      durationMsRef.current = safeDuration;
      setIntroDurationMs(safeDuration);
      startedWithFallbackRef.current = false;
    }
  }, [fallbackMinDurationMs, setGateLifecycle]);

  const resetForArmedStart = useCallback(() => {
    clearTimers();
    completedRef.current = false;
    releaseEventSentRef.current = false;
    timelineStartedRef.current = false;
    startedWithFallbackRef.current = false;
    rollbackAtRef.current = null;
    startedAtRef.current = null;
    introDurationKnownRef.current = false;
    minVisibleMsRef.current = fallbackMinDurationMs;
    durationMsRef.current = fallbackDurationMs;
    introStartedEventSentRef.current = false;
    introAudibleEventSentRef.current = false;
    introBlockedEventSentRef.current = false;
    completionLatchedRef.current = false;

    startReasonRef.current = "armed_entry";
    finalizeReasonRef.current = "none";
    minVisibleSatisfiedRef.current = false;
    setGateLifecycle("arming");

    setGatePhase("booting");
    setClosing(false);
    setSpinnerIndex(0);
    setState(createInitialGateState());
    setIntroDurationMs(null);
    setRemainingMs(null);
    setFadeProgress(0);
    setShowFailsafeCard(true);
    fadeProgressRef.current = 0;
    coreCardVisibleFramesRef.current = 0;
    setIntroPlaybackState("idle");
    setActive(true);
  }, [clearTimers, fallbackDurationMs, fallbackMinDurationMs, setGateLifecycle, setIntroPlaybackState]);

  const finalizeGate = useCallback((reason: GateFinalizeReason = "timeline_complete") => {
    if (completedRef.current) return;

    completedRef.current = true;
    finalizeReasonRef.current = reason;
    minVisibleSatisfiedRef.current = true;
    clearTimers();

    setFadeProgress(1);
    fadeProgressRef.current = 1;
    setGatePhase("released");
    setClosing(true);
    closingRef.current = true;
    setRemainingMs(0);
    setState((prev) => ({
      ...prev,
      progress: 100,
      phase: "Integrity waiver accepted.",
      incident: "Access granted after ceremonial delay.",
    }));

    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio.pause();
    }

    if (introStateRef.current !== "error" && introStateRef.current !== "blocked") {
      setIntroPlaybackState("ended");
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setActive(false);
    }, 120);
  }, [clearTimers, setIntroPlaybackState]);

  useEffect(() => {
    onReleasedRef.current = onReleased;
  }, [onReleased]);

  useEffect(() => {
    closingRef.current = closing;
  }, [closing]);

  useEffect(() => {
    fadeProgressRef.current = fadeProgress;
    applyFadeToIntroAudio(fadeProgress);
  }, [fadeProgress, applyFadeToIntroAudio]);

  useEffect(() => {
    const wasArmed = prevArmedRef.current;

    if (armed && !wasArmed) {
      resetForArmedStart();
    }

    if (!armed && wasArmed) {
      finalizeReasonRef.current = "disarmed";
      setGateLifecycle("idle");
      clearTimers();
      setActive(false);
      completedRef.current = true;
      completionLatchedRef.current = false;
      timelineStartedRef.current = false;
      startedAtRef.current = null;
      setIntroPlaybackState("idle");
    }

    prevArmedRef.current = armed;
    syncGateDebug();
  }, [armed, clearTimers, resetForArmedStart, setGateLifecycle, setIntroPlaybackState, syncGateDebug]);

  useEffect(() => {
    if (!active) return;

    hasActivatedRef.current = true;
    const root = document.documentElement;
    root.classList.add("global-glitch-lock");
    document.body.classList.add("global-glitch-lock");
    gateRef.current?.focus();

    return () => {
      root.classList.remove("global-glitch-lock");
      document.body.classList.remove("global-glitch-lock");
    };
  }, [active]);

  useEffect(() => {
    if (!armed || active || !hasActivatedRef.current) return;
    emitReleaseEvent();
  }, [armed, active, emitReleaseEvent]);

  useEffect(() => {
    if (!active) return;

    let disposed = false;
    const shared = window.__mobdGateIntroAudio;
    const audio = shared ?? new Audio(MAXIMUM_HOSTILITY.entryGate.introTrackUrl);
    const usingSharedAudio = Boolean(shared);
    audio.preload = "auto";
    audio.loop = false;
    if (!audio.src) {
      audio.src = MAXIMUM_HOSTILITY.entryGate.introTrackUrl;
    }
    audio.volume = introVolume;
    window.__mobdGateIntroAudio = audio;
    audioRef.current = audio;

    if (!audio.paused) {
      setIntroPlaybackState(audio.muted ? "muted_playing" : "playing");
    } else {
      setIntroPlaybackState("starting");
    }
    startTimeline(fallbackDurationMs, "fallback");

    const handleLoadedMetadata = () => {
      const durationSeconds = Number(audio.duration);
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;
      startTimeline(Math.round(durationSeconds * 1000), "metadata");
    };

    const handleEnded = () => {
      setIntroPlaybackState("ended");
    };

    const handleError = () => {
      if (introStateRef.current !== "blocked") {
        setIntroPlaybackState("error");
      }
    };

    const unlockToAudible = async () => {
      if (disposed) return;
      const current = audioRef.current;
      if (!current) return;
      if (introStateRef.current !== "muted_playing" && introStateRef.current !== "blocked") return;

      try {
        current.muted = false;
        current.volume = introVolume * (1 - fadeProgressRef.current);
        await current.play();
        setIntroPlaybackState("playing");
      } catch {
        current.muted = true;
        current.volume = 0;
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      startTimeline(Math.round(audio.duration * 1000), "metadata");
    } else if (!usingSharedAudio) {
      audio.load();
    }

    window.addEventListener("pointerdown", unlockToAudible, { capture: true, passive: true });
    window.addEventListener("touchstart", unlockToAudible, { capture: true, passive: true });
    window.addEventListener("keydown", unlockToAudible, { capture: true });

    if (audio.paused) {
      void (async () => {
        try {
          audio.muted = false;
          audio.volume = introVolume;
          await audio.play();
          if (!disposed) {
            setIntroPlaybackState("playing");
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            try {
              audio.muted = true;
              audio.volume = 0;
              await audio.play();
              if (!disposed) {
                setIntroPlaybackState("muted_playing");
              }
            } catch {
              if (!disposed) {
                setIntroPlaybackState("blocked");
              }
            }
          } else if (!disposed) {
            setIntroPlaybackState("error");
          }
        }
      })();
    }

    return () => {
      disposed = true;
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      window.removeEventListener("pointerdown", unlockToAudible, true);
      window.removeEventListener("touchstart", unlockToAudible, true);
      window.removeEventListener("keydown", unlockToAudible, true);
      audio.pause();
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [active, introVolume, fallbackDurationMs, setIntroPlaybackState, startTimeline]);

  useEffect(() => {
    if (!active) return;

    const spinTimer = window.setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, 180);

    return () => window.clearInterval(spinTimer);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      const startedAt = startedAtRef.current;
      if (!timelineStartedRef.current || completedRef.current || startedAt === null) {
        progressTickRef.current = window.setTimeout(tick, randomInRange(120, 320));
        return;
      }

      const now = Date.now();
      const elapsed = Math.max(0, now - startedAt);
      const milestones = getTimingMilestones(durationMsRef.current, fadeLeadMs, progressHoldAt100Ms);
      const duration = milestones.safeDuration;
      const timelineProgress = clamp(
        (elapsed / Math.max(1, milestones.progressCompleteAtMs)) * 100,
        0,
        99
      );

      if (elapsed >= milestones.progressCompleteAtMs || completionLatchedRef.current) {
        completionLatchedRef.current = true;
        rollbackAtRef.current = null;
        setState((prev) => ({
          ...prev,
          progress: 100,
          phase: "Finalizing near-complete state...",
          incident: "Integrity seal accepted. Preparing visual fade.",
        }));
        const [minTick, maxTick] = MAXIMUM_HOSTILITY.entryGate.phaseTickRangeMs;
        progressTickRef.current = window.setTimeout(tick, randomInRange(minTick, maxTick));
        return;
      }

      setState((prev) => {
        let nextProgress = prev.progress;
        let nextStalls = prev.stalls;
        let nextRegressions = prev.regressions;
        let nextFalseCompletes = prev.falseCompletes;
        let nextIncident = pick(INCIDENTS);

        if (rollbackAtRef.current && now >= rollbackAtRef.current) {
          rollbackAtRef.current = null;
          nextProgress = randomInRange(57, 78);
          nextIncident = "Ceremonial 100% revoked. Returning to review queue.";
        } else if (Math.random() < MAXIMUM_HOSTILITY.entryGate.stallChance) {
          nextStalls += 1;
          nextIncident = "Deep scan paused for decorative checks.";
        } else if (
          Math.random() < MAXIMUM_HOSTILITY.entryGate.falseCompleteChance &&
          nextProgress > 68 &&
          nextFalseCompletes < 3 &&
          !rollbackAtRef.current
        ) {
          nextFalseCompletes += 1;
          nextProgress = 100;
          rollbackAtRef.current = now + randomInRange(250, 620);
          nextIncident = "100% reached. Re-auditing 100% validity.";
        } else if (
          Math.random() < MAXIMUM_HOSTILITY.entryGate.regressionChance &&
          nextProgress > 24
        ) {
          nextRegressions += 1;
          nextProgress = Math.max(9, nextProgress - randomInRange(6, 19));
          nextIncident = "Regression injected by compatibility subsystem.";
        } else {
          nextProgress = Math.min(99, nextProgress + randomInRange(2, 9));
        }

        const floor = clamp(timelineProgress - 24, 2, 96);
        if (!(nextProgress >= 100 && rollbackAtRef.current)) {
          const ceiling = clamp(timelineProgress + 18, 8, 99);
          nextProgress = clamp(nextProgress, floor, ceiling);
        }

        const phaseIndex = Math.min(
          PHASES.length - 1,
          Math.floor((clamp(nextProgress, 0, 99) / 100) * PHASES.length)
        );

        return {
          progress: nextProgress,
          phase: PHASES[phaseIndex] || PHASES[0] || "Loading...",
          incident: nextIncident,
          stalls: nextStalls,
          regressions: nextRegressions,
          falseCompletes: nextFalseCompletes,
        };
      });

      const [minTick, maxTick] = MAXIMUM_HOSTILITY.entryGate.phaseTickRangeMs;
      progressTickRef.current = window.setTimeout(tick, randomInRange(minTick, maxTick));
    };

    progressTickRef.current = window.setTimeout(tick, randomInRange(120, 320));

    return () => {
      if (progressTickRef.current !== null) {
        window.clearTimeout(progressTickRef.current);
        progressTickRef.current = null;
      }
    };
  }, [active, fadeLeadMs, progressHoldAt100Ms]);

  useEffect(() => {
    if (!active) return;

    timelineTickRef.current = window.setInterval(() => {
      const startedAt = startedAtRef.current;
      if (!timelineStartedRef.current || completedRef.current || startedAt === null) return;

      const now = Date.now();
      const milestones = getTimingMilestones(durationMsRef.current, fadeLeadMs, progressHoldAt100Ms);
      const duration = milestones.safeDuration;
      const elapsed = Math.max(0, now - startedAt);
      const remaining = Math.max(0, duration - elapsed);
      const minRemaining = Math.max(0, minVisibleMsRef.current - elapsed);
      const minVisibleSatisfied = minRemaining <= 0;
      minVisibleSatisfiedRef.current = minVisibleSatisfied;
      setRemainingMs(Math.ceil(Math.max(remaining, minRemaining)));

      if (elapsed >= milestones.progressCompleteAtMs && !completionLatchedRef.current) {
        completionLatchedRef.current = true;
        rollbackAtRef.current = null;
        setState((prev) => ({
          ...prev,
          progress: 100,
          phase: "Finalizing near-complete state...",
          incident: "Integrity seal accepted. Preparing visual fade.",
        }));
      }

      const shouldClose = elapsed >= milestones.fadeStartAtMs;

      if (shouldClose && !closingRef.current) {
        setGatePhase("fading");
        setClosing(true);
        closingRef.current = true;
      }

      const nextFade = shouldClose
        ? clamp((elapsed - milestones.fadeStartAtMs) / Math.max(1, milestones.effectiveFadeLead), 0, 1)
        : 0;

      setFadeProgress(nextFade);

      if (remaining <= 0 && minVisibleSatisfied) {
        finalizeGate("timeline_complete");
      }
    }, 90);

    return () => {
      if (timelineTickRef.current !== null) {
        window.clearInterval(timelineTickRef.current);
        timelineTickRef.current = null;
      }
    };
  }, [active, fadeLeadMs, finalizeGate, progressHoldAt100Ms]);

  useEffect(() => {
    return () => setGateLifecycle("idle");
  }, [setGateLifecycle]);

  useEffect(() => {
    if (!active) {
      setShowFailsafeCard(true);
      coreCardVisibleFramesRef.current = 0;
      return;
    }

    const checkVisibility = () => {
      const node = coreCardRef.current;
      if (!node) {
        coreCardVisibleFramesRef.current = 0;
        setShowFailsafeCard(true);
        return;
      }
      const rect = node.getBoundingClientRect();
      const styles = window.getComputedStyle(node);
      const visible =
        rect.width > 220 &&
        rect.height > 120 &&
        styles.display !== "none" &&
        styles.visibility !== "hidden" &&
        Number(styles.opacity || "1") > 0.05;
      if (!visible) {
        coreCardVisibleFramesRef.current = 0;
        setShowFailsafeCard(true);
        return;
      }

      coreCardVisibleFramesRef.current += 1;
      setShowFailsafeCard(coreCardVisibleFramesRef.current < 2);
    };

    let frameA: number | null = null;
    let frameB: number | null = null;
    frameA = window.requestAnimationFrame(() => {
      checkVisibility();
      frameB = window.requestAnimationFrame(checkVisibility);
    });

    const id = window.setInterval(checkVisibility, 120);
    return () => {
      window.clearInterval(id);
      if (frameA !== null) {
        window.cancelAnimationFrame(frameA);
      }
      if (frameB !== null) {
        window.cancelAnimationFrame(frameB);
      }
    };
  }, [active]);

  useEffect(() => {
    syncGateDebug();
  }, [syncGateDebug, armed, active, gatePhase, closing, state.progress, introDurationMs, remainingMs, introState, fadeProgress]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!armed || !active) return null;

  const boundedProgress = Math.max(0, Math.min(100, state.progress));
  const progressLabel = Math.floor(boundedProgress);
  const etaSeconds = remainingMs !== null
    ? Math.max(0, Math.ceil(remainingMs / 1000))
    : Math.ceil(fallbackDurationMs / 1000);
  const spinner = SPINNER_FRAMES[spinnerIndex] || "[|]";
  const gateOpacity = clamp(1 - fadeProgress, 0, 1);
  const incidentBadge = INCIDENT_BADGES[(spinnerIndex + progressLabel) % INCIDENT_BADGES.length] ?? "UNSTABLE";

  return (
    <div
      ref={gateRef}
      className={`global-glitch-gate gate-v6 chaos-${chaosProfile} ${closing ? "closing" : ""}`}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label="Loading gate"
      style={{ opacity: gateOpacity }}
      onClick={blockEvent}
      onMouseDown={blockEvent}
      onMouseUp={blockEvent}
      onPointerDown={blockEvent}
      onPointerUp={blockEvent}
      onWheel={blockEvent}
      onTouchStart={blockEvent}
      onTouchMove={blockEvent}
      onTouchEnd={blockEvent}
      onKeyDown={blockEvent}
      onKeyUp={blockEvent}
    >
      <div ref={coreCardRef} data-gate-core-card className="global-gate-card-chaos" style={CORE_PANEL_STYLE}>
        <div className="global-gate-topline" style={TOPLINE_STYLE}>
          <span className="global-gate-topline-spinner">{spinner}</span>
          <span className="global-gate-topline-percent">{progressLabel}%</span>
        </div>
        <p className="global-gate-incident-badge" aria-hidden>{incidentBadge}</p>
        <p className="global-gate-title" style={TITLE_STYLE}>Loading Bad Decisions</p>
        <div style={METER_STYLE}>
          <div
            style={{
              width: `${boundedProgress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #ff2e4e 0%, #e7ba6f 43%, #00e9ff 100%)",
              boxShadow: "0 0 14px rgba(255, 0, 0, 0.6)",
              transition: "width 140ms linear",
            }}
          />
        </div>
        <p className="global-gate-phase" style={{ margin: "0 0 2px", fontSize: "clamp(15px, 2.4vw, 23px)", letterSpacing: "0.04em", color: "#f9dfae" }}>
          {state.phase}
        </p>
        <p className="global-gate-incident" style={{ margin: 0, fontSize: "clamp(13px, 2.1vw, 19px)", color: "#dcc295", opacity: 0.93 }}>
          {state.incident}
        </p>
        <div className="global-gate-fake-controls" aria-hidden>
          <span className="global-gate-fake-control">REROUTE</span>
          <span className="global-gate-fake-control">RETRY</span>
          <span className="global-gate-fake-control">HOLD</span>
        </div>
        <p className="global-gate-eta" style={{ margin: "10px 0 0", color: "#bcac89", fontFamily: "'VT323', monospace", fontSize: "14px" }}>
          ETA ~{etaSeconds}s | stalls: {state.stalls} | regressions: {state.regressions} | false 100s: {state.falseCompletes}
        </p>
      </div>
      {showFailsafeCard ? (
        <div data-gate-fallback-card className="global-gate-card-chaos" style={FAILSAFE_PANEL_STYLE}>
        <div className="global-gate-topline" style={TOPLINE_STYLE}>
          <span className="global-gate-topline-spinner">{spinner}</span>
          <span className="global-gate-topline-percent">{progressLabel}%</span>
        </div>
          <p className="global-gate-incident-badge" aria-hidden>{incidentBadge}</p>
          <p className="global-gate-title" style={TITLE_STYLE}>Loading Bad Decisions</p>
          <div style={METER_STYLE}>
            <div
              style={{
                width: `${boundedProgress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #ff2e4e 0%, #e7ba6f 43%, #00e9ff 100%)",
                boxShadow: "0 0 14px rgba(255, 0, 0, 0.6)",
                transition: "width 140ms linear",
              }}
            />
          </div>
          <p className="global-gate-phase" style={{ margin: "0 0 2px", fontSize: "clamp(15px, 2.4vw, 23px)", letterSpacing: "0.04em", color: "#f9dfae" }}>
            {state.phase}
          </p>
          <p className="global-gate-incident" style={{ margin: 0, fontSize: "clamp(13px, 2.1vw, 19px)", color: "#dcc295", opacity: 0.93 }}>
            {state.incident}
          </p>
          <div className="global-gate-fake-controls" aria-hidden>
            <span className="global-gate-fake-control">REROUTE</span>
            <span className="global-gate-fake-control">RETRY</span>
            <span className="global-gate-fake-control">HOLD</span>
          </div>
          <p className="global-gate-eta" style={{ margin: "10px 0 0", color: "#bcac89", fontFamily: "'VT323', monospace", fontSize: "14px" }}>
            ETA ~{etaSeconds}s | stalls: {state.stalls} | regressions: {state.regressions} | false 100s: {state.falseCompletes}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default GlobalGlitchGate;
