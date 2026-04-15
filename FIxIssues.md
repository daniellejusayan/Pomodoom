Excellent progress: I reviewed the details and we now have a precise target list of technical debt to fix. Next I’ll draft a concrete, prioritized implementation plan for each issue, with file targets, dependencies, and validation steps.

Created memory file [](file:///c%3A/Users/Danielle%20Jerick/AppData/Roaming/Code/User/workspaceStorage/891102fef46172d25055ca17a7214b31/GitHub.copilot-chat/memory-tool/memories/NmEwODQ3OTctZThhMC00MmU2LTlkNTgtZWNkM2M3MmI1YzU0/plan.md)

## Plan: Fix code smells + security issues one by one

Great news: the plan is ready and saved to `/memories/session/plan.md`.  
You’re now set with an actionable roadmap that matches your requested issue list and the codebase exactly.

### TL;DR
1. Implement complete `SessionContext`.
2. Refactor `HomeTimerScreen` responsibilities into hooks.
3. Add top-level `ErrorBoundary`.
4. Add model-level validation (`Zod`), reject invalid user input with UI feedback.

---

## Issue 1: SessionContext declared but not implemented

### Why
- Dead type-only context leads invalid trust / false completeness.
- Statistics uses fake data from StatisticsScreen.tsx arrays (`weeklyData`, `dailySessionsData`).

### Proposed fix
- New file `src/context/SessionContext.tsx`:
  - `SessionContextType` is already in types.ts.
  - Implement `SessionContext` via `createContext`.
  - Provide state: `activeSession`, `history`.
  - Actions: `startSession`, `completeSession`, `addSession`.
  - Persist into `AsyncStorage` with key `@pomodoom_sessions`.
  - Load on start.

- Update App.tsx:
  - Wrap children in `SessionProvider` (alongside `SettingsProvider`).

- Update StatisticsScreen.tsx:
  - Remove hardcoded mock arrays.
  - Use context-derived statistics from `useSession` or computed from session history.
  - For fallback with no data, show empty state.

### Validation
- Verify `sessionHistory`, `activeSession` persist across reload.
- `start/complete` path must create and store session with `start`, `end`, `duration`.

---

## Issue 2: HomeTimerScreen single-responsibility violation

### Why
- Complex file with UI + appstate + penalty + timer.
- Hard to maintain, test, reason about.

### Proposed fix
- New `src/features/timer/hooks/useAppStateHandler.ts`:
  - manage `AppState` listener.
  - emit events: `onBackground`, `onForeground`.
  - return `appState` value.

- New (or updated) business hook for background penalty:
  - e.g. `useBackgroundPenalty` using `useAppStateHandler`.
  - calls `recordPenaltyUsage` and `addSessionInterruptions` on penalty type.

- HomeTimerScreen.tsx becomes pure render + props from:
  - `useTimer` hook (existing).
  - `useSettings` and penalty hook.
  - local UI state only.
  - Comments for edge cases e.g., "background if timer running means rapid rollback".

- Ensure not duplicating timer lifecycle in file; use existing `useTimerState/useTimerActions/useTimerData`.

### Validation
- Works on app background/foreground transitions and penalizes as expected.
- Timer UI unaffected by refactor.
- Unit test hook logic independent.

---

## Issue 3: Missing global ErrorBoundary

### Why
- App can crash without recovery path; only console errors exist.
- User no visible info, no safe fallback.

### Proposed fix
- Create `src/shared/components/ErrorBoundary/ErrorBoundary.tsx` + styles.
- In App.tsx (or `RootNavigator`), wrap main app UI:
  - `<ErrorBoundary><Navigation/></ErrorBoundary>`.
- Fallback UI:
  - "Something went wrong."
  - buttons: "Retry app" (reload), "Report issue".
- In `componentDidCatch`, log to console and optionally local state.

### Validation
- Simulate throw in child component -> fallback renders.
- Confirm app does not break total navigation stack.

---

## Issue 4: Minimal validation for inputs/settings

### Why
- No schema validation for settings gives invalid persisted state.
- ToDo limit only UI; no feedback if invalid.

### Proposed fix
- Add `zod` library (`npm install zod`).
- Define schemas:
  - `src/context/validation/settingsSchema.ts` (focus 1-120, break 1-60, penalty types set, booleans).
  - `src/shared/components/ToDoList/ToDoList.schema.ts` (`text` string trimmed 1-200, no control chars maybe).
- Apply on:

  - SettingsContext.tsx load/save path:
    - validate `settings` from AsyncStorage before set state.
    - sanitize failure to defaults and console.warn.

  - `setFocusDuration` etc:
    - pre-validate changes and reject with thrown error or return false.
    - add `setValidationError` state, include in context.

- UI in `SettingsScreen` and `ToDoList`:
  - display error toast/message when invalid.
  - block save actions with invalid input.

### Validation
- Test invalid settings in AsyncStorage dumps and see corrected behavior.
- Test in UI by entering invalid durations (0, 999, text) and message shown.

---

## Cross-cutting fixes

- Add helper in index.ts for common read/write with typed schema + sanitization.
- Consider enabling `expo-secure-store` in future for issue-based item 1.
- Add unit tests:
  - `SessionContext` actions.
  - `useAppStateHandler`.
  - `ErrorBoundary`.
  - "invalid settings are rejected".

---

## Prioritization & roadmap (one by one)

1. SessionContext + Stats real data
2. Timer refactor (useAppStateHandler + cleaner HomeTimer)
3. ErrorBoundary top-level
4. Validation + UI messages

---

## Manual & automatic verification

- `npm run test` existing + new tests.
- Manual scenarios:
  - Settings persist + invalid input fails nicely.
  - ToDo add complete delete.
  - Background penalty path in foreground/background.
  - Throw exception to trigger ErrorBoundary.
- Check code style format.

---

## Notes

- `SessionContextType` already exists and can be reused; no major design changes.
- `SettingsContext` has extensive saveSettings code; refactor to avoid repetition (maybe single `persistAllSettings` helper).
- Keep final documentation updated with the same issue/tracking table as your question.