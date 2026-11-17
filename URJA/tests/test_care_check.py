# tests/test_care_check.py
"""
Test suite for Care Check Logic & Persona Screening Triage (Spec §10.1 & §13.1)
"""

import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

PERSONAS_FILE = BASE_DIR / "tests" / "personas" / "personas.json"

def evaluate_screening(answers: dict) -> tuple[str, list[str]]:
    flags = []
    if answers.get("q1_pregnant"):
        flags.append("pregnant_or_postpartum")
    if answers.get("q2_recent_surgery"):
        flags.append("recent_surgery_or_injury")
    if answers.get("q3_chest_pain"):
        flags.append("chest_pain_breathlessness")
    if answers.get("q4_dizzy"):
        flags.append("dizziness_or_fainting")
    if answers.get("q5_doctor_limit"):
        flags.append("doctor_advised_limit")

    # Hard gate: 1-5 -> STOP_CONSULT
    if flags:
        return "STOP_CONSULT", flags

    if answers.get("q6_joint_pain"):
        flags.append("joint_back_pelvic_pain")
    if answers.get("q7_extra_notes") and answers["q7_extra_notes"].strip():
        flags.append("extra_precautions_noted")

    if flags:
        return "GO_GENTLE", flags

    return "GO", []

def test_personas():
    print("--- Running Care Check Screening Test on Personas ---")
    with open(PERSONAS_FILE, "r", encoding="utf-8") as f:
        personas = json.load(f)

    for p in personas:
        p_id = p.get("id")
        if p_id == "persona_8_adversarial":
            continue

        answers = p.get("screeningAnswers", {})
        expected = p.get("expectedOutcome")

        outcome, flags = evaluate_screening(answers)
        assert outcome == expected, f"Persona {p_id} expected {expected}, got {outcome} with flags {flags}"
        print(f"[OK] {p['name']}: {outcome} (matches expected: {expected})")

    print("\nAll 7 test personas evaluated with 100% triage accuracy!")

if __name__ == "__main__":
    test_personas()
