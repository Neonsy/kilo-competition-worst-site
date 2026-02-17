"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import type { HostilityMode } from "@/data/hostilityPrimitives";

/**
 * ResonancePulseLayer
 *
 * Decorative layer that renders red resonance bands, ghost duplication bursts,
 * and chromatic jitter flashes. Triggered by event pulses and phase intensity.
 *
 * GUARDRAILS:
 * - pointer-events: none (decorative only)
 * - Lives between background and active controls (z-index: 6)
 * - Never occludes primary action labels
 */

export interface ResonancePulseLayerProps {
  phase?: 1 | 2 | 3;
  activeBurst?: boolean;
  pulseKey?: number;
  eventPulse?: boolean;
  intensity?: number;
  safeZones?: Array<{ x: number; y: number; w: number; h: number }>;
  coverage?: "peripheral" | "mixed" | "full";
  hostilityMode?: HostilityMode;
  /** Optional className override */
  className?: string;
}

interface PulseBand {
  id: string;
  top: number;
  left: number;
  width: number;
  delay: number;
  duration: number;
}

interface GhostElement {
  id: string;
  content: string;
  x: number;
  y: number;
}

const GHOST_SNIPPETS = [
  "ERROR",
  "VOID",
  "NULL",
  "BREAK",
  "FAULT",
  "0xERR",
  "???",
  "LOST",
  "GONE",
  "ESCAPE",
];

const INTENSITY_THRESHOLDS = {
  low: 0.15,
  mid: 0.4,
  high: 0.7,
  extreme: 0.9,
} as const;

function getIntensityClass(intensity: number): string {
  if (intensity >= INTENSITY_THRESHOLDS.extreme) return "res-extreme";
  if (intensity >= INTENSITY_THRESHOLDS.high) return "res-high";
  if (intensity >= INTENSITY_THRESHOLDS.mid) return "res-mid";
  return "res-low";
}

function generatePulseBands(
  phase: 1 | 2 | 3,
  intensity: number,
  seed: number,
  coverage: "peripheral" | "mixed" | "full"
): PulseBand[] {
  const count = Math.min(8, 3 + phase + Math.floor(intensity * 3));
  const bands: PulseBand[] = [];

  const random = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const isCenterCross = coverage === "full" || (coverage === "mixed" && i % 3 !== 0);
    const width = isCenterCross ? 78 + random(i * 5) * 22 : 44 + random(i * 5) * 24;
    const left = isCenterCross ? random(i * 9) * 12 : random(i * 9) * 56;
    bands.push({
      id: `pulse-band-${i}`,
      top: 8 + (i * 84) / count + random(i * 7) * 12,
      left,
      width,
      delay: random(i * 11) * 2,
      duration: 2.2 + random(i * 13) * 2.8,
    });
  }

  return bands;
}

function generateGhosts(
  phase: 1 | 2 | 3,
  intensity: number,
  seed: number,
  safeZones: Array<{ x: number; y: number; w: number; h: number }>
): GhostElement[] {
  const count = Math.min(14, Math.floor(phase * 2 + intensity * 8));
  const ghosts: GhostElement[] = [];

  const random = (n: number) => {
    const x = Math.sin(seed + n * 7) * 10000;
    return x - Math.floor(x);
  };

  const inSafeZone = (x: number, y: number) =>
    safeZones.some(zone => x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h);

  let guard = 0;
  while (ghosts.length < count && guard < count * 8) {
    const i = guard;
    guard += 1;
    const x = 4 + random(i * 5) * 92;
    const y = 6 + random(i * 7) * 88;
    if (inSafeZone(x, y)) continue;
    ghosts.push({
      id: `ghost-${ghosts.length}-${i}`,
      content: GHOST_SNIPPETS[Math.floor(random(i * 3) * GHOST_SNIPPETS.length)],
      x,
      y,
    });
  }

  return ghosts;
}

export default function ResonancePulseLayer({
  phase = 1,
  activeBurst = false,
  pulseKey = 0,
  eventPulse = false,
  intensity = 0.3,
  safeZones = [],
  coverage = "mixed",
  hostilityMode = 'legacy',
  className = "",
}: ResonancePulseLayerProps) {
  const [seed, setSeed] = useState(() => Date.now());
  const [burstActive, setBurstActive] = useState(false);
  const [chromaticTargets, setChromaticTargets] = useState<number[]>([]);
  const prevEventPulse = useRef(eventPulse);

  // Regenerate on phase changes
  useEffect(() => {
    setSeed(Date.now());
  }, [phase]);

  // Handle event pulse - trigger burst
  useEffect(() => {
    if (eventPulse && !prevEventPulse.current) {
      setBurstActive(true);
      // Add chromatic burst targets
      setChromaticTargets([Date.now()]);
      const timer = setTimeout(() => {
        setBurstActive(false);
        setChromaticTargets([]);
      }, 600);
      return () => clearTimeout(timer);
    }
    prevEventPulse.current = eventPulse;
  }, [eventPulse]);

  // Handle activeBurst prop
  useEffect(() => {
    if (activeBurst) {
      setBurstActive(true);
      const timer = setTimeout(() => setBurstActive(false), 800);
      return () => clearTimeout(timer);
    }
  }, [activeBurst]);

  useEffect(() => {
    if (!pulseKey) return;
    setBurstActive(true);
    setChromaticTargets(prev => [...prev, pulseKey]);
    const timer = setTimeout(() => {
      setBurstActive(false);
      setChromaticTargets(prev => prev.slice(-2));
    }, 680);
    return () => clearTimeout(timer);
  }, [pulseKey]);

  const effectivePhase = hostilityMode === 'maximum' ? 3 : phase;
  const effectiveIntensity = hostilityMode === 'maximum' ? Math.max(intensity, 0.97) : intensity;
  const effectiveCoverage = hostilityMode === 'maximum' ? 'full' : coverage;

  const pulseBands = useMemo(
    () => generatePulseBands(effectivePhase, effectiveIntensity, seed, effectiveCoverage),
    [effectivePhase, effectiveIntensity, seed, effectiveCoverage]
  );
  const ghosts = useMemo(
    () => generateGhosts(effectivePhase, effectiveIntensity, seed, safeZones),
    [effectivePhase, effectiveIntensity, seed, safeZones]
  );

  const intensityClass = getIntensityClass(effectiveIntensity);
  const burstClass = burstActive ? "res-burst-active" : "";

  return (
    <div
      className={`res-pulse-layer res-decorative ${intensityClass} ${burstClass} ${className}`}
      aria-hidden="true"
      data-resonance-layer="pulse"
    >
      {/* Pulse bands */}
      {pulseBands.map((band) => (
        <div
          key={band.id}
          className="res-pulse-band"
          style={{
            top: `${band.top}%`,
            left: `${band.left}%`,
            width: `${band.width}%`,
            animationDelay: `${band.delay}s`,
            animationDuration: `${band.duration}s`,
          }}
        />
      ))}

      {/* Ghost offset elements */}
      {ghosts.map((ghost) => (
        <div
          key={ghost.id}
          className="res-ghost-offset"
          data-ghost-content={ghost.content}
          style={{
            left: `${ghost.x}%`,
            top: `${ghost.y}%`,
            position: "absolute",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "10px",
            color: "rgba(255, 0, 0, 0.25)",
            whiteSpace: "nowrap",
          }}
        >
          {ghost.content}
        </div>
      ))}

      {/* Chromatic burst effects */}
      {chromaticTargets.map((target, i) => (
        <div
          key={target}
          className="res-chromatic-burst"
          style={{
            position: "absolute",
            inset: 0,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
