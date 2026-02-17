'use client';

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HostilityMode } from '@/data/hostilityPrimitives';
import { MAXIMUM_HOSTILITY } from '@/data/maximumHostility';

type OverlayMode = 'tour' | 'home' | 'exhibits';
type OverlayIntensity = 'low' | 'medium' | 'high';

interface LivingOverlayProps {
  mode: OverlayMode;
  phase?: 1 | 2 | 3;
  intensity?: OverlayIntensity;
  mobileHostile?: boolean;
  eventPulse?: number;
  hostilityMode?: HostilityMode;
}

interface GifMadnessOverlay {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  rotation: number;
  expiresAt: number;
  zBias: number;
  animationSeed: number;
}

const ribbonCopy: Record<OverlayMode, string[]> = {
  tour: [
    'SYSTEM ALERT: your choices are being quality-scored for regret output',
    'MAX HOSTILITY ACTIVE: interruptions are now policy-compliant',
    'NOTE: visible progress and real progress are legally distinct concepts',
  ],
  home: [
    'WELCOME NOTICE: this page is actively making itself worse in real-time',
    'INCIDENT FEED: user confidence dropped 38% in the last 2 minutes',
    'REMINDER: all decorative warnings are fully binding',
  ],
  exhibits: [
    'CURATION MODE: item order may mutate due to atmospheric instability',
    'MAINTENANCE NOTICE: this catalog is under permanent temporary repair',
    'RANKING UPDATE: regret scores were recalculated without permission',
  ],
};

const telemetryCopy: Record<OverlayMode, string[]> = {
  tour: [
    'Latency wobble +34ms',
    'Trust index falling',
    'Error empathy disabled',
    'Session friction: HIGH',
  ],
  home: [
    'Widget drift detected',
    'Hero optimism blocked',
    'CTA reliability: uncertain',
    'Banner entropy climbing',
  ],
  exhibits: [
    'Sort confidence: low',
    'Thumbnail alignment unstable',
    'Catalog drift +12%',
    'Maintenance heartbeat: noisy',
  ],
};

const intensityConfig: Record<OverlayIntensity, { badges: number; ghosts: number; occludeRate: number }> = {
  low: { badges: 3, ghosts: 4, occludeRate: 0.14 },
  medium: { badges: 5, ghosts: 6, occludeRate: 0.2 },
  high: { badges: 7, ghosts: 8, occludeRate: 0.3 },
};

const gifMadnessConfig = MAXIMUM_HOSTILITY.overlay.gifMadness;

const gifAspectBySrc: Record<string, number> = {
  '/media/hostility/gifs/1.gif': 1,
  '/media/hostility/gifs/2.gif': 1,
  '/media/hostility/gifs/3.gif': 500 / 281,
  '/media/hostility/gifs/4.gif': 1,
  '/media/hostility/gifs/5.gif': 1,
};

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomIntInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pickWeightedGifAsset(): string {
  const totalWeight = gifMadnessConfig.assets.reduce((sum, asset) => sum + asset.weight, 0);
  let cursor = Math.random() * totalWeight;
  for (const asset of gifMadnessConfig.assets) {
    cursor -= asset.weight;
    if (cursor <= 0) return asset.src;
  }
  return gifMadnessConfig.assets[0]?.src || '/media/hostility/gifs/1.gif';
}

