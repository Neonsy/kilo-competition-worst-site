'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type Position = { x: number; y: number };

const MOVE_INTERVAL_MS = 900;
const EDGE_PADDING = 16;

export default function NotFound() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const [position, setPosition] = useState<Position>({ x: EDGE_PADDING, y: EDGE_PADDING });

  const placeButton = useCallback(() => {
    const stage = stageRef.current;
    const button = buttonRef.current;
    if (!stage || !button) return;

    const stageRect = stage.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    const maxX = Math.max(EDGE_PADDING, stageRect.width - buttonRect.width - EDGE_PADDING);
    const maxY = Math.max(EDGE_PADDING, stageRect.height - buttonRect.height - EDGE_PADDING);

    const nextX = EDGE_PADDING + Math.random() * (maxX - EDGE_PADDING);
    const nextY = EDGE_PADDING + Math.random() * (maxY - EDGE_PADDING);

    setPosition({
      x: Math.min(Math.max(EDGE_PADDING, nextX), maxX),
      y: Math.min(Math.max(EDGE_PADDING, nextY), maxY),
    });
  }, []);

  useEffect(() => {
    placeButton();

    const intervalId = window.setInterval(() => {
      placeButton();
    }, MOVE_INTERVAL_MS);

    const onResize = () => placeButton();
    window.addEventListener('resize', onResize);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('resize', onResize);
    };
  }, [placeButton]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1e1a17]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-[#5b2140]/35 blur-2xl" />
        <div className="absolute right-4 top-20 h-36 w-36 rounded-full bg-[#24535c]/35 blur-2xl" />
        <div className="absolute bottom-8 left-1/3 h-32 w-32 rounded-full bg-[#4f6c2b]/30 blur-2xl" />
      </div>

      <main className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden p-4">
        <section
          ref={stageRef}
          className="relative h-full max-h-[92vh] w-full max-w-4xl overflow-hidden border-4 border-dashed border-[#8a131c] bg-[#28231f]/95 p-5 shadow-[0_0_0_3px_#3a2315]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(138,19,28,0.08)_0_1px,transparent_1px_9px),linear-gradient(0deg,rgba(36,83,92,0.08)_0_1px,transparent_1px_11px)]" />

          <div className="relative z-10 mx-auto mt-2 max-w-2xl text-center">
            <p
              className="animate-blink text-[11px] uppercase tracking-[0.2em] text-[#bfae8c]"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Navigation Incident Report
            </p>
            <h1
              className="mt-4 text-6xl text-[#d7d1c7] md:text-8xl"
              style={{ fontFamily: "'Bangers', cursive", textShadow: '3px 3px 0 #411821' }}
            >
              404
            </h1>
            <p
              className="mt-3 text-lg text-[#c9bb9f]"
              style={{ fontFamily: "'Comic Neue', cursive" }}
            >
              This exhibit escaped containment.
            </p>
            <p
              className="mt-2 text-sm text-[#a89d8d]"
              style={{ fontFamily: "'VT323', monospace" }}
            >
              Home route is available, but only if you can catch the button.
            </p>
          </div>

          <Link
            ref={buttonRef}
            href="/"
            className="absolute z-20 inline-flex min-h-[46px] items-center justify-center border-2 border-[#efd9a8] bg-gradient-to-b from-[#7a1c2d] to-[#4f1220] px-5 py-2 text-sm font-bold uppercase tracking-[0.08em] text-[#fff2d0] transition-all duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f9dfae]"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              fontFamily: "'Bangers', cursive",
            }}
          >
            Back To Home
          </Link>
        </section>
      </main>
    </div>
  );
}
