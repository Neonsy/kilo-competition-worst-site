'use client';

import { useMemo, useState } from 'react';

interface MazeOfConsentProps {
  phase: 1 | 2 | 3;
  attemptCount: number;
  onPass: (meta: { moves: number; fails: number }) => void;
  onFail: () => void;
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

function safePath(seed: number): string[] {
  const paths = [
    ['0-0', '0-1', '1-1', '2-1', '2-2', '3-2', '3-3'],
    ['0-0', '1-0', '1-1', '1-2', '2-2', '2-3', '3-3'],
    ['0-0', '0-1', '0-2', '1-2', '2-2', '3-2', '3-3'],
  ];
  return paths[seed % paths.length] || paths[0];
}

export function MazeOfConsent({ phase, attemptCount, onPass, onFail }: MazeOfConsentProps) {
  const cells = useMemo(() => buildCells(), []);
  const [fails, setFails] = useState(0);
  const [moves, setMoves] = useState<string[]>(['0-0']);
  const [slowMove, setSlowMove] = useState(true);

  const activePath = useMemo(() => safePath(attemptCount + fails + phase), [attemptCount, fails, phase]);
  const decoyTile = useMemo(() => (phase === 3 ? '2-3' : '1-3'), [phase]);
  const current = moves[moves.length - 1] || '0-0';

  const resetRun = () => {
    setMoves(['0-0']);
    setFails(prev => prev + 1);
    if (fails + 1 >= 2) {
      setSlowMove(false);
    }
    onFail();
  };

  const clickCell = async (cellId: string) => {
    if (slowMove) {
      await new Promise(resolve => setTimeout(resolve, 260));
    }
    const currentIndex = activePath.indexOf(current);
    const expectedNext = activePath[currentIndex + 1];

    if (cellId === decoyTile) {
      resetRun();
      return;
    }

    if (cellId !== expectedNext) {
      resetRun();
      return;
    }

    const nextMoves = [...moves, cellId];
    setMoves(nextMoves);
    if (nextMoves.length > 9) {
      resetRun();
      return;
    }
    if (cellId === '3-3') {
      onPass({ moves: nextMoves.length - 1, fails });
    }
  };

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
    </div>
  );
}

export default MazeOfConsent;
