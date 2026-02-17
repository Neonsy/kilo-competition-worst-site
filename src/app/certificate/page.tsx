'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav, SideNav, FooterNav, FloatingWidget } from '@/components/Navigation';
import { PopupManager } from '@/components/Popups';
import { Certificate } from '@/components/Certificate';
import { LivingOverlay } from '@/components/LivingOverlay';
import { FakeBrowserChrome } from '@/components/FakeBrowserChrome';
import { TargetedCursorLayer } from '@/components/TargetedCursorLayer';
import { CursorCorruptionLayer } from '@/components/CursorCorruptionLayer';
import ResonanceFractureLayer from '@/components/ResonanceFractureLayer';
import ResonancePulseLayer from '@/components/ResonancePulseLayer';
import UIFragmentDebris from '@/components/UIFragmentDebris';
import SignalNoiseVeil from '@/components/SignalNoiseVeil';
import ResonanceShellCorruptor from '@/components/ResonanceShellCorruptor';
import { Badge } from '@/data/badges';
import { Exhibit } from '@/data/exhibits';
import { MAXIMUM_HOSTILITY } from '@/data/maximumHostility';
import { HOSTILITY_MODE } from '@/data/hostilityPrimitives';
import { emitPulse, initialResonancePulseState } from '@/lib/resonancePulseBus';
import { useMaximumHeartbeatPulse } from '@/lib/useMaximumHeartbeatPulse';

interface TourResults {
  answers: Record<string, unknown>;
  score: number;
  badge: Badge;
  exhibitIds: string[];
  calculationBreakdown: {
    base: number;
    doorMultiplier: number;
    buttonAnxiety: number;
    shoeSizeFactor: number;
    chaosBonus: number;
  };
  runStats?: {
    strikes: number;
    instability: number;
    suspicion: number;
    recoveryTokensLeft: number;
    hardRegressions: number;
    attempts: number;
    durationMs: number;
    phaseStats: Record<string, { attempts: number; events: number; regressions: number }>;
    cursorMetrics?: {
      personaSwaps: number;
      desyncTriggers: number;
      ghostBursts: number;
      cursorMode: string;
      cursorOffset: number;
    };
    loadingMetrics?: {
      loops: number;
      regressions: number;
      falseCompletes: number;
      bypassTokens: number;
      debt: number;
    };
    skinMetrics?: {
      mutations: number;
      activeSkinMap: Record<string, string>;
    };
    minigameMetrics?: {
      stats: Record<string, { fails: number; passes: number; passed: boolean }>;
      interruptions: number;
    };
    interactionState?: {
      cursorMode: string;
      cursorHotspotOffset: number;
      cursorDecoyVisibleUntil: number;
      focusLockUntil: number;
      selectionCorruptUntil: number;
      dragResistance: number;
      chromeNoiseLevel: number;
    };
  };
}

