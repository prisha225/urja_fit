# Contract Changes Log

All contracts are defined in `/packages/contracts` and frozen at Phase 0 according to Build Spec §0.4.

| Date | Contract | Change Description | Reason | Affected Streams |
|---|---|---|---|---|
| 2026-11-15 | `packages/contracts` | Baseline freeze: UserProfile, ScreeningResult, Exercise, Block, Session, DayPlan, Meal, MealPlan, Food | Initial Phase 0 freeze per Spec §4 | All (A, B, C, D, E) |
| 2026-11-15 | `packages/contracts/types.ts` | Added `BuddyToolCall` and `BuddyActionResponse` interfaces | Explicit contract for Buddy tool-calling and UI undo actions | Streams A, C |
