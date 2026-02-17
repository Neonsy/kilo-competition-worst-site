'use client';

import { useEffect, useMemo, useState } from 'react';
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
    <div className={`living-overlay-layer ${mobileHostile ? 'living-overlay-mobile-hostile' : ''}`}>
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
