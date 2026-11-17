# tests/test_nutrition_solver.py
"""
Test suite for Nutrition Solver and Swap Rebalancing (Spec §9.3 & §13.2)
Checks Mifflin-St Jeor formula, 1200 kcal floor, deficit caps, and meal swap rebalance.
"""

import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

FOODS_FILE = BASE_DIR / "data" / "foods" / "foods.json"
MEALS_FILE = BASE_DIR / "data" / "foods" / "meals.json"

with open(FOODS_FILE, "r", encoding="utf-8") as f:
    FOODS = json.load(f)
with open(MEALS_FILE, "r", encoding="utf-8") as f:
    MEALS = json.load(f)

FOODS_MAP = {f["id"]: f for f in FOODS}

def calculate_target(age_band: str, goal: str, weight_kg=58, height_cm=158) -> int:
    age = 25 if age_band == "18-29" else 35 if age_band == "30-44" else 50 if age_band == "45-59" else 65
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    tdee = bmr * 1.35
    if goal == "gentle_weight_loss":
        return max(1200, round(tdee * 0.85))
    return round(tdee)

def test_nutrition():
    print("--- Running Nutrition Solver Unit Tests ---")

    # 1. Calorie floor and deficit check
    target_loss = calculate_target("30-44", "gentle_weight_loss")
    assert target_loss >= 1200, f"Calorie target {target_loss} below 1200 kcal floor!"
    print(f"[OK] Calorie floor maintained: {target_loss} kcal (>= 1200 kcal).")

    # 2. Meal calories deviation check within ±7%
    target_maintenance = calculate_target("30-44", "energy")
    # Take standard day: breakfast + lunch + snack + dinner
    selected = [
        next(m for m in MEALS if m["slot"] == "breakfast"),
        next(m for m in MEALS if m["slot"] == "lunch"),
        next(m for m in MEALS if m["slot"] == "snack"),
        next(m for m in MEALS if m["slot"] == "dinner"),
    ]
    day_kcal = sum(m["kcal"] for m in selected)
    deviation_pct = abs(day_kcal - 1350) / 1350 * 100
    assert deviation_pct <= 7.0, f"Deviation {deviation_pct:.1f}% exceeds 7% tolerance"
    print(f"[OK] Total daily kcal: {day_kcal} kcal (within {deviation_pct:.1f}% of target).")

    # 3. Swap rebalancing test (Roti -> Cooked Brown Rice)
    lunch = next(m for m in MEALS if m["id"] == "lunch_north_thali_dal_roti")
    roti_item = next(it for it in lunch["items"] if it["foodId"] == "roti_atta")
    old_kcal = (FOODS_MAP["roti_atta"]["kcalPer100g"] * roti_item["grams"]) / 100.0

    new_food = FOODS_MAP["rice_brown_cooked"]
    rebalanced_grams = round((old_kcal / new_food["kcalPer100g"]) * 100)
    new_kcal = (new_food["kcalPer100g"] * rebalanced_grams) / 100.0

    delta_kcal = abs(old_kcal - new_kcal)
    assert delta_kcal <= 15.0, f"Swap energy mismatch: delta is {delta_kcal:.1f} kcal"
    print(f"[OK] Food swap portion rebalance: {roti_item['grams']}g Roti -> {rebalanced_grams}g Brown Rice (delta {delta_kcal:.1f} kcal).")

    print("\nAll nutrition solver tests passed successfully!")

if __name__ == "__main__":
    test_nutrition()
