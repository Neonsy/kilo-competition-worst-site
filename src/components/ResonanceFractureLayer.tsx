"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import type { HostilityMode } from "@/data/hostilityPrimitives";

/**
 * ResonanceFractureLayer
 *
 * Decorative layer that renders cracks, seam tears, and panel drift artifacts
 * in empty/peripheral zones. Reads runtime intensity from phase and runState metrics.
 *
 * GUARDRAILS:
 * - pointer-events: none (decorative only)
 * - Lives between background and active controls (z-index: 5)
 * - Never occludes primary action labels
 */

export interface ResonanceFractureLayerProps {
  phase?: 1 | 2 | 3;
  intensity?: number;
  pulseKey?: number;
  eventPulse?: boolean;
  safeZones?: Array<{ x: number; y: number; w: number; h: number }>;
  coverage?: "peripheral" | "mixed" | "full";
  hostilityMode?: HostilityMode;
  /** Optional className override */
  className?: string;
}

interface FractureElement {
  id: string;
  type: "crack" | "seam-vertical" | "seam-horizontal" | "panel-drift";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  delay: number;
}

const INTENSITY_THRESHOLDS = {
  low: 0.15,
  mid: 0.4,
  high: 0.7,
} as const;

function getIntensityClass(intensity: number): string {
  if (intensity >= INTENSITY_THRESHOLDS.high) return "res-high";
  if (intensity >= INTENSITY_THRESHOLDS.mid) return "res-mid";
  return "res-low";
}

function generateFractures(
  phase: 1 | 2 | 3,
  intensity: number,
  seed: number,
  safeZones: Array<{ x: number; y: number; w: number; h: number }>,
  coverage: "peripheral" | "mixed" | "full"
): FractureElement[] {
  const elements: FractureElement[] = [];
  const baseCount = Math.floor(8 + phase * 4 + intensity * 10);
  const count = Math.min(baseCount, 24);

  // Seeded random for deterministic generation
  const random = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const inSafeZone = (x: number, y: number) =>
    safeZones.some(zone => x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h);

  let guard = 0;
  while (elements.length < count && guard < count * 8) {
    const i = guard;
    guard += 1;
    const typeRoll = random(i * 7);
    let type: FractureElement["type"];

    if (typeRoll < 0.25) {
      type = "crack";
    } else if (typeRoll < 0.45) {
      type = "seam-vertical";
    } else if (typeRoll < 0.65) {
      type = "seam-horizontal";
    } else {
      type = "panel-drift";
    }

    // Position in configurable zones.
    const zoneRoll = random(i * 13);
    let x = 50;
    let y = 50;
    const edgePlacement = () => {
      if (zoneRoll < 0.25) {
        x = random(i * 3) * 11;
        y = random(i * 5) * 100;
      } else if (zoneRoll < 0.5) {
        x = 82 + random(i * 3) * 18;
        y = random(i * 5) * 100;
      } else if (zoneRoll < 0.75) {
        x = random(i * 5) * 100;
        y = random(i * 3) * 16;
      } else {
        x = random(i * 5) * 100;
        y = 80 + random(i * 3) * 20;
      }
    };

    const centerPlacement = () => {
      x = 14 + random(i * 5) * 72;
      y = 18 + random(i * 3) * 64;
    };

    if (coverage === "peripheral") {
      edgePlacement();
    } else if (coverage === "full") {
      if (zoneRoll < 0.5) edgePlacement();
      else centerPlacement();
    } else {
      // mixed: 60% edge, 40% interior
      if (zoneRoll < 0.6) edgePlacement();
      else centerPlacement();
    }

    const width = type === "crack" ? 60 + random(i * 11) * 80 : 100;
    const height = type === "crack" ? 2 + random(i * 7) * 4 : 100;
    const rotation = type === "crack" ? random(i * 17) * 60 - 30 : 0;
    const delay = random(i * 19) * 2;

    if (inSafeZone(x, y)) continue;

    elements.push({
      id: `fracture-${elements.length}-${i}`,
      type,
      x,
      y,
      width,
      height,
      rotation,
      delay,
    });
  }

  return elements;
}

export default function ResonanceFractureLayer({
  phase = 1,
  intensity = 0.3,
  pulseKey = 0,
  eventPulse = false,
  safeZones = [],
  coverage = "mixed",
  hostilityMode = 'legacy',
  className = "",
}: ResonanceFractureLayerProps) {
  const [seed, setSeed] = useState(() => Date.now());
  const [visible, setVisible] = useState(true);
  const prevEventPulse = useRef(eventPulse);

  // Regenerate on phase/intensity changes
  useEffect(() => {
    setSeed(Date.now());
  }, [phase]);

  // Handle event pulse burst (legacy fallback)
  useEffect(() => {
    if (eventPulse && !prevEventPulse.current) {
      setVisible(false);
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    }
    prevEventPulse.current = eventPulse;
  }, [eventPulse]);

  // Handle pulse bus trigger.
  useEffect(() => {
    if (!pulseKey) return;
    setVisible(false);
    const timer = setTimeout(() => {
      setSeed(Date.now() + pulseKey);
      setVisible(true);
    }, 85);
    return () => clearTimeout(timer);
  }, [pulseKey]);

  const effectivePhase = hostilityMode === 'maximum' ? 3 : phase;
  const effectiveIntensity = hostilityMode === 'maximum' ? Math.max(intensity, 0.97) : intensity;
  const effectiveCoverage = hostilityMode === 'maximum' ? 'full' : coverage;

  const fractures = useMemo(
    () => generateFractures(effectivePhase, effectiveIntensity, seed, safeZones, effectiveCoverage),
    [effectivePhase, effectiveIntensity, seed, safeZones, effectiveCoverage]
  );

  const intensityClass = getIntensityClass(effectiveIntensity);
  const pulseClass = pulseKey > 0 || eventPulse ? "res-event-pulse" : "";

  if (!visible) return null;

  return (
    <div
      className={`res-fracture-layer res-decorative ${intensityClass} ${pulseClass} ${className}`}
      aria-hidden="true"
      data-resonance-layer="fracture"
    >
      {fractures.map((el) => {
        if (el.type === "crack") {
          return (
            <div
              key={el.id}
              className="res-crack"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                transform: `rotate(${el.rotation}deg)`,
                animationDelay: `${el.delay}s`,
              }}
            />
          );
        }

        if (el.type === "seam-vertical") {
          return (
            <div
              key={el.id}
              className="res-seam res-seam-vertical"
              style={{
                left: `${el.x}%`,
                top: 0,
                animationDelay: `${el.delay}s`,
              }}
            />
          );
        }

        if (el.type === "seam-horizontal") {
          return (
            <div
              key={el.id}
              className="res-seam res-seam-horizontal"
              style={{
                left: 0,
                top: `${el.y}%`,
                animationDelay: `${el.delay}s`,
              }}
            />
          );
        }

        if (el.type === "panel-drift") {
          return (
            <div
              key={el.id}
              className="res-panel-drift"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: "120px",
                height: "80px",
                animationDelay: `${el.delay}s`,
              }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
