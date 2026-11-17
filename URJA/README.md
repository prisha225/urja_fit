# Sakhi: AI Fitness Companion for Indian Women

> **Golden Path Prototype:** Built strictly according to the Prototype Build Spec. Designed around her day with the signature **Day Dial**, on-device Pose tracking, Indian food **Thali** plate rebalancer, and a conversational **Hinglish Buddy** that dynamically reshapes her workout plan.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18 (Tested on v26.6.0)
- Python >= 3.10 (Tested on 3.12.0)

### Run the Web Prototype
```bash
cd apps/web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser (Google Chrome recommended for Web Speech and PoseLandmarker).

### Run the FastAPI Backend (Optional)
The web client includes deterministic offline fallbacks and local solvers, but the full FastAPI pipeline can also be run:
```bash
cd apps/api
uvicorn main:app --reload --port 8000
```
API Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### Component Kit & Design System
Visit [http://localhost:3000/kit](http://localhost:3000/kit) to inspect the design tokens, color palette, Day Dial, Thali plate, and animated skeleton guides.

---

## 2. The 3-Minute Golden Path (§1)

| Beat | Screen | Route | Description |
|---|---|---|---|
| **1** | Day Dial Onboarding | `/` | Drag or tap free pockets on the 24-hr circular dial. Pick space (tiny flat), equipment (chair, none), noise (quiet), and language (Hinglish). |
| **2** | Care Check | `/care` | 7 calm Yes/No questions. Any red-flag routes to referral. All No continues. |
| **3** | Today | `/today` | The Day Dial fills with an animated marigold segment inside her pocket. Hero card: *18 min · quiet · no equipment*. |
| **4** | Studio Live | `/studio` | Setup check outline (~2m away, side-on), on-device PoseLandmarker, rep counter with peacock ring, form band, and cues. |
| **5** | Thali Plate | `/thali` | Circular Indian thali plate with compartments proportional to grams. Tap any dish (e.g. roti -> brown rice) to rebalance portions within ±7% kcal. |
| **6** | Hinglish Buddy | Floating button | Tap "Ask Sakhi" and say *"aaj 10 minute hi hain"*. Buddy shortens the session and the Day Dial reshapes in real time with an Undo chip. |
| **7** | Referral Safety | `/referral` | Demonstrates red-flag safety routing with a printable "Note for your doctor". |

---

## 3. Demo Modes and Fallbacks (§12)

- **Demo Persona Mode:** Append `?demo=1` to any URL (e.g. `http://localhost:3000/?demo=1`). Loads Priya's seeded profile with a visible "Demo data" tag for stage reliability.
- **Offline / Kill-Switch:** `NEXT_PUBLIC_FORCE_FALLBACK=1` activates the pure deterministic planner and rule parser. Works 100% offline with zero network calls.
- **Camera Fallback:** If camera permission is denied or webcam is absent, Studio switches seamlessly to guided animation mode without blocking the user.

---

## 4. Test Suites

Run all automated tests across the contract schemas, validator rules, personas, and nutrition solver:
```bash
# 1. Dataset integrity validator
python tools/validate_data.py

# 2. Pydantic contract fixture validation
python tests/test_fixtures.py

# 3. Planner validator & banned-copy linter
python tests/test_validator.py

# 4. Care check persona screening triage
python tests/test_care_check.py

# 5. Nutrition solver & portion rebalancing
python tests/test_nutrition_solver.py

# 6. FastAPI endpoint unit & integration tests
python tests/test_api.py
```

---

## 5. Documentation Directory

- `docs/STATUS.md`: Feature verification matrix, truth labels (`Built`, `Partial`, `Planned`).
- `docs/SAFETY.md`: Safety specification, care check logic, red-team prompt logs, and review gate status.
- `docs/CREDITS.md`: Full attribution of libraries, fonts, scientific sources (IFCT 2017), and team keyframe recordings.
- `docs/DEMO.md`: 90-second video script and live demonstration protocol.
- `docs/CONTRACT_CHANGES.md`: Frozen contract registry.