export default function CertificatePage() {
  const router = useRouter();
  const [results, setResults] = useState<TourResults | null>(null);
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulseState, setPulseState] = useState(initialResonancePulseState);
  const resonanceSafeZones = [{ x: 16, y: 20, w: 68, h: 58 }];

  useEffect(() => {
    // Load results from sessionStorage
    const storedResults = sessionStorage.getItem('tourResults');
    
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults) as TourResults;
        setResults(parsed);
        
        // Load exhibits
        import('@/data/exhibits').then(({ getExhibitById }) => {
          const loadedExhibits = parsed.exhibitIds
            .map(id => getExhibitById(id))
            .filter((e): e is Exhibit => e !== undefined);
          setExhibits(loadedExhibits);
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!results?.runStats) return;
    setPulseState(prev => emitPulse(prev, 'event', 0.34));
  }, [results]);

  useMaximumHeartbeatPulse({
    active: true,
    onPulse: strength => {
      setPulseState(prev => emitPulse(prev, 'event', strength));
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
        <div 
          className="text-center p-8"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          <span className="text-6xl animate-bounce-chaotic inline-block">📜</span>
          <p className="mt-4 text-xl animate-blink">Loading your certificate...</p>
          <div className="progress-lie mt-4 w-48 mx-auto">
            <div className="progress-lie-fill" style={{ width: '97%' }} />
            <div className="progress-lie-text">97%</div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <PopupManager>
        <div className="min-h-screen flex flex-col">
          <TopNav />
          <div className="flex flex-1">
            <SideNav />
            <main className="flex-1 overflow-x-hidden">
              <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div 
                  className="max-w-lg w-full p-8 bg-[#FFFF99] border-4 border-dashed border-[#FF0000] text-center"
                  style={{ fontFamily: "'Comic Neue', cursive" }}
                >
                  <span className="text-6xl">❓</span>
                  <h1 
                    className="text-2xl mt-4"
                    style={{ fontFamily: "'Bangers', cursive" }}
                  >
                    NO CERTIFICATE FOUND
                  </h1>
                  <p className="mt-4">
                    It appears you haven't completed the tour yet. 
                    Your certificate is waiting for you to make some bad decisions first.
                  </p>
                  <button
                    onClick={() => router.push('/tour')}
                    className="mt-6 px-6 py-3 bg-[#FF69B4] text-white font-bold"
                    style={{ fontFamily: "'Bangers', cursive" }}
                  >
                    START THE TOUR
                  </button>
                </div>
              </div>
            </main>
          </div>
          <FooterNav />
          <FloatingWidget />
        </div>
      </PopupManager>
    );
  }

  // Get name from answers
  const name = (results.answers['useless-data'] as string) || 'Anonymous Regretter';

  return (
    <PopupManager>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <div className="flex flex-1">
          <SideNav />
          <main className="res-interaction-root flex-1 overflow-x-hidden">
            <FakeBrowserChrome phase={3} hostilityMode={HOSTILITY_MODE} mode="home" noiseLevel={results.runStats?.strikes || 0} />
            <TargetedCursorLayer phase={3} hostilityMode={HOSTILITY_MODE} pityPass={false} active />
            <CursorCorruptionLayer phase={3} hostilityMode={HOSTILITY_MODE} pityPass={false} active eventPulse={results.runStats?.attempts || 0} />
            <LivingOverlay mode="home" hostilityMode={HOSTILITY_MODE} intensity={MAXIMUM_HOSTILITY.overlay.intensity} mobileHostile eventPulse={results.runStats?.strikes || 0} />
            <ResonanceShellCorruptor pulseKey={pulseState.key} hostilityMode={HOSTILITY_MODE} intensity={MAXIMUM_HOSTILITY.shell.intensity} profile={MAXIMUM_HOSTILITY.shell.profile} />
            <div className="res-layer-stack">
              <SignalNoiseVeil hostilityMode={HOSTILITY_MODE} severity={MAXIMUM_HOSTILITY.visual.resonanceNoiseSeverity} scanlines noise pulseKey={pulseState.key} coverage={MAXIMUM_HOSTILITY.visual.resonanceCoverage} safeZones={resonanceSafeZones} />
              <ResonanceFractureLayer hostilityMode={HOSTILITY_MODE} phase={3} intensity={MAXIMUM_HOSTILITY.visual.resonanceIntensity} pulseKey={pulseState.key} coverage={MAXIMUM_HOSTILITY.visual.resonanceCoverage} safeZones={resonanceSafeZones} />
              <ResonancePulseLayer hostilityMode={HOSTILITY_MODE} phase={3} intensity={MAXIMUM_HOSTILITY.visual.resonancePulseIntensity} pulseKey={pulseState.key} coverage={MAXIMUM_HOSTILITY.visual.resonanceCoverage} safeZones={resonanceSafeZones} />
              <UIFragmentDebris hostilityMode={HOSTILITY_MODE} mode="certificate" density={MAXIMUM_HOSTILITY.visual.resonanceFragmentDensity} intensity={MAXIMUM_HOSTILITY.visual.resonanceIntensity} pulseKey={pulseState.key} coverage={MAXIMUM_HOSTILITY.visual.resonanceCoverage} safeZones={resonanceSafeZones} />
            </div>
            {/* Header */}
            <section 
              className="res-shell p-4 md:p-8 text-center bg-gradient-to-b from-[#FFD700] to-[#FFA500]"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)
                `,
              }}
            >
              <h1 
                className="text-3xl md:text-5xl animate-rainbow"
                style={{ 
                  fontFamily: "'Bangers', cursive",
                  textShadow: '3px 3px 0 #8B4513',
                }}
              >
                🏆 CERTIFICATE OF ACHIEVEMENT 🏆
              </h1>
              <p 
                className="mt-2 text-lg"
                style={{ fontFamily: "'Comic Neue', cursive" }}
              >
                Congratulations! You've earned it (we think)
              </p>
            </section>

            {/* Certificate */}
            <section className="res-control-safe p-4 md:p-8 bg-[#F5F5DC]">
              <Certificate
                name={name}
                score={results.score}
                badge={results.badge}
                exhibits={exhibits}
                calculationBreakdown={results.calculationBreakdown}
              />
            </section>

            {/* What's Next Section */}
            <section className="p-4 md:p-8 bg-[#E6E6FA]">
              <div className="max-w-2xl mx-auto">
                <h2 
                  className="text-2xl text-center mb-6"
                  style={{ fontFamily: "'Bangers', cursive", color: '#8B4513' }}
                >
                  🎯 WHAT'S NEXT?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-4 bg-white border-2 border-[#808080]"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    <span className="text-3xl">🏛️</span>
                    <h3 className="text-lg font-bold mt-2">Visit More Exhibits</h3>
                    <p className="text-sm text-[#666666]">
                      Your personalized tour route awaits. More regret is just a click away.
                    </p>
                    <button
                      onClick={() => router.push('/exhibits')}
                      className="mt-2 text-[#0066CC] underline"
                    >
                      Browse Exhibits →
                    </button>
                  </div>
                  
                  <div 
                    className="p-4 bg-white border-2 border-[#808080]"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    <span className="text-3xl">🔄</span>
                    <h3 className="text-lg font-bold mt-2">Take the Tour Again</h3>
                    <p className="text-sm text-[#666666]">
                      Make different choices. Get the same result. It's the circle of regret.
                    </p>
                    <button
                      onClick={() => {
                        sessionStorage.removeItem('tourResults');
                        router.push('/tour');
                      }}
                      className="mt-2 text-[#0066CC] underline"
                    >
                      Restart Tour →
                    </button>
                  </div>
                  
                  <div 
                    className="p-4 bg-white border-2 border-[#808080]"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    <span className="text-3xl">⚙️</span>
                    <h3 className="text-lg font-bold mt-2">Adjust Settings</h3>
                    <p className="text-sm text-[#666666]">
                      Change things that don't matter. Feel a sense of control.
                    </p>
                    <button
                      onClick={() => router.push('/settings')}
                      className="mt-2 text-[#0066CC] underline"
                    >
                      Open Settings →
                    </button>
                  </div>
                  
                  <div 
                    className="p-4 bg-white border-2 border-[#808080]"
                    style={{ fontFamily: "'Comic Neue', cursive" }}
                  >
                    <span className="text-3xl">❓</span>
                    <h3 className="text-lg font-bold mt-2">Get Help</h3>
                    <p className="text-sm text-[#666666]">
                      You won't find answers, but you'll find more questions.
                    </p>
                    <button
                      onClick={() => router.push('/help')}
                      className="mt-2 text-[#0066CC] underline"
                    >
                      Visit Help →
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section - Made Up Numbers */}
            <section 
              className="p-4 md:p-8 bg-[#8B4513] text-[#F5F5DC]"
              style={{ fontFamily: "'VT323', monospace" }}
            >
              <div className="max-w-2xl mx-auto text-center">
                <h2 
                  className="text-xl mb-4"
                  style={{ fontFamily: "'Bangers', cursive" }}
                >
                  📊 YOUR TOUR STATISTICS (100% ACCURATE*)
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-[#A0522D]">
                    <div className="text-2xl font-bold">{Math.floor(Math.random() * 60) + 30}s</div>
                    <div className="text-xs">Time Wasted</div>
                  </div>
                  <div className="p-3 bg-[#A0522D]">
                    <div className="text-2xl font-bold">{Math.floor(Math.random() * 50) + 10}</div>
                    <div className="text-xs">Clicks Made</div>
                  </div>
                  <div className="p-3 bg-[#A0522D]">
                    <div className="text-2xl font-bold">{Math.floor(Math.random() * 5) + 1}</div>
                    <div className="text-xs">Errors Ignored</div>
                  </div>
                  <div className="p-3 bg-[#A0522D]">
                    <div className="text-2xl font-bold">{Math.floor(Math.random() * 100)}%</div>
                    <div className="text-xs">Regret Level</div>
                  </div>
                </div>
                
                <p className="text-[8px] text-[#999999] mt-4">
                  *Statistics are completely made up and have no basis in reality. 
                  We just wanted to show you some numbers.
                </p>
              </div>
            </section>

            {results.runStats && (
              <section className="p-4 md:p-8 bg-[#FFFF99] border-y-4 border-dotted border-[#8B4513]">
                <div className="max-w-3xl mx-auto">
                  <h2
                    className="text-2xl text-center mb-4"
                    style={{ fontFamily: "'Bangers', cursive", color: '#8B4513' }}
                  >
                    🧪 SURVIVAL DIAGNOSTICS
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-white border border-[#808080]">
                      <div className="text-xl font-bold">{results.runStats.strikes}</div>
                      <div className="text-xs">Strikes</div>
                    </div>
                    <div className="p-3 bg-white border border-[#808080]">
                      <div className="text-xl font-bold">{results.runStats.instability}</div>
                      <div className="text-xs">Instability</div>
                    </div>
                    <div className="p-3 bg-white border border-[#808080]">
                      <div className="text-xl font-bold">{results.runStats.suspicion}</div>
                      <div className="text-xs">Suspicion</div>
                    </div>
                    <div className="p-3 bg-white border border-[#808080]">
                      <div className="text-xl font-bold">{results.runStats.attempts}</div>
                      <div className="text-xs">Total Attempts</div>
                    </div>
                  </div>
                  <p className="text-center text-xs mt-3" style={{ fontFamily: "'VT323', monospace" }}>
                    Duration survived: {Math.max(1, Math.round(results.runStats.durationMs / 1000))}s | Hard regressions: {results.runStats.hardRegressions} | Recovery tokens left: {results.runStats.recoveryTokensLeft}
                  </p>
                  {results.runStats.interactionState && (
                    <p className="text-center text-xs mt-1" style={{ fontFamily: "'VT323', monospace" }}>
                      Cursor offset peak: {results.runStats.interactionState.cursorHotspotOffset}px | Drag resistance: {results.runStats.interactionState.dragResistance.toFixed(2)}x | Chrome noise: {Math.round(results.runStats.interactionState.chromeNoiseLevel * 100)}%
                    </p>
                  )}
                  {results.runStats.cursorMetrics && (
                    <p className="text-center text-xs mt-1" style={{ fontFamily: "'VT323', monospace" }}>
                      Cursor swaps: {results.runStats.cursorMetrics.personaSwaps} | Desync bursts: {results.runStats.cursorMetrics.desyncTriggers} | Ghost bursts: {results.runStats.cursorMetrics.ghostBursts}
                    </p>
                  )}
                  {results.runStats.loadingMetrics && (
                    <p className="text-center text-xs mt-1" style={{ fontFamily: "'VT323', monospace" }}>
                      Labyrinth loops: {results.runStats.loadingMetrics.loops} | Regressions: {results.runStats.loadingMetrics.regressions} | False 100%s: {results.runStats.loadingMetrics.falseCompletes} | Bypass tokens: {results.runStats.loadingMetrics.bypassTokens}
                    </p>
                  )}
                  {results.runStats.skinMetrics && (
                    <p className="text-center text-xs mt-1" style={{ fontFamily: "'VT323', monospace" }}>
                      Skin mutations survived: {results.runStats.skinMetrics.mutations}
                    </p>
                  )}
                  {results.runStats.minigameMetrics && (
                    <p className="text-center text-xs mt-1" style={{ fontFamily: "'VT323', monospace" }}>
                      Minigame interruptions: {results.runStats.minigameMetrics.interruptions} | Required games cleared: {Object.values(results.runStats.minigameMetrics.stats).filter(item => item.passed).length}/3
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Leaderboard (Fake) */}
            <section className="p-4 md:p-8 bg-[#F5F5DC]">
              <div className="max-w-md mx-auto">
                <h2 
                  className="text-xl text-center mb-4"
                  style={{ fontFamily: "'Bangers', cursive", color: '#8B4513' }}
                >
                  🏅 GLOBAL LEADERBOARD
                </h2>
                
                <div 
                  className="border-2 border-[#808080]"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  <div className="grid grid-cols-4 gap-2 p-2 bg-[#E6E6FA] font-bold text-sm">
                    <span>RANK</span>
                    <span>NAME</span>
                    <span>SCORE</span>
                    <span>DATE</span>
                  </div>
                  
                  {[
                    { rank: 1, name: 'RegretMaster2000', score: 9847, date: '02/14/26' },
                    { rank: 2, name: 'BadChoiceBobby', score: 9523, date: '02/13/26' },
                    { rank: 3, name: 'QuestionableQuinn', score: 9102, date: '02/12/26' },
                    { rank: 4, name: 'Your Name Here', score: results.score, date: '02/16/26', isYou: true },
                    { rank: 5, name: 'DecisionDebby', score: 8756, date: '02/11/26' },
                  ].map((entry) => (
                    <div 
                      key={entry.rank}
                      className={`
                        grid grid-cols-4 gap-2 p-2 text-sm
                        ${entry.isYou ? 'bg-[#FFFF99] font-bold' : 'bg-white'}
                        ${entry.rank % 2 === 0 ? 'bg-[#F5F5F5]' : ''}
                      `}
                    >
                      <span>
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                        {entry.rank > 3 && `#${entry.rank}`}
                      </span>
                      <span className={entry.isYou ? 'text-[#FF0000]' : ''}>
                        {entry.isYou ? '👉 ' : ''}{entry.name}
                      </span>
                      <span>{entry.score.toLocaleString()}</span>
                      <span className="text-[#999999]">{entry.date}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-center text-[#999999] mt-2">
                  You are ranked #4 out of 8,472,910 visitors (today)
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="disclaimer p-4 text-center">
              <p>
                This certificate is non-transferable, non-refundable, and has no cash value.
                The Museum of Bad Decisions is not responsible for any feelings of pride or 
                shame resulting from this certificate. Your score has been recorded in our 
                permanent records and will follow you forever. Badge rarity is determined by 
                an algorithm that we don't understand either. By viewing this certificate, 
                you agree to tell at least one person about the Museum of Bad Decisions.
              </p>
            </div>
          </main>
        </div>
        <FooterNav />
        <FloatingWidget />
      </div>
    </PopupManager>
  );
}
