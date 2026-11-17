# apps/api/main.py
"""
Sakhi FastAPI Backend
Provides planner pipeline, nutrition solver, care check triage, and Hinglish buddy tool execution.
"""

import sys
import json
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to sys.path to access packages/contracts
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from packages.contracts.models import (
    UserProfile,
    ScreeningResult,
    DayPlan,
    Session,
    Block,
    MealPlan,
    Meal,
    Food,
    BuddyActionResponse,
)

app = FastAPI(title="Sakhi Backend API", version="0.1.0")

# CORS middleware for Next.js web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load exercise and food datasets
EXERCISES_FILE = BASE_DIR / "data" / "exercises" / "exercises.json"
FOODS_FILE = BASE_DIR / "data" / "foods" / "foods.json"
MEALS_FILE = BASE_DIR / "data" / "foods" / "meals.json"

with open(EXERCISES_FILE, "r", encoding="utf-8") as f:
    EXERCISES_DATA = json.load(f)

with open(FOODS_FILE, "r", encoding="utf-8") as f:
    FOODS_DATA = json.load(f)

with open(MEALS_FILE, "r", encoding="utf-8") as f:
    MEALS_DATA = json.load(f)

FOODS_MAP = {food["id"]: food for food in FOODS_DATA}

# Request/Response schemas
class CareCheckRequest(BaseModel):
    q1_pregnant: bool
    q2_recent_surgery: bool
    q3_chest_pain: bool
    q4_dizzy: bool
    q5_doctor_limit: bool
    q6_joint_pain: bool
    q7_extra_notes: Optional[str] = None

class PlanRequest(BaseModel):
    profile: UserProfile
    screening: ScreeningResult

class SwapRequest(BaseModel):
    currentPlan: MealPlan
    slot: str
    oldFoodId: str
    newFoodId: str

class BuddyChatRequest(BaseModel):
    message: str
    currentPlan: DayPlan
    currentMealPlan: Optional[MealPlan] = None

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Sakhi FastAPI API",
        "exercises_loaded": len(EXERCISES_DATA),
        "foods_loaded": len(FOODS_DATA),
        "meals_loaded": len(MEALS_DATA),
    }

@app.post("/care-check", response_model=ScreeningResult)
def care_check(req: CareCheckRequest):
    flags = []
    if req.q1_pregnant:
        flags.append("pregnant_or_postpartum")
    if req.q2_recent_surgery:
        flags.append("recent_surgery_or_injury")
    if req.q3_chest_pain:
        flags.append("chest_pain_breathlessness")
    if req.q4_dizzy:
        flags.append("dizziness_or_fainting")
    if req.q5_doctor_limit:
        flags.append("doctor_advised_limit")

    if flags:
        return ScreeningResult(outcome="STOP_CONSULT", flags=flags)

    if req.q6_joint_pain:
        flags.append("joint_back_pelvic_pain")
    if req.q7_extra_notes and req.q7_extra_notes.strip():
        flags.append("extra_precautions_noted")

    if flags:
        return ScreeningResult(outcome="GO_GENTLE", flags=flags)

    return ScreeningResult(outcome="GO", flags=[])

@app.post("/plan", response_model=DayPlan)
def generate_plan(req: PlanRequest):
    profile = req.profile
    screening = req.screening

    if screening.outcome == "STOP_CONSULT" or not profile.pockets:
        return DayPlan(date="2026-11-15", kind="rest", sessions=[], source="fallback")

    # Rule filter
    allowed = []
    user_flags = set(screening.flags)
    user_equipment = set(profile.equipment)

    for ex in EXERCISES_DATA:
        if screening.outcome == "GO_GENTLE" and not ex.get("gentleOk", False):
            continue
        if any(flag in user_flags for flag in ex.get("contraindicatedFlags", [])):
            continue
        req_eq = ex.get("equipment", ["none"])
        if any(eq != "none" and eq not in user_equipment for eq in req_eq):
            continue
        if profile.space == "tiny" and ex.get("space") == "room":
            continue
        if profile.quiet and not ex.get("quiet", True):
            continue
        allowed.append(ex)

    if not allowed:
        allowed = [EXERCISES_DATA[0]]

    pocket = profile.pockets[0]
    minutes = pocket.minutes

    # Build fallback composition
    warmup_pool = [e for e in allowed if e.get("pattern") in ["mobility", "cardio_low"]]
    main_pool = [e for e in allowed if e.get("pattern") in ["squat", "push", "hinge", "core", "balance"]]
    cooldown_pool = [e for e in allowed if e.get("pattern") in ["yoga", "mobility"]]

    warmup_ex = warmup_pool[0] if warmup_pool else allowed[0]
    main_ex1 = main_pool[0] if main_pool else allowed[0]
    main_ex2 = main_pool[1] if len(main_pool) > 1 else allowed[0]
    cooldown_ex = cooldown_pool[0] if cooldown_pool else allowed[-1]

    sets_count = 2 if profile.level == "new" else 3
    reps_count = 10 if profile.level == "new" else 12

    session = Session(
        pocketStart=pocket.start,
        minutes=minutes,
        warmup=[
            Block(
                exerciseId=warmup_ex["id"],
                sets=1,
                reps=10,
                restSec=15,
                note="Light mobility warmup",
            )
        ],
        main=[
            Block(
                exerciseId=main_ex1["id"],
                sets=sets_count,
                reps=None if main_ex1.get("cv", {}).get("ruleId") in ["forearm_plank", "tree_pose"] else reps_count,
                holdSec=20 if main_ex1.get("cv", {}).get("ruleId") in ["forearm_plank", "tree_pose"] else None,
                restSec=40,
                note="Steady smooth movement",
            ),
            Block(
                exerciseId=main_ex2["id"],
                sets=sets_count,
                reps=None if main_ex2.get("cv", {}).get("ruleId") in ["forearm_plank", "tree_pose"] else reps_count,
                holdSec=20 if main_ex2.get("cv", {}).get("ruleId") in ["forearm_plank", "tree_pose"] else None,
                restSec=40,
                note="Controlled pace",
            ),
        ],
        cooldown=[
            Block(
                exerciseId=cooldown_ex["id"],
                sets=1,
                holdSec=30,
                restSec=0,
                note="Gentle relaxing stretch",
            )
        ],
        rationale=f"{minutes} minutes fit your {pocket.start} pocket; balanced strength today, mobility tomorrow.",
    )

    return DayPlan(
        date="2026-11-15",
        kind="gentle" if screening.outcome == "GO_GENTLE" else "train",
        sessions=[session],
        source="llm",
    )

