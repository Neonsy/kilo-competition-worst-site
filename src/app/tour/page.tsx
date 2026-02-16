
'use client';

import { Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopNav, SideNav, FooterNav, FloatingWidget } from '@/components/Navigation';
import { PopupManager } from '@/components/Popups';
import { HellButton, ProgressButton } from '@/components/HellButton';
import { ProgressBar } from '@/components/ProgressBar';
import { HostileInput, HostileSlider } from '@/components/HostileForm';
import { LivingOverlay } from '@/components/LivingOverlay';
import { getQuestionByNumber, totalQuestions, TourQuestion } from '@/data/questions';
import { getRandomLoadingMessage, getRandomValidationMessage } from '@/data/validations';
import { getRandomDisclaimer } from '@/data/disclaimers';
import { getRandomExhibits, calculateRegretScore } from '@/data/exhibits';
import { getBadgeByScore } from '@/data/badges';
import { getPhaseByStep, scheduleTourEvent, TourEvent } from '@/data/tourEvents';

type TourAnswerValue = string | number | boolean | string[] | IntegrityAnswer;

interface IntegrityAnswer {
  checksum?: string;
  pin?: string;
  oath?: boolean;
}

interface TourAnswers {
  [key: string]: TourAnswerValue;
}

interface TourRunState {
  step: number;
  strikes: number;
  debuffs: { inputCorruption: boolean; uiFreezeUntil: number };
  lockouts: { nextUntil: number };
  instability: number;
  suspicion: number;
  recoveryTokens: number;
  eventSeed: number;
  startedAt: number;
  attempts: Record<number, number>;
  lastEventAt: number;
  hardRegressions: number;
  phaseStats: Record<1 | 2 | 3, { attempts: number; events: number; regressions: number }>;
}

type TourAction =
  | { type: 'RESET'; seed: number; startedAt: number }
  | { type: 'RECORD_ATTEMPT'; step: number; phase: 1 | 2 | 3 }
  | { type: 'ADVANCE'; maxStep: number }
  | { type: 'REGRESS'; phase: 1 | 2 | 3 }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_LOCKOUT'; until: number }
  | { type: 'CLEAR_INPUT_CORRUPTION' }
  | { type: 'CONSUME_RECOVERY' }
  | { type: 'APPLY_EVENT'; event: TourEvent; phase: 1 | 2 | 3; now: number; lockoutMs: number; freezeMs: number };

const MAX_HARD_REGRESSIONS = 3;
const PITY_PASS_TRIGGER = 4;
const CATASTROPHIC_COOLDOWN_MS = 12000;
const ESCALATION_MODEL: Record<1 | 2 | 3, { eventChance: number; regressionChance: number; lockoutRange: [number, number] }> = {
  1: { eventChance: 0.18, regressionChance: 0.08, lockoutRange: [800, 1800] },
  2: { eventChance: 0.33, regressionChance: 0.14, lockoutRange: [1500, 3000] },
  3: { eventChance: 0.47, regressionChance: 0.2, lockoutRange: [2200, 4200] },
};

function createInitialRunState(): TourRunState {
  return {
    step: 1,
    strikes: 0,
    debuffs: { inputCorruption: false, uiFreezeUntil: 0 },
    lockouts: { nextUntil: 0 },
    instability: 0,
    suspicion: 0,
    recoveryTokens: 0,
    eventSeed: 91337,
    startedAt: 0,
    attempts: {},
    lastEventAt: 0,
    hardRegressions: 0,
    phaseStats: {
      1: { attempts: 0, events: 0, regressions: 0 },
      2: { attempts: 0, events: 0, regressions: 0 },
      3: { attempts: 0, events: 0, regressions: 0 },
    },
  };
}

