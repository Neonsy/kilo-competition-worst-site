
'use client';

import { Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopNav, SideNav, FooterNav, FloatingWidget } from '@/components/Navigation';
import { PopupManager } from '@/components/Popups';
import { HellButton } from '@/components/HellButton';
import { ProgressBar } from '@/components/ProgressBar';
import { HostileInput, HostileSlider } from '@/components/HostileForm';
import { LivingOverlay } from '@/components/LivingOverlay';
import { TargetedCursorLayer } from '@/components/TargetedCursorLayer';
import { CursorCorruptionLayer } from '@/components/CursorCorruptionLayer';
import { FakeBrowserChrome } from '@/components/FakeBrowserChrome';
import { FocusSaboteur } from '@/components/FocusSaboteur';
import { ClipboardSaboteur } from '@/components/ClipboardSaboteur';
import { DragFrictionField } from '@/components/DragFrictionField';
import ResonanceFractureLayer from '@/components/ResonanceFractureLayer';
import ResonancePulseLayer from '@/components/ResonancePulseLayer';
import UIFragmentDebris from '@/components/UIFragmentDebris';
import SignalNoiseVeil from '@/components/SignalNoiseVeil';
import ResonanceShellCorruptor from '@/components/ResonanceShellCorruptor';
import { LoadingLabyrinthButton, LoadingLabyrinthMetrics } from '@/components/LoadingLabyrinthButton';
import { BureaucracyQueue } from '@/components/BureaucracyQueue';
import { MazeOfConsent } from '@/components/MazeOfConsent';
import { CaptchaGauntlet } from '@/components/CaptchaGauntlet';
import { getQuestionByNumber, totalQuestions, TourQuestion } from '@/data/questions';
import { getRandomValidationMessage } from '@/data/validations';
import { getRandomDisclaimer } from '@/data/disclaimers';
import { getRandomExhibits, calculateRegretScore } from '@/data/exhibits';
import { getBadgeByScore } from '@/data/badges';
import { scheduleTourEventMaximum, TourEvent } from '@/data/tourEvents';
import { MinigameId } from '@/data/minigames';
import { createModuleSkinMap, getSkinClass, getSkinPulseClass, mutationRule, mutateModuleSkinMap, randomModule, SkinModule } from '@/data/skinPacks';
import { HOSTILITY_MODE } from '@/data/hostilityPrimitives';
import { MAXIMUM_HOSTILITY } from '@/data/maximumHostility';
import { emitPulse, initialResonancePulseState } from '@/lib/resonancePulseBus';
import { useMaximumHeartbeatPulse } from '@/lib/useMaximumHeartbeatPulse';

type TourAnswerValue = string | number | boolean | string[] | IntegrityAnswer | MinigameResult;

interface IntegrityAnswer {
  checksum?: string;
  pin?: string;
  oath?: boolean;
}

interface MinigameResult {
  passed: boolean;
  meta?: Record<string, number>;
}

interface TourAnswers {
  [key: string]: TourAnswerValue;
}

interface MinigameStat {
  fails: number;
  passes: number;
  passed: boolean;
}

type CursorPersona = 'pointer' | 'text' | 'wait' | 'not-allowed' | 'crosshair';

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
  interactionState: {
    cursorMode: 'normal' | 'trapped' | 'relaxed';
    cursorHotspotOffset: number;
    cursorDecoyVisibleUntil: number;
    focusLockUntil: number;
    selectionCorruptUntil: number;
    dragResistance: number;
    chromeNoiseLevel: number;
    cursorPersona: CursorPersona;
    cursorJitterUntil: number;
    cursorDesyncUntil: number;
    cursorGhostUntil: number;
    loadingDebt: number;
    loadingLoops: number;
    loadingRegressions: number;
    loadingBypassTokens: number;
    loadingFalseCompletes: number;
    lastLoadingIncidentAt: number;
    themeSeed: number;
    activeSkinMap: ReturnType<typeof createModuleSkinMap>;
    mutationCooldownUntil: number;
    minigameStats: Record<MinigameId, MinigameStat>;
    skinMutationCount: number;
    cursorPersonaSwaps: number;
    cursorDesyncTriggers: number;
    cursorGhostBursts: number;
    minigameInterruptions: number;
  };
}

type TourAction =
  | { type: 'RESET'; seed: number; startedAt: number }
  | { type: 'RECORD_ATTEMPT'; step: number; phase: 1 | 2 | 3 }
  | { type: 'ADVANCE'; maxStep: number }
  | { type: 'REGRESS'; phase: 1 | 2 | 3 }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_LOCKOUT'; until: number }
  | { type: 'SET_INTERACTION_STATE'; patch: Partial<TourRunState['interactionState']> }
  | { type: 'CLEAR_INPUT_CORRUPTION' }
  | { type: 'CONSUME_RECOVERY' }
  | { type: 'ADD_STRIKE'; count?: number }
  | { type: 'REGISTER_MINIGAME_FAIL'; gameId: MinigameId }
  | { type: 'REGISTER_MINIGAME_PASS'; gameId: MinigameId }
  | { type: 'APPLY_LOADING_METRICS'; metrics: LoadingLabyrinthMetrics }
  | { type: 'APPLY_EVENT'; event: TourEvent; phase: 1 | 2 | 3; now: number; lockoutMs: number; freezeMs: number };

const MAX_HARD_REGRESSIONS = 3;
const PITY_PASS_TRIGGER = 4;
const CATASTROPHIC_COOLDOWN_MS = 12000;
const EFFECTIVE_PHASE: 1 | 2 | 3 = 3;

