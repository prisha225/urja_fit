"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThaliPlate } from "../../components/ThaliPlate";
import { MealPlan, Meal } from "@packages/contracts/types";
import { solveMealPlan, swapFoodItem } from "../../lib/nutritionSolver";
import { ArrowLeft, Sparkles, Info, Users, Clock } from "lucide-react";

export default function ThaliPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [activeSlot, setActiveSlot] = useState<"breakfast" | "lunch" | "snack" | "dinner">("lunch");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfileStr = localStorage.getItem("sakhi_user_profile");
      const profile = savedProfileStr
        ? JSON.parse(savedProfileStr)
        : {
            ageBand: "30-44",
            goal: "energy",
            level: "new",
            pockets: [{ start: "06:15", minutes: 18 }],
            space: "tiny",
            equipment: ["none"],
            quiet: true,
            lang: "hinglish",
            diet: "veg",
            region: "north",
            budgetBand: "mid",
            cookMinutes: 20,
            avoidFoods: [],
            tracks: ["home"],
          };

      const initialPlan = solveMealPlan(profile);
      setMealPlan(initialPlan);
    }
  }, []);

  if (!mealPlan) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-ink-70">
        Preparing your thali...
      </div>
    );
  }

  const currentMeal: Meal =
    mealPlan.meals.find((m) => m.slot === activeSlot) || mealPlan.meals[0];

  const handleSwap = (oldFoodId: string, newFoodId: string) => {
    const updated = swapFoodItem(mealPlan, activeSlot, oldFoodId, newFoodId);
    setMealPlan(updated);
  };

  const slots: ("breakfast" | "lunch" | "snack" | "dinner")[] = [
    "breakfast",
    "lunch",
    "snack",
    "dinner",
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white pb-16">
      <div>
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/today"
            className="text-xs text-ink-70 hover:text-aubergine flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to today
          </Link>
          <span className="text-[11px] text-ink-70 italic">
            IFCT 2017 (ICMR-NIN) Verified
          </span>
        </div>

        <div>
          <h1 className="font-display text-2xl text-aubergine font-bold">Today's Thali</h1>
          <p className="text-xs text-ink-70 mt-1">
            Tap any dish on your plate to swap. Portions rebalance automatically.
          </p>
        </div>

        {/* Meal Slot Tabs */}
        <div className="flex items-center gap-1.5 my-4 p-1 bg-mist rounded-chip">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setActiveSlot(slot)}
              className={`flex-1 py-1.5 text-xs capitalize rounded-chip font-medium transition-all ${
                activeSlot === slot
                  ? "bg-white text-aubergine shadow-xs"
                  : "text-ink-70 hover:text-aubergine"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>

        {/* The Thali Plate Component */}
        <div className="my-4">
          <ThaliPlate
            meal={currentMeal}
            targetKcal={mealPlan.targets.kcal}
            targetProteinG={mealPlan.targets.proteinG}
            onSwapFood={handleSwap}
            size={300}
          />
        </div>

        {/* Day Totals Summary */}
        <div className="mt-5 p-4 rounded-hero bg-mist border border-ink-12">
          <div className="text-xs font-semibold text-aubergine mb-2">
            Day Plan Totals vs Target
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-field">
              <span className="text-[10px] text-ink-70 block">Energy</span>
              <span className="font-display text-sm font-bold text-aubergine">
                {mealPlan.totals.kcal} kcal
              </span>
              <span className="text-[9px] text-peacock block">
                target {mealPlan.targets.kcal}
              </span>
            </div>
            <div className="bg-white p-2 rounded-field">
              <span className="text-[10px] text-ink-70 block">Protein</span>
              <span className="font-display text-sm font-bold text-aubergine">
                {mealPlan.totals.proteinG}g
              </span>
              <span className="text-[9px] text-peacock block">
                target {mealPlan.targets.proteinG}g
              </span>
            </div>
            <div className="bg-white p-2 rounded-field">
              <span className="text-[10px] text-ink-70 block">Day Cost</span>
              <span className="font-display text-sm font-bold text-aubergine">
                ₹{mealPlan.totals.costInr}
              </span>
              <span className="text-[9px] text-ink-70 block">approx.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Medical Disclaimer */}
      <div className="pt-4 border-t border-ink-12 text-center text-[11px] text-ink-70">
        General dietary guidance based on ICMR-NIN Indian food tables. Not a prescribed medical diet.
      </div>
    </div>
  );
}
