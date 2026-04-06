# AGENTS.md - Apuntador

## Project Overview
Web app for scoring card/dice games (Generala, Truco, etc.), later wrapped with Capacitor for Android.

## Commands
- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Type check + production build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint check

## Architecture
- **Vite + React 19 + TypeScript** with Tailwind CSS (via `@tailwindcss/vite` plugin)
- **React Router DOM** for routing (BrowserRouter)
- **Context API** for game state (`src/context/GameContext.tsx`)
- **File structure:**
  - `src/types/` - TypeScript interfaces
  - `src/data/` - Static game data (games list, categories, rules)
  - `src/context/` - React context providers
  - `src/pages/` - Route-level components
  - `src/components/` - Reusable UI components

## Routes
- `/` - Game selection screen
- `/:gameId/setup` - Game configuration (players, options)
- `/:gameId/score` - Live scoring board
- `/:gameId/result` - Final results & winner

## Adding a New Game
1. Add game entry to `src/data/games.ts` (id, name, description, icon)
2. Define categories array (with `type: 'upper' | 'lower'` and optional `values: { base, served }`)
3. Create a setup page if game needs custom config (reuse `GameSetup.tsx` if compatible)
4. Create a scoring page if game logic differs significantly from Generala
5. Add route in `App.tsx`

## Generala Rules Implemented
- Upper section: 1-6 (sum of matching dice)
- Bonus: +35 points if upper section >= 63
- Lower section: Escalera (20/25), Full (30/35), Póker (40/45), Generala (50/100)
- Optional Doble Generala (100 pts)
- Players score in rotation, one category per turn per player

## Capacitor Integration (Future)
- App is designed mobile-first (Tailwind, touch-friendly)
- When ready: `npm install @capacitor/core @capacitor/cli`, `npx cap init`, `npx cap add android`
- Build with `npm run build` before `npx cap sync`

## Style Conventions
- Dark gradient backgrounds (`from-indigo-900 via-purple-900 to-slate-900`)
- Glass-morphism cards (`bg-white/10 backdrop-blur-sm border border-white/20`)
- Purple accent colors throughout
- Mobile-first responsive design
