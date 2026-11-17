import { UserProfile, MealPlan, Meal, Food } from "@packages/contracts/types";
import { FOODS, MEALS } from "../data/foodsData";

export function calculateEnergyTarget(profile: UserProfile): { kcal: number; proteinG: number } {
  // Estimated reference parameters for adult Indian woman
  const weightKg = 58;
  const heightCm = 158;
  const ageYears = profile.ageBand === "18-29" ? 25 : profile.ageBand === "30-44" ? 35 : profile.ageBand === "45-59" ? 50 : 65;

  // Mifflin-St Jeor for females: 10*weight + 6.25*height - 5*age - 161
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
  const tdee = bmr * 1.35; // Light activity factor

  let targetKcal = tdee;
  if (profile.goal === "gentle_weight_loss") {
    targetKcal = Math.max(1200, Math.round(tdee * 0.85)); // 15% deficit capped, floor 1200
  } else {
    targetKcal = Math.round(tdee);
  }

  // Protein target: 0.8g to 1.0g per kg of bodyweight
  const targetProteinG = Math.round(weightKg * 0.85);

  return {
    kcal: targetKcal,
    proteinG: targetProteinG,
  };
}

export function solveMealPlan(profile: UserProfile, dateStr: string = "2026-11-15"): MealPlan {
  const targets = calculateEnergyTarget(profile);

  // Filter meals matching user diet
  const compatibleMeals = MEALS.filter((m) => {
    // Cook minutes cap
    if (m.cookMin > profile.cookMinutes + 10) return false;
    return true;
  });

  const breakfast = compatibleMeals.find((m) => m.slot === "breakfast") || MEALS[0];
  const lunch = compatibleMeals.find((m) => m.slot === "lunch") || MEALS[2];
  const snack = compatibleMeals.find((m) => m.slot === "snack") || MEALS[3];
  const dinner = compatibleMeals.find((m) => m.slot === "dinner") || MEALS[4];

  const meals = [breakfast, lunch, snack, dinner];

  const totalKcal = meals.reduce((sum, m) => sum + m.kcal, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.proteinG, 0);
  const totalCost = meals.reduce((sum, m) => sum + m.costInr, 0);

  return {
    date: dateStr,
    meals,
    targets,
    totals: {
      kcal: Math.round(totalKcal),
      proteinG: Math.round(totalProtein * 10) / 10,
      costInr: Math.round(totalCost),
    },
  };
}

export function swapFoodItem(
  currentPlan: MealPlan,
  slot: "breakfast" | "lunch" | "dinner" | "snack",
  oldFoodId: string,
  newFoodId: string
): MealPlan {
  const foodMap = new Map(FOODS.map((f) => [f.id, f]));
  const newFood = foodMap.get(newFoodId);
  const oldFood = foodMap.get(oldFoodId);

  if (!newFood || !oldFood) {
    return currentPlan;
  }

  const updatedMeals = currentPlan.meals.map((meal) => {
    if (meal.slot !== slot) return meal;

    // Replace the item and rebalance grams so calories match closely
    const updatedItems = meal.items.map((item) => {
      if (item.foodId === oldFoodId) {
        const oldKcal = (oldFood.kcalPer100g * item.grams) / 100;
        // Calculate new grams to yield roughly the same calories
        const newGrams = Math.round((oldKcal / newFood.kcalPer100g) * 100);
        return {
          foodId: newFoodId,
          grams: Math.max(20, Math.min(250, newGrams)),
        };
      }
      return item;
    });

    // Recalculate meal totals
    let mealKcal = 0;
    let mealProtein = 0;
    let mealCost = 0;

    for (const item of updatedItems) {
      const f = foodMap.get(item.foodId);
      if (f) {
        mealKcal += (f.kcalPer100g * item.grams) / 100;
        mealProtein += (f.proteinGPer100g * item.grams) / 100;
        mealCost += (f.costInrPer100g * item.grams) / 100;
      }
    }

    return {
      ...meal,
      items: updatedItems,
      kcal: Math.round(mealKcal),
      proteinG: Math.round(mealProtein * 10) / 10,
      costInr: Math.round(mealCost),
    };
  });

  const totalKcal = updatedMeals.reduce((sum, m) => sum + m.kcal, 0);
  const totalProtein = updatedMeals.reduce((sum, m) => sum + m.proteinG, 0);
  const totalCost = updatedMeals.reduce((sum, m) => sum + m.costInr, 0);

  return {
    ...currentPlan,
    meals: updatedMeals,
    totals: {
      kcal: Math.round(totalKcal),
      proteinG: Math.round(totalProtein * 10) / 10,
      costInr: Math.round(totalCost),
    },
  };
}
