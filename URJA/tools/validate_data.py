#!/usr/bin/env python3
"""
tools/validate_data.py
Automated validator for Sakhi dataset integrity according to Build Spec §0.3, §0.5, §7.2, §8.3.
Run in CI and locally before commits.
"""

import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
EXERCISES_FILE = BASE_DIR / "data" / "exercises" / "exercises.json"
RULES_FILE = BASE_DIR / "data" / "exercises" / "formRules.json"
KEYFRAMES_DIR = BASE_DIR / "data" / "exercises" / "keyframes"
FOODS_FILE = BASE_DIR / "data" / "foods" / "foods.json"
MEALS_FILE = BASE_DIR / "data" / "foods" / "meals.json"

BANNED_WORDS = [
    "cure", "treat", "heal", "fix your", "detox", "burn fat fast",
    "lose weight fast", "bikini body", "toned body", "melt fat"
]

def check_banned_copy(text: str, context: str) -> list[str]:
    errors = []
    text_lower = text.lower()
    for word in BANNED_WORDS:
        if word in text_lower:
            errors.append(f"Banned copy '{word}' found in {context}: '{text}'")
    return errors

def validate_exercises():
    errors = []
    if not EXERCISES_FILE.exists():
        return [f"Missing {EXERCISES_FILE}"]
    with open(EXERCISES_FILE, "r", encoding="utf-8") as f:
        exercises = json.load(f)
    
    exercise_ids = set()
    for ex in exercises:
        ex_id = ex.get("id")
        if not ex_id:
            errors.append("Exercise missing 'id'")
            continue
        if ex_id in exercise_ids:
            errors.append(f"Duplicate exercise id '{ex_id}'")
        exercise_ids.add(ex_id)
        
        # Check cues length <= 7 words
        cues = ex.get("cues", {})
        for lang in ["en", "hinglish"]:
            for cue in cues.get(lang, []):
                word_count = len(cue.strip().split())
                if word_count > 7:
                    errors.append(f"Cue exceeds 7 words ({word_count}): '{cue}' in {ex_id}")
                errors.extend(check_banned_copy(cue, f"{ex_id} cue ({lang})"))
        
        # Check keyframe file exists
        kf_rel = ex.get("keyframes")
        if kf_rel:
            kf_path = KEYFRAMES_DIR / kf_rel
            if not kf_path.exists():
                errors.append(f"Keyframe file not found: {kf_path} for {ex_id}")
        
        # RPE range
        rpe = ex.get("intensityRPE", 0)
        if not (1 <= rpe <= 10):
            errors.append(f"Invalid intensityRPE {rpe} for {ex_id}")
    
    print(f"Validated {len(exercises)} exercises.")
    return errors

def validate_foods_and_meals():
    errors = []
    if not FOODS_FILE.exists():
        return [f"Missing {FOODS_FILE}"]
    if not MEALS_FILE.exists():
        return [f"Missing {MEALS_FILE}"]

    with open(FOODS_FILE, "r", encoding="utf-8") as f:
        foods = json.load(f)
    with open(MEALS_FILE, "r", encoding="utf-8") as f:
        meals = json.load(f)

    food_ids = {food["id"]: food for food in foods}
    
    # Check food sources
    for food in foods:
        source = food.get("source", "")
        if not source:
            errors.append(f"Food {food['id']} has no source citation.")
    
    # Validate meals reference existing foods
    for meal in meals:
        meal_id = meal.get("id")
        calc_kcal = 0.0
        calc_protein = 0.0
        for item in meal.get("items", []):
            f_id = item.get("foodId")
            grams = item.get("grams", 0)
            if f_id not in food_ids:
                errors.append(f"Meal {meal_id} references unknown foodId '{f_id}'")
            else:
                f = food_ids[f_id]
                calc_kcal += (f["kcalPer100g"] * grams) / 100.0
                calc_protein += (f["proteinGPer100g"] * grams) / 100.0
        
        stated_kcal = meal.get("kcal", 0)
        if abs(calc_kcal - stated_kcal) > 25:
            # Tolerable delta due to rounding, but flag large drift
            errors.append(f"Meal {meal_id} kcal mismatch: stated {stated_kcal}, calculated {calc_kcal:.1f}")

    print(f"Validated {len(foods)} foods and {len(meals)} meals.")
    return errors

def main():
    print("--- Running Sakhi Data Integrity Validator ---")
    all_errors = []
    all_errors.extend(validate_exercises())
    all_errors.extend(validate_foods_and_meals())

    if all_errors:
        print(f"\nFAILED with {len(all_errors)} errors:")
        for err in all_errors:
            print(f" - {err}")
        sys.exit(1)
    else:
        print("\nAll data files validated successfully! Pass.")
        sys.exit(0)

if __name__ == "__main__":
    main()
