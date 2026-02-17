'use client';

import { useEffect } from 'react';

type VisitMusicState =
  | 'idle'
  | 'primed'
  | 'starting'
  | 'muted_playing'
  | 'audible_playing'
  | 'blocked'
  | 'error';

type AutoplayPath = 'unmuted_ok' | 'muted_preroll' | 'interaction_unlock' | null;
type GateLifecycleState = 'idle' | 'arming' | 'active' | 'released';

type VisitMusicDebug = {
  queue: string[];
  currentIndex: number;
  currentSrc: string;
  state: VisitMusicState;
  startedAt: number | null;
  playAttempts: number;
  lastError: string | null;
  autoplayPath: AutoplayPath;
  isMutedNow: boolean;
  lastUnmuteAttemptAt: number | null;
  unlockGestureSeen: boolean;
};

type VisitMusicRuntime = VisitMusicDebug & {
  audio: HTMLAudioElement | null;
  booted: boolean;
  started: boolean;
  entryConfirmed: boolean;
  unlockInFlight: boolean;
  failureStreak: number;
  gatePollTimerId: number | null;
  unlockAttached: boolean;
  entryConfirmHandler: (() => void) | null;
  unlockHandler: ((event: Event) => void) | null;
  gateReleaseHandler: (() => void) | null;
  endedHandler: (() => void) | null;
  errorHandler: (() => void) | null;
  unmuteRetryTimerId: number | null;
  unmuteDelayTimerId: number | null;
  volumeRampTimerId: number | null;
};

declare global {
  interface Window {
    __mobdEntryConfirmed?: boolean;
    __mobdGateLifecycle?: GateLifecycleState;
    __mobdVisitMusicRuntime?: VisitMusicRuntime;
    __mobdVisitMusic?: VisitMusicDebug;
  }
}

const TRACKS = [
  '/audio/playlist/1.mp3',
  '/audio/playlist/2.mp3',
  '/audio/playlist/3.mp3',
  '/audio/playlist/4.mp3',
  '/audio/playlist/5.mp3',
] as const;

const ENTRY_CONFIRMED_EVENT = 'mobd:entry-confirmed';
const GATE_RELEASE_EVENT = 'mobd:glitch-gate-released';
const MUSIC_STARTED_EVENT = 'mobd:visit-music-started';
const MUSIC_AUDIBLE_EVENT = 'mobd:visit-music-audible';
const MUSIC_VOLUME = 0.18;
const MUTED_PROMOTE_DELAY_MS = 180;
const UNMUTE_RETRY_MS = 1200;
const VOLUME_RAMP_MS = 720;
const VOLUME_RAMP_TICK_MS = 70;
const TRACK_RECOVERY_DELAY_MS = 170;

function shuffle(list: readonly string[]): string[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = out[i];
    out[i] = out[j] as string;
    out[j] = temp as string;
  }
  return out;
}

function syncDebug(runtime: VisitMusicRuntime) {
  window.__mobdVisitMusic = {
    queue: [...runtime.queue],
    currentIndex: runtime.currentIndex,
    currentSrc: runtime.currentSrc || runtime.queue[runtime.currentIndex] || '',
    state: runtime.state,
    startedAt: runtime.startedAt,
    playAttempts: runtime.playAttempts,
    lastError: runtime.lastError,
    autoplayPath: runtime.autoplayPath,
    isMutedNow: runtime.isMutedNow,
    lastUnmuteAttemptAt: runtime.lastUnmuteAttemptAt,
    unlockGestureSeen: runtime.unlockGestureSeen,
  };
}

function clearTimer(timerId: number | null) {
  if (timerId !== null) {
    window.clearTimeout(timerId);
  }
}

function clearVolumeRamp(runtime: VisitMusicRuntime) {
  if (runtime.volumeRampTimerId !== null) {
    window.clearInterval(runtime.volumeRampTimerId);
    runtime.volumeRampTimerId = null;
  }
}

function clearUnmuteTimers(runtime: VisitMusicRuntime) {
  clearTimer(runtime.unmuteRetryTimerId);
  clearTimer(runtime.unmuteDelayTimerId);
  runtime.unmuteRetryTimerId = null;
  runtime.unmuteDelayTimerId = null;
}

function nextIndex(runtime: VisitMusicRuntime): number {
  if (!runtime.queue.length) return 0;
  return (runtime.currentIndex + 1) % runtime.queue.length;
}

function isGateLocked(): boolean {
  return (
    document.documentElement.classList.contains('global-glitch-lock') ||
    document.body.classList.contains('global-glitch-lock')
  );
}

function getGateLifecycle(): GateLifecycleState {
  return window.__mobdGateLifecycle ?? 'idle';
}

