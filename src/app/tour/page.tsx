
'use client';

import { Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
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
import { MEMORY_SOUND_CODES, type MemorySoundCode, normalizeMemorySoundCode } from '@/data/memorySoundCodes';
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
type ChaosContractType = 'clean-run' | 'speed-window' | 'steady-hand' | 'minigame-discipline';
type AssistTier = 0 | 1 | 2;

interface MinigameStatusPayload {
  mode: 'building' | 'submitted' | 'running' | 'failed' | 'passed';
  fails: number;
  selectedCount?: number;
  cycle?: number;
  ruleMode?: 'A' | 'B';
  moves?: number;
  round?: number;
  timeLeft?: number;
  lastResetReason?: string;
}

interface ActiveMinigameStatus extends MinigameStatusPayload {
  gameId: MinigameId;
}

interface ChaosContract {
  id: string;
  type: ChaosContractType;
  label: string;
  description: string;
  speedWindowMs?: number;
}

interface ChaosContractFeedback {
  id: string;
  success: boolean;
  text: string;
}

interface CursorChaosTelemetry {
  trailNodesSpawned: number;
  decoyActivations: number;
  clickOffsetInterventions: number;
  remapActiveControls: number;
  remapScannedControls: number;
  remapPeakActiveControls: number;
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
  stepFailStreak: Record<number, number>;
  minigameFailStreak: Record<MinigameId, number>;
  lastEventAt: number;
  hardRegressions: number;
  phaseStats: Record<1 | 2 | 3, { attempts: number; events: number; regressions: number }>;
  skillChaos: {
    combo: number;
    peakCombo: number;
    chaosScore: number;
    chaosTokens: number;
    tokensConsumed: number;
    activeContract: ChaosContract | null;
    contractStartedAt: number;
    contractsCompleted: number;
    contractsFailed: number;
    lastComboAt: number;
  };
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
  | { type: 'INCREMENT_STEP_FAIL_STREAK'; step: number }
  | { type: 'RESET_STEP_FAIL_STREAK'; step: number }
  | { type: 'INCREMENT_MINIGAME_FAIL_STREAK'; gameId: MinigameId }
  | { type: 'RESET_MINIGAME_FAIL_STREAK'; gameId: MinigameId }
  | { type: 'CLEAR_INPUT_CORRUPTION' }
  | { type: 'CONSUME_RECOVERY' }
  | { type: 'ADD_STRIKE'; count?: number }
  | { type: 'REGISTER_MINIGAME_FAIL'; gameId: MinigameId }
  | { type: 'REGISTER_MINIGAME_PASS'; gameId: MinigameId }
  | { type: 'SET_ACTIVE_CONTRACT'; contract: ChaosContract; startedAt: number }
  | { type: 'RESOLVE_CONTRACT'; success: boolean; now: number }
  | { type: 'DECAY_CHAOS_COMBO'; now: number }
  | { type: 'CONSUME_CHAOS_TOKEN' }
  | { type: 'GRANT_CHAOS_TOKEN'; count?: number }
  | { type: 'ADD_INSTABILITY'; amount?: number }
  | { type: 'APPLY_LOADING_METRICS'; metrics: LoadingLabyrinthMetrics }
  | { type: 'APPLY_EVENT'; event: TourEvent; phase: 1 | 2 | 3; now: number; lockoutMs: number; freezeMs: number };

const MAX_HARD_REGRESSIONS = 3;
const PITY_PASS_TRIGGER = 4;
const CATASTROPHIC_COOLDOWN_MS = 12000;
const EFFECTIVE_PHASE: 1 | 2 | 3 = 3;
const speedWindowDefaultMs = 11000;
const speedWindowPityMs = 14000;

function getAssistTierFromStreak(streak: number): AssistTier {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1;
  return 0;
}

function getMinigameAssistTierFromStreak(streak: number): AssistTier {
  if (streak >= 4) return 2;
  if (streak >= 2) return 1;
  return 0;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function stableRotation(seed: string, maxAbsDeg: number): number {
  const unit = (stableHash(seed) % 2001) / 1000 - 1;
  return parseFloat((unit * maxAbsDeg).toFixed(2));
}

function createChaosContract(step: number, question: TourQuestion | undefined, roll: number): ChaosContract {
  const contractTypes: ChaosContractType[] =
    question?.type === 'minigame'
      ? ['minigame-discipline', 'clean-run', 'speed-window', 'steady-hand']
      : ['clean-run', 'speed-window', 'steady-hand'];
  const selected = contractTypes[Math.floor(roll * contractTypes.length)] || 'clean-run';
  if (selected === 'speed-window') {
    return {
      id: `contract-${step}-speed-window`,
      type: 'speed-window',
      label: 'Speed Window',
      description: 'Commit this step quickly before the timer window closes.',
      speedWindowMs: speedWindowDefaultMs,
    };
  }
  if (selected === 'steady-hand') {
    return {
      id: `contract-${step}-steady-hand`,
      type: 'steady-hand',
      label: 'Steady Hand',
      description: 'Do not use Back actions during this step.',
    };
  }
  if (selected === 'minigame-discipline') {
    return {
      id: `contract-${step}-minigame-discipline`,
      type: 'minigame-discipline',
      label: 'Minigame Discipline',
      description: 'Clear this minigame with at most one fail.',
    };
  }
  return {
    id: `contract-${step}-clean-run`,
    type: 'clean-run',
    label: 'Clean Run',
    description: 'Pass this step without any validation failures.',
  };
}

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
    stepFailStreak: {},
    minigameFailStreak: {
      'bureaucracy-queue': 0,
      'maze-consent': 0,
      'captcha-gauntlet': 0,
    },
    lastEventAt: 0,
    hardRegressions: 0,
    phaseStats: {
      1: { attempts: 0, events: 0, regressions: 0 },
      2: { attempts: 0, events: 0, regressions: 0 },
      3: { attempts: 0, events: 0, regressions: 0 },
    },
    skillChaos: {
      combo: 0,
      peakCombo: 0,
      chaosScore: 0,
      chaosTokens: 0,
      tokensConsumed: 0,
      activeContract: null,
      contractStartedAt: 0,
      contractsCompleted: 0,
      contractsFailed: 0,
      lastComboAt: 0,
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
    case 'INCREMENT_STEP_FAIL_STREAK':
      return {
        ...state,
        stepFailStreak: {
          ...state.stepFailStreak,
          [action.step]: (state.stepFailStreak[action.step] || 0) + 1,
        },
      };
    case 'RESET_STEP_FAIL_STREAK':
      return {
        ...state,
        stepFailStreak: {
          ...state.stepFailStreak,
          [action.step]: 0,
        },
      };
    case 'INCREMENT_MINIGAME_FAIL_STREAK':
      return {
        ...state,
        minigameFailStreak: {
          ...state.minigameFailStreak,
          [action.gameId]: (state.minigameFailStreak[action.gameId] || 0) + 1,
        },
      };
    case 'RESET_MINIGAME_FAIL_STREAK':
      return {
        ...state,
        minigameFailStreak: {
          ...state.minigameFailStreak,
          [action.gameId]: 0,
        },
      };
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
    case 'SET_ACTIVE_CONTRACT':
      return {
        ...state,
        skillChaos: {
          ...state.skillChaos,
          activeContract: action.contract,
          contractStartedAt: action.startedAt,
        },
      };
    case 'RESOLVE_CONTRACT': {
      if (!MAXIMUM_HOSTILITY.tour.skillChaos.enabled) return state;
      if (action.success) {
        const withinWindow = action.now - state.skillChaos.lastComboAt <= MAXIMUM_HOSTILITY.tour.skillChaos.comboWindowMs;
        const combo = Math.min(
          MAXIMUM_HOSTILITY.tour.skillChaos.maxCombo,
          withinWindow ? state.skillChaos.combo + 1 : 1
        );
        return {
          ...state,
          skillChaos: {
            ...state.skillChaos,
            combo,
            peakCombo: Math.max(state.skillChaos.peakCombo, combo),
            chaosScore: state.skillChaos.chaosScore + MAXIMUM_HOSTILITY.tour.skillChaos.contractScoreReward,
            chaosTokens: Math.min(
              MAXIMUM_HOSTILITY.tour.skillChaos.contractRewardTokenCap,
              state.skillChaos.chaosTokens + 1
            ),
            contractsCompleted: state.skillChaos.contractsCompleted + 1,
            lastComboAt: action.now,
          },
        };
      }
      return {
        ...state,
        suspicion: Math.min(100, state.suspicion + MAXIMUM_HOSTILITY.tour.skillChaos.contractSuspicionPenalty),
        skillChaos: {
          ...state.skillChaos,
          combo: 0,
          contractsFailed: state.skillChaos.contractsFailed + 1,
        },
      };
    }
    case 'DECAY_CHAOS_COMBO': {
      if (state.skillChaos.combo <= 0) return state;
      if (action.now - state.skillChaos.lastComboAt < MAXIMUM_HOSTILITY.tour.skillChaos.comboDecayMs) return state;
      return {
        ...state,
        skillChaos: {
          ...state.skillChaos,
          combo: Math.max(0, state.skillChaos.combo - 1),
          lastComboAt: action.now,
        },
      };
    }
    case 'CONSUME_CHAOS_TOKEN':
      if (state.skillChaos.chaosTokens <= 0) return state;
      return {
        ...state,
        skillChaos: {
          ...state.skillChaos,
          chaosTokens: Math.max(0, state.skillChaos.chaosTokens - 1),
          tokensConsumed: state.skillChaos.tokensConsumed + 1,
        },
      };
    case 'GRANT_CHAOS_TOKEN':
      return {
        ...state,
        skillChaos: {
          ...state.skillChaos,
          chaosTokens: Math.min(
            MAXIMUM_HOSTILITY.tour.skillChaos.contractRewardTokenCap,
            state.skillChaos.chaosTokens + (action.count || 1)
          ),
        },
      };
    case 'ADD_INSTABILITY':
      return {
        ...state,
        instability: Math.min(100, state.instability + (action.amount || 1)),
      };
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
  const [memoryAnchor, setMemoryAnchor] = useState<MemorySoundCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backClicks, setBackClicks] = useState(0);
  const [started, setStarted] = useState(false);
  const [disclaimer, setDisclaimer] = useState(getRandomDisclaimer());
  const [nowTick, setNowTick] = useState(Date.now());
  const [focusArmSignal, setFocusArmSignal] = useState(0);
  const [skinPulseModule, setSkinPulseModule] = useState<SkinModule | null>(null);
  const [pulseState, setPulseState] = useState(initialResonancePulseState);
  const [feed, setFeed] = useState<string[]>(['Hostility engine armed.', 'Route entropy rising.']);
  const [contractFeedback, setContractFeedback] = useState<ChaosContractFeedback | null>(null);
  const [minigameStatus, setMinigameStatus] = useState<ActiveMinigameStatus | null>(null);
  const [cursorChaosTelemetry, setCursorChaosTelemetry] = useState<CursorChaosTelemetry>({
    trailNodesSpawned: 0,
    decoyActivations: 0,
    clickOffsetInterventions: 0,
    remapActiveControls: 0,
    remapScannedControls: 0,
    remapPeakActiveControls: 0,
  });
  const backAttemptsThisStepRef = useRef(0);
  const minigameFailsThisStepRef = useRef(0);
  const validationFailedThisStepRef = useRef(false);
  const contractResolvedThisStepRef = useRef(false);

  const exhibitParam = searchParams.get('exhibit');
  const currentQuestion = getQuestionByNumber(runState.step);
  const currentMinigameId = currentQuestion?.type === 'minigame' ? currentQuestion.minigameId : undefined;
  const phase = EFFECTIVE_PHASE;
  const attemptsOnCurrentStep = runState.attempts[runState.step] || 0;
  const pityPass = attemptsOnCurrentStep >= PITY_PASS_TRIGGER;
  const currentStepFailStreak = runState.stepFailStreak[runState.step] || 0;
  const currentMinigameFailStreak = currentMinigameId ? runState.minigameFailStreak[currentMinigameId] || 0 : 0;
  const activeFailStreak = Math.max(currentStepFailStreak, currentMinigameFailStreak);
  const assistTier = getAssistTierFromStreak(activeFailStreak);
  const minigameAssistTier =
    currentQuestion?.type === 'minigame' ? getMinigameAssistTierFromStreak(currentMinigameFailStreak) : 0;
  const effectivePityForSabotage = pityPass || (currentQuestion?.type === 'minigame' && assistTier >= 1);
  const eventAssistMultiplier = assistTier >= 2 ? 0.68 : assistTier >= 1 ? 0.82 : 1;
  const validationStreakRelief = Math.min(0.24, currentStepFailStreak * 0.05);
  const currentContract = runState.skillChaos.activeContract;
  const skinMap = runState.interactionState.activeSkinMap;
  const minigamePasses = useMemo(
    () =>
      Object.values(runState.interactionState.minigameStats).reduce((sum, item) => sum + (item.passed ? 1 : 0), 0),
    [runState.interactionState.minigameStats]
  );
  const resonanceIntensity = MAXIMUM_HOSTILITY.visual.resonanceIntensity;
  const cursorPresentation = MAXIMUM_HOSTILITY.primitives.cursorPresentation;
  const resonanceSafeZones = useMemo(
    () => [
      { x: 6, y: 18, w: 66, h: 52 },
      { x: 6, y: 62, w: 66, h: 30 },
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

  useEffect(() => {
    if (!started || !MAXIMUM_HOSTILITY.tour.skillChaos.enabled || runState.skillChaos.combo <= 0) return;
    const timer = window.setInterval(() => {
      dispatch({ type: 'DECAY_CHAOS_COMBO', now: Date.now() });
    }, 1300);
    return () => window.clearInterval(timer);
  }, [runState.skillChaos.combo, started]);

  useEffect(() => {
    if (currentQuestion?.id !== 'timelock-confirm') return;
    const current = answers[currentQuestion.id];
    if (typeof current === 'string' && current.trim().length > 0) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: 'proceed' }));
  }, [answers, currentQuestion]);

  useEffect(() => {
    if (!contractFeedback) return;
    const timer = window.setTimeout(() => setContractFeedback(null), 2400);
    return () => window.clearTimeout(timer);
  }, [contractFeedback]);

  useEffect(() => {
    if (currentQuestion?.type !== 'minigame' || !currentQuestion.minigameId) {
      setMinigameStatus(null);
      return;
    }
    setMinigameStatus(prev => (prev?.gameId === currentQuestion.minigameId ? prev : null));
  }, [currentQuestion?.id, currentQuestion?.minigameId, currentQuestion?.type]);

  const pushFeed = useCallback((line: string) => {
    setFeed(prev => [line, ...prev].slice(0, 8));
  }, []);

  const pushPulse = useCallback((kind: 'event' | 'cursor' | 'loading' | 'minigame' | 'mutation', strength: number) => {
    setPulseState(prev => emitPulse(prev, kind, strength));
  }, []);

  const handleCursorMetrics = useCallback(
    (metrics: { trailNodesSpawned: number; decoyActivations: number; clickOffsetInterventions: number }) => {
      setCursorChaosTelemetry(prev => ({
        ...prev,
        trailNodesSpawned: metrics.trailNodesSpawned,
        decoyActivations: metrics.decoyActivations,
        clickOffsetInterventions: metrics.clickOffsetInterventions,
      }));
    },
    []
  );

  const handleCursorRemapStatus = useCallback((status: { active: number; scanned: number }) => {
    setCursorChaosTelemetry(prev => ({
      ...prev,
      remapActiveControls: status.active,
      remapScannedControls: status.scanned,
      remapPeakActiveControls: Math.max(prev.remapPeakActiveControls, status.active),
    }));
  }, []);

  const handleMinigameStatus = useCallback(
    (gameId: MinigameId, status: MinigameStatusPayload) => {
      setMinigameStatus({ gameId, ...status });
    },
    []
  );

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

  const contractRoll = useMemo(() => {
    const value = Math.sin(runState.eventSeed + runState.step * 173 + 91) * 10000;
    return value - Math.floor(value);
  }, [runState.eventSeed, runState.step]);

  useEffect(() => {
    if (!started || !MAXIMUM_HOSTILITY.tour.skillChaos.enabled) return;
    const contract = createChaosContract(runState.step, currentQuestion, contractRoll);
    dispatch({ type: 'SET_ACTIVE_CONTRACT', contract, startedAt: Date.now() });
    backAttemptsThisStepRef.current = 0;
    minigameFailsThisStepRef.current = 0;
    validationFailedThisStepRef.current = false;
    contractResolvedThisStepRef.current = false;
    setContractFeedback(null);
  }, [contractRoll, currentQuestion, runState.step, started]);

  const startTour = () => {
    const seed = Math.floor(Math.random() * 999999);
    setStarted(true);
    setAnswers({});
    setMemoryAnchor(null);
    setError(null);
    setContractFeedback(null);
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
      const catastrophic = event.effect === 'regress' || event.effect === 'lockout' || event.effect === 'freeze';
      if (
        !mercy &&
        catastrophic &&
        MAXIMUM_HOSTILITY.tour.skillChaos.enabled &&
        runState.skillChaos.chaosTokens > 0 &&
        MAXIMUM_HOSTILITY.tour.skillChaos.catastrophicTokenDowngradeEffect === 'instability'
      ) {
        dispatch({ type: 'CONSUME_CHAOS_TOKEN' });
        const now = Date.now();
        const downgraded: TourEvent = {
          ...event,
          effect: 'instability',
          copy: `${event.copy} Chaos token absorbed catastrophic impact.`,
        };
        dispatch({
          type: 'APPLY_EVENT',
          event: downgraded,
          phase: eventPhase,
          now,
          lockoutMs: 0,
          freezeMs: 0,
        });
        setError('Chaos token consumed. Catastrophe downgraded to instability.');
        pushFeed(`Token shield intercepted ${event.id}.`);
        pushPulse('event', 0.76);
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
    [pushFeed, pushPulse, runState.skillChaos.chaosTokens, seeded, triggerSkinMutation]
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
    if (runState.debuffs.inputCorruption && typeof value === 'string' && value.length > 0) {
      const isMemoryCritical = questionId === 'hated-sound' || questionId === 'memory-trap';
      if (isMemoryCritical) {
        pushFeed('Input corruption tried to poison memory-critical data and was neutralized.');
        dispatch({ type: 'CLEAR_INPUT_CORRUPTION' });
      } else if (Math.random() > 0.35) {
        nextValue = scrambleText(value);
        pushFeed('Input corruption altered your latest value.');
        dispatch({ type: 'CLEAR_INPUT_CORRUPTION' });
      }
    }
    if (questionId === 'hated-sound') {
      setMemoryAnchor(normalizeMemorySoundCode(nextValue));
    }
    setAnswers(prev => ({ ...prev, [questionId]: nextValue }));
    triggerSkinMutation('input');
    setError(null);
  };

  const validateStep = (question: TourQuestion, mercy: boolean): boolean => {
    const answer = answers[question.id];
    const baseRandomFailChance = Math.min(
      0.08 + question.difficultyWeight * 0.07 + runState.instability * 0.002 + MAXIMUM_HOSTILITY.tour.randomValidationAdditive,
      0.62
    );
    let adjustedRandomFailChance = Math.min(
      0.62,
      Math.max(0.08, baseRandomFailChance - validationStreakRelief)
    );
    if (assistTier >= 1) {
      adjustedRandomFailChance = Math.min(adjustedRandomFailChance, 0.48);
    }
    if (assistTier >= 2) {
      adjustedRandomFailChance = Math.min(adjustedRandomFailChance, 0.38);
    }

    if (question.type === 'minigame') {
      const result = asMinigameResult(answer);
      if (!result?.passed) {
        setError('Required minigame is not completed yet.');
        return false;
      }
    }

    if (question.id === 'timelock-confirm') {
      if (typeof answer !== 'string' || answer.trim() === '') {
        setError('Pick any time-lock action first (Proceed now, Wait, or Spam).');
        return false;
      }
      const gateIsOpen = nowTick % 7000 < 1800;
      if (!gateIsOpen) {
        dispatch({ type: 'SET_LOCKOUT', until: Date.now() + 1400 });
        setError('Time-lock gate is CLOSED. Wait for OPEN status.');
        return false;
      }
      return true;
    }

    if (!mercy && Math.random() < adjustedRandomFailChance) {
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
      const expected = memoryAnchor ?? normalizeMemorySoundCode(answers['hated-sound']);
      const given = normalizeMemorySoundCode(answer);
      if (!expected && given) {
        setMemoryAnchor(given);
        setAnswers(prev => ({ ...prev, 'hated-sound': given }));
        pushFeed('Memory baseline auto-recovered to canonical code.');
        return true;
      }
      if (!expected || !given || given !== expected) {
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

  const resolveChaosContract = useCallback(
    (question: TourQuestion, attemptCount: number) => {
      if (!MAXIMUM_HOSTILITY.tour.skillChaos.enabled || !currentContract || contractResolvedThisStepRef.current) return;
      let success = true;
      if (currentContract.type === 'clean-run') {
        success = !validationFailedThisStepRef.current;
      } else if (currentContract.type === 'speed-window') {
        const windowMs = attemptCount >= PITY_PASS_TRIGGER ? speedWindowPityMs : currentContract.speedWindowMs || speedWindowDefaultMs;
        success = Date.now() - runState.skillChaos.contractStartedAt <= windowMs;
      } else if (currentContract.type === 'steady-hand') {
        success = backAttemptsThisStepRef.current === 0;
      } else if (currentContract.type === 'minigame-discipline') {
        success = question.type === 'minigame' ? minigameFailsThisStepRef.current <= 1 : true;
      }

      dispatch({ type: 'RESOLVE_CONTRACT', success, now: Date.now() });
      contractResolvedThisStepRef.current = true;

      if (success) {
        pushFeed(`Contract complete: ${currentContract.label}. Chaos score increased.`);
        setContractFeedback({
          id: `contract-success-${Date.now()}`,
          success: true,
          text: `Contract cleared: ${currentContract.label}`,
        });
        return;
      }
      pushFeed(`Contract failed: ${currentContract.label}. Suspicion increased.`);
      setContractFeedback({
        id: `contract-fail-${Date.now()}`,
        success: false,
        text: `Contract failed: ${currentContract.label}`,
      });
    },
    [currentContract, pushFeed, runState.skillChaos.contractStartedAt]
  );

  const handleMinigamePass = useCallback(
    (gameId: MinigameId, meta: Record<string, number>) => {
      if (!currentQuestion || currentQuestion.minigameId !== gameId) return;
      dispatch({ type: 'REGISTER_MINIGAME_PASS', gameId });
      dispatch({ type: 'RESET_MINIGAME_FAIL_STREAK', gameId });
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
      minigameFailsThisStepRef.current += 1;
      const failCount = runState.interactionState.minigameStats[gameId].fails + 1;
      dispatch({ type: 'REGISTER_MINIGAME_FAIL', gameId });
      dispatch({ type: 'INCREMENT_MINIGAME_FAIL_STREAK', gameId });
      dispatch({ type: 'INCREMENT_STEP_FAIL_STREAK', step: runState.step });
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
    [currentQuestion, pushFeed, pushPulse, runState.interactionState.loadingBypassTokens, runState.interactionState.minigameStats, runState.step, triggerSkinMutation]
  );

  const handleBack = useCallback(() => {
    const now = Date.now();
    if (now < runState.lockouts.nextUntil) {
      setError('Back action blocked during lockout.');
      return;
    }

    backAttemptsThisStepRef.current += 1;
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
          trailNodesSpawned: cursorChaosTelemetry.trailNodesSpawned,
          decoyActivations: cursorChaosTelemetry.decoyActivations,
          clickOffsetInterventions: cursorChaosTelemetry.clickOffsetInterventions,
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
        skillChaosMetrics: {
          contractsCompleted: runState.skillChaos.contractsCompleted,
          contractsFailed: runState.skillChaos.contractsFailed,
          peakCombo: runState.skillChaos.peakCombo,
          chaosScore: runState.skillChaos.chaosScore,
          tokensConsumed: runState.skillChaos.tokensConsumed,
          tokensBanked: runState.skillChaos.chaosTokens,
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

    if (
      MAXIMUM_HOSTILITY.tour.skillChaos.enabled &&
      attemptCount === MAXIMUM_HOSTILITY.tour.skillChaos.autoTokenAtPityAttempt &&
      runState.skillChaos.chaosTokens < MAXIMUM_HOSTILITY.tour.skillChaos.contractRewardTokenCap
    ) {
      dispatch({ type: 'GRANT_CHAOS_TOKEN', count: 1 });
      pushFeed('Pity threshold reached: chaos token granted.');
    }

    const bypassTimelockEventChaos = currentQuestion.id === 'timelock-confirm';
    if (!bypassTimelockEventChaos) {
      const beforeValidateEvent = scheduleTourEventMaximum({
        trigger: 'before-validate',
        now,
        lastEventAt: runState.lastEventAt,
        catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
        baseChance: MAXIMUM_HOSTILITY.tour.beforeValidateChance * eventAssistMultiplier,
        rng: salt => seeded(salt, 1),
      });
      if (beforeValidateEvent && applyEvent(beforeValidateEvent, EFFECTIVE_PHASE, mercy, 1)) return;
    }

    if (!validateStep(currentQuestion, mercy)) {
      validationFailedThisStepRef.current = true;
      dispatch({ type: 'INCREMENT_STEP_FAIL_STREAK', step: runState.step });
      if (mercy && runState.recoveryTokens > 0) {
        dispatch({ type: 'CONSUME_RECOVERY' });
        pushFeed('Recovery token consumed after repeated failure.');
      }
      return;
    }

    if (!bypassTimelockEventChaos) {
      const afterValidateEvent = scheduleTourEventMaximum({
        trigger: 'after-validate',
        now,
        lastEventAt: runState.lastEventAt,
        catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
        baseChance: MAXIMUM_HOSTILITY.tour.afterValidateChance * eventAssistMultiplier,
        rng: salt => seeded(salt, 2),
      });
      if (afterValidateEvent && applyEvent(afterValidateEvent, EFFECTIVE_PHASE, mercy, 2)) return;
    }

    if (!bypassTimelockEventChaos) {
      const beforeTransitionEvent = scheduleTourEventMaximum({
        trigger: 'before-transition',
        now: Date.now(),
        lastEventAt: runState.lastEventAt,
        catastrophicCooldownMs: CATASTROPHIC_COOLDOWN_MS,
        baseChance: MAXIMUM_HOSTILITY.tour.beforeTransitionChance * eventAssistMultiplier,
        rng: salt => seeded(salt, 3),
      });
      if (beforeTransitionEvent && applyEvent(beforeTransitionEvent, EFFECTIVE_PHASE, mercy, 3)) return;
    }

    if (!mercy && runState.hardRegressions < MAX_HARD_REGRESSIONS && Math.random() < MAXIMUM_HOSTILITY.tour.regressionChance) {
      dispatch({ type: 'REGRESS', phase: EFFECTIVE_PHASE });
      setError('Sequence drift: regression penalty applied.');
      pushFeed('Regression penalty triggered by escalation model.');
      pushPulse('event', 0.72);
      triggerSkinMutation('regression', 'question-card', true);
      return;
    }

    resolveChaosContract(currentQuestion, attemptCount);
    dispatch({ type: 'RESET_STEP_FAIL_STREAK', step: runState.step });
    if (currentQuestion.type === 'minigame' && currentQuestion.minigameId) {
      dispatch({ type: 'RESET_MINIGAME_FAIL_STREAK', gameId: currentQuestion.minigameId });
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
  const contractElapsedMs = Math.max(0, nowTick - runState.skillChaos.contractStartedAt);

  if (!started) {
    return (
      <PopupManager>
        <div className="min-h-screen flex flex-col">
          <TopNav />
          <div className="flex flex-1">
            <SideNav />
            <main className="relative flex-1 overflow-x-hidden">
              <LivingOverlay mode="tour" phase={EFFECTIVE_PHASE} hostilityMode={HOSTILITY_MODE} intensity={MAXIMUM_HOSTILITY.overlay.intensity} mobileHostile />
              <CursorCorruptionLayer phase={EFFECTIVE_PHASE} hostilityMode={HOSTILITY_MODE} pityPass={false} active eventPulse={0} />
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
              pityPass={effectivePityForSabotage}
              active
              eventPulse={
                runState.strikes +
                runState.instability +
                runState.suspicion +
                runState.interactionState.loadingDebt +
                runState.interactionState.loadingLoops
              }
              onIncident={pushFeed}
              onMetrics={handleCursorMetrics}
            />
            <TargetedCursorLayer
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              pityPass={effectivePityForSabotage}
              active
              offsetBoost={runState.interactionState.cursorHotspotOffset}
              chanceBoost={runState.interactionState.cursorMode === 'trapped' ? 0.08 : 0}
              onIncident={pushFeed}
              onRemapStatus={handleCursorRemapStatus}
            />
            <FocusSaboteur
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              step={runState.step}
              pityPass={effectivePityForSabotage}
              armSignal={focusArmSignal}
              active
              onIncident={pushFeed}
            />
            <ClipboardSaboteur
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              pityPass={effectivePityForSabotage}
              active
              corruptionUntil={runState.interactionState.selectionCorruptUntil}
              onIncident={pushFeed}
            />
            <DragFrictionField
              phase={EFFECTIVE_PHASE}
              hostilityMode={HOSTILITY_MODE}
              pityPass={effectivePityForSabotage}
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
                {currentContract && (
                  <div className={`res-control-safe min-h-[86px] mt-3 mb-3 p-3 bg-[#FFF6B8] border-2 border-dashed border-[#8B4513] ${getSkinClass(skinMap.modals)} ${skinPulseModule === 'modals' ? getSkinPulseClass(skinMap.modals) : ''}`}>
                    <p className="text-[11px] font-bold" style={{ fontFamily: "'Bangers', cursive" }}>
                      ACTIVE CHAOS CONTRACT
                    </p>
                    <p className="text-[12px]" style={{ fontFamily: "'Comic Neue', cursive" }}>
                      {currentContract.label}: {currentContract.description}
                    </p>
                    {currentContract.type === 'speed-window' && (
                      <p className="text-[10px]" style={{ fontFamily: "'VT323', monospace" }}>
                        Time left: {Math.max(0, Math.ceil(((pityPass ? speedWindowPityMs : currentContract.speedWindowMs || speedWindowDefaultMs) - contractElapsedMs) / 1000))}s
                      </p>
                    )}
                    {contractFeedback && (
                      <p
                        className={`text-[10px] mt-1 ${contractFeedback.success ? 'text-[#0d5c2e]' : 'text-[#8b1a1a]'}`}
                        style={{ fontFamily: "'VT323', monospace" }}
                      >
                        {contractFeedback.success ? '✔' : '✖'} {contractFeedback.text}
                      </p>
                    )}
                  </div>
                )}
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
                    minigameAssistTier={minigameAssistTier}
                    activeFailStreak={activeFailStreak}
                    minigameStatus={minigameStatus}
                    onMinigameStatus={handleMinigameStatus}
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
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>
                    Persistence streak: {activeFailStreak} | Assist tier: {assistTier} | Minigame coaching: {minigameAssistTier}
                  </p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Validation relief: -{validationStreakRelief.toFixed(2)} | Event scale: x{eventAssistMultiplier.toFixed(2)}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Sabotage softening: {effectivePityForSabotage ? 'ON' : 'OFF'} | Hint ramp: {assistTier >= 2 ? 'tier-2' : assistTier >= 1 ? 'tier-1' : 'base'}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Chaos combo: x{runState.skillChaos.combo} (peak x{runState.skillChaos.peakCombo})</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Chaos score: {runState.skillChaos.chaosScore} | Tokens: {runState.skillChaos.chaosTokens}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Contracts: {runState.skillChaos.contractsCompleted}W / {runState.skillChaos.contractsFailed}L</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Cursor profile: {cursorPresentation.nativeCursorPolicy} / {cursorPresentation.trailPointerStyle}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Remap status: {cursorChaosTelemetry.remapActiveControls}/{Math.max(cursorChaosTelemetry.remapScannedControls, 1)} controls</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Trail nodes: {cursorChaosTelemetry.trailNodesSpawned} | Decoys: {cursorChaosTelemetry.decoyActivations}</p>
                  <p className="text-[11px]" style={{ fontFamily: "'VT323', monospace" }}>Click offsets: {cursorChaosTelemetry.clickOffsetInterventions}</p>
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
  minigameAssistTier,
  activeFailStreak,
  minigameStatus,
  onMinigameStatus,
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
  minigameAssistTier: AssistTier;
  activeFailStreak: number;
  minigameStatus: ActiveMinigameStatus | null;
  onMinigameStatus: (gameId: MinigameId, status: MinigameStatusPayload) => void;
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const styles = [
    { bg: 'bg-[#E6E6FA]', border: 'border-4 border-double border-[#808080]' },
    { bg: 'bg-[#FFFF99]', border: 'border-4 border-dotted border-[#FF69B4]' },
    { bg: 'bg-[#F5F5DC]', border: 'border-4 border-solid border-[#8B4513]' },
    { bg: 'bg-[#C0C0C0]', border: 'border-4 border-outset' },
  ];
  const style = styles[question.questionNumber % styles.length];
  const cardRotation = useMemo(() => stableRotation(`card:${question.id}`, 1.2), [question.id]);

  useEffect(() => {
    setTooltipVisible(question.type === 'minigame' || question.id === 'memory-trap' || question.id === 'timelock-confirm');
  }, [question.id, question.type]);

  return (
    <div className={`res-control-safe ${style.bg} ${style.border} p-6 shadow-ugly relative ${className || ''}`} style={{ transform: `rotate(${cardRotation}deg)` }}>
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF69B4] rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse" style={{ fontFamily: "'Bangers', cursive" }}>#{question.questionNumber}</div>

      <h2 className="text-2xl md:text-3xl mb-2 text-center" style={{ fontFamily: "'Bangers', cursive", color: '#8B4513', textShadow: '2px 2px 0 #FFFF99' }}>{question.title}</h2>
      <p className="text-center mb-6" style={{ fontFamily: "'Comic Neue', cursive", fontStyle: 'italic' }}>{question.subtitle}</p>

      <div className="mb-4">
        {renderQuestionContent(question, answer, onAnswer, gateOpen, expectedPin, {
          phase,
          attemptsOnStep,
          minigameAssistTier,
          onMinigamePass,
          onMinigameFail,
          onMinigameStatus,
        })}
      </div>

      {question.type === 'minigame' && (
        <div className="assist-panel">
          <p className="assist-kicker">MINIGAME STATUS</p>
          <p className="assist-copy">
            Mode: {minigameStatus?.mode || 'running'} | Fails: {minigameStatus?.fails ?? 0} | Coaching tier: {minigameAssistTier} (streak {activeFailStreak})
          </p>
          {(typeof minigameStatus?.selectedCount === 'number' || typeof minigameStatus?.cycle === 'number') && (
            <p className="assist-copy">
              Queue progress: {minigameStatus?.selectedCount ?? 0}/4 selected | Cycle {minigameStatus?.cycle ?? 0} | Rule mode {minigameStatus?.ruleMode || 'A/B'}
            </p>
          )}
          {typeof minigameStatus?.moves === 'number' && (
            <p className="assist-copy">
              Maze progress: {minigameStatus.moves}/9 moves
            </p>
          )}
          {(typeof minigameStatus?.round === 'number' || typeof minigameStatus?.timeLeft === 'number') && (
            <p className="assist-copy">
              Captcha progress: Round {minigameStatus?.round ?? 1}/3 | Time {Math.max(0, minigameStatus?.timeLeft ?? 0)}s
            </p>
          )}
          <p className="assist-copy">Reset policy: progress persists through lockout/freeze/noise. Reset only on minigame fail or step change.</p>
          <p className="assist-copy">Last reset: {minigameStatus?.lastResetReason || 'None yet.'}</p>
        </div>
      )}

      {question.type === 'minigame' && (
        <div className="assist-panel">
          <p className="assist-kicker">HOW TO PASS THIS MINIGAME</p>
          <p className="assist-copy">Goal: {question.requiredWinCondition || 'Complete the run condition shown in the minigame.'}</p>
          {question.minigameId === 'bureaucracy-queue' && (
            <p className="assist-copy">
              Policy: Submit exactly 4 docs. Mode A/B flips after failed submit. Current mode: {minigameStatus?.ruleMode || 'A/B'}.
            </p>
          )}
          {question.minigameId === 'maze-consent' && (
            <p className="assist-copy">Policy: Follow the safe route to E in 9 moves; decoy tile always resets.</p>
          )}
          {question.minigameId === 'captcha-gauntlet' && (
            <p className="assist-copy">Policy: Clear 3 rounds in one sequence before timeout.</p>
          )}
          <p className="assist-copy">
            Active coaching: {minigameAssistTier === 0 ? 'Base clarity' : minigameAssistTier === 1 ? 'Tier 1 guidance active' : 'Tier 2 strongest guidance active'}
          </p>
        </div>
      )}

      {error && <div className="assist-inline-alert" style={{ fontFamily: "'Comic Neue', cursive" }}>⚠️ {error}</div>}

      <div className="mt-4 text-sm text-[#666666] relative" style={{ fontFamily: "'VT323', monospace" }}>
        <button type="button" onClick={() => setTooltipVisible(prev => !prev)} className="text-[#0066CC] underline">
          💡 {tooltipVisible ? 'Hide help' : 'Show help'}
        </button>
        {tooltipVisible && (
          <div className="tooltip-evil mt-2 assist-panel">
            <p className="font-bold mb-1" style={{ fontFamily: "'Bangers', cursive" }}>HELP IS HERE!</p>
            <p className="assist-copy">{question.helpText}</p>
            <p className="assist-copy text-[#999999]">(Tap/click to close this help panel.)</p>
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
    minigameAssistTier: AssistTier;
    onMinigamePass: (gameId: MinigameId, meta: Record<string, number>) => void;
    onMinigameFail: (gameId: MinigameId) => void;
    onMinigameStatus: (gameId: MinigameId, status: MinigameStatusPayload) => void;
  }
) {
  if (question.type === 'minigame' && question.minigameId) {
    const gameId = question.minigameId;
    if (gameId === 'bureaucracy-queue') {
      return (
        <BureaucracyQueue
          attemptCount={minigameContext.attemptsOnStep}
          assistTier={minigameContext.minigameAssistTier}
          onPass={meta => minigameContext.onMinigamePass(gameId, meta)}
          onFail={() => minigameContext.onMinigameFail(gameId)}
          onStatus={status => minigameContext.onMinigameStatus(gameId, status)}
        />
      );
    }
    if (gameId === 'maze-consent') {
      return (
        <MazeOfConsent
          phase={minigameContext.phase}
          attemptCount={minigameContext.attemptsOnStep}
          assistTier={minigameContext.minigameAssistTier}
          onPass={meta => minigameContext.onMinigamePass(gameId, meta)}
          onFail={() => minigameContext.onMinigameFail(gameId)}
          onStatus={status => minigameContext.onMinigameStatus(gameId, status)}
        />
      );
    }
    return (
      <CaptchaGauntlet
        phase={minigameContext.phase}
        attemptCount={minigameContext.attemptsOnStep}
        assistTier={minigameContext.minigameAssistTier}
        onPass={meta => minigameContext.onMinigamePass(gameId, meta)}
        onFail={() => minigameContext.onMinigameFail(gameId)}
        onStatus={status => minigameContext.onMinigameStatus(gameId, status)}
      />
    );
  }

  if (question.type === 'slider') {
    return <HostileSlider label="How confident are you right now?" value={(answer as number) || 97} onChange={onAnswer} />;
  }

  if (question.id === 'memory-trap') {
    const value = typeof answer === 'string' ? answer : '';
    return (
      <div className="space-y-2">
        <label className="block text-sm" style={{ fontFamily: "'Comic Neue', cursive" }}>
          Recall Code
        </label>
        <select
          value={value}
          onChange={e => onAnswer(e.target.value)}
          className="assist-select"
          required
          aria-label="Select the sound code you chose in step 3"
        >
          <option value="">Select exact code from Step 3</option>
          {MEMORY_SOUND_CODES.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p className="assist-copy">Choose the exact sound code you selected earlier.</p>
      </div>
    );
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
    const selectedAction = typeof answer === 'string' ? answer : '';
    const selectedLabel = question.options?.find(option => option.value === selectedAction)?.label || 'None selected';
    return (
      <div className="space-y-3">
        <div className={`p-3 border-2 ${gateOpen ? 'bg-[#39FF14] border-[#8B4513]' : 'bg-[#FFE4E1] border-[#FF0000] animate-blink-fast'}`} style={{ fontFamily: "'VT323', monospace" }}>
          Gate status: {gateOpen ? 'OPEN' : 'CLOSED'}
        </div>
        <div className="assist-panel">
          <p className="assist-kicker">TIME-LOCK CHECKLIST</p>
          <p className="assist-copy">1) Pick any action. 2) Wait for OPEN. 3) Press Next immediately.</p>
          <p className="assist-copy">
            Selected action: <strong>{selectedLabel}</strong>
          </p>
        </div>
        {question.options?.map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => onAnswer(option.value)}
            className={`w-full p-3 text-left border-2 transition-all ${selectedAction === option.value ? 'bg-[#E6E6FA] border-[#8B4513] ring-2 ring-[#39FF14]' : 'bg-white border-[#808080]'}`}
            style={{ fontFamily: "'Comic Neue', cursive" }}
          >
            {selectedAction === option.value ? '✓ ' : ''}{option.label}
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
          <button
            key={option.id}
            onClick={() => onAnswer(option.value)}
            className={`px-6 py-3 transition-all ${answer === option.value ? 'ring-4 ring-[#FF0000]' : ''}`}
            style={{
              background: ['#FF0000', '#39FF14', '#00FFFF', '#FFFF00', '#FF69B4'][index % 5],
              color: index === 1 || index === 3 ? '#8B4513' : 'white',
              fontFamily: ['Bangers', 'Comic Neue', 'VT323', 'Press Start 2P', 'Arial Black'][index % 5],
              border: `${index + 2}px ${['solid', 'dashed', 'dotted', 'double'][index % 4]} #000`,
              transform: `rotate(${stableRotation(`button:${question.id}:${option.id}`, 5)}deg)`,
            }}
          >
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
