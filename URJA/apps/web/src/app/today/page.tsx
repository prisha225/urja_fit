"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DayDial, DialPocket } from "../../components/DayDial";
import { BuddySheet } from "../../components/BuddySheet";
import { SkeletonAnimator } from "../../components/SkeletonAnimator";
import { DayPlan, MealPlan, UserProfile, ScreeningResult } from "@packages/contracts/types";
import { generateDeterministicPlan } from "../../lib/planner";
import { solveMealPlan } from "../../lib/nutritionSolver";
import { EXERCISES } from "../../data/exercisesData";
import { Play, Utensils, Tag, Info, Sparkles, X, ChevronRight } from "lucide-react";

export default function TodayPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [screening, setScreening] = useState<ScreeningResult | null>(null);
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [animateFill, setAnimateFill] = useState(false);
  const [previewExId, setPreviewExId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isAnimate = params.get("animate") === "1";
      const demoFlag = params.get("demo") === "1" || localStorage.getItem("sakhi_demo_mode") === "1";
      setIsDemo(demoFlag);
      if (isAnimate) setAnimateFill(true);

      const savedProfile = localStorage.getItem("sakhi_user_profile");
      const savedScreening = localStorage.getItem("sakhi_screening_result");

      let currentProfile: UserProfile;
      let currentScreening: ScreeningResult;

      if (savedProfile) {
        currentProfile = JSON.parse(savedProfile);
      } else {
        // Fallback default persona (Priya)
        currentProfile = {
          ageBand: "30-44",
          goal: "energy",
          level: "new",
          pockets: [
            { start: "06:15", minutes: 18 },
            { start: "17:30", minutes: 15 },
          ],
          space: "tiny",
          equipment: ["none", "chair"],
          quiet: true,
          lang: "hinglish",
          diet: "veg",
          region: "north",
          budgetBand: "mid",
          cookMinutes: 20,
          avoidFoods: [],
          tracks: ["home"],
        };
      }

      if (savedScreening) {
        currentScreening = JSON.parse(savedScreening);
      } else {
        currentScreening = { outcome: "GO", flags: [] };
      }

      setProfile(currentProfile);
      setScreening(currentScreening);

      // Generate or load plan
      const generatedPlan = generateDeterministicPlan(currentProfile, currentScreening);
      setPlan(generatedPlan);

      // Generate or load meal plan
      const generatedMeals = solveMealPlan(currentProfile);
      setMealPlan(generatedMeals);
    }
  }, []);

  if (!plan || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-ink-70">
        Loading today's dial...
      </div>
    );
  }

  const session = plan.sessions[0];
  const allMoves = session ? [...session.warmup, ...session.main, ...session.cooldown] : [];
  const exerciseMap = new Map(EXERCISES.map((e) => [e.id, e]));

  return (
    <div className="flex-1 flex flex-col justify-between p-6 pb-20">
      <div>
        {/* Top greeting bar */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-2xl text-aubergine font-bold">Good morning, Priya</h1>
            <p className="text-xs text-ink-70">
              {screening?.outcome === "GO_GENTLE" ? "Gentle recovery day" : "Training day"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {isDemo && (
              <span className="px-2 py-0.5 rounded-chip bg-marigold/20 text-aubergine font-semibold text-[11px] border border-marigold">
                Demo data
              </span>
            )}
            {plan.source === "fallback" && (
              <span className="px-2 py-0.5 rounded-chip bg-mist text-ink-70 font-medium text-[11px] border border-ink-12">
                Basic plan
              </span>
            )}
          </div>
        </div>

        {/* 1. Day Dial (The signature Hero element) */}
        <div className="my-4 flex flex-col items-center">
          <DayDial
            interactive={false}
            pockets={profile.pockets}
            sessionPocket={session ? { start: session.pocketStart, minutes: session.minutes } : null}
            size={270}
            animateFill={animateFill}
          />
        </div>

        {/* 2. Today's session card */}
        {session ? (
          <div className="bg-white rounded-hero p-5 border border-ink-12 shadow-sm my-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-peacock uppercase tracking-wider">
                Today's Session
              </span>
              <span className="text-xs text-ink-70">
                {session.minutes} min · {profile.quiet ? "quiet" : "regular"} · {profile.equipment.includes("chair") ? "chair" : "no gear"}
              </span>
            </div>

            <p className="text-xs text-ink-70 mb-4 leading-relaxed">
              {session.rationale}
            </p>

            {/* Single primary MARIGOLD action button */}
            <Link
              href="/studio"
              className="w-full py-4 px-6 rounded-chip bg-marigold text-aubergine font-bold text-base shadow-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mb-4"
            >
              <Play className="w-5 h-5 fill-aubergine text-aubergine" />
              <span>Start session</span>
            </Link>

            {/* Inline moves row - tap to preview keyframe animation */}
            <div className="pt-3 border-t border-ink-12">
              <span className="text-[11px] text-ink-70 block mb-2 font-medium">
                Moves today (tap to preview guide):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allMoves.map((b, idx) => {
                  const ex = exerciseMap.get(b.exerciseId);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewExId(b.exerciseId)}
                      className="px-2.5 py-1 rounded-chip border border-ink-12 bg-mist hover:bg-white text-xs text-aubergine font-medium transition-all"
                    >
                      {ex?.name.hinglish || b.exerciseId}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-hero text-center border border-ink-12 text-sm text-ink-70 my-4">
            No session scheduled for today. Rest and recover.
          </div>
        )}

        {/* 3. Meals Today Thali Preview Card */}
        {mealPlan && (
          <Link
            href="/thali"
            className="w-full bg-white rounded-hero p-4 border border-ink-12 shadow-sm flex items-center justify-between hover:bg-mist transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-peacock/10 text-peacock flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-sm text-aubergine block">
                  Today's Thali & Meals
                </span>
                <span className="text-xs text-ink-70">
                  {mealPlan.totals.kcal} kcal · {mealPlan.totals.proteinG}g protein · ₹{mealPlan.totals.costInr} approx.
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-70 group-hover:text-aubergine" />
          </Link>
        )}

        {/* Professional Review Truth Label (§10.2 / §10.6) */}
        <div className="mt-5 text-center">
          <span className="text-[11px] text-ink-70 italic">
            Not yet professionally reviewed (Clinical dietitian & trainer verification pending)
          </span>
        </div>
      </div>

      {/* Exercise Animation Preview Modal */}
      {previewExId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xs bg-white rounded-hero p-5 text-center relative border border-ink-12 shadow-xl">
            <button
              type="button"
              onClick={() => setPreviewExId(null)}
              className="absolute top-3 right-3 p-1 rounded-full text-ink-70 hover:text-aubergine"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display text-base text-aubergine mb-3">
              {exerciseMap.get(previewExId)?.name.hinglish}
            </h3>
            <div className="h-48 flex items-center justify-center">
              <SkeletonAnimator exerciseId={previewExId} width={180} height={180} />
            </div>
            <div className="mt-2 text-xs text-ink-70">
              {exerciseMap.get(previewExId)?.cues.hinglish[0]}
            </div>
          </div>
        </div>
      )}

      {/* Sakhi Buddy Assistant Sheet with interactive tools */}
      <BuddySheet
        currentPlan={plan}
        currentMealPlan={mealPlan || undefined}
        onPlanChange={(newPlan) => setPlan(newPlan)}
        onMealPlanChange={(newMeals) => setMealPlan(newMeals)}
      />
    </div>
  );
}