function initialMinigameStats(): Record<MinigameId, MinigameStat> {
  return {
    'bureaucracy-queue': { fails: 0, passes: 0, passed: false },
    'maze-consent': { fails: 0, passes: 0, passed: false },
    'captcha-gauntlet': { fails: 0, passes: 0, passed: false },
  };
}

function createInitialRunState(): TourRunState {
  const seed = 91337;
  return {
    step: 1,
    strikes: 0,
    debuffs: { inputCorruption: false, uiFreezeUntil: 0 },
    lockouts: { nextUntil: 0 },
    instability: 0,
    suspicion: 0,
    recoveryTokens: 0,
    eventSeed: seed,
    startedAt: 0,
    attempts: {},
    lastEventAt: 0,
    hardRegressions: 0,
    phaseStats: {
      1: { attempts: 0, events: 0, regressions: 0 },
      2: { attempts: 0, events: 0, regressions: 0 },
      3: { attempts: 0, events: 0, regressions: 0 },
    },
    interactionState: {
      cursorMode: 'normal',
      cursorHotspotOffset: 0,
      cursorDecoyVisibleUntil: 0,
      focusLockUntil: 0,
      selectionCorruptUntil: 0,
      dragResistance: 1,
      chromeNoiseLevel: 0,
      cursorPersona: 'pointer',
      cursorJitterUntil: 0,
      cursorDesyncUntil: 0,
      cursorGhostUntil: 0,
      loadingDebt: 0,
      loadingLoops: 0,
      loadingRegressions: 0,
      loadingBypassTokens: 0,
      loadingFalseCompletes: 0,
      lastLoadingIncidentAt: 0,
      themeSeed: seed,
      activeSkinMap: createModuleSkinMap(seed),
      mutationCooldownUntil: 0,
      minigameStats: initialMinigameStats(),
      skinMutationCount: 0,
      cursorPersonaSwaps: 0,
      cursorDesyncTriggers: 0,
      cursorGhostBursts: 0,
      minigameInterruptions: 0,
    },
  };
}

