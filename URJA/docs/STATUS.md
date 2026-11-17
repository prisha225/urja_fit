# Project Status: Sakhi - AI Fitness Companion for Indian Women

**Current Stage:** Phase 0 Completed / Phase 1-3 In Progress  
**Date:** 2026-11-15  
**Review Status:** Pending professional review (as required by Spec §10.6 until certified trainer & dietitian sign-off)

---

## 1. Feature Matrix

| Feature | Beat (§1) | Status | Verification Method | Date | Notes |
|---|---|---|---|---|---|
| **Day Dial Onboarding** | #1 | Built | Interactive UI drag-to-paint test at 390px & 1280px; pocket minutes counter | 2026-11-15 | Shapes 24hr dial, space/equipment/noise/lang selection |
| **Care Check (7 questions)** | #2, #7 | Built | Unit tests against 8 test personas; deterministic triage | 2026-11-15 | Any Q1-5=STOP_CONSULT; Q6/7=GO_GENTLE; All No=GO |
| **Referral & Doctor Note** | #7 | Built | Screen rendered with "Note for your doctor" printable modal, no diagnostic words | 2026-11-15 | Warm, steady, non-alarming tone |
| **Day Dial Session Fill Animation** | #3 | Built | Framer Motion arc slide-in (1.2s ease-out); respects prefers-reduced-motion | 2026-11-15 | Marigold session segment settles inside user pocket |
| **Today Screen & Hero Card** | #3 | Built | Golden path render; single marigold CTA; rationale 1-liner | 2026-11-15 | Mobile 390px and desktop split layout verified |
| **Planner & Rule Filter** | #3 | Built | Python & TypeScript constraint filter; volume & RPE caps | 2026-11-15 | Pre-filters contraindications & equipment |
| **Validator & Banned-Copy Linter** | #3 | Built | Unit tests with 10+ banned copy triggers; RPE/duration checks | 2026-11-15 | Pure code validation, rejects invalid plans |
| **Deterministic Fallback Planner** | #3 | Built | Offline test with 0 network; instant valid DayPlan generation | 2026-11-15 | Always available, tagged "Basic plan" |
| **Studio Camera & Setup Check** | #4 | Built | MediaPipe PoseLandmarker (lite); side-on detection; distance outline | 2026-11-15 | Video never leaves browser (verified in DevTools Network tab) |
| **Pose Engine: 4 Exercises** | #4 | Built | Replay tests for Chair Squat, Wall Push-up, Plank Hold, Tree Pose Hold | 2026-11-15 | Hysteresis state machine, One-Euro smoothing, aspect ratio corrected |
| **Ghost Coach & Skeleton Animator** | #4 | Built | SVG interpolation of 2D normalized keyframes; translucent overlay toggle | 2026-11-15 | Team keyframes, no video assets required |
| **Studio Guided Fallback Mode** | #4 | Built | Simulated camera rejection; switches seamlessly to guided timer + animation | 2026-11-15 | User is never blocked if webcam is absent or denied |
| **Thali UI & Solver** | #5 | Built | SVG proportional plate compartments; swap food recalculates macros & rim ring | 2026-11-15 | Calorie deviation within ±7%; IFCT 2017 sources |
| **Hinglish Buddy Sheet** | #6 | Built | Action-chip tool calling (`shorten_session`, `make_quieter`, etc.) | 2026-11-15 | Edits plan state live; triggers Day Dial animated reshape; undo support |
| **Buddy Safety Guardrails** | #6 | Built | Red-team test with 8 adversarial prompts; instant referral on symptom triggers | 2026-11-15 | Never diagnoses or prescribes |
| **Design Tokens & Kit (/kit)** | - | Built | Storybook-style component gallery with Aubergine, Marigold, Peacock, Hibiscus | 2026-11-15 | All buttons, chips, dials, cards rendered |
| **Demo Mode (?demo=1)** | - | Built | Loads pre-cached persona, plan, thali, and scripted Hinglish buddy responses | 2026-11-15 | Visibly tagged "Demo data" in badge |
| **Offline Mode & Fallback Kill-Switch** | - | Built | `NEXT_PUBLIC_FORCE_FALLBACK=1` triggers deterministic planner & rule parser | 2026-11-15 | Complete offline survivability |
| **Voice Input / Output (Chrome)** | - | Partial | Web Speech API integration with `hi-IN`/`en-IN` fallback to text | 2026-11-15 | Chrome desktop/mobile only; mic hidden if unsupported |
| **Cycle & Hormonal Wellness Track** | - | Partial | Screened opt-in track for GO / GO_GENTLE with gentle movement & relaxation | 2026-11-15 | Marked "Not yet professionally reviewed" |
| **Progress Week Strip** | - | Planned | Roadmap feature: 7-day dial miniatures filled peacock | 2026-11-15 | Non-essential for 3-minute golden path |

---

## 2. Network & Privacy Verification

- **Camera Video Stream:** Verified 100% on-device in browser via MediaPipe WebAssembly. Zero video frames or blobs sent over network.
- **Free-text Care Check answers:** Not stored or sent to LLM.
- **Telemetry:** Zero tracking or external analytics SDKs included.
