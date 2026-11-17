"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DayDial, DialPocket } from "../components/DayDial";
import { Space, Equip, Lang, UserProfile } from "@packages/contracts/types";
import { Sparkles, Home, Volume2, VolumeX, ShieldCheck, Tag } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Default initial pockets matching demo persona: 06:15 (18m) and 17:30 (15m)
  const [pockets, setPockets] = useState<DialPocket[]>([
    { start: "06:15", minutes: 18 },
    { start: "17:30", minutes: 15 },
  ]);

  const [space, setSpace] = useState<Space>("tiny");
  const [equipment, setEquipment] = useState<Equip[]>(["none", "chair"]);
  const [quiet, setQuiet] = useState(true);
  const [lang, setLang] = useState<Lang>("hinglish");
  const [goal, setGoal] = useState<UserProfile["goal"]>("energy");
  const [diet, setDiet] = useState<UserProfile["diet"]>("veg");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1") {
        setIsDemoMode(true);
      }
    }
  }, []);

  const toggleEquipment = (eq: Equip) => {
    if (eq === "none") {
      setEquipment(["none"]);
      return;
    }
    const filtered = equipment.filter((e) => e !== "none");
    if (filtered.includes(eq)) {
      const next = filtered.filter((e) => e !== eq);
      setEquipment(next.length === 0 ? ["none"] : next);
    } else {
      setEquipment([...filtered, eq]);
    }
  };

  const handleContinue = () => {
    const profile: UserProfile = {
      ageBand: "30-44",
      goal,
      level: "new",
      pockets,
      space,
      equipment,
      quiet,
      lang,
      diet,
      region: "north",
      budgetBand: "mid",
      cookMinutes: 20,
      avoidFoods: [],
      tracks: ["home"],
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("sakhi_user_profile", JSON.stringify(profile));
      if (isDemoMode) {
        localStorage.setItem("sakhi_demo_mode", "1");
      }
    }

    router.push(isDemoMode ? "/care?demo=1" : "/care");
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <div>
        {/* Header with demo badge if active */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-3xl text-aubergine font-bold">Shape your day</h1>
            <p className="text-sm text-ink-70 mt-1">
              Mark when you can move. Fitness that fits your life.
            </p>
          </div>
          {isDemoMode && (
            <span className="px-2.5 py-1 rounded-chip bg-marigold/20 text-aubergine font-semibold text-xs border border-marigold flex items-center gap-1">
              <Tag className="w-3 h-3" /> Demo data
            </span>
          )}
        </div>

        {/* 1. The Day Dial (Hero element) */}
        <div className="my-5 flex flex-col items-center">
          <DayDial
            interactive={true}
            pockets={pockets}
            onPocketsChange={setPockets}
            size={280}
          />
        </div>

        {/* Quick add pocket presets if user wants quick buttons */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setPockets([...pockets, { start: "07:00", minutes: 15 }])}
            className="px-3 py-1 rounded-chip border border-ink-12 text-xs text-aubergine bg-mist hover:bg-white"
          >
            + Morning 15 min
          </button>
          <button
            type="button"
            onClick={() => setPockets([...pockets, { start: "18:00", minutes: 20 }])}
            className="px-3 py-1 rounded-chip border border-ink-12 text-xs text-aubergine bg-mist hover:bg-white"
          >
            + Evening 20 min
          </button>
          {pockets.length > 0 && (
            <button
              type="button"
              onClick={() => setPockets([])}
              className="px-2.5 py-1 text-xs text-ink-70 hover:text-aubergine underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* 2. Questions below dial */}
        <div className="space-y-5 text-left border-t border-ink-12 pt-5">
          {/* Space */}
          <div>
            <label className="block text-xs font-semibold text-aubergine mb-1.5">
              Space you have
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["tiny", "room", "balcony"] as Space[]).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSpace(sp)}
                  className={`py-2 px-3 rounded-field text-xs capitalize text-center border font-medium transition-all ${
                    space === sp
                      ? "border-aubergine bg-aubergine text-white"
                      : "border-ink-12 bg-white text-aubergine hover:bg-mist"
                  }`}
                >
                  {sp === "tiny" ? "Tiny flat" : sp}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-70 mt-1">Why we ask: we only suggest movements that fit your space.</p>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-xs font-semibold text-aubergine mb-1.5">
              Things at home
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(["none", "chair", "mat", "bottle", "towel", "band"] as Equip[]).map((eq) => {
                const active = equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    className={`py-1.5 px-3 rounded-chip text-xs capitalize border font-medium transition-all ${
                      active
                        ? "border-aubergine bg-aubergine text-white"
                        : "border-ink-12 bg-white text-aubergine hover:bg-mist"
                    }`}
                  >
                    {eq === "none" ? "No equipment" : eq}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Noise & Language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-aubergine mb-1.5">
                Sound level
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuiet(true)}
                  className={`flex-1 py-2 px-2 text-xs rounded-field border font-medium flex items-center justify-center gap-1 ${
                    quiet
                      ? "border-aubergine bg-aubergine text-white"
                      : "border-ink-12 bg-white text-aubergine"
                  }`}
                >
                  <VolumeX className="w-3.5 h-3.5" /> Quiet
                </button>
                <button
                  type="button"
                  onClick={() => setQuiet(false)}
                  className={`flex-1 py-2 px-2 text-xs rounded-field border font-medium flex items-center justify-center gap-1 ${
                    !quiet
                      ? "border-aubergine bg-aubergine text-white"
                      : "border-ink-12 bg-white text-aubergine"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" /> Fine
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-aubergine mb-1.5">
                Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="w-full py-2 px-2.5 text-xs rounded-field border border-ink-12 bg-white text-aubergine font-medium"
              >
                <option value="hinglish">Hinglish</option>
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button - MARIGOLD RESERVED */}
      <div className="mt-8 pt-4">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-4 px-6 rounded-chip bg-marigold text-aubergine font-semibold text-base shadow-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Next: Care check</span>
        </button>
      </div>
    </div>
  );
}