function isGateReleased(): boolean {
  const lifecycle = getGateLifecycle();
  if (lifecycle === 'released') return true;
  if (lifecycle === 'arming' || lifecycle === 'active') return false;

  const gate = document.querySelector<HTMLElement>('.global-glitch-gate');
  if (gate || isGateLocked()) return false;
  return window.__mobdEntryConfirmed === true;
}

function detachGateWait(runtime: VisitMusicRuntime) {
  if (runtime.gateReleaseHandler) {
    window.removeEventListener(GATE_RELEASE_EVENT, runtime.gateReleaseHandler);
    runtime.gateReleaseHandler = null;
  }

  if (runtime.gatePollTimerId !== null) {
    window.clearInterval(runtime.gatePollTimerId);
    runtime.gatePollTimerId = null;
  }
}

function getAudio(runtime: VisitMusicRuntime): HTMLAudioElement {
  if (!runtime.audio) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = false;
    audio.volume = MUSIC_VOLUME;
    runtime.audio = audio;
  }
  return runtime.audio;
}

function ensureCurrentSrc(runtime: VisitMusicRuntime, audio: HTMLAudioElement) {
  const src = runtime.queue[runtime.currentIndex];
  if (!src) return;
  if (runtime.currentSrc !== src) {
    audio.src = src;
    runtime.currentSrc = src;
  }
}

function scheduleVolumeRamp(runtime: VisitMusicRuntime, targetVolume: number) {
  const audio = getAudio(runtime);
  clearVolumeRamp(runtime);

  const startedAt = performance.now();
  const startVolume = audio.volume;
  const boundedTarget = Math.max(0, Math.min(1, targetVolume));

  runtime.volumeRampTimerId = window.setInterval(() => {
    const elapsed = performance.now() - startedAt;
    const progress = Math.max(0, Math.min(1, elapsed / VOLUME_RAMP_MS));
    const nextVolume = startVolume + (boundedTarget - startVolume) * progress;
    audio.volume = nextVolume;

    if (progress >= 1) {
      clearVolumeRamp(runtime);
      audio.volume = boundedTarget;
    }
  }, VOLUME_RAMP_TICK_MS);
}

function dispatchMusicStarted() {
  window.dispatchEvent(new CustomEvent(MUSIC_STARTED_EVENT));
}

function dispatchMusicAudible() {
  window.dispatchEvent(new CustomEvent(MUSIC_AUDIBLE_EVENT));
}

function scheduleUnmuteRetry(runtime: VisitMusicRuntime) {
  clearTimer(runtime.unmuteRetryTimerId);
  runtime.unmuteRetryTimerId = window.setTimeout(() => {
    void promoteMutedToAudible(runtime, 'auto');
  }, UNMUTE_RETRY_MS);
}

async function primeAudioFromGesture(runtime: VisitMusicRuntime): Promise<void> {
  await primeAudioForAutoplay(runtime);
}

async function primeAudioForAutoplay(runtime: VisitMusicRuntime): Promise<void> {
  if (!runtime.queue.length) return;
  const audio = getAudio(runtime);
  ensureCurrentSrc(runtime, audio);

  const prevMuted = audio.muted;
  const prevVolume = audio.volume;
  audio.muted = true;
  audio.volume = 0;

  try {
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    runtime.state = 'primed';
    runtime.lastError = null;
  } catch (error) {
    runtime.lastError =
      error instanceof DOMException ? `${error.name}: ${error.message}` : String(error);
  } finally {
    audio.muted = prevMuted;
    audio.volume = prevVolume;
    syncDebug(runtime);
  }
}

async function startMutedPreroll(runtime: VisitMusicRuntime): Promise<'ok' | 'blocked' | 'error'> {
  if (!runtime.queue.length) return 'error';
  const audio = getAudio(runtime);
  ensureCurrentSrc(runtime, audio);

  clearUnmuteTimers(runtime);
  clearVolumeRamp(runtime);

  runtime.state = 'starting';
  runtime.playAttempts += 1;
  runtime.isMutedNow = true;
  syncDebug(runtime);

  audio.muted = true;
  audio.volume = 0;

  try {
    await audio.play();
    runtime.state = 'muted_playing';
    runtime.startedAt = runtime.startedAt ?? Date.now();
    runtime.lastError = null;
    runtime.failureStreak = 0;
    runtime.autoplayPath = runtime.autoplayPath ?? 'muted_preroll';
    syncDebug(runtime);
    dispatchMusicStarted();

    runtime.unmuteDelayTimerId = window.setTimeout(() => {
      void promoteMutedToAudible(runtime, 'auto');
    }, MUTED_PROMOTE_DELAY_MS);

    return 'ok';
  } catch (error) {
    runtime.lastError =
      error instanceof DOMException ? `${error.name}: ${error.message}` : String(error);

    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      runtime.state = 'blocked';
      runtime.isMutedNow = true;
      syncDebug(runtime);
      return 'blocked';
    }

    runtime.state = 'error';
    runtime.failureStreak += 1;
    syncDebug(runtime);
    return 'error';
  }
}

