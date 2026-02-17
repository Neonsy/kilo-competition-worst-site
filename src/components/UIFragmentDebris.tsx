"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import type { HostilityMode } from "@/data/hostilityPrimitives";

/**
 * UIFragmentDebris
 *
 * Decorative layer that renders fake detached UI fragments floating in whitespace.
 * Creates the illusion of UI elements breaking off and drifting away.
 *
 * GUARDRAILS:
 * - pointer-events: none (decorative only)
 * - Lives between background and active controls (z-index: 7)
 * - Fragments are clearly fake (wrong fonts, partial content, warning icons)
 */

export interface UIFragmentDebrisProps {
  mode?: "home" | "tour" | "exhibits" | "help" | "settings" | "certificate";
  density?: "sparse" | "medium" | "dense";
  pulseKey?: number;
  eventPulse?: boolean;
  intensity?: number;
  safeZones?: Array<{ x: number; y: number; w: number; h: number }>;
  coverage?: "peripheral" | "mixed" | "full";
  hostilityMode?: HostilityMode;
  /** Optional className override */
  className?: string;
}

interface Fragment {
  id: string;
  content: string;
  x: number;
  y: number;
  rotation: number;
  delay: number;
  duration: number;
  type: "button" | "label" | "badge" | "text";
}

const FRAGMENT_CONTENT: Record<string, string[]> = {
  button: ["Submit", "Cancel", "OK", "Next", "Back", "Accept", "Decline", "Continue"],
  label: ["Name:", "Email:", "Phone:", "Address:", "Date:", "Status:"],
  badge: ["NEW!", "HOT!", "ALERT", "WARN", "INFO", "ERROR", "???"],
  text: ["Lorem ipsum", "dolor sit", "amet consectetur", "adipiscing elit", "sed do"],
};

const MODE_COLORS: Record<string, string> = {
  home: "#FF69B4",
  tour: "#39FF14",
  exhibits: "#00FFFF",
  help: "#FFFF00",
  settings: "#FF0000",
  certificate: "#FFD700",
};

function generateFragments(
  mode: string,
  density: string,
  intensity: number,
  seed: number,
  safeZones: Array<{ x: number; y: number; w: number; h: number }>,
  coverage: "peripheral" | "mixed" | "full"
): Fragment[] {
  let count: number;
  switch (density) {
    case "sparse":
      count = Math.floor(2 + intensity * 2);
      break;
    case "medium":
      count = Math.floor(4 + intensity * 4);
      break;
    case "dense":
      count = Math.floor(6 + intensity * 6);
      break;
    default:
      count = 3;
  }

  count = Math.min(count + Math.floor(intensity * 2), 18);

  const fragments: Fragment[] = [];
  const types: Fragment["type"][] = ["button", "label", "badge", "text"];

  const random = (n: number) => {
    const x = Math.sin(seed + n * 13) * 10000;
    return x - Math.floor(x);
  };
  const modeBias = Math.max(0, Math.min(8, mode.length - 2));

  const inSafeZone = (x: number, y: number) =>
    safeZones.some(zone => x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h);

  let guard = 0;
  while (fragments.length < count && guard < count * 10) {
    const i = guard;
    guard += 1;
    const type = types[Math.floor(random(i * 3) * types.length)];
    const contents = FRAGMENT_CONTENT[type];
    const content = contents[Math.floor(random(i * 7) * contents.length)];
    const y =
      coverage === "peripheral"
        ? 72 + random(i * 11) * 24
        : coverage === "full"
          ? 4 + random(i * 11) * (92 - modeBias)
          : 20 + random(i * 11) * (72 - modeBias * 0.5);
    const x = 4 + random(i * 5) * 92;
    if (inSafeZone(x, y)) continue;

    fragments.push({
      id: `fragment-${seed}-${fragments.length}-${i}`,
      content,
      x,
      y,
      rotation: -15 + random(i * 17) * 30,
      delay: random(i * 19) * 3,
      duration: 8 + random(i * 23) * 8,
      type,
    });
  }

  return fragments;
}

export default function UIFragmentDebris({
  mode = "home",
  density = "medium",
  pulseKey = 0,
  eventPulse = false,
  intensity = 0.3,
  safeZones = [],
  coverage = "mixed",
  hostilityMode = 'legacy',
  className = "",
}: UIFragmentDebrisProps) {
  const [seed, setSeed] = useState(() => Date.now());
  const [extraFragments, setExtraFragments] = useState<Fragment[]>([]);
  const prevEventPulse = useRef(eventPulse);

  const effectiveDensity = hostilityMode === 'maximum' ? 'dense' : density;
  const effectiveIntensity = hostilityMode === 'maximum' ? Math.max(intensity, 0.97) : intensity;
  const effectiveCoverage = hostilityMode === 'maximum' ? 'full' : coverage;

  // Spawn new fragments on event pulse
  useEffect(() => {
    if (eventPulse && !prevEventPulse.current) {
      const newFragments = generateFragments(mode, effectiveDensity, effectiveIntensity, Date.now(), safeZones, effectiveCoverage);
      setExtraFragments((prev) => [...prev, ...newFragments.slice(0, 3)]);

      // Clean up old fragments after animation
      const timer = setTimeout(() => {
        setExtraFragments((prev) => prev.slice(3));
      }, 12000);
      return () => clearTimeout(timer);
    }
    prevEventPulse.current = eventPulse;
  }, [eventPulse, mode, effectiveDensity, effectiveIntensity, safeZones, effectiveCoverage]);

  useEffect(() => {
    if (!pulseKey) return;
    const newFragments = generateFragments(mode, effectiveDensity, effectiveIntensity, Date.now() + pulseKey, safeZones, effectiveCoverage);
    setExtraFragments(prev => [...prev, ...newFragments.slice(0, 4)]);
    const timer = setTimeout(() => {
      setExtraFragments(prev => prev.slice(4));
    }, 10000);
    return () => clearTimeout(timer);
  }, [pulseKey, mode, effectiveDensity, effectiveIntensity, safeZones, effectiveCoverage]);

  // Regenerate on mode/density changes
  useEffect(() => {
    setSeed(Date.now());
  }, [mode, effectiveDensity]);

  const baseFragments = useMemo(
    () => generateFragments(mode, effectiveDensity, effectiveIntensity, seed, safeZones, effectiveCoverage),
    [mode, effectiveDensity, effectiveIntensity, seed, safeZones, effectiveCoverage]
  );

  const allFragments = [...baseFragments, ...extraFragments];
  const densityClass = `res-density-${effectiveDensity}`;
  const modeColor = MODE_COLORS[mode] || "#8B4513";

  return (
    <div
      className={`res-fragment-layer res-decorative ${densityClass} ${className}`}
      aria-hidden="true"
      data-resonance-layer="debris"
      data-mode={mode}
    >
      {allFragments.map((fragment) => (
        <div
          key={fragment.id}
          className="res-fragment"
          style={{
            left: `${fragment.x}%`,
            top: `${fragment.y}%`,
            transform: `rotate(${fragment.rotation}deg)`,
            animationDelay: `${fragment.delay}s`,
            animationDuration: `${fragment.duration}s`,
            borderColor: `rgba(139, 69, 19, ${0.3 + effectiveIntensity * 0.3})`,
            ...(fragment.type === "badge" && {
              backgroundColor: modeColor,
              color: "#000",
              fontWeight: "bold",
            }),
          }}
        >
          {fragment.type !== "badge" && "⚠"}
          {fragment.content}
        </div>
      ))}
    </div>
  );
}
