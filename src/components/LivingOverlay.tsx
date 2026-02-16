'use client';

import { useEffect, useMemo, useState } from 'react';

type OverlayMode = 'tour' | 'home' | 'exhibits';
type OverlayIntensity = 'low' | 'medium' | 'high';

interface LivingOverlayProps {
  mode: OverlayMode;
  phase?: 1 | 2 | 3;
  intensity?: OverlayIntensity;
  mobileHostile?: boolean;
  eventPulse?: number;
}

const ribbonCopy: Record<OverlayMode, string[]> = {
  tour: [
    'SYSTEM ALERT: your choices are being quality-scored for regret output',
    'PHASE ESCALATION ACTIVE: interruptions are now policy-compliant',
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
}: LivingOverlayProps) {
  const [tick, setTick] = useState(0);
  const [showOccluder, setShowOccluder] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);

  const config = intensityConfig[intensity];
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
      const phaseBoost = phase === 3 ? 0.08 : phase === 2 ? 0.04 : 0;
      const pulseBoost = eventPulse > 0 ? Math.min(eventPulse * 0.01, 0.06) : 0;
      const chance = config.occludeRate + phaseBoost + pulseBoost;
      if (Math.random() < chance) {
        setShowOccluder(true);
        setTimeout(() => setShowOccluder(false), 750 + Math.floor(Math.random() * 900));
      }
    }, 3200);
    return () => clearInterval(occluder);
  }, [config.occludeRate, eventPulse, phase]);

  const badges = useMemo(
    () =>
      [...Array(config.badges)].map((_, index) => ({
        id: `${mode}-badge-${index}`,
        left: `${8 + (index * 13) % 82}%`,
        top: `${12 + ((index * 19 + tick * 2) % 70)}%`,
        label: ['UNSTABLE', 'REROUTE', 'CAUTION', 'PENDING', 'VERIFY', 'LOCKED', 'LATE'][index % 7],
      })),
    [config.badges, mode, tick]
  );

  const ghosts = useMemo(
    () =>
      [...Array(config.ghosts)].map((_, index) => ({
        id: `${mode}-ghost-${index}`,
        left: `${(index * 17 + tick * 3) % 100}%`,
        top: `${(index * 23 + tick * 5) % 100}%`,
        size: 40 + ((index * 9 + phase * 11) % 55),
        opacity: 0.09 + (index % 4) * 0.03,
      })),
    [config.ghosts, mode, phase, tick]
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