async function startAudible(runtime: VisitMusicRuntime, fromInteraction: boolean): Promise<'ok' | 'blocked' | 'error'> {
  if (!runtime.queue.length) return 'error';
  const audio = getAudio(runtime);
  ensureCurrentSrc(runtime, audio);

  clearUnmuteTimers(runtime);
  clearVolumeRamp(runtime);

  runtime.state = 'starting';
  runtime.playAttempts += 1;
  runtime.isMutedNow = false;
  syncDebug(runtime);

  audio.muted = false;
  audio.volume = MUSIC_VOLUME;

  try {
    await audio.play();
    runtime.state = 'audible_playing';
    runtime.startedAt = runtime.startedAt ?? Date.now();
    runtime.lastError = null;
    runtime.failureStreak = 0;
    runtime.autoplayPath = fromInteraction
      ? (runtime.autoplayPath === 'unmuted_ok' ? 'unmuted_ok' : 'interaction_unlock')
      : 'unmuted_ok';
    runtime.isMutedNow = false;
    syncDebug(runtime);
    dispatchMusicStarted();
    dispatchMusicAudible();
    return 'ok';
  } catch (error) {
    runtime.lastError =
      error instanceof DOMException ? `${error.name}: ${error.message}` : String(error);

    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      runtime.state = 'blocked';
      runtime.isMutedNow = true;
      syncDebug(runtime);
      return 'blocked';
    }

    runtime.state = 'error';
    runtime.failureStreak += 1;
    syncDebug(runtime);
    return 'error';
  }
}

async function promoteMutedToAudible(runtime: VisitMusicRuntime, source: 'auto' | 'interaction'): Promise<void> {
  if (!runtime.queue.length) return;

  const audio = getAudio(runtime);
  ensureCurrentSrc(runtime, audio);

  clearTimer(runtime.unmuteRetryTimerId);
  runtime.unmuteRetryTimerId = null;
  runtime.lastUnmuteAttemptAt = Date.now();

  audio.muted = false;
  audio.volume = 0;
  runtime.isMutedNow = false;

  try {
    await audio.play();
    runtime.state = 'audible_playing';
    runtime.lastError = null;
    runtime.autoplayPath = source === 'interaction'
      ? 'interaction_unlock'
      : (runtime.autoplayPath ?? 'muted_preroll');
    runtime.isMutedNow = false;
    syncDebug(runtime);
    scheduleVolumeRamp(runtime, MUSIC_VOLUME);
    dispatchMusicAudible();
    return;
  } catch (error) {
    runtime.lastError =
      error instanceof DOMException ? `${error.name}: ${error.message}` : String(error);
    audio.muted = true;
    audio.volume = 0;
    runtime.isMutedNow = true;
    runtime.state = 'muted_playing';
    if (source === 'interaction') {
      runtime.autoplayPath = 'interaction_unlock';
    }
    syncDebug(runtime);
    scheduleUnmuteRetry(runtime);
  }
}

function recoverToNextTrack(runtime: VisitMusicRuntime, fromInteraction: boolean) {
  if (!runtime.queue.length) return;

  if (runtime.failureStreak > runtime.queue.length * 2) {
    runtime.state = 'error';
    syncDebug(runtime);
    return;
  }

  runtime.currentIndex = nextIndex(runtime);
  syncDebug(runtime);

  window.setTimeout(() => {
    void playCurrent(runtime, fromInteraction);
  }, TRACK_RECOVERY_DELAY_MS);
}

async function playCurrent(runtime: VisitMusicRuntime, fromInteraction: boolean): Promise<void> {
  if (!runtime.queue.length) return;

  if (!fromInteraction) {
    const mutedResult = await startMutedPreroll(runtime);
    if (mutedResult === 'ok') {
      runtime.autoplayPath = 'muted_preroll';
      syncDebug(runtime);
      return;
    }

    if (mutedResult === 'blocked') {
      runtime.state = 'blocked';
      syncDebug(runtime);
      return;
    }
  }

  const audibleResult = await startAudible(runtime, fromInteraction);
  if (audibleResult === 'ok') {
    return;
  }

  if (audibleResult === 'blocked') {
    const mutedResult = await startMutedPreroll(runtime);
    if (mutedResult === 'ok') {
      runtime.autoplayPath = 'muted_preroll';
      syncDebug(runtime);
      return;
    }
    if (mutedResult === 'blocked') {
      runtime.state = 'blocked';
      syncDebug(runtime);
      return;
    }
  }

  recoverToNextTrack(runtime, fromInteraction);
}