function tourReducer(state: TourRunState, action: TourAction): TourRunState {
  switch (action.type) {
    case 'RESET':
      return { ...createInitialRunState(), eventSeed: action.seed, startedAt: action.startedAt };
    case 'RECORD_ATTEMPT': {
      const count = (state.attempts[action.step] || 0) + 1;
      return {
        ...state,
        attempts: { ...state.attempts, [action.step]: count },
        phaseStats: {
          ...state.phaseStats,
          [action.phase]: {
            ...state.phaseStats[action.phase],
            attempts: state.phaseStats[action.phase].attempts + 1,
          },
        },
      };
    }
    case 'ADVANCE':
      return { ...state, step: Math.min(action.maxStep, state.step + 1), instability: Math.max(0, state.instability - 4), suspicion: Math.max(0, state.suspicion - 3) };
    case 'REGRESS': {
      if (state.step <= 1 || state.hardRegressions >= MAX_HARD_REGRESSIONS) {
        return { ...state, strikes: state.strikes + 1 };
      }
      return {
        ...state,
        step: state.step - 1,
        hardRegressions: state.hardRegressions + 1,
        phaseStats: {
          ...state.phaseStats,
          [action.phase]: {
            ...state.phaseStats[action.phase],
            regressions: state.phaseStats[action.phase].regressions + 1,
          },
        },
      };
    }
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_LOCKOUT':
      return { ...state, lockouts: { ...state.lockouts, nextUntil: Math.max(state.lockouts.nextUntil, action.until) } };
    case 'CLEAR_INPUT_CORRUPTION':
      return { ...state, debuffs: { ...state.debuffs, inputCorruption: false } };
    case 'CONSUME_RECOVERY':
      return {
        ...state,
        recoveryTokens: Math.max(0, state.recoveryTokens - 1),
        strikes: Math.max(0, state.strikes - 1),
        instability: Math.max(0, state.instability - 8),
        suspicion: Math.max(0, state.suspicion - 8),
      };
    case 'APPLY_EVENT': {
      const next = {
        ...state,
        lastEventAt: action.now,
        phaseStats: {
          ...state.phaseStats,
          [action.phase]: {
            ...state.phaseStats[action.phase],
            events: state.phaseStats[action.phase].events + 1,
          },
        },
      };
      switch (action.event.effect) {
        case 'strike':
          next.strikes += 1;
          break;
        case 'regress':
          if (next.step > 1 && next.hardRegressions < MAX_HARD_REGRESSIONS) {
            next.step -= 1;
            next.hardRegressions += 1;
            next.phaseStats[action.phase].regressions += 1;
          } else {
            next.strikes += 1;
          }
          break;
        case 'lockout':
          next.lockouts.nextUntil = Math.max(next.lockouts.nextUntil, action.now + action.lockoutMs);
          break;
        case 'freeze':
          next.debuffs.uiFreezeUntil = Math.max(next.debuffs.uiFreezeUntil, action.now + action.freezeMs);
          break;
        case 'instability':
          next.instability = Math.min(100, next.instability + 13);
          break;
        case 'suspicion':
          next.suspicion = Math.min(100, next.suspicion + 12);
          break;
        case 'grant-recovery':
          next.recoveryTokens = Math.min(3, next.recoveryTokens + 1);
          break;
        case 'input-corrupt':
          next.debuffs.inputCorruption = true;
          break;
      }
      return next;
    }
    default:
      return state;
  }
}

function isBlank(value: TourAnswerValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function scrambleText(value: string): string {
  if (value.length < 2) return value;
  const chars = value.split('');
  chars[Math.floor(Math.random() * chars.length)] = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  return chars.join('');
}

function asStringArray(value: TourAnswerValue | undefined): string[] {
  return Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];
}

function asIntegrity(value: TourAnswerValue | undefined): IntegrityAnswer {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as IntegrityAnswer;
  return {};
}

function TourContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [runState, dispatch] = useReducer(tourReducer, undefined, createInitialRunState);
  const [answers, setAnswers] = useState<TourAnswers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backClicks, setBackClicks] = useState(0);
  const [started, setStarted] = useState(false);
  const [disclaimer, setDisclaimer] = useState(getRandomDisclaimer());
  const [nowTick, setNowTick] = useState(Date.now());
  const [feed, setFeed] = useState<string[]>(['Hostility engine armed.', 'Route entropy rising.']);

  const exhibitParam = searchParams.get('exhibit');
  const currentQuestion = getQuestionByNumber(runState.step);
  const phase = getPhaseByStep(runState.step);
  const attemptsOnCurrentStep = runState.attempts[runState.step] || 0;
  const pityPass = attemptsOnCurrentStep >= PITY_PASS_TRIGGER;

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      const lines = ['Signal noise increased.', 'UI friction is now policy-compliant.', 'Retry budget unchanged.', 'Exit remains decorative.'];
      if (Math.random() > 0.45) setFeed(prev => [lines[Math.floor(Math.random() * lines.length)], ...prev].slice(0, 8));
    }, 5200);
    return () => clearInterval(timer);
  }, [started]);

  const pushFeed = useCallback((line: string) => {
    setFeed(prev => [line, ...prev].slice(0, 8));
  }, []);

  const seeded = useCallback(
    (salt: number, attemptBoost = 0) => {
      const attempt = (runState.attempts[runState.step] || 0) + attemptBoost;
      const value = Math.sin(runState.eventSeed + runState.step * 97 + runState.strikes * 29 + attempt * 53 + salt * 17) * 10000;
      return value - Math.floor(value);
    },
    [runState.attempts, runState.eventSeed, runState.step, runState.strikes]
  );
  const startTour = () => {
    const seed = Math.floor(Math.random() * 999999);
    setStarted(true);
    setAnswers({});
    setError(null);
    setFeed([`Session started with seed ${seed}.`, exhibitParam ? `Prefetch hint: ${exhibitParam}` : 'No prefetch hint.']);
    dispatch({ type: 'RESET', seed, startedAt: Date.now() });
  };

  const applyEvent = useCallback(
    (event: TourEvent, eventPhase: 1 | 2 | 3, mercy: boolean, attemptBoost = 0): boolean => {
      if (mercy && (event.effect === 'regress' || event.effect === 'lockout' || event.effect === 'freeze')) {
        pushFeed(`Mercy protocol blocked ${event.id}.`);
        return false;
      }
      const [minLock, maxLock] = ESCALATION_MODEL[eventPhase].lockoutRange;
      const lockoutMs = minLock + Math.floor(seeded(31, attemptBoost) * (maxLock - minLock));
      const freezeMs = Math.floor(lockoutMs * 0.7);

      dispatch({ type: 'APPLY_EVENT', event, phase: eventPhase, now: Date.now(), lockoutMs, freezeMs });
      pushFeed(`Event: ${event.copy}`);
      if (event.effect === 'regress' || event.effect === 'lockout' || event.effect === 'freeze') {
        setError(event.copy);
        return true;
      }
      if (event.effect === 'strike') setError(event.copy);
      return false;
    },
    [pushFeed, seeded]
  );

  const handleAnswer = (questionId: string, value: TourAnswerValue) => {
    let nextValue = value;
    if (runState.debuffs.inputCorruption && typeof value === 'string' && value.length > 0 && Math.random() > 0.35) {
      nextValue = scrambleText(value);
      pushFeed('Input corruption altered your latest value.');
      dispatch({ type: 'CLEAR_INPUT_CORRUPTION' });
    }
    setAnswers(prev => ({ ...prev, [questionId]: nextValue }));
    setError(null);
  };

  const validateStep = (question: TourQuestion, mercy: boolean): boolean => {
    const answer = answers[question.id];
    const randomFailChance = Math.min(0.08 + question.difficultyWeight * 0.07 + runState.instability * 0.002 + (question.phase - 1) * 0.05, 0.62);

    if (!mercy && Math.random() < randomFailChance) {
      setError(getRandomValidationMessage());
      return false;
    }

    if (question.validation?.required && isBlank(answer)) {
      setError('This field is required and emotionally mandatory.');
      return false;
    }

    if (question.id === 'contradiction-matrix') {
      const selected = asStringArray(answer);
      if (selected.length < (question.validation?.minSelections || 2)) {
        setError(question.validation?.customMessage || 'Select more contradictions.');
        return false;
      }
    }

    if (question.id === 'memory-trap') {
      const expected = String(answers['hated-sound'] || '').trim().toLowerCase();
      const given = String(answer || '').trim().toLowerCase();
      if (!expected || given !== expected) {
        setError('Memory mismatch. Re-enter the exact sound code from Step 3.');
        return false;
      }
    }

    if (question.id === 'useless-data' && typeof answer === 'string') {
      if (answer.toLowerCase().includes('john') || answer.toLowerCase().includes('jane')) {
        setError('Your name is too normal. Please enter a more interesting name.');
        return false;
      }
    }

    if (question.id === 'timelock-confirm') {
      const gateOpen = nowTick % 7000 < 1800;
      if (!gateOpen) {
        dispatch({ type: 'SET_LOCKOUT', until: Date.now() + 1400 });
        setError('Time-lock gate is CLOSED. Wait for OPEN status.');
        return false;
      }
    }

    if (question.id === 'integrity-check') {
      const integrity = asIntegrity(answer);
      const checksum = String(integrity.checksum || '');
      const pin = String(integrity.pin || '');
      const expectedPin = String((runState.step + runState.strikes + attemptsOnCurrentStep) % 10);
      if (checksum.length < 3 || !/\d/.test(checksum)) {
        setError('Checksum must be at least 3 chars and include a number.');
        return false;
      }
      if (pin !== expectedPin) {
        setError(`PIN mismatch. Hint: ${expectedPin}.`);
        return false;
      }
      if (!integrity.oath) {
        setError('Integrity oath must be checked before proceeding.');
        return false;
      }
    }

    return true;
  };

  const handleBack = useCallback(() => {
    const now = Date.now();
    if (now < runState.lockouts.nextUntil) {
      setError('Back action blocked during lockout.');
      return;
    }

    setBackClicks(prev => prev + 1);
    if (runState.step <= 1) return;

    if (backClicks % 4 === 3) {
      dispatch({ type: 'SET_STEP', step: Math.max(1, runState.step - 1) });
      pushFeed('Back action accepted. You moved backward.');
    } else if (phase === 3 && backClicks % 3 === 1) {
      dispatch({ type: 'SET_STEP', step: Math.min(totalQuestions, runState.step + 1) });
      pushFeed('Back action rerouted forward by phase policy.');
    } else {
      setError('Back button currently unavailable.');
    }
  }, [backClicks, phase, pushFeed, runState.lockouts.nextUntil, runState.step]);

  const completeTour = () => {
    const exhibitIds = getRandomExhibits(4).map(e => e.id);
    const score = calculateRegretScore(exhibitIds);
    const badge = getBadgeByScore(score);
    const totalAttempts = Object.values(runState.attempts).reduce((sum, count) => sum + count, 0);

    const results = {
      answers,
      score,
      badge,
      exhibitIds,
      calculationBreakdown: {
        base: Math.floor(Math.random() * 2000) + 1000,
        doorMultiplier: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        buttonAnxiety: Math.floor(Math.random() * -500) - 100,
        shoeSizeFactor: Math.floor(Math.random() * 500),
        chaosBonus: Math.floor(Math.random() * 1000),
      },
      runStats: {
        strikes: runState.strikes,
        instability: Math.round(runState.instability),
        suspicion: Math.round(runState.suspicion),
        recoveryTokensLeft: runState.recoveryTokens,
        hardRegressions: runState.hardRegressions,
        attempts: totalAttempts,
        durationMs: Math.max(0, Date.now() - runState.startedAt),
        phaseStats: runState.phaseStats,
      },
    };

    sessionStorage.setItem('tourResults', JSON.stringify(results));
    router.push('/certificate');
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    const now = Date.now();

    if (now < runState.lockouts.nextUntil) {
      setError(`Lockout active for ${Math.ceil((runState.lockouts.nextUntil - now) / 1000)}s.`);
      return;
    }
    if (now < runState.debuffs.uiFreezeUntil) {
      setError('UI freeze burst active. Please wait.');
      return;
    }
    if (isLoading) return;

    const attemptCount = (runState.attempts[runState.step] || 0) + 1;
    dispatch({ type: 'RECORD_ATTEMPT', step: runState.step, phase: currentQuestion.phase });
    const mercy = attemptCount >= PITY_PASS_TRIGGER;

    const beforeValidateEvent = scheduleTourEvent({
      phase: currentQuestion.phase,
      trigger: 'before-validate',
      now,
      lastEventAt: runState.lastEventAt,
      catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
      baseChance: ESCALATION_MODEL[currentQuestion.phase].eventChance,
      rng: salt => seeded(salt, 1),
    });
    if (beforeValidateEvent && applyEvent(beforeValidateEvent, currentQuestion.phase, mercy, 1)) return;

    if (!validateStep(currentQuestion, mercy)) {
      if (mercy && runState.recoveryTokens > 0) {
        dispatch({ type: 'CONSUME_RECOVERY' });
        pushFeed('Recovery token consumed after repeated failure.');
      }
      return;
    }

    const afterValidateEvent = scheduleTourEvent({
      phase: currentQuestion.phase,
      trigger: 'after-validate',
      now,
      lastEventAt: runState.lastEventAt,
      catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
      baseChance: ESCALATION_MODEL[currentQuestion.phase].eventChance * 0.85,
      rng: salt => seeded(salt, 2),
    });
    if (afterValidateEvent && applyEvent(afterValidateEvent, currentQuestion.phase, mercy, 2)) return;

    setIsLoading(true);
    setLoadingMessage(getRandomLoadingMessage());
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800));
    setIsLoading(false);

    const beforeTransitionEvent = scheduleTourEvent({
      phase: currentQuestion.phase,
      trigger: 'before-transition',
      now: Date.now(),
      lastEventAt: runState.lastEventAt,
      catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
      baseChance: ESCALATION_MODEL[currentQuestion.phase].eventChance * 0.9,
      rng: salt => seeded(salt, 3),
    });
    if (beforeTransitionEvent && applyEvent(beforeTransitionEvent, currentQuestion.phase, mercy, 3)) return;

    if (!mercy && runState.hardRegressions < MAX_HARD_REGRESSIONS && Math.random() < ESCALATION_MODEL[currentQuestion.phase].regressionChance) {
      dispatch({ type: 'REGRESS', phase: currentQuestion.phase });
      setError('Sequence drift: regression penalty applied.');
      pushFeed('Regression penalty triggered by escalation model.');
      return;
    }

    if (runState.step >= totalQuestions) {
      completeTour();
      return;
    }

    dispatch({ type: 'ADVANCE', maxStep: totalQuestions });
    setDisclaimer(getRandomDisclaimer());
    setError(null);
  };

  const phaseLabel = useMemo(() => {
    if (phase === 1) return 'Phase 1: Orientation Chaos';
    if (phase === 2) return 'Phase 2: Penalty Compounding';
    return 'Phase 3: Maximum Hostility';
  }, [phase]);

  const lockoutMs = Math.max(0, runState.lockouts.nextUntil - nowTick);
  const freezeMs = Math.max(0, runState.debuffs.uiFreezeUntil - nowTick);

  if (!started) {
    return (
      <PopupManager>
        <div className="min-h-screen flex flex-col">
          <TopNav />
          <div className="flex flex-1">
            <SideNav />
            <main className="relative flex-1 overflow-x-hidden">
              <LivingOverlay mode="tour" phase={1} intensity="medium" mobileHostile />
              <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-lg w-full p-8 bg-[#F5F5DC] border-8 border-double border-[#8B4513] shadow-chaos relative z-10" style={{ fontFamily: "'Comic Neue', cursive" }}>
                  <div className="text-center">
                    <span className="text-6xl animate-bounce-chaotic inline-block">🎫</span>
                    <h1 className="text-3xl mt-4 mb-2 animate-rainbow" style={{ fontFamily: "'Bangers', cursive" }}>EXHIBIT TOUR WIZARD</h1>
                    <p className="text-lg mb-4" style={{ fontFamily: "'Times New Roman', serif" }}>
                      Prepare yourself for an <span style={{ fontFamily: "'Rock Salt', cursive", color: '#FF0000' }}>EXPERIENCE</span> that is longer, meaner, and structurally unfair.
                    </p>
                    <div className="text-left p-4 bg-[#FFFF99] border-2 border-dashed border-[#808080] mb-4" style={{ fontFamily: "'VT323', monospace" }}>
                      <p className="font-bold mb-2">📋 TOUR DETAILS:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Duration: 12 hostile steps</li>
                        <li>• Escalation: 3 phases</li>
                        <li>• Difficulty: Brutal but beatable</li>
                        <li>• Recovery: Rare pity tokens</li>
                        <li>• Exit: Conditionally available</li>
                      </ul>
                    </div>
                    <p className="text-xs text-[#999999] mb-4">{disclaimer}</p>
                    {exhibitParam && <p className="text-xs text-[#8B4513] mb-4" style={{ fontFamily: "'VT323', monospace" }}>Prefetch hint: {exhibitParam}</p>}
                    <div className="flex gap-4 justify-center">
                      <HellButton variant="glossy" label="BEGIN TOUR" onClick={startTour} size="large" />
                      <HellButton variant="link" label="Maybe later (coward)" onClick={() => router.push('/')} size="small" />
                    </div>
                  </div>
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

  return (
    <PopupManager>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <div className="flex flex-1">
          <SideNav />
          <main className="relative flex-1 overflow-x-hidden">
            <LivingOverlay mode="tour" phase={phase} intensity={phase === 3 ? 'high' : phase === 2 ? 'medium' : 'low'} mobileHostile eventPulse={runState.strikes + runState.instability + runState.suspicion} />
            <div className="relative z-10 p-4 md:p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
              <section>
                <ProgressBar currentStep={runState.step} totalSteps={totalQuestions} phase={phase} strikes={runState.strikes} instability={runState.instability} suspicion={runState.suspicion} lockoutMs={lockoutMs} />
                {currentQuestion && (
                  <QuestionCard
                    question={currentQuestion}
                    answer={answers[currentQuestion.id]}
                    onAnswer={value => handleAnswer(currentQuestion.id, value)}
                    error={error}
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                    disclaimer={disclaimer}
                    gateOpen={nowTick % 7000 < 1800}
                    expectedPin={String((runState.step + runState.strikes + attemptsOnCurrentStep) % 10)}
                  />
                )}

                <div className="flex justify-between items-center mt-6">
                  <HellButton variant="win95" label={`← Back (click ${4 - (backClicks % 4)} more times)`} onClick={handleBack} size="small" />
                  <div className="flex gap-2">
                    <HellButton
                      variant="link"
                      label="Skip (invalid)"
                      onClick={() => {
                        dispatch({ type: 'SET_LOCKOUT', until: Date.now() + 1200 });
                        setError('Skipping is not permitted. Lockout applied.');
                      }}
                      size="small"
                    />
                    <ProgressButton label={runState.step >= totalQuestions ? 'Complete Tour →' : 'Next →'} onClick={handleNext} />
                  </div>
                </div>

                {(lockoutMs > 0 || freezeMs > 0) && (
                  <div className="mt-3 p-2 text-xs bg-[#FFFF99] border-2 border-dashed border-[#FF0000] text-[#8B4513]" style={{ fontFamily: "'VT323', monospace" }}>
                    {lockoutMs > 0 && <p>Lockout active: {Math.ceil(lockoutMs / 1000)}s remaining.</p>}
                    {freezeMs > 0 && <p>Freeze burst active: {Math.ceil(freezeMs / 1000)}s remaining.</p>}
                  </div>
                )}
              </section>

              <aside className="mobile-hostile-panel space-y-3">
                <div className="p-3 bg-[#FFFF99] border-2 border-[#8B4513] shadow-ugly">
                  <p className="text-xs font-bold" style={{ fontFamily: "'Bangers', cursive" }}>{phaseLabel}</p>
                  <p className="text-[11px] mt-1" style={{ fontFamily: "'VT323', monospace" }}>Attempts on current step: {attemptsOnCurrentStep}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Pity pass: {pityPass ? 'ACTIVE' : `at ${PITY_PASS_TRIGGER} attempts`}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Recovery tokens: {runState.recoveryTokens}</p>
                </div>

                <div className="p-3 bg-[#E6E6FA] border-2 border-dashed border-[#808080]">
                  <p className="text-xs font-bold mb-2" style={{ fontFamily: "'Bangers', cursive" }}>INCIDENT FEED</p>
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {feed.map((line, index) => (
                      <p key={`${line}-${index}`} className="text-[10px] leading-tight" style={{ fontFamily: "'VT323', monospace" }}>• {line}</p>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#F5F5DC] border-2 border-[#FF69B4]">
                  <p className="text-xs font-bold mb-1" style={{ fontFamily: "'Bangers', cursive" }}>PHASE METRICS</p>
                  {[1, 2, 3].map(raw => {
                    const phaseKey = raw as 1 | 2 | 3;
                    const stats = runState.phaseStats[phaseKey];
                    return <p key={phaseKey} className="text-[10px]" style={{ fontFamily: "'VT323', monospace" }}>P{phaseKey}: attempts {stats.attempts} | events {stats.events} | regressions {stats.regressions}</p>;
                  })}
                </div>
              </aside>
            </div>
          </main>
        </div>
        <FooterNav />
        <FloatingWidget />
      </div>
    </PopupManager>
  );
}

export default function TourPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]"><div className="text-center p-8" style={{ fontFamily: "'Comic Neue', cursive" }}><span className="text-6xl animate-bounce-chaotic inline-block">🎫</span><p className="mt-4 text-xl animate-blink">Loading 12-step hostility engine...</p><div className="progress-lie mt-4 w-48 mx-auto"><div className="progress-lie-fill" style={{ width: '97%' }} /><div className="progress-lie-text">97%</div></div></div></div>}>
      <TourContent />
    </Suspense>
  );
}

function QuestionCard({
  question,
  answer,
  onAnswer,
  error,
  isLoading,
  loadingMessage,
  disclaimer,
  gateOpen,
  expectedPin,
}: {
  question: TourQuestion;
  answer: TourAnswerValue | undefined;
  onAnswer: (value: TourAnswerValue) => void;
  error: string | null;
  isLoading: boolean;
  loadingMessage: string;
  disclaimer: string;
  gateOpen: boolean;
  expectedPin: string;
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const styles = [
    { bg: 'bg-[#E6E6FA]', border: 'border-4 border-double border-[#808080]' },
    { bg: 'bg-[#FFFF99]', border: 'border-4 border-dotted border-[#FF69B4]' },
    { bg: 'bg-[#F5F5DC]', border: 'border-4 border-solid border-[#8B4513]' },
    { bg: 'bg-[#C0C0C0]', border: 'border-4 border-outset' },
  ];
  const style = styles[question.questionNumber % styles.length];

  return (
    <div className={`${style.bg} ${style.border} p-6 shadow-ugly relative`} style={{ transform: `rotate(${(Math.random() - 0.5) * 2}deg)` }}>
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF69B4] rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse" style={{ fontFamily: "'Bangers', cursive" }}>#{question.questionNumber}</div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-[#FFFF99] p-6 border-4 border-double border-[#8B4513]" style={{ fontFamily: "'VT323', monospace" }}>
            <p className="text-lg animate-blink">{loadingMessage}</p>
            <div className="progress-lie mt-2 w-48 h-4"><div className="progress-lie-fill" style={{ width: `${Math.random() * 100}%` }} /></div>
          </div>
        </div>
      )}

      <h2 className="text-2xl md:text-3xl mb-2 text-center" style={{ fontFamily: "'Bangers', cursive", color: '#8B4513', textShadow: '2px 2px 0 #FFFF99' }}>{question.title}</h2>
      <p className="text-center mb-6" style={{ fontFamily: "'Comic Neue', cursive", fontStyle: 'italic' }}>{question.subtitle}</p>

      <div className="mb-4">{renderQuestionContent(question, answer, onAnswer, gateOpen, expectedPin)}</div>

      {error && <div className="p-3 bg-[#FFE4E1] border-2 border-[#FF0000] text-[#FF0000] animate-shake" style={{ fontFamily: "'Comic Neue', cursive" }}>⚠️ {error}</div>}

      <div className="mt-4 text-sm text-[#666666] relative" style={{ fontFamily: "'VT323', monospace" }}>
        <button onMouseEnter={() => setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)} className="text-[#0066CC] underline">💡 Need help?</button>
        {tooltipVisible && (
          <div className="tooltip-evil absolute left-0 top-full mt-2" style={{ zIndex: 100 }}>
            <p className="font-bold mb-1" style={{ fontFamily: "'Bangers', cursive" }}>HELP IS HERE!</p>
            <p>{question.helpText}</p>
            <p className="text-[8px] text-[#999999] mt-2">(This tooltip may be covering important information)</p>
          </div>
        )}
      </div>

      {question.disclaimer && <p className="disclaimer mt-4" style={{ fontFamily: "'VT323', monospace" }}>{question.disclaimer}</p>}
      <p className="text-[10px] mt-2 text-[#8B4513]" style={{ fontFamily: "'VT323', monospace" }}>Live disclaimer: {disclaimer}</p>
    </div>
  );
}
function renderQuestionContent(
  question: TourQuestion,
  answer: TourAnswerValue | undefined,
  onAnswer: (value: TourAnswerValue) => void,
  gateOpen: boolean,
  expectedPin: string
) {
  if (question.type === 'slider') {
    return <HostileSlider label="How confident are you right now?" value={(answer as number) || 97} onChange={onAnswer} />;
  }

  if (question.type === 'input' || question.type === 'memory') {
    return (
      <HostileInput
        name={question.id}
        label={question.id === 'memory-trap' ? 'Recall Code' : 'Your Name'}
        placeholder={question.placeholder || "Enter a value that won't be rejected..."}
        required={question.validation?.required}
        value={(answer as string) || ''}
        onChange={onAnswer}
      />
    );
  }

  if (question.type === 'matrix') {
    const selected = asStringArray(answer);
    return (
      <div className="space-y-2">
        {question.options?.map((option, index) => {
          const checked = selected.includes(option.value);
          return (
            <label key={option.id} className={`flex items-center gap-3 p-3 cursor-pointer border-2 ${checked ? 'bg-[#39FF14] border-[#8B4513]' : 'bg-white border-[#808080]'}`} style={{ fontFamily: "'Comic Neue', cursive", transform: `rotate(${(index % 3 - 1) * 1.2}deg)` }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => (checked ? onAnswer(selected.filter(v => v !== option.value)) : onAnswer([...selected, option.value]))}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === 'timelock') {
    return (
      <div className="space-y-3">
        <div className={`p-3 border-2 ${gateOpen ? 'bg-[#39FF14] border-[#8B4513]' : 'bg-[#FFE4E1] border-[#FF0000] animate-blink-fast'}`} style={{ fontFamily: "'VT323', monospace" }}>
          Gate status: {gateOpen ? 'OPEN' : 'CLOSED'}
        </div>
        {question.options?.map(option => (
          <button key={option.id} onClick={() => onAnswer(option.value)} className={`w-full p-3 text-left border-2 transition-all ${answer === option.value ? 'bg-[#E6E6FA] border-[#8B4513]' : 'bg-white border-[#808080]'}`} style={{ fontFamily: "'Comic Neue', cursive" }}>
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'integrity') {
    const integrity = asIntegrity(answer);
    return (
      <div className="space-y-3">
        <div className="p-3 bg-[#FFFF99] border-2 border-dashed border-[#8B4513] text-xs" style={{ fontFamily: "'VT323', monospace" }}>PIN hint: <strong>{expectedPin}</strong></div>
        <input type="text" value={integrity.checksum || ''} onChange={e => onAnswer({ ...integrity, checksum: e.target.value })} placeholder="Checksum (needs a number)" className="w-full px-3 py-2 border-2 border-[#808080]" style={{ fontFamily: "'Courier New', monospace" }} />
        <input type="text" value={integrity.pin || ''} onChange={e => onAnswer({ ...integrity, pin: e.target.value })} placeholder="PIN" className="w-full px-3 py-2 border-2 border-[#808080]" style={{ fontFamily: "'Courier New', monospace" }} />
        <label className="flex items-center gap-2" style={{ fontFamily: "'Comic Neue', cursive" }}>
          <input type="checkbox" checked={Boolean(integrity.oath)} onChange={e => onAnswer({ ...integrity, oath: e.target.checked })} />
          I solemnly swear my checksum is emotionally honest.
        </label>
      </div>
    );
  }

  if (question.type === 'door') {
    return (
      <div className="grid grid-cols-3 gap-4">
        {question.options?.map((option, index) => (
          <button key={option.id} onClick={() => onAnswer(option.value)} className={`p-6 text-center transition-all ${answer === option.value ? 'bg-[#39FF14] border-4 border-[#8B4513] scale-110' : 'bg-[#E6E6FA] border-2 border-[#808080]'} hover:scale-105`} style={{ fontFamily: "'Bangers', cursive", fontSize: '24px', transform: `rotate(${(index - 1) * 5}deg)` }}>
            <div className="text-4xl mb-2">🚪</div>
            <div className="text-sm">{option.label.replace('🚪 ', '')}</div>
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'button') {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        {question.options?.map((option, index) => (
          <button key={option.id} onClick={() => onAnswer(option.value)} className={`px-6 py-3 transition-all ${answer === option.value ? 'ring-4 ring-[#FF0000]' : ''}`} style={{ background: ['#FF0000', '#39FF14', '#00FFFF', '#FFFF00', '#FF69B4'][index % 5], color: index === 1 || index === 3 ? '#8B4513' : 'white', fontFamily: ['Bangers', 'Comic Neue', 'VT323', 'Press Start 2P', 'Arial Black'][index % 5], border: `${index + 2}px ${['solid', 'dashed', 'dotted', 'double'][index % 4]} #000`, transform: `rotate(${(Math.random() - 0.5) * 10}deg)` }}>
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === 'sound' || question.type === 'radio' || question.type === 'confirm') {
    return (
      <div className="space-y-2">
        {question.options?.map((option, index) => (
          <label key={option.id} className={`flex items-center gap-3 p-3 cursor-pointer ${index % 2 === 0 ? 'bg-[#F5F5DC]' : 'bg-white'} border border-[#808080] ${answer === option.value ? 'border-l-4 border-l-[#FF69B4]' : ''}`} style={{ fontFamily: "'Comic Neue', cursive" }}>
            <input type="radio" name={question.id} value={option.value} checked={answer === option.value} onChange={() => onAnswer(option.value)} className="w-4 h-4" />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'color') {
    return (
      <div className="flex flex-wrap gap-4 justify-center">
        {question.options?.map(option => {
          const colors: Record<string, string> = { blue: '#0000FF', green: '#00FF00', red: '#FF0000', yellow: '#FFFF00', purple: '#800080' };
          const actualColor = colors[option.value] || '#808080';
          return (
            <button key={option.id} onClick={() => onAnswer(option.value)} className={`w-16 h-16 rounded-full border-4 transition-all ${answer === option.value ? 'scale-125 ring-4 ring-[#FF69B4]' : ''}`} style={{ backgroundColor: actualColor, borderColor: answer === option.value ? '#FF69B4' : '#808080' }}>
              <span className="text-xs" style={{ fontFamily: "'VT323', monospace", color: actualColor === '#FFFF00' ? '#000' : '#FFF' }}>{option.label.split('(')[1]?.replace(')', '') || option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return <p>Unknown question type</p>;
}
