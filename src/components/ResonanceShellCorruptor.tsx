"use client";

import { useCallback, useEffect, useRef } from "react";

type CorruptionProfile = "light" | "medium" | "heavy";

interface ResonanceShellCorruptorProps {
  pulseKey?: number;
  intensity?: number;
  profile?: CorruptionProfile;
  rootSelector?: string;
  shellSelector?: string;
  enableAmbient?: boolean;
}

interface ProfileConfig {
  breakMs: number;
  healMs: number;
  maxTargets: number;
  ambientMinMs: number;
  ambientMaxMs: number;
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

export default function ResonanceShellCorruptor({
  pulseKey = 0,
  intensity = 0.45,
  profile = "medium",
  rootSelector = ".res-interaction-root",
  shellSelector = ".res-shell",
  enableAmbient = true,
}: ResonanceShellCorruptorProps) {
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);

  const queueTimer = useCallback((id: number) => {
    timersRef.current.push(id);
  }, []);

  const clearQueued = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
      window.clearInterval(id);
    }
    timersRef.current = [];
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => () => clearQueued(), [clearQueued]);

  useEffect(() => {
    if (!pulseKey) return;

    const config = PROFILE_CONFIG[profile];
    const profileIntensity = clamp(
      intensity * (profile === "light" ? 1.35 : profile === "medium" ? 1.08 : 1),
      0.22,
      0.98
    );
    const roots = Array.from(document.querySelectorAll<HTMLElement>(rootSelector));

    roots.forEach((root, rootIndex) => {
      const shells = Array.from(root.querySelectorAll<HTMLElement>(shellSelector));
      if (!shells.length) return;

      const seededShells = shells
        .map((el, i) => ({ el, score: seeded(pulseKey + rootIndex * 13, i + 1) }))
        .sort((a, b) => a.score - b.score)
        .map(item => item.el);

      const targetCount = clamp(
        Math.round(1 + profileIntensity * config.maxTargets),
        1,
        Math.min(config.maxTargets, seededShells.length)
      );
      const targets = seededShells.slice(0, targetCount);
      const breakMs = config.breakMs + Math.round(profileIntensity * 140);
      const healMs = config.healMs + Math.round(profileIntensity * 210);

      root.classList.add("res-control-halo-active");
      queueTimer(
        window.setTimeout(() => {
          root.classList.remove("res-control-halo-active");
        }, breakMs + healMs + 120)
      );

      targets.forEach((shell, index) => {
        const sample = seeded(pulseKey, index + 11);
        const variantClass = sample > 0.52 ? "res-shell-crack-snap" : "res-shell-fault-warp";
        const shearClass = sample > 0.74 ? "res-shell-shear" : "";
        shell.style.setProperty("--res-shell-intensity", String(profileIntensity));
        shell.style.setProperty("--res-shell-break-ms", `${breakMs}ms`);
        shell.style.setProperty("--res-shell-heal-ms", `${healMs}ms`);

        shell.classList.remove("res-shell-healing", "res-shell-crack-snap", "res-shell-fault-warp", "res-shell-shear");
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
  }, [pulseKey, intensity, profile, rootSelector, shellSelector, queueTimer]);

  useEffect(() => {
    if (!enableAmbient) return;
    const config = PROFILE_CONFIG[profile];
    let cancelled = false;

    const scheduleAmbient = () => {
      if (cancelled) return;
      const wait =
        config.ambientMinMs +
        Math.round(Math.random() * (config.ambientMaxMs - config.ambientMinMs));

      queueTimer(
        window.setTimeout(() => {
          if (cancelled) return;
          const roots = Array.from(document.querySelectorAll<HTMLElement>(rootSelector));
          const shells = roots.flatMap(root =>
            Array.from(root.querySelectorAll<HTMLElement>(shellSelector))
          );
          if (shells.length) {
            const target = shells[Math.floor(Math.random() * shells.length)];
            target.classList.add("res-shell-ambient");
            queueTimer(
              window.setTimeout(() => {
                target.classList.remove("res-shell-ambient");
              }, 1200)
            );
          }
          rafRef.current = window.requestAnimationFrame(scheduleAmbient);
        }, wait)
      );
    };

    rafRef.current = window.requestAnimationFrame(scheduleAmbient);
    return () => {
      cancelled = true;
    };
  }, [enableAmbient, profile, rootSelector, shellSelector, queueTimer]);

  return null;
}
