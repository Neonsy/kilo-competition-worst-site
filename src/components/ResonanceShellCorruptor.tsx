"use client";

import { useCallback, useEffect, useRef } from "react";
import type { HostilityMode } from "@/data/hostilityPrimitives";
import { MAXIMUM_HOSTILITY } from "@/data/maximumHostility";

type CorruptionProfile = "light" | "medium" | "heavy";
type CorruptionSource = "pulse" | "ambient";
type TriggerMode = "pulse" | "ambient" | "both";

interface ResonanceShellCorruptorProps {
  pulseKey?: number;
  intensity?: number;
  profile?: CorruptionProfile;
  rootSelector?: string;
  shellSelector?: string;
  enableAmbient?: boolean;
  hostilityMode?: HostilityMode;
  triggerMode?: TriggerMode;
  ambientBreakChance?: number;
}

interface ProfileConfig {
  breakMs: number;
  healMs: number;
  maxTargets: number;
  ambientMinMs: number;
  ambientMaxMs: number;
}

interface TriggerOptions {
  source: CorruptionSource;
  maxTargetsCap?: number;
  intensityScale?: number;
}

const PROFILE_CONFIG: Record<CorruptionProfile, ProfileConfig> = {
  light: { breakMs: 210, healMs: 360, maxTargets: 3, ambientMinMs: 2100, ambientMaxMs: 3400 },
  medium: { breakMs: 210, healMs: 360, maxTargets: 3, ambientMinMs: 2400, ambientMaxMs: 3800 },
  heavy: { breakMs: 260, healMs: 460, maxTargets: 4, ambientMinMs: 1800, ambientMaxMs: 3200 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function seeded(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export default function ResonanceShellCorruptor({
  pulseKey = 0,
  intensity = 0.45,
  profile = "medium",
  rootSelector = ".res-interaction-root",
  shellSelector = ".res-shell",
  enableAmbient = true,
  hostilityMode = "legacy",
  triggerMode = "both",
  ambientBreakChance = MAXIMUM_HOSTILITY.shellAmbientCycle.breakChance,
}: ResonanceShellCorruptorProps) {
  const timersRef = useRef<number[]>([]);

  const queueTimer = useCallback((id: number) => {
    timersRef.current.push(id);
  }, []);

  const clearQueued = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
      window.clearInterval(id);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearQueued(), [clearQueued]);

  const triggerCorruption = useCallback(
    (seedKey: number, options: TriggerOptions) => {
      if (!seedKey) return;

      const isMaximum = hostilityMode === "maximum";
      const baseConfig = PROFILE_CONFIG[profile];
      const config: ProfileConfig = isMaximum
        ? {
            breakMs: MAXIMUM_HOSTILITY.shell.breakMs,
            healMs: MAXIMUM_HOSTILITY.shell.healMs,
            maxTargets: MAXIMUM_HOSTILITY.shell.maxTargets,
            ambientMinMs: MAXIMUM_HOSTILITY.shell.ambientRangeMs[0],
            ambientMaxMs: MAXIMUM_HOSTILITY.shell.ambientRangeMs[1],
          }
        : baseConfig;

      const sourceIntensityScale = options.source === "ambient" ? 0.92 : 1;
      const profileIntensity = isMaximum
        ? clamp(MAXIMUM_HOSTILITY.shell.intensity * sourceIntensityScale, 0.22, 0.99)
        : clamp(
            intensity * (profile === "light" ? 1.35 : profile === "medium" ? 1.08 : 1) * sourceIntensityScale,
            0.22,
            0.98
          );
      const effectiveIntensity = clamp(profileIntensity * (options.intensityScale || 1), 0.2, 0.99);
      const roots = Array.from(document.querySelectorAll<HTMLElement>(rootSelector));
      const ambientTargetCap = options.maxTargetsCap || config.maxTargets;

      roots.forEach((root, rootIndex) => {
        const shells = Array.from(root.querySelectorAll<HTMLElement>(shellSelector));
        if (!shells.length) return;

        const seededShells = shells
          .map((el, i) => ({ el, score: seeded(seedKey + rootIndex * 13, i + 1) }))
          .sort((a, b) => a.score - b.score)
          .map((item) => item.el);

        const maxTargetPool =
          options.source === "ambient" ? Math.max(1, Math.min(ambientTargetCap, seededShells.length)) : Math.min(config.maxTargets, seededShells.length);
        const targetCount = clamp(
          options.source === "ambient"
            ? Math.round(1 + seeded(seedKey, rootIndex + 101) * maxTargetPool)
            : Math.round(1 + effectiveIntensity * config.maxTargets),
          1,
          maxTargetPool
        );
        const targets = seededShells.slice(0, targetCount);

        const durationScale = options.source === "ambient" ? 0.92 : 1;
        const breakMs = Math.round((config.breakMs + effectiveIntensity * 140) * durationScale);
        const healMs = Math.round((config.healMs + effectiveIntensity * 210) * durationScale);

        root.classList.add("res-control-halo-active");
        queueTimer(
          window.setTimeout(() => {
            root.classList.remove("res-control-halo-active");
          }, breakMs + healMs + 120)
        );

        targets.forEach((shell, index) => {
          const sample = seeded(seedKey + rootIndex, index + 11);
          const variantClass = sample > 0.52 ? "res-shell-crack-snap" : "res-shell-fault-warp";
          const shearClass = sample > 0.74 ? "res-shell-shear" : "";

          shell.style.setProperty("--res-shell-intensity", String(effectiveIntensity));
          shell.style.setProperty("--res-shell-break-ms", `${breakMs}ms`);
          shell.style.setProperty("--res-shell-heal-ms", `${healMs}ms`);

          shell.classList.remove("res-shell-ambient", "res-shell-healing", "res-shell-crack-snap", "res-shell-fault-warp", "res-shell-shear");
          shell.classList.add("res-shell-breaking", variantClass);
          if (shearClass) shell.classList.add(shearClass);

          queueTimer(
            window.setTimeout(() => {
              shell.classList.remove("res-shell-breaking", "res-shell-crack-snap", "res-shell-fault-warp", "res-shell-shear");
              shell.classList.add("res-shell-healing");
            }, breakMs)
          );

          queueTimer(
            window.setTimeout(() => {
              shell.classList.remove("res-shell-healing");
            }, breakMs + healMs)
          );
        });
      });
    },
    [hostilityMode, intensity, profile, queueTimer, rootSelector, shellSelector]
  );

  useEffect(() => {
    const allowsPulse = triggerMode === "pulse" || triggerMode === "both";
    if (!allowsPulse) return;
    if (!pulseKey) return;

    triggerCorruption(pulseKey, { source: "pulse" });
    if (hostilityMode === "maximum") {
      queueTimer(
        window.setTimeout(() => {
          triggerCorruption(pulseKey + MAXIMUM_HOSTILITY.shell.aftershockDelayMs, {
            source: "pulse",
            intensityScale: 0.94,
          });
        }, MAXIMUM_HOSTILITY.shell.aftershockDelayMs)
      );
    }
  }, [hostilityMode, pulseKey, queueTimer, triggerCorruption, triggerMode]);

  useEffect(() => {
    const allowsAmbient = triggerMode === "ambient" || triggerMode === "both";
    if (!enableAmbient || !allowsAmbient) return;

    const isMaximum = hostilityMode === "maximum";
    const config =
      hostilityMode === "maximum"
        ? {
            breakMs: MAXIMUM_HOSTILITY.shell.breakMs,
            healMs: MAXIMUM_HOSTILITY.shell.healMs,
            maxTargets: MAXIMUM_HOSTILITY.shell.maxTargets,
            ambientMinMs: MAXIMUM_HOSTILITY.shellAmbientCycle.intervalRangeMs[0],
            ambientMaxMs: MAXIMUM_HOSTILITY.shellAmbientCycle.intervalRangeMs[1],
          }
        : PROFILE_CONFIG[profile];
    const breakChance = clamp(ambientBreakChance, 0.08, 1);
    const maxAmbientTargets = isMaximum
      ? MAXIMUM_HOSTILITY.shellAmbientCycle.maxTargets
      : Math.max(1, Math.min(2, config.maxTargets));
    const aftershockChance = isMaximum ? MAXIMUM_HOSTILITY.shellAmbientCycle.aftershockChance : 0.18;
    let cancelled = false;

    const scheduleAmbient = () => {
      if (cancelled) return;
      const wait = Math.round(randomInRange(config.ambientMinMs, config.ambientMaxMs));

      queueTimer(
        window.setTimeout(() => {
          if (cancelled) return;
          const seed = Date.now();
          const shouldBreak = Math.random() < breakChance;

          if (shouldBreak) {
            triggerCorruption(seed, {
              source: "ambient",
              maxTargetsCap: maxAmbientTargets,
              intensityScale: 0.9,
            });

            if (Math.random() < aftershockChance) {
              queueTimer(
                window.setTimeout(() => {
                  triggerCorruption(seed + Math.round(randomInRange(50, 190)), {
                    source: "ambient",
                    maxTargetsCap: maxAmbientTargets,
                    intensityScale: 0.82,
                  });
                }, Math.round(randomInRange(120, 360)))
              );
            }
          } else {
            const roots = Array.from(document.querySelectorAll<HTMLElement>(rootSelector));
            const shells = roots.flatMap((root) => Array.from(root.querySelectorAll<HTMLElement>(shellSelector)));
            if (shells.length) {
              const target = shells[Math.floor(Math.random() * shells.length)];
              target.classList.add("res-shell-ambient");
              queueTimer(
                window.setTimeout(() => {
                  target.classList.remove("res-shell-ambient");
                }, 1200)
              );
            }
          }

          scheduleAmbient();
        }, wait)
      );
    };

    scheduleAmbient();
    return () => {
      cancelled = true;
    };
  }, [
    ambientBreakChance,
    enableAmbient,
    hostilityMode,
    profile,
    queueTimer,
    rootSelector,
    shellSelector,
    triggerCorruption,
    triggerMode,
  ]);

  return null;
}