export function LivingOverlay({
  mode,
  phase = 1,
  intensity = 'medium',
  mobileHostile = false,
  eventPulse = 0,
  hostilityMode = 'legacy',
}: LivingOverlayProps) {
  const [tick, setTick] = useState(0);
  const [showOccluder, setShowOccluder] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [fractureNotices, setFractureNotices] = useState<Array<{ id: string; left: string; top: string; text: string }>>([]);
  const [gifOverlays, setGifOverlays] = useState<GifMadnessOverlay[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const isMaximum = hostilityMode === 'maximum';
  const effectivePhase = isMaximum ? 3 : phase;
  const config = intensityConfig[intensity];
  const activeConfig = isMaximum
    ? {
        badges: MAXIMUM_HOSTILITY.overlay.badges,
        ghosts: MAXIMUM_HOSTILITY.overlay.ghosts,
        occludeRate: MAXIMUM_HOSTILITY.overlay.occluderBaseChance,
      }
    : config;
  const ribbons = ribbonCopy[mode];
  const telemetry = telemetryCopy[mode];

  const buildGifOverlay = useCallback((now: number, mobile: boolean): GifMadnessOverlay => {
    const src = pickWeightedGifAsset();
    const ratio = gifAspectBySrc[src] || 1;
    const baseSize = randomInRange(gifMadnessConfig.sizeRangePx[0], gifMadnessConfig.sizeRangePx[1]);
    const scale = randomInRange(gifMadnessConfig.scaleRange[0], gifMadnessConfig.scaleRange[1]);
    const width = Math.round(baseSize * scale * (mobile ? 0.82 : 1));
    const height = Math.max(48, Math.round(width / ratio));
    const edgePadding = gifMadnessConfig.edgePaddingPx;

    const rootRect = overlayRef.current?.getBoundingClientRect();
    let x: number = edgePadding;
    let y: number = edgePadding;

    if (rootRect && rootRect.width > width + edgePadding * 2 && rootRect.height > height + edgePadding * 2) {
      const selector = gifMadnessConfig.targetSelectors.join(',');
      const targets = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(node => {
        if (overlayRef.current?.contains(node)) return false;
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.08) return false;
        const rect = node.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 14) return false;
        const outside =
          rect.right < rootRect.left ||
          rect.left > rootRect.right ||
          rect.bottom < rootRect.top ||
          rect.top > rootRect.bottom;
        return !outside;
      });

      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const rect = target.getBoundingClientRect();
        const anchorX = rect.left - rootRect.left + rect.width * randomInRange(0.18, 0.82);
        const anchorY = rect.top - rootRect.top + rect.height * randomInRange(0.18, 0.82);
        x = anchorX - width * randomInRange(0.25, 0.75);
        y = anchorY - height * randomInRange(0.25, 0.75);
      } else {
        x = randomInRange(edgePadding, rootRect.width - width - edgePadding);
        y = randomInRange(edgePadding, rootRect.height - height - edgePadding);
      }

      x = clamp(x, edgePadding, rootRect.width - width - edgePadding);
      y = clamp(y, edgePadding, rootRect.height - height - edgePadding);
    }

    return {
      id: `gif-${now}-${Math.random().toString(36).slice(2, 9)}`,
      src,
      x,
      y,
      w: width,
      h: height,
      opacity: randomInRange(gifMadnessConfig.opacityRange[0], gifMadnessConfig.opacityRange[1]),
      rotation: randomInRange(gifMadnessConfig.rotationRangeDeg[0], gifMadnessConfig.rotationRangeDeg[1]),
      expiresAt: now + randomIntInRange(gifMadnessConfig.ttlRangeMs[0], gifMadnessConfig.ttlRangeMs[1]),
      zBias: randomIntInRange(0, 6),
      animationSeed: Math.random(),
    };
  }, []);

  useEffect(() => {
    const ticker = setInterval(() => setTick(prev => prev + 1), 1700);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    const rotator = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % ribbons.length);
    }, 4500);
    return () => clearInterval(rotator);
  }, [ribbons.length]);

  useEffect(() => {
    const occluder = setInterval(() => {
      const phaseBoost = isMaximum ? 0 : phase === 3 ? 0.08 : phase === 2 ? 0.04 : 0;
      const pulseBoost = eventPulse > 0 ? Math.min(eventPulse * 0.01, isMaximum ? 0.1 : 0.06) : 0;
      const chance = activeConfig.occludeRate + phaseBoost + pulseBoost;
      if (Math.random() < chance) {
        setShowOccluder(true);
        const [minMs, maxMs] = isMaximum
          ? MAXIMUM_HOSTILITY.overlay.occluderWindowMs
          : ([750, 1650] as [number, number]);
        setTimeout(() => setShowOccluder(false), minMs + Math.floor(Math.random() * (maxMs - minMs)));
      }
    }, isMaximum ? 2400 : 3200);
    return () => clearInterval(occluder);
  }, [activeConfig.occludeRate, eventPulse, isMaximum, phase]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!isMaximum || prefersReducedMotion) {
      setGifOverlays([]);
      return;
    }

    let timeoutId: number | undefined;
    const prune = window.setInterval(() => {
      const now = Date.now();
      setGifOverlays(prev => prev.filter(item => item.expiresAt > now));
    }, 700);

    const scheduleSpawn = () => {
      const delay = randomIntInRange(gifMadnessConfig.spawnIntervalRangeMs[0], gifMadnessConfig.spawnIntervalRangeMs[1]);
      timeoutId = window.setTimeout(() => {
        const now = Date.now();
        const mobile = window.matchMedia('(max-width: 768px)').matches;
        const cap = mobile ? gifMadnessConfig.maxActiveMobile : gifMadnessConfig.maxActiveDesktop;
        setGifOverlays(prev => {
          const alive = prev.filter(item => item.expiresAt > now);
          let slots = Math.max(0, cap - alive.length);
          if (slots === 0) return alive;

          let spawnCount = 1;
          if (Math.random() < gifMadnessConfig.burstChance) {
            spawnCount += randomIntInRange(
              gifMadnessConfig.burstExtraCountRange[0],
              gifMadnessConfig.burstExtraCountRange[1]
            );
          }
          spawnCount = Math.min(spawnCount, slots);
          const next = [...alive];
          while (spawnCount > 0) {
            next.push(buildGifOverlay(now + spawnCount, mobile));
            spawnCount -= 1;
            slots -= 1;
            if (slots <= 0) break;
          }
          return next;
        });
        scheduleSpawn();
      }, delay);
    };

    scheduleSpawn();

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      window.clearInterval(prune);
    };
  }, [buildGifOverlay, isMaximum, prefersReducedMotion]);

  useEffect(() => {
    if (!isMaximum) {
      setFractureNotices([]);
      return;
    }
    const labels = ['fracture', 'rift', 'signal', 'tear', 'echo', 'split', 'bleed'];
    const timer = setInterval(() => {
      const now = Date.now();
      setFractureNotices(prev => {
        const next = [
          ...prev,
          {
            id: `fracture-${now}`,
            left: `${6 + Math.random() * 88}%`,
            top: `${12 + Math.random() * 78}%`,
            text: labels[Math.floor(Math.random() * labels.length)] || 'fracture',
          },
        ];
        return next.slice(-10);
      });
    }, MAXIMUM_HOSTILITY.overlay.fractureNoticeIntervalMs);
    return () => clearInterval(timer);
  }, [isMaximum]);

  const badges = useMemo(
    () =>
      [...Array(activeConfig.badges)].map((_, index) => ({
        id: `${mode}-badge-${index}`,
        left: `${8 + (index * 13) % 82}%`,
        top: `${12 + ((index * 19 + tick * 2) % 70)}%`,
        label: ['UNSTABLE', 'REROUTE', 'CAUTION', 'PENDING', 'VERIFY', 'LOCKED', 'LATE'][index % 7],
      })),
    [activeConfig.badges, mode, tick]
  );

  const ghosts = useMemo(
    () =>
      [...Array(activeConfig.ghosts)].map((_, index) => ({
        id: `${mode}-ghost-${index}`,
        left: `${(index * 17 + tick * 3) % 100}%`,
        top: `${(index * 23 + tick * 5) % 100}%`,
        size: (isMaximum ? 56 : 40) + ((index * 9 + effectivePhase * 11) % (isMaximum ? 72 : 55)),
        opacity: (isMaximum ? 0.12 : 0.09) + (index % 4) * (isMaximum ? 0.04 : 0.03),
      })),
    [activeConfig.ghosts, effectivePhase, isMaximum, mode, tick]
  );

  const rifts = useMemo(
    () =>
      isMaximum
        ? [...Array(MAXIMUM_HOSTILITY.overlay.rifts)].map((_, index) => ({
            id: `rift-${index}`,
            top: `${8 + (index * 14) % 84}%`,
            delay: `${index * 0.35}s`,
            duration: `${8 + (index % 3) * 2}s`,
          }))
        : [],
    [isMaximum]
  );

  return (
    <div ref={overlayRef} className={`living-overlay-layer ${mobileHostile ? 'living-overlay-mobile-hostile' : ''}`}>
      <div className="living-overlay-ribbon living-overlay-ribbon-top">
        {ribbons[bannerIndex]}
      </div>

      <div className="living-overlay-ribbon living-overlay-ribbon-bottom">
        {telemetry.map((line, index) => (
          <span key={`${line}-${index}`} className="living-overlay-telemetry-chip">
            {line}
          </span>
        ))}
      </div>

      <div className="living-overlay-ghost-field">
        {ghosts.map(ghost => (
          <span
            key={ghost.id}
            className="living-overlay-ghost"
            style={{
              left: ghost.left,
              top: ghost.top,
              width: `${ghost.size}px`,
              height: `${ghost.size}px`,
              opacity: ghost.opacity,
            }}
          />
        ))}
        {rifts.map(rift => (
          <span
            key={rift.id}
            className="living-overlay-rift"
            style={{ top: rift.top, animationDelay: rift.delay, animationDuration: rift.duration }}
          />
        ))}
      </div>

      {isMaximum && !prefersReducedMotion && (
        <div className="living-overlay-gif-field" aria-hidden>
          {gifOverlays.map(overlay => {
            const gifStyle = {
              left: `${overlay.x}px`,
              top: `${overlay.y}px`,
              width: `${overlay.w}px`,
              height: `${overlay.h}px`,
              opacity: overlay.opacity,
              zIndex: 2 + overlay.zBias,
              animationDelay: `-${(0.4 + overlay.animationSeed * 1.9).toFixed(2)}s`,
              animationDuration: `${(2.3 + overlay.animationSeed * 2.4).toFixed(2)}s`,
              '--gif-seed': overlay.animationSeed,
              '--gif-rot': `${overlay.rotation}deg`,
            } as CSSProperties;
            return (
              // Animated GIF overlays are intentionally unoptimized decorative noise.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={overlay.id}
                src={overlay.src}
                alt=""
                aria-hidden
                draggable={false}
                decoding="async"
                className="living-overlay-gif"
                style={gifStyle}
              />
            );
          })}
        </div>
      )}

      <div className="living-overlay-badge-field">
        {badges.map(badge => (
          <span
            key={badge.id}
            className="living-overlay-badge animate-float"
            style={{ left: badge.left, top: badge.top }}
          >
            {badge.label}
          </span>
        ))}
      </div>

      {fractureNotices.map((notice, index) => (
        <span
          key={notice.id}
          className="living-overlay-fracture-notice"
          style={{ left: notice.left, top: notice.top, animationDelay: `${index * 0.05}s` }}
        >
          ▲ {notice.text}
        </span>
      ))}

      {showOccluder && (
        <div className={`living-overlay-occluder ${mobileHostile ? 'living-overlay-occluder-mobile' : ''}`}>
          <p>Temporary obstruction for authenticity.</p>
          <p className="text-[10px]">Please continue interacting while blocked.</p>
        </div>
      )}
    </div>
  );
}

export default LivingOverlay;
