# Contract changes

## 2026-11-15 — Phase 0 contract resolution

1. `DayPlan.source` is an optional enum: `"llm" | "fallback"`. It is required by the fallback behavior; when it is `fallback`, the UI must show **Basic plan**. Existing plan producers may omit it only until they identify their source.
2. `DayPlan` remains the schema for exactly one calendar day. Planner endpoints return the new `PlanResponse` envelope: `{ "plans": DayPlan[] }`. This removes the API collection ambiguity without changing the day contract.

Affected future workstreams: UI must render the Basic plan tag; Planner must return `PlanResponse`; tests and fixtures use the frozen schemas.