function tourReducer(state: TourRunState, action: TourAction): TourRunState {
  switch (action.type) {
    case 'RESET':
      return {
        ...createInitialRunState(),
        eventSeed: action.seed,
        startedAt: action.startedAt,
        interactionState: {
          ...createInitialRunState().interactionState,
          themeSeed: action.seed,
          activeSkinMap: createModuleSkinMap(action.seed),
        },
      };
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
      return {
        ...state,
        step: Math.min(action.maxStep, state.step + 1),
        instability: Math.max(0, state.instability - 5),
        suspicion: Math.max(0, state.suspicion - 4),
        interactionState: {
          ...state.interactionState,
          cursorMode: 'normal',
          cursorHotspotOffset: Math.max(0, state.interactionState.cursorHotspotOffset - 1),
          dragResistance: Math.max(1, state.interactionState.dragResistance - 0.08),
          chromeNoiseLevel: Math.max(0, state.interactionState.chromeNoiseLevel - 0.05),
          loadingDebt: Math.max(0, state.interactionState.loadingDebt - 1),
        },
      };
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
    case 'SET_INTERACTION_STATE':
      return { ...state, interactionState: { ...state.interactionState, ...action.patch } };
    case 'CLEAR_INPUT_CORRUPTION':
      return { ...state, debuffs: { ...state.debuffs, inputCorruption: false } };
    case 'ADD_STRIKE':
      return { ...state, strikes: state.strikes + (action.count || 1) };
    case 'CONSUME_RECOVERY':
      return {
        ...state,
        recoveryTokens: Math.max(0, state.recoveryTokens - 1),
        strikes: Math.max(0, state.strikes - 1),
        instability: Math.max(0, state.instability - 8),
        suspicion: Math.max(0, state.suspicion - 8),
        interactionState: {
          ...state.interactionState,
          cursorMode: 'relaxed',
          cursorHotspotOffset: Math.max(0, state.interactionState.cursorHotspotOffset - 2),
          dragResistance: Math.max(1, state.interactionState.dragResistance - 0.2),
          chromeNoiseLevel: Math.max(0, state.interactionState.chromeNoiseLevel - 0.18),
        },
      };
    case 'REGISTER_MINIGAME_FAIL': {
      const stats = state.interactionState.minigameStats[action.gameId];
      return {
        ...state,
        interactionState: {
          ...state.interactionState,
          minigameStats: {
            ...state.interactionState.minigameStats,
            [action.gameId]: {
              ...stats,
              fails: stats.fails + 1,
              passed: false,
            },
          },
        },
      };
    }
    case 'REGISTER_MINIGAME_PASS': {
      const stats = state.interactionState.minigameStats[action.gameId];
      return {
        ...state,
        interactionState: {
          ...state.interactionState,
          minigameStats: {
            ...state.interactionState.minigameStats,
            [action.gameId]: {
              ...stats,
              passes: stats.passes + 1,
              passed: true,
            },
          },
        },
      };
    }
    case 'APPLY_LOADING_METRICS':
      return {
        ...state,
        interactionState: {
          ...state.interactionState,
          loadingLoops: state.interactionState.loadingLoops + action.metrics.loops,
          loadingRegressions: state.interactionState.loadingRegressions + action.metrics.regressions,
          loadingFalseCompletes: state.interactionState.loadingFalseCompletes + action.metrics.falseCompletes,
          loadingBypassTokens: state.interactionState.loadingBypassTokens + (action.metrics.bypassed ? 1 : 0),
          loadingDebt: Math.min(10, state.interactionState.loadingDebt + action.metrics.loops + action.metrics.regressions),
          lastLoadingIncidentAt: Date.now(),
        },
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
        case 'cursor-trap':
          next.interactionState.cursorMode = 'trapped';
          next.interactionState.cursorHotspotOffset = MAXIMUM_HOSTILITY.primitives.cursorHotspotOffset;
          next.interactionState.cursorDecoyVisibleUntil = Math.max(
            next.interactionState.cursorDecoyVisibleUntil,
            action.now + Math.min(1800, action.lockoutMs)
          );
          break;
        case 'focus-trap':
          next.interactionState.focusLockUntil = Math.max(next.interactionState.focusLockUntil, action.now + action.lockoutMs);
          break;
        case 'clipboard-trap':
          next.interactionState.selectionCorruptUntil = Math.max(next.interactionState.selectionCorruptUntil, action.now + action.lockoutMs);
          break;
        case 'drag-friction':
          next.interactionState.dragResistance = Math.min(2.2, next.interactionState.dragResistance + 0.16);
          break;
        case 'chrome-mislead':
          next.interactionState.chromeNoiseLevel = Math.min(1, next.interactionState.chromeNoiseLevel + 0.16);
          break;
        case 'cursor-global-shift':
          next.interactionState.cursorPersona = (['pointer', 'text', 'wait', 'not-allowed', 'crosshair'][Math.floor(Math.random() * 5)] || 'pointer') as CursorPersona;
          next.interactionState.cursorPersonaSwaps += 1;
          next.interactionState.cursorGhostUntil = action.now + 1800;
          break;
        case 'cursor-desync':
          next.interactionState.cursorDesyncUntil = Math.max(next.interactionState.cursorDesyncUntil, action.now + 1800);
          next.interactionState.cursorJitterUntil = Math.max(next.interactionState.cursorJitterUntil, action.now + 1800);
          next.interactionState.cursorDesyncTriggers += 1;
          next.interactionState.cursorGhostBursts += 1;
          break;
        case 'loading-loop':
          next.interactionState.loadingDebt = Math.min(10, next.interactionState.loadingDebt + 2);
          break;
        case 'loading-regress':
          next.interactionState.loadingDebt = Math.min(10, next.interactionState.loadingDebt + 3);
          break;
        case 'loading-stall':
          next.interactionState.loadingDebt = Math.min(10, next.interactionState.loadingDebt + 2);
          next.lockouts.nextUntil = Math.max(next.lockouts.nextUntil, action.now + Math.floor(action.lockoutMs * 0.6));
          break;
        case 'skin-mutate':
          next.interactionState.skinMutationCount += 1;
          break;
        case 'minigame-interrupt':
          next.interactionState.minigameInterruptions += 1;
          next.lockouts.nextUntil = Math.max(next.lockouts.nextUntil, action.now + 1100);
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

function asMinigameResult(value: TourAnswerValue | undefined): MinigameResult | null {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'passed' in value) {
    return value as MinigameResult;
  }
  return null;
}

function TourContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [runState, dispatch] = useReducer(tourReducer, undefined, createInitialRunState);
  const [answers, setAnswers] = useState<TourAnswers>({});
  const [error, setError] = useState<string | null>(null);
  const [backClicks, setBackClicks] = useState(0);
  const [started, setStarted] = useState(false);
  const [disclaimer, setDisclaimer] = useState(getRandomDisclaimer());
  const [nowTick, setNowTick] = useState(Date.now());
  const [focusArmSignal, setFocusArmSignal] = useState(0);
  const [skinPulseModule, setSkinPulseModule] = useState<SkinModule | null>(null);
  const [pulseState, setPulseState] = useState(initialResonancePulseState);
  const [feed, setFeed] = useState<string[]>(['Hostility engine armed.', 'Route entropy rising.']);

  const exhibitParam = searchParams.get('exhibit');
  const currentQuestion = getQuestionByNumber(runState.step);
  const phase = EFFECTIVE_PHASE;
  const attemptsOnCurrentStep = runState.attempts[runState.step] || 0;
  const pityPass = attemptsOnCurrentStep >= PITY_PASS_TRIGGER;
  const skinMap = runState.interactionState.activeSkinMap;
  const minigamePasses = useMemo(
    () =>
      Object.values(runState.interactionState.minigameStats).reduce((sum, item) => sum + (item.passed ? 1 : 0), 0),
    [runState.interactionState.minigameStats]
  );
  const resonanceIntensity = MAXIMUM_HOSTILITY.visual.resonanceIntensity;
  const resonanceSafeZones = useMemo(
    () => [
      { x: 14, y: 24, w: 72, h: 45 },
      { x: 24, y: 66, w: 52, h: 16 },
    ],
    []
  );

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

  const pushPulse = useCallback((kind: 'event' | 'cursor' | 'loading' | 'minigame' | 'mutation', strength: number) => {
    setPulseState(prev => emitPulse(prev, kind, strength));
  }, []);

  const triggerSkinMutation = useCallback(
    (reason: string, module?: SkinModule, bypassChance = false) => {
      const now = Date.now();
      if (now < runState.interactionState.mutationCooldownUntil) return;

      const chance = pityPass ? mutationRule.pulseChanceByPhase[EFFECTIVE_PHASE] * 0.55 : mutationRule.pulseChanceByPhase[EFFECTIVE_PHASE];
      if (!bypassChance && Math.random() > chance) return;

      const target = module || randomModule(now + runState.step + runState.strikes);
      const nextMap = mutateModuleSkinMap(runState.interactionState.activeSkinMap, target, now + runState.eventSeed);
      dispatch({
        type: 'SET_INTERACTION_STATE',
        patch: {
          activeSkinMap: nextMap,
          mutationCooldownUntil: now + mutationRule.minIntervalMs,
          skinMutationCount: runState.interactionState.skinMutationCount + 1,
        },
      });
      setSkinPulseModule(target);
      pushPulse('mutation', Math.min(1, 0.45 + (bypassChance ? 0.25 : 0.12)));
      pushFeed(`Design roulette pulse (${reason}) mutated ${target}.`);
    },
    [
      pityPass,
      pushFeed,
      pushPulse,
      runState.eventSeed,
      runState.interactionState.activeSkinMap,
      runState.interactionState.mutationCooldownUntil,
      runState.interactionState.skinMutationCount,
      runState.step,
      runState.strikes,
    ]
  );

  useEffect(() => {
    if (!skinPulseModule) return;
    const timer = window.setTimeout(() => setSkinPulseModule(null), 820);
    return () => window.clearTimeout(timer);
  }, [skinPulseModule]);

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
    setPulseState(initialResonancePulseState);
    setFeed([`Session started with seed ${seed}.`, exhibitParam ? `Prefetch hint: ${exhibitParam}` : 'No prefetch hint.']);
    dispatch({ type: 'RESET', seed, startedAt: Date.now() });
  };

  const applyEvent = useCallback(
    (event: TourEvent, eventPhase: 1 | 2 | 3, mercy: boolean, attemptBoost = 0): boolean => {
      if (mercy && (event.effect === 'regress' || event.effect === 'lockout' || event.effect === 'freeze')) {
        pushFeed(`Mercy protocol blocked ${event.id}.`);
        return false;
      }
      const now = Date.now();
      const [minLock, maxLock] = MAXIMUM_HOSTILITY.tour.lockoutRangeMs;
      const lockoutMs = minLock + Math.floor(seeded(31, attemptBoost) * (maxLock - minLock));
      const freezeMs = Math.floor(lockoutMs * 0.7);

      dispatch({ type: 'APPLY_EVENT', event, phase: eventPhase, now, lockoutMs, freezeMs });
      const normalizedCopy = event.copy
        .replace(/phase[- ]?\d/gi, 'MAX')
        .replace(/phase/gi, 'mode');
      pushFeed(`Event: ${normalizedCopy}`);
      if (event.effect === 'cursor-desync' || event.effect === 'cursor-global-shift') {
        pushPulse('cursor', 0.9);
      } else if (event.effect === 'loading-loop' || event.effect === 'loading-regress' || event.effect === 'loading-stall') {
        pushPulse('loading', 0.88);
      } else if (event.effect === 'minigame-interrupt') {
        pushPulse('minigame', 0.92);
      } else if (event.effect !== 'skin-mutate') {
        pushPulse('event', 0.86);
      }
      if (event.effect === 'focus-trap' || event.effect === 'minigame-interrupt') {
        setFocusArmSignal(now + 1);
      }
      if (event.effect === 'skin-mutate') {
        triggerSkinMutation('event', undefined, true);
      }
      if (event.effect === 'regress' || event.effect === 'lockout' || event.effect === 'freeze') {
        setError(event.copy);
        return true;
      }
      if (event.effect === 'strike') setError(event.copy);
      return false;
    },
    [pushFeed, pushPulse, seeded, triggerSkinMutation]
  );

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const idleEvent = scheduleTourEventMaximum({
        trigger: 'idle',
        now,
        lastEventAt: runState.lastEventAt,
        catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
        baseChance: MAXIMUM_HOSTILITY.tour.idleChance,
        rng: salt => seeded(salt, 4),
      });
      if (!idleEvent) return;
      applyEvent(idleEvent, EFFECTIVE_PHASE, pityPass, 4);
    }, 2500);
    return () => clearInterval(timer);
  }, [applyEvent, pityPass, runState.lastEventAt, seeded, started]);

  const handleAnswer = (questionId: string, value: TourAnswerValue) => {
    let nextValue = value;
    if (runState.debuffs.inputCorruption && typeof value === 'string' && value.length > 0 && Math.random() > 0.35) {
      nextValue = scrambleText(value);
      pushFeed('Input corruption altered your latest value.');
      dispatch({ type: 'CLEAR_INPUT_CORRUPTION' });
    }
    setAnswers(prev => ({ ...prev, [questionId]: nextValue }));
    triggerSkinMutation('input');
    setError(null);
  };

  const validateStep = (question: TourQuestion, mercy: boolean): boolean => {
    const answer = answers[question.id];
    const randomFailChance = Math.min(
      0.08 + question.difficultyWeight * 0.07 + runState.instability * 0.002 + MAXIMUM_HOSTILITY.tour.randomValidationAdditive,
      0.62
    );

    if (question.type === 'minigame') {
      const result = asMinigameResult(answer);
      if (!result?.passed) {
        setError('Required minigame is not completed yet.');
        return false;
      }
    }

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

    if (question.id === 'integrity-check-beta' && typeof answer === 'string') {
      const raw = answer.trim();
      if (!raw.includes('-') || !/\d/.test(raw)) {
        setError('Use phrase-number format, e.g. unstable-42.');
        return false;
      }
    }

    return true;
  };

  const handleMinigamePass = useCallback(
    (gameId: MinigameId, meta: Record<string, number>) => {
      if (!currentQuestion || currentQuestion.minigameId !== gameId) return;
      dispatch({ type: 'REGISTER_MINIGAME_PASS', gameId });
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: { passed: true, meta } }));
      triggerSkinMutation('minigame-win', 'question-card', true);
      pushPulse('minigame', 0.62);
      setError(null);
      pushFeed(`Minigame ${gameId} passed.`);
    },
    [currentQuestion, pushFeed, pushPulse, triggerSkinMutation]
  );

  const handleMinigameFail = useCallback(
    (gameId: MinigameId) => {
      if (!currentQuestion || currentQuestion.minigameId !== gameId) return;
      const failCount = runState.interactionState.minigameStats[gameId].fails + 1;
      dispatch({ type: 'REGISTER_MINIGAME_FAIL', gameId });
      dispatch({ type: 'ADD_STRIKE' });
      dispatch({ type: 'SET_LOCKOUT', until: Date.now() + 850 + gameId.length * 35 });
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: { passed: false } }));
      setError(`Minigame failed: ${gameId}. Queue penalty applied.`);
      setFocusArmSignal(Date.now() + failCount);
      triggerSkinMutation('minigame-fail', 'modals', true);
      pushPulse('minigame', 0.82);
      pushFeed(`Minigame ${gameId} failed (${failCount}).`);

      if (gameId === 'captcha-gauntlet' && failCount >= 4) {
        dispatch({
          type: 'SET_INTERACTION_STATE',
          patch: { loadingBypassTokens: runState.interactionState.loadingBypassTokens + 1 },
        });
        pushFeed('Captcha pity token granted for repeated failures.');
      }
    },
    [currentQuestion, pushFeed, pushPulse, runState.interactionState.loadingBypassTokens, runState.interactionState.minigameStats, triggerSkinMutation]
  );

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
    } else if (Math.random() < 0.33) {
      dispatch({ type: 'SET_STEP', step: Math.min(totalQuestions, runState.step + 1) });
      pushFeed('Back action rerouted forward by max-mode policy.');
    } else {
      setError('Back button currently unavailable.');
    }
  }, [backClicks, pushFeed, runState.lockouts.nextUntil, runState.step]);

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
        cursorMetrics: {
          personaSwaps: runState.interactionState.cursorPersonaSwaps,
          desyncTriggers: runState.interactionState.cursorDesyncTriggers,
          ghostBursts: runState.interactionState.cursorGhostBursts,
          cursorMode: runState.interactionState.cursorMode,
          cursorOffset: runState.interactionState.cursorHotspotOffset,
        },
        loadingMetrics: {
          loops: runState.interactionState.loadingLoops,
          regressions: runState.interactionState.loadingRegressions,
          falseCompletes: runState.interactionState.loadingFalseCompletes,
          bypassTokens: runState.interactionState.loadingBypassTokens,
          debt: runState.interactionState.loadingDebt,
        },
        skinMetrics: {
          mutations: runState.interactionState.skinMutationCount,
          activeSkinMap: runState.interactionState.activeSkinMap,
        },
        minigameMetrics: {
          stats: runState.interactionState.minigameStats,
          interruptions: runState.interactionState.minigameInterruptions,
        },
        interactionState: {
          cursorMode: runState.interactionState.cursorMode,
          cursorHotspotOffset: runState.interactionState.cursorHotspotOffset,
          cursorDecoyVisibleUntil: runState.interactionState.cursorDecoyVisibleUntil,
          focusLockUntil: runState.interactionState.focusLockUntil,
          selectionCorruptUntil: runState.interactionState.selectionCorruptUntil,
          dragResistance: runState.interactionState.dragResistance,
          chromeNoiseLevel: runState.interactionState.chromeNoiseLevel,
        },
      },
    };

    sessionStorage.setItem('tourResults', JSON.stringify(results));
    router.push('/certificate');
  };

  const handleNext = () => {
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

    const attemptCount = (runState.attempts[runState.step] || 0) + 1;
    dispatch({ type: 'RECORD_ATTEMPT', step: runState.step, phase: EFFECTIVE_PHASE });
    const mercy = attemptCount >= PITY_PASS_TRIGGER;
    setFocusArmSignal(now + EFFECTIVE_PHASE + attemptCount);
    triggerSkinMutation('submit');

    const beforeValidateEvent = scheduleTourEventMaximum({
      trigger: 'before-validate',
      now,
      lastEventAt: runState.lastEventAt,
      catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
      baseChance: MAXIMUM_HOSTILITY.tour.beforeValidateChance,
      rng: salt => seeded(salt, 1),
    });
    if (beforeValidateEvent && applyEvent(beforeValidateEvent, EFFECTIVE_PHASE, mercy, 1)) return;

    if (!validateStep(currentQuestion, mercy)) {
      if (mercy && runState.recoveryTokens > 0) {
        dispatch({ type: 'CONSUME_RECOVERY' });
        pushFeed('Recovery token consumed after repeated failure.');
      }
      return;
    }

    const afterValidateEvent = scheduleTourEventMaximum({
      trigger: 'after-validate',
      now,
      lastEventAt: runState.lastEventAt,
      catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
      baseChance: MAXIMUM_HOSTILITY.tour.afterValidateChance,
      rng: salt => seeded(salt, 2),
    });
    if (afterValidateEvent && applyEvent(afterValidateEvent, EFFECTIVE_PHASE, mercy, 2)) return;

    const beforeTransitionEvent = scheduleTourEventMaximum({
      trigger: 'before-transition',
      now: Date.now(),
      lastEventAt: runState.lastEventAt,
      catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
      baseChance: MAXIMUM_HOSTILITY.tour.beforeTransitionChance,
      rng: salt => seeded(salt, 3),
    });
    if (beforeTransitionEvent && applyEvent(beforeTransitionEvent, EFFECTIVE_PHASE, mercy, 3)) return;

    if (!mercy && runState.hardRegressions < MAX_HARD_REGRESSIONS && Math.random() < MAXIMUM_HOSTILITY.tour.regressionChance) {
      dispatch({ type: 'REGRESS', phase: EFFECTIVE_PHASE });
      setError('Sequence drift: regression penalty applied.');
      pushFeed('Regression penalty triggered by escalation model.');
      pushPulse('event', 0.72);
      triggerSkinMutation('regression', 'question-card', true);
      return;
    }

    if (runState.step >= totalQuestions) {
      completeTour();
      return;
    }

    dispatch({ type: 'ADVANCE', maxStep: totalQuestions });
    setDisclaimer(getRandomDisclaimer());
    triggerSkinMutation('advance', 'hero');
    setError(null);
  };

  const phaseLabel = 'MAX HOSTILITY MODE';

  useMaximumHeartbeatPulse({
    active: true,
    onPulse: strength => {
      setPulseState(prev => emitPulse(prev, 'event', strength));
    },
  });

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
              <LivingOverlay mode="tour" phase={EFFECTIVE_PHASE} hostilityMode={HOSTILITY_MODE} intensity={MAXIMUM_HOSTILITY.overlay.intensity} mobileHostile />
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
                        <li>• Duration: 18 hostile steps</li>
                        <li>• Runtime: phase-free maximum mode</li>
                        <li>• Difficulty: unstable and punitive</li>
                        <li>• Required minigames: 3</li>
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
          <main className={`res-interaction-root relative flex-1 overflow-x-hidden ${getSkinClass(skinMap.hero)} ${skinPulseModule === 'hero' ? getSkinPulseClass(skinMap.hero) : ''}`}>
            <FakeBrowserChrome phase={EFFECTIVE_PHASE} hostilityMode={HOSTILITY_MODE} mode="tour" noiseLevel={runState.interactionState.chromeNoiseLevel * 100} onIncident={pushFeed} />
            <CursorCorruptionLayer
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              pityPass={pityPass}
              active
              eventPulse={
                runState.strikes +
                runState.instability +
                runState.suspicion +
                runState.interactionState.loadingDebt +
                runState.interactionState.loadingLoops
              }
              onIncident={pushFeed}
            />
            <TargetedCursorLayer
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              pityPass={pityPass}
              active
              offsetBoost={runState.interactionState.cursorHotspotOffset}
              chanceBoost={runState.interactionState.cursorMode === 'trapped' ? 0.08 : 0}
              onIncident={pushFeed}
            />
            <FocusSaboteur
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              step={runState.step}
              pityPass={pityPass}
              armSignal={focusArmSignal}
              active
              onIncident={pushFeed}
            />
            <ClipboardSaboteur
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              pityPass={pityPass}
              active
              corruptionUntil={runState.interactionState.selectionCorruptUntil}
              onIncident={pushFeed}
            />
            <DragFrictionField
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              pityPass={pityPass}
              active
              resistanceBoost={Math.round(runState.interactionState.dragResistance * 10)}
              onIncident={pushFeed}
            />
            <LivingOverlay
              mode="tour"
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              intensity={MAXIMUM_HOSTILITY.overlay.intensity}
              mobileHostile
              eventPulse={runState.strikes + runState.instability + runState.suspicion + runState.interactionState.loadingDebt}
            />
            <ResonanceShellCorruptor
              pulseKey={pulseState.key}
              hostilityMode={HOSTILITY_MODE}
              intensity={MAXIMUM_HOSTILITY.shell.intensity}
              profile={MAXIMUM_HOSTILITY.shell.profile}
              triggerMode="ambient"
              ambientBreakChance={MAXIMUM_HOSTILITY.shellAmbientCycle.breakChance}
            />
            <div className="res-layer-stack">
              <SignalNoiseVeil
                hostilityMode={HOSTILITY_MODE}
                severity={MAXIMUM_HOSTILITY.visual.resonanceNoiseSeverity}
                scanlines
                noise
                pulseKey={pulseState.key}
                coverage={MAXIMUM_HOSTILITY.visual.resonanceCoverage}
                safeZones={resonanceSafeZones}
              />
              <ResonanceFractureLayer
                hostilityMode={HOSTILITY_MODE}
                phase={EFFECTIVE_PHASE}
                intensity={resonanceIntensity}
                pulseKey={pulseState.key}
                coverage={MAXIMUM_HOSTILITY.visual.resonanceCoverage}
                safeZones={resonanceSafeZones}
              />
              <ResonancePulseLayer
                hostilityMode={HOSTILITY_MODE}
                phase={EFFECTIVE_PHASE}
                intensity={MAXIMUM_HOSTILITY.visual.resonancePulseIntensity}
                activeBurst={runState.interactionState.loadingFalseCompletes > 0}
                pulseKey={pulseState.key}
                coverage={MAXIMUM_HOSTILITY.visual.resonanceCoverage}
                safeZones={resonanceSafeZones}
              />
              <UIFragmentDebris
                hostilityMode={HOSTILITY_MODE}
                mode="tour"
                density={MAXIMUM_HOSTILITY.visual.resonanceFragmentDensity}
                intensity={MAXIMUM_HOSTILITY.visual.resonanceIntensity}
                pulseKey={pulseState.key}
                coverage={MAXIMUM_HOSTILITY.visual.resonanceCoverage}
                safeZones={resonanceSafeZones}
              />
            </div>
            <div className={`res-shell relative z-10 p-4 md:p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 ${getSkinClass(skinMap.nav)} ${skinPulseModule === 'nav' ? getSkinPulseClass(skinMap.nav) : ''}`}>
              <section data-focus-zone data-clipboard-hostile onMouseEnter={() => triggerSkinMutation('hover', 'question-card')}>
                <ProgressBar
                  currentStep={runState.step}
                  totalSteps={totalQuestions}
                  phase={EFFECTIVE_PHASE}
                  hostilityMode={HOSTILITY_MODE}
                  strikes={runState.strikes}
                  instability={runState.instability}
                  suspicion={runState.suspicion}
                  lockoutMs={lockoutMs}
                  loadingLoops={runState.interactionState.loadingLoops}
                  loadingRegressions={runState.interactionState.loadingRegressions}
                  minigamePasses={minigamePasses}
                />
                {currentQuestion && (
                  <QuestionCard
                    className={`${getSkinClass(skinMap['question-card'])} ${skinPulseModule === 'question-card' ? getSkinPulseClass(skinMap['question-card']) : ''}`}
                    question={currentQuestion}
                    answer={answers[currentQuestion.id]}
                    onAnswer={value => handleAnswer(currentQuestion.id, value)}
                    onMinigamePass={handleMinigamePass}
                    onMinigameFail={handleMinigameFail}
                    attemptsOnStep={attemptsOnCurrentStep}
                    phase={EFFECTIVE_PHASE}
                    error={error}
                    disclaimer={disclaimer}
                    gateOpen={nowTick % 7000 < 1800}
                    expectedPin={String((runState.step + runState.strikes + attemptsOnCurrentStep) % 10)}
                  />
                )}

                <div className={`res-control-safe flex justify-between items-center mt-6 ${getSkinClass(skinMap.buttons)} ${skinPulseModule === 'buttons' ? getSkinPulseClass(skinMap.buttons) : ''}`} data-trap-zone="tour-nav-actions">
                  <HellButton variant="win95" label={`← Back (click ${4 - (backClicks % 4)} more times)`} onClick={handleBack} size="small" />
                  <div className="flex gap-2 items-center">
                    <HellButton
                      variant="link"
                      label="Skip (invalid)"
                      onClick={() => {
                        dispatch({ type: 'SET_LOCKOUT', until: Date.now() + 1200 });
                        setError('Skipping is not permitted. Lockout applied.');
                        triggerSkinMutation('invalid-skip', 'buttons', true);
                      }}
                      size="small"
                    />
                    <LoadingLabyrinthButton
                      className="min-w-[230px]"
                      label={runState.step >= totalQuestions ? 'Finalize Tour Commit' : 'Next (Labyrinth)'}
                      phase={EFFECTIVE_PHASE}
                      hostilityMode={HOSTILITY_MODE}
                      pityPass={pityPass || runState.interactionState.loadingBypassTokens > 0}
                      onIncident={pushFeed}
                      onMetrics={(metrics: LoadingLabyrinthMetrics) => {
                        dispatch({ type: 'APPLY_LOADING_METRICS', metrics });
                        if (metrics.loops > 0 || metrics.regressions > 0 || metrics.falseCompletes > 0) {
                          pushPulse(
                            'loading',
                            Math.min(1, 0.48 + metrics.loops * 0.08 + metrics.regressions * 0.12 + metrics.falseCompletes * 0.1)
                          );
                        }
                        if (metrics.loops > 0 || metrics.regressions > 0 || metrics.falseCompletes > 0) {
                          triggerSkinMutation('labyrinth', 'modals', true);
                        }
                      }}
                      onCommit={handleNext}
                    />
                  </div>
                </div>

                {(lockoutMs > 0 || freezeMs > 0) && (
                  <div className={`res-control-safe mt-3 p-2 text-xs bg-[#FFFF99] border-2 border-dashed border-[#FF0000] text-[#8B4513] ${getSkinClass(skinMap.modals)} ${skinPulseModule === 'modals' ? getSkinPulseClass(skinMap.modals) : ''}`} style={{ fontFamily: "'VT323', monospace" }}>
                    {lockoutMs > 0 && <p>Lockout active: {Math.ceil(lockoutMs / 1000)}s remaining.</p>}
                    {freezeMs > 0 && <p>Freeze burst active: {Math.ceil(freezeMs / 1000)}s remaining.</p>}
                  </div>
                )}
              </section>

              <aside className={`mobile-hostile-panel space-y-3 ${getSkinClass(skinMap['side-panel'])} ${skinPulseModule === 'side-panel' ? getSkinPulseClass(skinMap['side-panel']) : ''}`}>
                <div className="p-3 bg-[#FFFF99] border-2 border-[#8B4513] shadow-ugly">
                  <p className="text-xs font-bold" style={{ fontFamily: "'Bangers', cursive" }}>{phaseLabel}</p>
                  <p className="text-[11px] mt-1" style={{ fontFamily: "'VT323', monospace" }}>Attempts on current step: {attemptsOnCurrentStep}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Pity pass: {pityPass ? 'ACTIVE' : `at ${PITY_PASS_TRIGGER} attempts`}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Recovery tokens: {runState.recoveryTokens}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Cursor persona swaps: {runState.interactionState.cursorPersonaSwaps}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Loading debt: {runState.interactionState.loadingDebt}</p>
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
                  <p className="text-xs font-bold mb-1" style={{ fontFamily: "'Bangers', cursive" }}>RUN METRICS</p>
                  {[1, 2, 3].map(raw => {
                    const phaseKey = raw as 1 | 2 | 3;
                    const stats = runState.phaseStats[phaseKey];
                    return <p key={phaseKey} className="text-[10px]" style={{ fontFamily: "'VT323', monospace" }}>Bucket {phaseKey}: attempts {stats.attempts} | events {stats.events} | regressions {stats.regressions}</p>;
                  })}
                  <p className="text-[10px] mt-2" style={{ fontFamily: "'VT323', monospace" }}>
                    Minigame fails: {Object.values(runState.interactionState.minigameStats).reduce((sum, item) => sum + item.fails, 0)}
                  </p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]"><div className="text-center p-8" style={{ fontFamily: "'Comic Neue', cursive" }}><span className="text-6xl animate-bounce-chaotic inline-block">🎫</span><p className="mt-4 text-xl animate-blink">Loading maximum hostility engine...</p><div className="progress-lie mt-4 w-48 mx-auto"><div className="progress-lie-fill" style={{ width: '97%' }} /><div className="progress-lie-text">97%</div></div></div></div>}>
      <TourContent />
    </Suspense>
  );
}

