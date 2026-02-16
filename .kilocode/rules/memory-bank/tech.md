# Technical Context: Next.js Starter Template

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| TypeScript   | 5.9.x   | Type-safe JavaScript            |
| Tailwind CSS | 4.x     | Utility-first CSS               |
| Bun          | Latest  | Package manager & runtime       |

## Development Environment

### Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Node.js 20+ (for compatibility)

### Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun build          # Production build
bun start          # Start production server
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
npm run lint       # ESLint (current workflow)
npm run typecheck  # TypeScript no-emit check
npm run build      # Next production build
```

## Project Configuration

### Next.js Config (`next.config.ts`)

- App Router enabled
- Default settings for flexibility

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path alias: `@/*` → `src/*`
- Target: ESNext

### Tailwind CSS 4 (`postcss.config.mjs`)

- Uses `@tailwindcss/postcss` plugin
- CSS-first configuration (v4 style)

### ESLint (`eslint.config.mjs`)

- Uses `eslint-config-next`
- Flat config format

## Key Dependencies

### Production Dependencies

```json
{
  "next": "^16.1.3", // Framework
  "react": "^19.2.3", // UI library
  "react-dom": "^19.2.3" // React DOM
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.9.3",
  "@types/node": "^24.10.2",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@tailwindcss/postcss": "^4.1.17",
  "tailwindcss": "^4.1.17",
  "eslint": "^9.39.1",
  "eslint-config-next": "^16.0.0"
}
```

## File Structure

```
/
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── bun.lock                # Bun lockfile
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs      # PostCSS (Tailwind) config
├── eslint.config.mjs       # ESLint configuration
├── public/                 # Static assets
│   └── .gitkeep
└── src/                    # Source code
    └── app/                # Next.js App Router
        ├── layout.tsx      # Root layout
        ├── page.tsx        # Home page
        ├── globals.css     # Global styles
        └── favicon.ico     # Site icon
```

## Technical Constraints

### Starting Point

- Minimal structure - expand as needed
- No database by default (use recipe to add)
- No authentication by default (add when needed)

### Browser Support

- Modern browsers (ES2020+)
- No IE11 support

## Performance Considerations

### Image Optimization

- Use Next.js `Image` component for optimization
- Place images in `public/` directory

### Bundle Size

- Tree-shaking enabled by default
- Tailwind CSS purges unused styles

### Core Web Vitals

- Server Components reduce client JavaScript
- Streaming and Suspense for better UX

## Deployment

### Build Output

- Server-rendered pages by default
- Can be configured for static export

### Environment Variables

- None required for base template
- Add as needed for features
- Use `.env.local` for local development

## Hostility Primitive Runtime (2026-02-16)

- Added `src/data/hostilityPrimitives.ts` with phase probabilities, cooldowns, and guardrail defaults.
- Added client interaction components:
  - `src/components/TargetedCursorLayer.tsx`
  - `src/components/FakeBrowserChrome.tsx`
  - `src/components/FocusSaboteur.tsx`
  - `src/components/ClipboardSaboteur.tsx`
  - `src/components/DragFrictionField.tsx`
- Extended `src/data/tourEvents.ts` with primitive effects:
  - `cursor-trap`, `focus-trap`, `clipboard-trap`, `drag-friction`, `chrome-mislead`

## Ultra-Hostility V3 Runtime (2026-02-16)

- Expanded tour content model in `src/data/questions.ts` to 18 steps with required minigame metadata (`minigameId`, `requiredWinCondition`) and mutation hooks.
- Added V3 data modules:
  - `src/data/skinPacks.ts` (8 skin packs + mutation cooldown rules + module map helpers)
  - `src/data/minigames.ts` (minigame IDs/spec metadata)
- Extended `src/data/tourEvents.ts` effects with:
  - `cursor-global-shift`, `cursor-desync`
  - `loading-loop`, `loading-regress`, `loading-stall`
  - `skin-mutate`, `minigame-interrupt`
- Added V3 runtime components:
  - `src/components/CursorCorruptionLayer.tsx`
  - `src/components/LoadingLabyrinthButton.tsx`
  - `src/components/BureaucracyQueue.tsx`
  - `src/components/MazeOfConsent.tsx`
  - `src/components/CaptchaGauntlet.tsx`
- `src/app/tour/page.tsx` now wires:
  - required minigame gates (steps 6/11/16)
  - loading labyrinth commit button
  - global cursor corruption + targeted cursor traps
  - focus/clipboard/drag sabotage layers
  - per-module skin roulette + mutation pulses
  - extended session payload diagnostics (`cursorMetrics`, `loadingMetrics`, `skinMetrics`, `minigameMetrics`)
- `src/app/page.tsx`, `src/app/exhibits/page.tsx`, `src/app/help/page.tsx`, and `src/app/settings/page.tsx` now run lighter global cursor + skin roulette mutations.
- `src/app/globals.css` includes:
  - cursor corruption visuals
  - loading labyrinth styles
  - minigame shell/grid styles
  - skin-pack and pulse animation classes
- Verification performed:
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
