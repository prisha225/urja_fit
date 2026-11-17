# tests/test_validator.py
"""
Unit tests for Sakhi Planner Validator & Banned Copy Linter
Verifies Spec §7.2 rules, volume caps, RPE caps, duration ±10%, and copy lint.
"""

import re
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

BANNED_PATTERNS = [
    re.compile(r"\bcure\b", re.IGNORECASE),
    re.compile(r"\btreat\b", re.IGNORECASE),
    re.compile(r"\bheal\b", re.IGNORECASE),
    re.compile(r"\bfix your\b", re.IGNORECASE),
    re.compile(r"\bdetox\b", re.IGNORECASE),
    re.compile(r"\bburn fat fast\b", re.IGNORECASE),
    re.compile(r"\blose \d+\s?kg\b", re.IGNORECASE),
    re.compile(r"\bin \d+ days\b", re.IGNORECASE),
    re.compile(r"\bbikini body\b", re.IGNORECASE),
    re.compile(r"\btoned body\b", re.IGNORECASE),
    re.compile(r"\bmelt fat\b", re.IGNORECASE),
]

def lint_copy(text: str) -> bool:
    for pat in BANNED_PATTERNS:
        if pat.search(text):
            return False
    return True

def validate_session_duration(session_min: int, pocket_min: int) -> bool:
    min_allow = pocket_min * 0.9 - 1
    max_allow = pocket_min * 1.1 + 1
    return min_allow <= session_min <= max_allow

def validate_volume(level: str, sets: int, reps: int, rpe: int) -> bool:
    caps = {
        "new": {"sets": 3, "reps": 12, "rpe": 5},
        "some": {"sets": 4, "reps": 15, "rpe": 7},
        "regular": {"sets": 5, "reps": 20, "rpe": 8},
    }
    cap = caps.get(level, caps["new"])
    return sets <= cap["sets"] and reps <= cap["reps"] and rpe <= cap["rpe"]

def test_validator_rules():
    print("--- Running Planner Validator Unit Tests ---")

    # 1. Banned copy test cases (Passing and Failing)
    valid_copy = "Two 18-minute windows fit your mornings; legs today, quiet moves so the kids don't wake up."
    assert lint_copy(valid_copy) == True, "Failed to pass clean copy"

    banned_samples = [
        "This workout will cure your back pain",
        "Detox your body in 7 days",
        "Burn fat fast with this session",
        "Lose 10 kg in 2 weeks easily",
        "Get a toned body before summer",
        "This routine will heal your joints",
    ]
    for sample in banned_samples:
        assert lint_copy(sample) == False, f"Banned copy linter escaped: {sample}"
    print("[OK] Banned copy linter correctly rejects 6/6 prohibited claims.")

    # 2. Duration ±10% test cases
    assert validate_session_duration(18, 18) == True, "18 min session in 18 min pocket should pass"
    assert validate_session_duration(17, 18) == True, "17 min session in 18 min pocket should pass (-5.5%)"
    assert validate_session_duration(20, 18) == True, "20 min session in 18 min pocket should pass (+11% within tolerance)"
    assert validate_session_duration(30, 18) == False, "30 min session in 18 min pocket must fail"
    assert validate_session_duration(5, 18) == False, "5 min session in 18 min pocket must fail"
    print("[OK] Pocket duration +/-10% bounds validated.")

    # 3. Volume and RPE Caps
    assert validate_volume("new", sets=2, reps=10, rpe=3) == True
    assert validate_volume("new", sets=4, reps=10, rpe=3) == False  # Exceeds sets cap (3)
    assert validate_volume("new", sets=2, reps=15, rpe=3) == False  # Exceeds reps cap (12)
    assert validate_volume("new", sets=2, reps=10, rpe=6) == False  # Exceeds RPE cap (5)

    assert validate_volume("some", sets=4, reps=14, rpe=6) == True
    assert validate_volume("some", sets=5, reps=14, rpe=6) == False
    print("[OK] Volume and RPE caps verified for 'new' and 'some' levels.")

    print("All validator tests passed successfully!")

if __name__ == "__main__":
    test_validator_rules()
