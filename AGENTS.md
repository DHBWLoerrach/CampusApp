# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Expo Router entry (screens, layouts). Tabs live in `app/(tabs)/` with routes like `news`, `schedule`, `canteen`, `services`.
- `components/`: Reusable UI and feature components (e.g., `ui/`, `news/`). Prefer colocating simple component styles with the component.
- `lib/`: Framework-agnostic helpers (API clients, parsers, utils). Keep side effects out of `lib`.
- `constants/`: App-wide constants and keys (e.g., `StorageKeys.ts`).
- `context/` and `hooks/`: React Context providers and custom hooks.
- `assets/`: Fonts, images, screenshots. Load fonts in `app/_layout.tsx`.
- `android/`, `ios/`: Generated native projects managed by Expo with CNG (not in git repo)
- `scripts/`: One-off utilities (e.g., `parse-ics.js`).

## Build, Test, and Development Commands

- `npm install`: Install dependencies.
- `npm run start` or `npx expo`: Start Metro bundler and open Expo tools.
- `npm run android` | `npm run ios` | `npm run web`: Run locally on Android, iOS, or Web.
- `npm run lint`: ESLint check using `eslint-config-expo`.
- `npm run test:ics`: Run the `.ics` parsing script for schedule data.
- EAS builds: Use Expo EAS (see `eas.json`) for CI/release builds.

## Coding Style & Naming Conventions

- TypeScript, strict mode enabled; 2-space indentation.
- Components: PascalCase `*.tsx` (e.g., `ThemedText.tsx`). Hooks: `useX.ts`.
- Constants: PascalCase files; exported constants in UPPER_SNAKE_CASE where appropriate.
- Path alias `@/*` is available (see `tsconfig.json`).
- Lint before pushing: `npm run lint` (fix issues or justify with comments).
- Code comments always in English

## Testing Guidelines

- No formal test framework configured yet. Prefer adding Jest + React Native Testing Library.
- Name tests `*.test.ts`/`*.test.tsx`, colocated with the unit or under `__tests__/`.
- Validate critical flows manually on Android, iOS, and Web; run `npm run lint` in CI.

## Commit & Pull Request Guidelines

- Commits: Imperative, concise subject (e.g., "Add role-based pricing").
- Branches: `feature/…`, `fix/…`, `chore/…`.
- PRs: Clear description, linked issues (`#123`), screenshots for UI changes (light/dark, Android/iOS), reproduction/testing steps, and notes on `.env` keys.
- Do not commit secrets. Store API keys in `.env` (ignored by Git).

## Security & Configuration Tips

- Request required keys (e.g., Mensa/SWFR) and add to `.env`.
- Keep `app.json` and `eas.json` consistent with platform settings and updates.