function attachUnlock(runtime: VisitMusicRuntime) {
  if (runtime.unlockAttached) return;

  runtime.unlockHandler = () => {
    if (!runtime.entryConfirmed) return;
    runtime.unlockGestureSeen = true;
    syncDebug(runtime);

    if (runtime.unlockInFlight) return;
    runtime.unlockInFlight = true;

    void (async () => {
      try {
        if (!isGateReleased()) {
          await primeAudioFromGesture(runtime);
          return;
        }

        if (runtime.state === 'muted_playing') {
          await promoteMutedToAudible(runtime, 'interaction');
          return;
        }

        if (runtime.state === 'audible_playing') {
          return;
        }

        runtime.autoplayPath = 'interaction_unlock';
        syncDebug(runtime);
        await playCurrent(runtime, true);
      } finally {
        runtime.unlockInFlight = false;
        syncDebug(runtime);
      }
    })();
  };

  window.addEventListener('pointerdown', runtime.unlockHandler, { capture: true, passive: true });
  window.addEventListener('keydown', runtime.unlockHandler, { capture: true });
  window.addEventListener('touchstart', runtime.unlockHandler, { capture: true, passive: true });
  runtime.unlockAttached = true;
}

function ensureRuntime(): VisitMusicRuntime {
  if (!window.__mobdVisitMusicRuntime) {
    window.__mobdVisitMusicRuntime = {
      queue: shuffle(TRACKS),
      currentIndex: 0,
      currentSrc: '',
      state: 'idle',
      startedAt: null,
      playAttempts: 0,
      lastError: null,
      autoplayPath: null,
      isMutedNow: false,
      lastUnmuteAttemptAt: null,
      unlockGestureSeen: false,
      audio: null,
      booted: false,
      started: false,
      entryConfirmed: window.__mobdEntryConfirmed === true,
      unlockInFlight: false,
      failureStreak: 0,
      gatePollTimerId: null,
      unlockAttached: false,
      entryConfirmHandler: null,
      unlockHandler: null,
      gateReleaseHandler: null,
      endedHandler: null,
      errorHandler: null,
      unmuteRetryTimerId: null,
      unmuteDelayTimerId: null,
      volumeRampTimerId: null,
    };
  }

  const runtime = window.__mobdVisitMusicRuntime;
  if (!runtime) {
    throw new Error('VisitMusic runtime unavailable');
  }

  syncDebug(runtime);
  return runtime;
}

function bindAudioEvents(runtime: VisitMusicRuntime) {
  const audio = getAudio(runtime);
  if (runtime.endedHandler && runtime.errorHandler) return;

  runtime.endedHandler = () => {
    runtime.failureStreak = 0;
    runtime.currentIndex = nextIndex(runtime);
    syncDebug(runtime);

    if (runtime.state === 'muted_playing') {
      void startMutedPreroll(runtime);
      return;
    }

    void playCurrent(runtime, runtime.autoplayPath === 'interaction_unlock');
  };

  runtime.errorHandler = () => {
    runtime.failureStreak += 1;
    runtime.lastError = audio.error
      ? `MediaError ${audio.error.code}`
      : 'unknown audio element error';
    runtime.state = 'error';
    syncDebug(runtime);

    recoverToNextTrack(runtime, runtime.autoplayPath === 'interaction_unlock');
  };

  audio.addEventListener('ended', runtime.endedHandler);
  audio.addEventListener('error', runtime.errorHandler);
}

function boot(runtime: VisitMusicRuntime) {
  if (runtime.booted) return;

  runtime.booted = true;
  bindAudioEvents(runtime);
  attachUnlock(runtime);

  const startNow = () => {
    if (runtime.started) return;
    runtime.started = true;
    detachGateWait(runtime);
    void playCurrent(runtime, false);
  };

  const armGateReleaseStart = () => {
    if (!runtime.entryConfirmed || runtime.started) return;

    void primeAudioForAutoplay(runtime);
    detachGateWait(runtime);

    if (isGateReleased()) {
      startNow();
      return;
    }

    runtime.gateReleaseHandler = () => {
      startNow();
    };
    window.addEventListener(GATE_RELEASE_EVENT, runtime.gateReleaseHandler);

    runtime.gatePollTimerId = window.setInterval(() => {
      if (isGateReleased()) {
        startNow();
      }
    }, 90);
  };

  if (runtime.entryConfirmed) {
    armGateReleaseStart();
  } else {
    runtime.entryConfirmHandler = () => {
      runtime.entryConfirmed = true;
      runtime.entryConfirmHandler = null;
      syncDebug(runtime);
      armGateReleaseStart();
    };
    window.addEventListener(ENTRY_CONFIRMED_EVENT, runtime.entryConfirmHandler, { once: true });
  }

}

export function VisitMusicQueue() {
  useEffect(() => {
    const runtime = ensureRuntime();
    boot(runtime);
  }, []);

  return <div aria-hidden="true" className="hidden" />;
}

export default VisitMusicQueue;
