# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Apuntador** is a card/dice game scorekeeper app built with React + Vite + TypeScript, packaged as an Android APK via Capacitor. Supports four games: Generala (dice), Truco, UNO, and Conga.

## Commands

```bash
npm run dev          # Dev server in browser
npm run build        # TypeScript check + Vite build → dist/
npm run lint         # ESLint
npm run sync         # Copy dist/ to Android project (npx cap sync android)
```

No test suite exists in this project.

### Android APK release flow

1. Bump `version` (and optionally `versionCode`) in `package.json`
2. `npm run build` → `npm run sync`
3. Open `android/` in Android Studio → Build > Build APK(s)
4. APK output: `android/app/build/outputs/apk/debug/app-debug.apk`
5. Publish as a GitHub Release at `nestorlesna/Anotador` with tag `vX.Y.Z`; include `versionCode: N` in the release body so the in-app update checker can parse it

## Architecture

All app state lives in a single React context (`src/context/GameContext.tsx`). There is no external state library.

**Routing** (`src/App.tsx`): four routes driven by `gameId` URL param:
- `/` → game selector
- `/:gameId/setup` → player names + options
- `/:gameId/score` → active scoring
- `/:gameId/result` → final standings

**Data flow**: `GameSetup` calls `setConfig(GameConfig)`, which initialises the score structures. During play, `ScorePage` calls either `submitScore` (Generala — category-based) or `addPoints` (Truco/UNO/Conga — cumulative). `isComplete` is derived inside the context and `winner` is computed there as well.

**Game-specific logic lives inside `GameContext.addPoints`**:
- *Truco*: score is set absolutely per team (`Math.max(0, points)`), complete when any team ≥ `targetScore`
- *UNO*: cumulative per player, keeps last-5-rounds history, complete when any player ≥ `targetScore`
- *Conga*: cumulative per player, complete when only one player remains below `targetScore`; supports `applyReenganche` (resets eliminated player to the current lowest score)

**Generala specifics** (`src/data/games.ts`): upper section (1–6) triggers a +35 bonus when their sum ≥ 63. Optional "Doble Generala" category added via `doubleGenerala` config flag.

**Version checker** (`src/components/VersionChecker.tsx`): wraps the whole app, checks `api.github.com/repos/nestorlesna/Anotador/releases/latest` after a 2-second delay. `APP_VERSION` and `APP_VERSION_CODE` inside that file must be kept in sync with `package.json` manually before each release.

## Key files

| File | Role |
|------|------|
| `src/context/GameContext.tsx` | All game state, scoring logic, winner determination |
| `src/data/games.ts` | Game list, Generala categories, bonus constants |
| `src/types/index.ts` | All shared TypeScript types |
| `src/components/VersionChecker.tsx` | Auto-update banner (update `APP_VERSION` here on release) |
| `capacitor.config.ts` | Capacitor/Android app config (`appId`, `webDir`) |
