'use client';

import { useEffect, useMemo, useState } from 'react';

type AssistTier = 0 | 1 | 2;

interface MazeStatus {
  mode: 'running' | 'failed' | 'passed';
  moves: number;
  fails: number;
  lastResetReason?: string;
}

interface MazeOfConsentProps {
  phase: 1 | 2 | 3;
  attemptCount: number;
  assistTier: AssistTier;
  onPass: (meta: { moves: number; fails: number }) => void;
  onFail: () => void;
  onStatus?: (status: MazeStatus) => void;
}

interface Cell {
  id: string;
  row: number;
  col: number;
}

const size = 4;

function buildCells(): Cell[] {
  const cells: Cell[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      cells.push({ id: `${row}-${col}`, row, col });
    }
  }
  return cells;
}

function safePath(seed: number, phase: 1 | 2 | 3): string[] {
  const allPaths = [
    ['0-0', '0-1', '1-1', '2-1', '2-2', '3-2', '3-3'],
    ['0-0', '1-0', '1-1', '1-2', '2-2', '2-3', '3-3'],
    ['0-0', '0-1', '0-2', '1-2', '2-2', '3-2', '3-3'],
  ];
  const decoyTile = phase === 3 ? '2-3' : '1-3';
  const validPaths = allPaths.filter(path => !path.includes(decoyTile));
  if (validPaths.length === 0) return allPaths[0] || [];
  return validPaths[seed % validPaths.length] || validPaths[0];
}

function getDirection(fromId: string, toId: string): string {
  const [fromRow, fromCol] = fromId.split('-').map(Number);
  const [toRow, toCol] = toId.split('-').map(Number);
  if (toCol > fromCol) return 'Move right.';
  if (toCol < fromCol) return 'Move left.';
  if (toRow > fromRow) return 'Move down.';
  if (toRow < fromRow) return 'Move up.';
  return 'Hold position and re-check route.';
}

export function MazeOfConsent({ phase, attemptCount, assistTier, onPass, onFail, onStatus }: MazeOfConsentProps) {
  const cells = useMemo(() => buildCells(), []);
  const [fails, setFails] = useState(0);
  const [moves, setMoves] = useState<string[]>(['0-0']);
  const [slowMove, setSlowMove] = useState(true);
  const [mode, setMode] = useState<MazeStatus['mode']>('running');
  const [lastResetReason, setLastResetReason] = useState<string | null>(null);

  const activePath = useMemo(() => safePath(attemptCount + fails + phase, phase), [attemptCount, fails, phase]);
  const decoyTile = useMemo(() => (phase === 3 ? '2-3' : '1-3'), [phase]);
  const current = moves[moves.length - 1] || '0-0';
  const currentIndex = activePath.indexOf(current);
  const expectedNext = activePath[currentIndex + 1];

  useEffect(() => {
    onStatus?.({
      mode,
      moves: Math.max(0, moves.length - 1),
      fails,
      lastResetReason: lastResetReason || undefined,
    });
  }, [fails, lastResetReason, mode, moves.length, onStatus]);

  const resetRun = (reason: string) => {
    setMode('failed');
    setLastResetReason(reason);
    setMoves(['0-0']);
    setFails(prev => prev + 1);
    if (fails + 1 >= 2) {
      setSlowMove(false);
    }
    onFail();
  };

  const clickCell = async (cellId: string) => {
    setMode('running');
    if (slowMove) {
      await new Promise(resolve => setTimeout(resolve, 260));
    }

    if (cellId === decoyTile) {
      resetRun(`Decoy tile ${decoyTile} triggered reset.`);
      return;
    }

    if (cellId !== expectedNext) {
      resetRun(`Wrong tile selected. Expected ${expectedNext || 'route end'}.`);
      return;
    }

    const nextMoves = [...moves, cellId];
    setMoves(nextMoves);
    if (nextMoves.length > 9) {
      resetRun('Move overflow reset (more than 9 moves).');
      return;
    }
    if (cellId === '3-3') {
      setMode('passed');
      setLastResetReason(null);
      onPass({ moves: nextMoves.length - 1, fails });
    }
  };

  const tierOneHint = expectedNext ? getDirection(current, expectedNext) : 'Final tile is adjacent.';
  const tierTwoHint = expectedNext ? `Next safe tile: ${expectedNext}` : 'Step onto E to complete.';

  return (
    <div className="minigame-shell">
      <p className="minigame-title">Maze of Consent</p>
      <p className="minigame-subtitle">Reach the end tile in 9 moves or fewer. One fake success tile resets you.</p>
      <div className="maze-grid">
        {cells.map(cell => {
          const visited = moves.includes(cell.id);
          return (
            <button
              key={cell.id}
              type="button"
              onClick={() => clickCell(cell.id)}
              className={`maze-cell ${visited ? 'visited' : ''} ${cell.id === '3-3' ? 'goal' : ''}`}
            >
              {cell.id === '0-0' ? 'S' : cell.id === '3-3' ? 'E' : '□'}
            </button>
          );
        })}
      </div>
      <p className="minigame-hint">Moves: {moves.length - 1}/9 | Failures: {fails}</p>
      <p className="minigame-hint">Run policy: progress persists through lockout/freeze/noise. Reset only on fail or step change.</p>
      <p className="minigame-hint">Last reset: {lastResetReason || 'No reset yet.'}</p>
      {assistTier >= 1 && <p className="minigame-hint">Assist hint: {tierOneHint}</p>}
      {assistTier >= 2 && <p className="minigame-hint">Assist hint+: {tierTwoHint}</p>}
    </div>
  );
}

export default MazeOfConsent;
