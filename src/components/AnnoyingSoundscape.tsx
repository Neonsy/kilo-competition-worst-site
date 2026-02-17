'use client';

import { useEffect, useRef } from 'react';
import {
  AUDIO_SCENE_LOCK_EVENT,
  AUDIO_SCENE_RELEASE_EVENT,
  type AudioSceneLockDetail,
  type AudioSceneReleaseDetail,
} from '@/lib/audioSceneBus';

type AudioNodes = {
  ctx: AudioContext;
  master: GainNode;
  compressor: DynamicsCompressorNode;
};

type SoundscapeStartPath = 'gate_release' | 'none';
type GateLifecycleState = 'idle' | 'arming' | 'active' | 'released';

const GATE_RELEASE_EVENT = 'mobd:glitch-gate-released';
const ENTRY_CONFIRMED_EVENT = 'mobd:entry-confirmed';
const MUSIC_STARTED_EVENT = 'mobd:visit-music-started';
const WAKE_SOUND_COOLDOWN_MS = 260;

declare global {
  interface Window {
    __mobdEntryConfirmed?: boolean;
    __mobdGateLifecycle?: GateLifecycleState;
    __mobdSoundscapeDebug?: {
      ctxState: AudioContextState | 'uninitialized';
      started: boolean;
      startPath: SoundscapeStartPath;
      lastResumeAttemptAt: number | null;
      resumeAttempts: number;
    };
  }
}

function makeNodes(): AudioNodes {
  const ctx = new window.AudioContext();
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 20;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.2;
  const master = ctx.createGain();
  master.gain.value = 0.1;
  master.connect(compressor);
  compressor.connect(ctx.destination);
  return { ctx, master, compressor };
}

function playErrorTriplet(ctx: AudioContext, master: GainNode, at: number) {
  const freqs = [760, 640, 520];
  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, at + index * 0.11);
    gain.gain.setValueAtTime(0.0001, at + index * 0.11);
    gain.gain.exponentialRampToValueAtTime(0.18, at + index * 0.13);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + index * 0.24);
    osc.connect(gain);
    gain.connect(master);
    osc.start(at + index * 0.11);
    osc.stop(at + index * 0.26);
  });
}

function playBuzz(ctx: AudioContext, master: GainNode, at: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, at);
  osc.frequency.exponentialRampToValueAtTime(70, at + 0.45);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.2, at + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + 0.5);
}

function playChirp(ctx: AudioContext, master: GainNode, at: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, at);
  osc.frequency.exponentialRampToValueAtTime(1180, at + 0.12);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.15, at + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + 0.24);
}

function playDetunedGlitch(ctx: AudioContext, master: GainNode, at: number) {
  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  const gain = ctx.createGain();
  oscA.type = 'square';
  oscB.type = 'square';
  oscA.frequency.setValueAtTime(420, at);
  oscB.frequency.setValueAtTime(435, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.1, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.19);
  oscA.connect(gain);
  oscB.connect(gain);
  gain.connect(master);
  oscA.start(at);
  oscB.start(at);
  oscA.stop(at + 0.2);
  oscB.stop(at + 0.2);
}

function playAlarmWarble(ctx: AudioContext, master: GainNode, at: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(540, at);
  osc.frequency.linearRampToValueAtTime(920, at + 0.14);
  osc.frequency.linearRampToValueAtTime(560, at + 0.28);
  osc.frequency.linearRampToValueAtTime(880, at + 0.44);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.22, at + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + 0.52);
}

function playModemSqueal(ctx: AudioContext, master: GainNode, at: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(620, at);
  osc.frequency.exponentialRampToValueAtTime(1700, at + 0.11);
  osc.frequency.exponentialRampToValueAtTime(260, at + 0.25);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.18, at + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.29);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + 0.32);
}

function playClickTrain(ctx: AudioContext, master: GainNode, at: number) {
  for (let i = 0; i < 5; i += 1) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startAt = at + i * 0.045;
    osc.type = 'square';
    osc.frequency.setValueAtTime(2200 - i * 220, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.022);
    osc.connect(gain);
    gain.connect(master);
    osc.start(startAt);
    osc.stop(startAt + 0.03);
  }
}

function playStaticBurst(ctx: AudioContext, master: GainNode, at: number) {
  const duration = 0.15;
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) {
    channel[i] = (Math.random() * 2 - 1) * 0.85;
  }
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = 'highpass';
  filter.frequency.value = 1900;
  src.buffer = buffer;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.16, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(at);
  src.stop(at + duration + 0.02);
}