function QuestionCard({
  className,
  question,
  answer,
  onAnswer,
  onMinigamePass,
  onMinigameFail,
  attemptsOnStep,
  phase,
  error,
  disclaimer,
  gateOpen,
  expectedPin,
}: {
  className?: string;
  question: TourQuestion;
  answer: TourAnswerValue | undefined;
  onAnswer: (value: TourAnswerValue) => void;
  onMinigamePass: (gameId: MinigameId, meta: Record<string, number>) => void;
  onMinigameFail: (gameId: MinigameId) => void;
  attemptsOnStep: number;
  phase: 1 | 2 | 3;
  error: string | null;
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
    <div className={`res-control-safe ${style.bg} ${style.border} p-6 shadow-ugly relative ${className || ''}`} style={{ transform: `rotate(${(Math.random() - 0.5) * 2}deg)` }}>
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF69B4] rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse" style={{ fontFamily: "'Bangers', cursive" }}>#{question.questionNumber}</div>

      <h2 className="text-2xl md:text-3xl mb-2 text-center" style={{ fontFamily: "'Bangers', cursive", color: '#8B4513', textShadow: '2px 2px 0 #FFFF99' }}>{question.title}</h2>
      <p className="text-center mb-6" style={{ fontFamily: "'Comic Neue', cursive", fontStyle: 'italic' }}>{question.subtitle}</p>

      <div className="mb-4">
        {renderQuestionContent(question, answer, onAnswer, gateOpen, expectedPin, {
          phase,
          attemptsOnStep,
          onMinigamePass,
          onMinigameFail,
        })}
      </div>

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
  expectedPin: string,
  minigameContext: {
    phase: 1 | 2 | 3;
    attemptsOnStep: number;
    onMinigamePass: (gameId: MinigameId, meta: Record<string, number>) => void;
    onMinigameFail: (gameId: MinigameId) => void;
  }
) {
  if (question.type === 'minigame' && question.minigameId) {
    const gameId = question.minigameId;
    if (gameId === 'bureaucracy-queue') {
      return (
        <BureaucracyQueue
          attemptCount={minigameContext.attemptsOnStep}
          onPass={meta => minigameContext.onMinigamePass(gameId, meta)}
          onFail={() => minigameContext.onMinigameFail(gameId)}
        />
      );
    }
    if (gameId === 'maze-consent') {
      return (
        <MazeOfConsent
          phase={minigameContext.phase}
          attemptCount={minigameContext.attemptsOnStep}
          onPass={meta => minigameContext.onMinigamePass(gameId, meta)}
          onFail={() => minigameContext.onMinigameFail(gameId)}
        />
      );
    }
    return (
      <CaptchaGauntlet
        phase={minigameContext.phase}
        attemptCount={minigameContext.attemptsOnStep}
        onPass={meta => minigameContext.onMinigamePass(gameId, meta)}
        onFail={() => minigameContext.onMinigameFail(gameId)}
      />
    );
  }

  if (question.type === 'slider') {
    return <HostileSlider label="How confident are you right now?" value={(answer as number) || 97} onChange={onAnswer} />;
  }

  if (question.type === 'input' || question.type === 'memory') {
    return (
      <div data-clipboard-hostile>
        <HostileInput
          name={question.id}
          label={question.id === 'memory-trap' ? 'Recall Code' : 'Your Name'}
          placeholder={question.placeholder || "Enter a value that won't be rejected..."}
          required={question.validation?.required}
          value={(answer as string) || ''}
          onChange={onAnswer}
        />
      </div>
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
      <div className="space-y-3" data-clipboard-hostile>
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
