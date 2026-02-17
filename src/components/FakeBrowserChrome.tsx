'use client';

import { useEffect, useMemo, useState } from 'react';
import { HostilityMode, HostilityPhase, hostilityPrimitives, randomInRange } from '@/data/hostilityPrimitives';

interface FakeBrowserChromeProps {
  phase?: HostilityPhase;
  mode?: 'tour' | 'home' | 'exhibits';
  noiseLevel?: number;
  hostilityMode?: HostilityMode;
  onIncident?: (line: string) => void;
}

const modeUrls: Record<NonNullable<FakeBrowserChromeProps['mode']>, string> = {
  home: 'http://museum.local/home?tracking=mandatory',
  exhibits: 'http://museum.local/exhibits?sort=unstable',
  tour: 'http://museum.local/tour?step=volatile',
};

const fakeTabs = ['REGRET PORTAL', 'UNSAVED CHOICES', 'CERTIFICATE DRAFT', '404 (EXPECTED)'];

export function FakeBrowserChrome({
  phase = 1,
  mode = 'home',
  noiseLevel = 0,
  hostilityMode = 'legacy',
  onIncident,
}: FakeBrowserChromeProps) {
  const chromeRules = hostilityPrimitives.chromeRules;
  const effectivePhase: HostilityPhase = hostilityMode === 'maximum' ? 3 : phase;
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [maskUntil, setMaskUntil] = useState(0);
  const [tick, setTick] = useState(Date.now());

  const noise = useMemo(() => chromeRules.chromeNoiseByPhase[effectivePhase] + Math.min(noiseLevel * 0.02, 0.12), [chromeRules.chromeNoiseByPhase, effectivePhase, noiseLevel]);

  useEffect(() => {
    const ticker = setInterval(() => setTick(Date.now()), 250);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    const rotator = setInterval(() => {
      setActiveTab(prev => (prev + 1) % fakeTabs.length);
      if (Math.random() < chromeRules.fakeControlChance[effectivePhase] * 0.4) {
        const duration = randomInRange(chromeRules.interruptionWindowMs[0], chromeRules.interruptionWindowMs[1]);
        setMaskUntil(Date.now() + duration);
      }
    }, Math.max(2200, 4800 - effectivePhase * 900));
    return () => clearInterval(rotator);
  }, [chromeRules.fakeControlChance, chromeRules.interruptionWindowMs, effectivePhase]);

  const fireFakeAction = (action: string) => {
    const lines = [
      `Fake ${action} acknowledged. Nothing changed.`,
      `${action} queued behind decorative incidents.`,
      `${action} denied by ceremonial browser policy.`,
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];
    setToast(line);
    onIncident?.(`Chrome mislead: ${line}`);
    window.setTimeout(() => setToast(null), 1400);
  };

  return (
    <div className={`fake-browser-chrome phase-${effectivePhase}`} aria-hidden>
      <div className="fake-browser-tabs">
        {fakeTabs.map((tab, index) => (
          <span key={tab} className={`fake-browser-tab ${index === activeTab ? 'active' : ''}`}>
            {tab}
          </span>
        ))}
      </div>
      <div className="fake-browser-toolbar">
        <div className="fake-browser-controls">
          <button type="button" onClick={() => fireFakeAction('back')} className="fake-browser-btn">◀</button>
          <button type="button" onClick={() => fireFakeAction('refresh')} className="fake-browser-btn">↻</button>
          <button type="button" onClick={() => fireFakeAction('warning')} className="fake-browser-btn">⚠</button>
        </div>
        <div className="fake-browser-url">
          <span className="fake-browser-lock">🔒</span>
          <span>{modeUrls[mode]}</span>
          <span className="fake-browser-spinner" />
        </div>
        <span className="fake-browser-badge">NOISE {Math.round(noise * 100)}%</span>
      </div>
      {toast && <div className="fake-browser-toast">{toast}</div>}
      {maskUntil > tick && <div className="fake-browser-mask">Navigation clarity interrupted briefly.</div>}
    </div>
  );
}

export default FakeBrowserChrome;
