# System Patterns: Next.js Starter Template

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Home page
│   ├── globals.css         # Tailwind imports + global styles
│   └── favicon.ico         # Site icon
└── (expand as needed)
    ├── components/         # React components (add when needed)
    ├── lib/                # Utilities and helpers (add when needed)
    └── db/                 # Database files (add via recipe)
```

## Project-Specific Architecture (Museum of Bad Decisions)

```
src/
├── app/
│   ├── page.tsx                    # Home with incident rail + living overlay
│   ├── exhibits/page.tsx           # Exhibits with unstable shift + maintenance waves
│   ├── tour/page.tsx               # 12-step phase-based hostility state machine
│   ├── certificate/page.tsx        # Certificate + survival diagnostics
│   ├── help/page.tsx               # Help/FAQ chaos page
│   └── settings/page.tsx           # Meaningless settings page
├── components/
│   ├── LivingOverlay.tsx           # Shared overlay engine for eventful dead-space fill
│   ├── Navigation.tsx              # Multi-nav mismatch + misroutes
│   ├── Popups.tsx                  # Aggressive popup triggers/chains
│   ├── ProgressBar.tsx             # Lying progress + penalty telemetry
│   ├── HellButton.tsx              # Hostile buttons and fake processing
│   └── HostileForm.tsx             # Hostile form controls
└── data/
    ├── questions.ts                # 12 questions + phase/difficulty metadata
    ├── tourEvents.ts               # Phase-scoped deterministic hostility events
    └── ...                         # badges/exhibits/disclaimers/validations
```

## Runtime Hostility Pattern

- `tour/page.tsx` uses reducer-driven `TourRunState` for stateful penalties:
  - `strikes`, `instability`, `suspicion`
  - `lockouts`, `freeze bursts`, `input corruption`
  - `recovery tokens`, `pity-pass threshold`, `hard regression cap`
- Event scheduling uses `tourEvents.ts` with phase-aware probabilities and cooldowns.
- Escalation phases:
  - Phase 1: orientation chaos
  - Phase 2: compounding penalties
  - Phase 3: maximum hostility

## Key Design Patterns

### 1. App Router Pattern

Uses Next.js App Router with file-based routing:
```
src/app/
├── page.tsx           # Route: /
├── about/page.tsx     # Route: /about
├── blog/
│   ├── page.tsx       # Route: /blog
│   └── [slug]/page.tsx # Route: /blog/:slug
└── api/
    └── route.ts       # API Route: /api
```

### 2. Component Organization Pattern (When Expanding)

```
src/components/
├── ui/                # Reusable UI components (Button, Card, etc.)
├── layout/            # Layout components (Header, Footer)
├── sections/          # Page sections (Hero, Features, etc.)
└── forms/             # Form components
```

### 3. Server Components by Default

All components are Server Components unless marked with `"use client"`:
```tsx
// Server Component (default) - can fetch data, access DB
export default function Page() {
  return <div>Server rendered</div>;
}

// Client Component - for interactivity
"use client";
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 4. Layout Pattern

Layouts wrap pages and can be nested:
```tsx
// src/app/layout.tsx - Root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// src/app/dashboard/layout.tsx - Nested layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

## Styling Conventions

### Tailwind CSS Usage
- Utility classes directly on elements
- Component composition for repeated patterns
- Responsive: `sm:`, `md:`, `lg:`, `xl:`

### Common Patterns
```tsx
// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flexbox centering
<div className="flex items-center justify-center">
```

## File Naming Conventions

- Components: PascalCase (`Button.tsx`, `Header.tsx`)
- Utilities: camelCase (`utils.ts`, `helpers.ts`)
- Pages/Routes: lowercase (`page.tsx`, `layout.tsx`)
- Directories: kebab-case (`api-routes/`) or lowercase (`components/`)

## State Management

For simple needs:
- `useState` for local component state
- `useContext` for shared state
- Server Components for data fetching

For complex needs (add when necessary):
- Zustand for client state
- React Query for server state