const playbook = [
  playErrorTriplet,
  playBuzz,
  playChirp,
  playDetunedGlitch,
  playAlarmWarble,
  playModemSqueal,
  playClickTrain,
  playStaticBurst,
];

export function AnnoyingSoundscape() {
  const nodesRef = useRef<AudioNodes | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    let disposed = false;
    let started = false;
    let startPath: SoundscapeStartPath = 'none';
    let sceneSuppressed = false;
    let resumeAttempts = 0;
    let lastResumeAttemptAt: number | null = null;
    let gatePollId: number | null = null;
    let resumeProbeId: number | null = null;
    let gateReleaseHandler: (() => void) | null = null;
    let musicStartedHandler: (() => void) | null = null;
    let entryConfirmedHandler: (() => void) | null = null;
    let audioSceneLockHandler: ((event: Event) => void) | null = null;
    let audioSceneReleaseHandler: ((event: Event) => void) | null = null;
    let lastWakeSoundAt = 0;
    let entryConfirmed = window.__mobdEntryConfirmed === true;

    const queueTimeout = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay);
      timersRef.current.push(id);
      return id;
    };

    const ensureNodes = () => {
      if (!nodesRef.current) {
        nodesRef.current = makeNodes();
      }
      return nodesRef.current;
    };

    const syncSoundscapeDebug = () => {
      const ctxState = nodesRef.current?.ctx.state ?? 'uninitialized';
      window.__mobdSoundscapeDebug = {
        ctxState,
        started,
        startPath,
        lastResumeAttemptAt,
        resumeAttempts,
      };
    };

    const tryResume = () => {
      lastResumeAttemptAt = Date.now();
      resumeAttempts += 1;
      const nodes = ensureNodes();
      if (nodes.ctx.state !== 'running') {
        void nodes.ctx.resume();
      }
      syncSoundscapeDebug();
    };

    const isGateReleased = () => {
      const lifecycle = window.__mobdGateLifecycle ?? 'idle';
      if (lifecycle === 'released') return true;
      if (lifecycle === 'arming' || lifecycle === 'active') return false;

      const gate = document.querySelector<HTMLElement>('.global-glitch-gate');
      const htmlLocked = document.documentElement.classList.contains('global-glitch-lock');
      const bodyLocked = document.body.classList.contains('global-glitch-lock');
      if (gate || htmlLocked || bodyLocked) return false;
      return window.__mobdEntryConfirmed === true;
    };

    const playRandom = () => {
      if (disposed || document.hidden || sceneSuppressed) return;
      const nodes = ensureNodes();
      if (nodes.ctx.state !== 'running') return;
      nodes.master.gain.value = 0.08 + Math.random() * 0.07;
      const now = nodes.ctx.currentTime + 0.01;
      const fn = playbook[Math.floor(Math.random() * playbook.length)] || playChirp;
      fn(nodes.ctx, nodes.master, now);
      syncSoundscapeDebug();
    };

    const schedule = () => {
      if (disposed) return;
      const wait = 650 + Math.floor(Math.random() * 2300);
      queueTimeout(() => {
        tryResume();
        playRandom();
        // Burst clusters keep the soundscape persistently irritating.
        if (Math.random() < 0.38) {
          const burstCount = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < burstCount; i += 1) {
            queueTimeout(() => playRandom(), 90 + i * (120 + Math.floor(Math.random() * 160)));
          }
        }
        schedule();
      }, wait);
    };

    const startSoundscape = (path: SoundscapeStartPath) => {
      if (disposed || started) return;
      started = true;
      startPath = path;
      if (gateReleaseHandler) {
        window.removeEventListener(GATE_RELEASE_EVENT, gateReleaseHandler);
        gateReleaseHandler = null;
      }
      if (gatePollId !== null) {
        window.clearInterval(gatePollId);
        gatePollId = null;
      }
      tryResume();
      playRandom();
      schedule();
      syncSoundscapeDebug();

      if (resumeProbeId !== null) {
        window.clearInterval(resumeProbeId);
      }
      // Probe resume briefly so autoplay-allowed browsers become audible without hover/click interaction.
      resumeProbeId = window.setInterval(() => {
        if (disposed) return;
        tryResume();
        if (nodesRef.current?.ctx.state === 'running') {
          playRandom();
          if (resumeProbeId !== null) {
            window.clearInterval(resumeProbeId);
            resumeProbeId = null;
          }
        }
      }, 180);

      queueTimeout(() => {
        if (resumeProbeId !== null) {
          window.clearInterval(resumeProbeId);
          resumeProbeId = null;
        }
      }, 3200);
    };

    const wake = () => {
      tryResume();
      if (!started) {
        if (!entryConfirmed) return;
        return;
      }
      if (sceneSuppressed) return;
      const now = Date.now();
      if (now - lastWakeSoundAt < WAKE_SOUND_COOLDOWN_MS) return;
      lastWakeSoundAt = now;
      playRandom();
    };

    const armGateReleaseStart = () => {
      if (gateReleaseHandler) {
        window.removeEventListener(GATE_RELEASE_EVENT, gateReleaseHandler);
        gateReleaseHandler = null;
      }
      if (gatePollId !== null) {
        window.clearInterval(gatePollId);
        gatePollId = null;
      }
      if (isGateReleased()) {
        startSoundscape('gate_release');
      } else {
        gateReleaseHandler = () => {
          startSoundscape('gate_release');
        };
        window.addEventListener(GATE_RELEASE_EVENT, gateReleaseHandler, { once: true });
        gatePollId = window.setInterval(() => {
          if (isGateReleased()) {
            startSoundscape('gate_release');
          }
        }, 90);
      }
    };

    if (entryConfirmed) {
      armGateReleaseStart();
    } else {
      entryConfirmedHandler = () => {
        entryConfirmed = true;
        armGateReleaseStart();
        syncSoundscapeDebug();
      };
      window.addEventListener(ENTRY_CONFIRMED_EVENT, entryConfirmedHandler, { once: true });
    }

    musicStartedHandler = () => {
      tryResume();
      if (started) {
        playRandom();
      }
    };
    window.addEventListener(MUSIC_STARTED_EVENT, musicStartedHandler);

    audioSceneLockHandler = (event: Event) => {
      const detail = (event as CustomEvent<AudioSceneLockDetail>).detail;
      if (!detail || detail.scene !== 'certificate') return;
      sceneSuppressed = true;
      if (nodesRef.current) {
        nodesRef.current.master.gain.value = 0;
      }
      syncSoundscapeDebug();
    };
    window.addEventListener(AUDIO_SCENE_LOCK_EVENT, audioSceneLockHandler);

    audioSceneReleaseHandler = (event: Event) => {
      const detail = (event as CustomEvent<AudioSceneReleaseDetail>).detail;
      if (!detail || detail.scene !== 'certificate') return;
      sceneSuppressed = false;
      if (started) {
        playRandom();
      }
      syncSoundscapeDebug();
    };
    window.addEventListener(AUDIO_SCENE_RELEASE_EVENT, audioSceneReleaseHandler);

    window.addEventListener('pointerdown', wake, { passive: true, capture: true });
    window.addEventListener('touchstart', wake, { passive: true, capture: true });
    window.addEventListener('keydown', wake, { capture: true });
    syncSoundscapeDebug();

    return () => {
      disposed = true;
      timersRef.current.forEach(id => window.clearTimeout(id));
      timersRef.current = [];
      if (gatePollId !== null) {
        window.clearInterval(gatePollId);
      }
      if (resumeProbeId !== null) {
        window.clearInterval(resumeProbeId);
      }
      if (gateReleaseHandler) {
        window.removeEventListener(GATE_RELEASE_EVENT, gateReleaseHandler);
      }
      if (musicStartedHandler) {
        window.removeEventListener(MUSIC_STARTED_EVENT, musicStartedHandler);
      }
      if (entryConfirmedHandler) {
        window.removeEventListener(ENTRY_CONFIRMED_EVENT, entryConfirmedHandler);
      }
      if (audioSceneLockHandler) {
        window.removeEventListener(AUDIO_SCENE_LOCK_EVENT, audioSceneLockHandler);
      }
      if (audioSceneReleaseHandler) {
        window.removeEventListener(AUDIO_SCENE_RELEASE_EVENT, audioSceneReleaseHandler);
      }
      window.removeEventListener('pointerdown', wake, true);
      window.removeEventListener('touchstart', wake, true);
      window.removeEventListener('keydown', wake, true);
      if (nodesRef.current) {
        void nodesRef.current.ctx.close();
        nodesRef.current = null;
      }
      started = false;
      startPath = 'none';
      syncSoundscapeDebug();
    };
  }, []);

  return <div aria-hidden="true" className="hidden" />;
}

export default AnnoyingSoundscape;
