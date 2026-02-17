'use client';

import { useEffect, useRef } from 'react';

type AudioNodes = {
  ctx: AudioContext;
  master: GainNode;
  compressor: DynamicsCompressorNode;
};

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

    const tryResume = () => {
      const nodes = ensureNodes();
      if (nodes.ctx.state !== 'running') {
        void nodes.ctx.resume();
      }
    };

    const playRandom = () => {
      if (disposed || document.hidden) return;
      const nodes = ensureNodes();
      if (nodes.ctx.state !== 'running') return;
      nodes.master.gain.value = 0.08 + Math.random() * 0.07;
      const now = nodes.ctx.currentTime + 0.01;
      const fn = playbook[Math.floor(Math.random() * playbook.length)] || playChirp;
      fn(nodes.ctx, nodes.master, now);
    };

    const schedule = () => {
      if (disposed) return;
      const wait = 650 + Math.floor(Math.random() * 2300);
      queueTimeout(() => {
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

    const wake = () => {
      tryResume();
      playRandom();
    };

    tryResume();
    queueTimeout(() => {
      playRandom();
      schedule();
    }, 300 + Math.floor(Math.random() * 900));

    window.addEventListener('pointerdown', wake, { passive: true });
    window.addEventListener('keydown', wake);

    return () => {
      disposed = true;
      timersRef.current.forEach(id => window.clearTimeout(id));
      timersRef.current = [];
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
      if (nodesRef.current) {
        void nodesRef.current.ctx.close();
        nodesRef.current = null;
      }
    };
  }, []);

  return <div aria-hidden="true" className="hidden" />;
}

export default AnnoyingSoundscape;
