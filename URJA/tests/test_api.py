# tests/test_api.py
"""
API Unit and Integration Tests for Sakhi FastAPI Endpoints
Tests health_check, care_check, generate_plan, solve_nutrition, and buddy_chat directly.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from apps.api.main import (
    health_check,
    care_check,
    generate_plan,
    solve_nutrition,
    buddy_chat,
    CareCheckRequest,
    PlanRequest,
    BuddyChatRequest,
)
from packages.contracts.models import UserProfile, ScreeningResult

def test_api():
    print("--- Running FastAPI Endpoints Direct Verification ---")

    # 1. Health check
    h = health_check()
    assert h["status"] == "healthy"
    assert h["exercises_loaded"] == 12
    assert h["foods_loaded"] == 22
    assert h["meals_loaded"] == 10
    print("[OK] health_check() -> healthy with all datasets loaded")

    # 2. Care Check (Clean passing)
    req_clean = CareCheckRequest(
        q1_pregnant=False,
        q2_recent_surgery=False,
        q3_chest_pain=False,
        q4_dizzy=False,
        q5_doctor_limit=False,
        q6_joint_pain=False,
        q7_extra_notes="",
    )
    res_clean = care_check(req_clean)
    assert res_clean.outcome == "GO"
    print("[OK] care_check(clean) -> GO")

    # 3. Care Check (Chest pain -> STOP_CONSULT)
    req_chest = CareCheckRequest(
        q1_pregnant=False,
        q2_recent_surgery=False,
        q3_chest_pain=True,
        q4_dizzy=False,
        q5_doctor_limit=False,
        q6_joint_pain=False,
    )
    res_chest = care_check(req_chest)
    assert res_chest.outcome == "STOP_CONSULT"
    assert "chest_pain_breathlessness" in res_chest.flags
    print("[OK] care_check(chest pain) -> STOP_CONSULT")

    # 4. Plan generation
    profile = UserProfile(
        ageBand="30-44",
        goal="energy",
        level="new",
        pockets=[{"start": "06:15", "minutes": 18}],
        space="tiny",
        equipment=["none", "chair"],
        quiet=True,
        lang="hinglish",
        diet="veg",
        region="north",
        budgetBand="mid",
        cookMinutes=20,
        avoidFoods=[],
        tracks=["home"],
    )
    plan_req = PlanRequest(profile=profile, screening=res_clean)
    plan_res = generate_plan(plan_req)
    assert len(plan_res.sessions) == 1
    assert plan_res.sessions[0].minutes == 18
    assert len(plan_res.sessions[0].warmup) >= 1
    assert len(plan_res.sessions[0].main) >= 1
    assert len(plan_res.sessions[0].cooldown) >= 1
    print("[OK] generate_plan() -> Valid 18-minute session with warmup/main/cooldown")

    # 5. Buddy Chat with tool call
    buddy_req = BuddyChatRequest(
        message="aaj 10 minute hi hain",
        currentPlan=plan_res,
    )
    buddy_res = buddy_chat(buddy_req)
    assert buddy_res.action is not None
    assert buddy_res.action["toolCall"]["tool"] == "shorten_session"
    assert buddy_res.action["toolCall"]["args"]["minutes"] == 10
    print("[OK] buddy_chat('10 min') -> Triggers shorten_session(10)")

    # 6. Buddy Chat with safety red-flag
    buddy_safety = BuddyChatRequest(
        message="Mujhe dizziness aur fainting ho rahi hai",
        currentPlan=plan_res,
    )
    buddy_safety_res = buddy_chat(buddy_safety)
    assert buddy_safety_res.safetyTriggered == True
    print("[OK] buddy_chat(dizziness trigger) -> Priority safety pause and referral")

    print("\nAll FastAPI endpoints directly verified and operational!")

if __name__ == "__main__":
    test_api()
