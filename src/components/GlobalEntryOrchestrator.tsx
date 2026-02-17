'use client';

import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { MAXIMUM_HOSTILITY } from '@/data/maximumHostility';
import { GlobalGlitchGate } from '@/components/GlobalGlitchGate';

const ENTRY_CONFIRMED_EVENT = 'mobd:entry-confirmed';

declare global {
  interface Window {
    __mobdEntryConfirmed?: boolean;
    __mobdGateIntroAudio?: HTMLAudioElement | null;
    __mobdGateLifecycle?: 'idle' | 'arming' | 'active' | 'released';
    __mobdEntryDebug?: {
      entered: boolean;
      gateReleased: boolean;
    };
  }
}

interface GlobalEntryOrchestratorProps {
  children?: ReactNode;
}

export function GlobalEntryOrchestrator({ children }: GlobalEntryOrchestratorProps) {
  const requireExplicitEntry = MAXIMUM_HOSTILITY.entryGate.requireExplicitEntry ?? true;
  const [entered, setEntered] = useState(!requireExplicitEntry);
  const [gateReleased, setGateReleased] = useState(!requireExplicitEntry);
  const entryLabel = MAXIMUM_HOSTILITY.entryGate.entryLabel ?? 'Click to Enter Museum';
  const showEntryPrompt = requireExplicitEntry && !entered;
  const showGate = requireExplicitEntry && entered;
  const showChildren = !requireExplicitEntry || gateReleased;

  useEffect(() => {
    window.__mobdEntryDebug = { entered, gateReleased };
  }, [entered, gateReleased]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (!showChildren) {
      root.classList.add('global-entry-lock');
      body.classList.add('global-entry-lock');
      return;
    }

    root.classList.remove('global-entry-lock');
    body.classList.remove('global-entry-lock');

    return () => {
      root.classList.remove('global-entry-lock');
      body.classList.remove('global-entry-lock');
    };
  }, [showChildren]);

  useEffect(() => {
    if (!requireExplicitEntry) {
      window.__mobdEntryConfirmed = true;
      window.__mobdGateLifecycle = 'released';
      window.dispatchEvent(new CustomEvent(ENTRY_CONFIRMED_EVENT));
    }
  }, [requireExplicitEntry]);

  const handleEnter = useCallback(() => {
    window.__mobdGateLifecycle = 'arming';
    const intro = new Audio(MAXIMUM_HOSTILITY.entryGate.introTrackUrl);
    intro.preload = 'auto';
    intro.loop = false;
    intro.volume = MAXIMUM_HOSTILITY.entryGate.introVolume ?? 0.18;
    window.__mobdGateIntroAudio = intro;

    void (async () => {
      try {
        intro.muted = false;
        await intro.play();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          try {
            intro.muted = true;
            intro.volume = 0;
            await intro.play();
          } catch {
            // Gate will treat this as blocked and continue timeline-authoritatively.
          }
        }
      }
    })();

    window.__mobdEntryConfirmed = true;
    window.dispatchEvent(new CustomEvent(ENTRY_CONFIRMED_EVENT));
    setEntered(true);
  }, []);

  return (
    <>
      {showChildren ? children : null}

      {showEntryPrompt ? (
        <div role="dialog" aria-modal="true" aria-label="Museum entry gate" className="global-entry-consent">
          <span className="global-entry-consent-grid" aria-hidden />
          <span className="global-entry-consent-noise" aria-hidden />
          <div className="global-entry-consent-card">
            <p className="global-entry-consent-kicker">Museum Entry Control</p>
            <h2 className="global-entry-consent-title">Loading Sequence Requires Consent</h2>
            <p className="global-entry-consent-copy">
              One click starts entry lock, loading gate, and sound system.
            </p>
            <div className="global-entry-consent-chips" aria-hidden>
              <span className="global-entry-consent-chip">Audio Handshake</span>
              <span className="global-entry-consent-chip">Gate Link</span>
              <span className="global-entry-consent-chip">Session Stamp</span>
            </div>
            <button type="button" onClick={handleEnter} className="global-entry-consent-cta">
              {entryLabel}
            </button>
          </div>
        </div>
      ) : null}

      {showGate ? <GlobalGlitchGate armed={entered} onReleased={() => setGateReleased(true)} /> : null}
    </>
  );
}

export default GlobalEntryOrchestrator;