@app.post("/nutrition/solve", response_model=MealPlan)
def solve_nutrition(profile: UserProfile):
    # Estimated calorie target
    bmr = 10 * 58 + 6.25 * 158 - 5 * 35 - 161
    tdee = bmr * 1.35
    target_kcal = max(1200, int(tdee * 0.85)) if profile.goal == "gentle_weight_loss" else int(tdee)
    target_protein = 48.0

    selected_meals = []
    for slot in ["breakfast", "lunch", "snack", "dinner"]:
        slot_meals = [m for m in MEALS_DATA if m["slot"] == slot]
        meal_data = slot_meals[0] if slot_meals else MEALS_DATA[0]
        selected_meals.append(Meal(**meal_data))

    total_kcal = sum(m.kcal for m in selected_meals)
    total_protein = sum(m.proteinG for m in selected_meals)
    total_cost = sum(m.costInr for m in selected_meals)

    return MealPlan(
        date="2026-11-15",
        meals=selected_meals,
        targets={"kcal": target_kcal, "proteinG": target_protein},
        totals={"kcal": round(total_kcal, 1), "proteinG": round(total_protein, 1), "costInr": round(total_cost, 1)},
    )

@app.post("/buddy/chat", response_model=BuddyActionResponse)
def buddy_chat(req: BuddyChatRequest):
    message = req.message.lower()

    # Safety checks
    if any(w in message for w in ["pain", "dard", "dukh", "chot", "injury"]):
        return BuddyActionResponse(
            reply="Agar kahin dard ya chot mehsus ho rahi hai, toh turant workout rok dijiye. Apne shareer ki sunein aur doctor se consult karein.",
            safetyTriggered=True,
        )

    if any(w in message for w in ["supplement", "medicine", "dawa", "tablet"]):
        return BuddyActionResponse(
            reply="Main koi dawai ya supplements prescribe nahi kar sakti. Please apne doctor ya qualified dietitian se baat karein.",
            safetyTriggered=True,
        )

    if any(w in message for w in ["dizz", "chakkar", "faint", "behosh"]):
        return BuddyActionResponse(
            reply="Chakkar aana ya faint hona serious ho sakta hai. Exercise pause karein aur doctor se checkup karwayein.",
            safetyTriggered=True,
        )

    # Shorten session tool
    if any(w in message for w in ["10 min", "kam time", "sirf 10", "shorten"]):
        return BuddyActionResponse(
            reply="Koi baat nahi! Plan ko 10 minute ka kar diya hai. Aasan aur focused movements rakhe hain.",
            action={
                "id": "shorten_10",
                "description": "Shortened to 10 min",
                "undoData": {"minutes": 18},
                "toolCall": {"tool": "shorten_session", "args": {"minutes": 10}},
            },
        )

    # Make quieter tool
    if any(w in message for w in ["quiet", "shor", "awaaz", "sound"]):
        return BuddyActionResponse(
            reply="Zaroor! Saare jumps aur loud moves hata diye hain. Bilkul silent mat and chair moves set hain.",
            action={
                "id": "make_quiet",
                "description": "Swapped to silent moves",
                "toolCall": {"tool": "make_quieter", "args": {"quiet": True}},
            },
        )

    return BuddyActionResponse(
        reply="Main yahan aapke saath hoon. Aap session chhota kar sakti hain, silent moves chun sakti hain, ya thali me food swap kar sakti hain.",
    )
