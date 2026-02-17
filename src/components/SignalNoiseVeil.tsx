"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import type { HostilityMode } from "@/data/hostilityPrimitives";

/**
 * SignalNoiseVeil
 *
 * Decorative layer that applies subtle scanline/noise/grain + low-alpha flicker
 * over the whole content area. Creates an unstable, "breaking signal" feeling.
 *
 * GUARDRAILS:
 * - pointer-events: none (decorative only)
 * - Lives below active controls (z-index: 4)
 * - Uses mix-blend-mode: overlay to avoid blocking content
 */

export interface SignalNoiseVeilProps {
  severity?: number;
  scanlines?: boolean;
  noise?: boolean;
  pulseKey?: number;
  eventPulse?: boolean;
  safeZones?: Array<{ x: number; y: number; w: number; h: number }>;
  coverage?: "peripheral" | "mixed" | "full";
  hostilityMode?: HostilityMode;
  /** Optional className override */
  className?: string;
}

interface Scanline {
  id: string;
  delay: number;
  duration: number;
  left: number;
}

const INTENSITY_THRESHOLDS = {
  low: 0.2,
  mid: 0.5,
  high: 0.75,
  extreme: 0.9,
} as const;

function getIntensityClass(severity: number): string {
  if (severity >= INTENSITY_THRESHOLDS.extreme) return "res-extreme";
  if (severity >= INTENSITY_THRESHOLDS.high) return "res-high";
  if (severity >= INTENSITY_THRESHOLDS.mid) return "res-mid";
  return "res-low";
}

function generateScanlines(severity: number, seed: number): Scanline[] {
  const count = Math.floor(2 + severity * 4);
  const scanlines: Scanline[] = [];

  const random = (n: number) => {
    const x = Math.sin(seed + n * 11) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    scanlines.push({
      id: `scanline-${i}`,
      delay: random(i * 7) * 4,
      duration: 4 + random(i * 13) * 4,
      left: random(i * 3) * 100,
    });
  }

  return scanlines;
}

export default function SignalNoiseVeil({
  severity = 0.3,
  scanlines = true,
  noise = true,
  pulseKey = 0,
  eventPulse = false,
  safeZones: _safeZones,
  coverage: _coverage,
  hostilityMode = 'legacy',
  className = "",
}: SignalNoiseVeilProps) {
  const [seed, setSeed] = useState(() => Date.now());
  const [flickerActive, setFlickerActive] = useState(false);
  const [pulseBoostUntil, setPulseBoostUntil] = useState(0);
  const prevEventPulse = useRef(eventPulse);

  // Regenerate on severity changes
  useEffect(() => {
    setSeed(Date.now());
  }, [severity]);

  // Handle event pulse - trigger flicker
  useEffect(() => {
    if (eventPulse && !prevEventPulse.current) {
      setFlickerActive(true);
      const timer = setTimeout(() => setFlickerActive(false), 300);
      return () => clearTimeout(timer);
    }
    prevEventPulse.current = eventPulse;
  }, [eventPulse]);

  useEffect(() => {
    if (!pulseKey) return;
    setFlickerActive(true);
    setPulseBoostUntil(Date.now() + 560);
    const timer = setTimeout(() => setFlickerActive(false), 340);
    return () => clearTimeout(timer);
  }, [pulseKey]);

  const effectiveSeverity = hostilityMode === 'maximum' ? Math.max(severity, 0.88) : severity;
  const scanlineElements = useMemo(
    () => (scanlines ? generateScanlines(effectiveSeverity, seed) : []),
    [scanlines, effectiveSeverity, seed]
  );

  const intensityClass = getIntensityClass(effectiveSeverity);
  const boosted = Date.now() < pulseBoostUntil;
  const flickerStyle = flickerActive
    ? { opacity: Math.min(0.5, effectiveSeverity * 0.5) }
    : {};

  return (
    <div
      className={`res-noise-veil res-decorative ${intensityClass} ${className}`}
      style={flickerStyle}
      aria-hidden="true"
      data-resonance-layer="noise"
      data-severity={effectiveSeverity.toFixed(2)}
    >
      {/* Noise texture overlay */}
      {noise && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: boosted ? Math.min(0.48, 0.14 + effectiveSeverity * 0.32) : 0.08 + effectiveSeverity * 0.16,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.6 + effectiveSeverity * 0.3}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Scanlines */}
      {scanlines &&
        scanlineElements.map((sl) => (
          <div
            key={sl.id}
            className="res-scanline"
            style={{
              left: `${sl.left}%`,
              width: boosted ? "84%" : "44%",
              animationDelay: `${sl.delay}s`,
              animationDuration: `${boosted ? Math.max(1.4, sl.duration * 0.55) : sl.duration}s`,
            }}
          />
        ))}

      {/* Flicker overlay on event pulse */}
      {flickerActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(255, 0, 0, ${effectiveSeverity * 0.09})`,
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
}
