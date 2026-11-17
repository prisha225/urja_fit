# tests/test_fixtures.py
import json
import sys
from pathlib import Path

# Add root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from packages.contracts.models import UserProfile, DayPlan, MealPlan, ScreeningResult

def test_fixtures():
    print("Validating fixtures against Pydantic models...")
    
    with open(BASE_DIR / "fixtures" / "persona.json", "r", encoding="utf-8") as f:
        persona_data = json.load(f)
    p = UserProfile(**persona_data)
    print("[OK] UserProfile fixture validates successfully.")

    with open(BASE_DIR / "fixtures" / "dayPlan.json", "r", encoding="utf-8") as f:
        day_plan_data = json.load(f)
    dp = DayPlan(**day_plan_data)
    print("[OK] DayPlan fixture validates successfully.")

    with open(BASE_DIR / "fixtures" / "mealPlan.json", "r", encoding="utf-8") as f:
        meal_plan_data = json.load(f)
    mp = MealPlan(**meal_plan_data)
    print("[OK] MealPlan fixture validates successfully.")

    with open(BASE_DIR / "fixtures" / "screeningResults.json", "r", encoding="utf-8") as f:
        screening_data = json.load(f)
    for key, val in screening_data.items():
        sr = ScreeningResult(**val)
    print("[OK] ScreeningResult fixtures validate successfully.")

    print("\nAll fixtures passed Pydantic contract validation!")

if __name__ == "__main__":
    test_fixtures()
