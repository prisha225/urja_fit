"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DayDial } from "../../components/DayDial";
import { ThaliPlate } from "../../components/ThaliPlate";
import { SkeletonAnimator } from "../../components/SkeletonAnimator";
import { MEALS } from "../../data/foodsData";
import { EXERCISES } from "../../data/exercisesData";
import { ArrowLeft, Play, ShieldAlert, Heart, Check, Users, Clock } from "lucide-react";

export default function KitPage() {
  const [selectedEx, setSelectedEx] = useState("chair_squat");

  return (
    <div className="min-h-screen bg-white text-aubergine p-6 pb-24 space-y-10">
      {/* Header */}
      <div className="border-b border-ink-12 pb-4 flex items-center justify-between">
        <div>
          <Link href="/today" className="text-xs text-ink-70 hover:text-aubergine flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to app
          </Link>
          <h1 className="font-display text-3xl font-bold">Design System & Kit</h1>
          <p className="text-xs text-ink-70 mt-1">
            Component tokens, UI primitives, and animated guides per Build Spec §6.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-chip bg-peacock/10 text-peacock font-semibold text-xs">
          Phase 0 Compliant
        </span>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">1. Color Tokens (Spec §6.1)</h2>
        <p className="text-xs text-ink-70">
          Five named values, nothing else. Marigold is strictly reserved for primary actions and session arcs.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-field bg-[#2B1B3D] text-white text-xs">
            <span className="font-bold block">Aubergine</span>
            <span className="opacity-80">#2B1B3D</span>
            <span className="text-[10px] opacity-70 block mt-2">Text & dark surfaces</span>
          </div>
          <div className="p-3 rounded-field bg-[#F5B427] text-aubergine text-xs">
            <span className="font-bold block">Marigold</span>
            <span className="opacity-80">#F5B427</span>
            <span className="text-[10px] opacity-70 block mt-2">Primary CTA & Dial Arc</span>
          </div>
          <div className="p-3 rounded-field bg-[#0F7B83] text-white text-xs">
            <span className="font-bold block">Peacock</span>
            <span className="opacity-80">#0F7B83</span>
            <span className="text-[10px] opacity-70 block mt-2">Good form & Done</span>
          </div>
          <div className="p-3 rounded-field bg-[#D6336C] text-white text-xs">
            <span className="font-bold block">Hibiscus</span>
            <span className="opacity-80">#D6336C</span>
            <span className="text-[10px] opacity-70 block mt-2">Attention & Stops</span>
          </div>
          <div className="p-3 rounded-field bg-[#F4F3F8] text-aubergine border border-ink-12 text-xs">
            <span className="font-bold block">Mist</span>
            <span className="opacity-80">#F4F3F8</span>
            <span className="text-[10px] opacity-70 block mt-2">App Background</span>
          </div>
          <div className="p-3 rounded-field bg-white text-aubergine border border-ink-12 text-xs">
            <span className="font-bold block">White</span>
            <span className="opacity-80">#FFFFFF</span>
            <span className="text-[10px] opacity-70 block mt-2">Cards & Surfaces</span>
          </div>
        </div>
      </section>

      {/* 2. Typography Scale */}
      <section className="space-y-3 border-t border-ink-12 pt-6">
        <h2 className="font-display text-xl font-bold">2. Typography (Display & Body)</h2>
        <div className="space-y-2">
          <div className="font-display text-3xl font-bold">
            Young Serif Display (3xl) - 2.44rem
          </div>
          <div className="font-display text-2xl font-bold">
            Young Serif Display (2xl) - 1.95rem
          </div>
          <div className="font-display text-xl font-bold">
            Young Serif Display (xl) - 1.56rem
          </div>
          <p className="font-body text-base text-ink-70 leading-relaxed">
            Hind Body font: Aaram se ghar par exercise karein. Sentence case everywhere. No all-caps labels, no tracked eyebrows.
          </p>
        </div>
      </section>

      {/* 3. The Day Dial Component */}
      <section className="space-y-3 border-t border-ink-12 pt-6">
        <h2 className="font-display text-xl font-bold">3. The Day Dial (Spec §6)</h2>
        <p className="text-xs text-ink-70">
          The signature circular identity element. Pockets in soft ink, session arc in marigold.
        </p>
        <div className="flex flex-col items-center justify-center p-4 bg-mist rounded-hero">
          <DayDial
            interactive={true}
            pockets={[{ start: "06:15", minutes: 18 }, { start: "17:30", minutes: 15 }]}
            sessionPocket={{ start: "06:15", minutes: 18 }}
            size={260}
          />
        </div>
      </section>

      {/* 4. Thali Plate Component */}
      <section className="space-y-3 border-t border-ink-12 pt-6">
        <h2 className="font-display text-xl font-bold">4. Thali Plate Component (Spec §6.3 Screen 5)</h2>
        <p className="text-xs text-ink-70">
          Circular plate with compartment area proportional to food grams. Tap to swap.
        </p>
        <div className="p-4 bg-mist rounded-hero flex justify-center">
          <ThaliPlate meal={MEALS[2]} size={280} />
        </div>
      </section>

      {/* 5. Skeleton Animator Guides */}
      <section className="space-y-3 border-t border-ink-12 pt-6">
        <h2 className="font-display text-xl font-bold">5. Skeleton Animator Guides (Spec §8.4)</h2>
        <p className="text-xs text-ink-70">
          2D normalized keyframe interpolation with white/aubergine round-cap strokes.
        </p>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["chair_squat", "wall_pushup", "forearm_plank", "tree_pose"].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedEx(id)}
              className={`px-3 py-1.5 rounded-chip text-xs capitalize font-medium border ${
                selectedEx === id
                  ? "bg-aubergine text-white border-aubergine"
                  : "bg-white text-aubergine border-ink-12"
              }`}
            >
              {id.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="h-64 bg-mist rounded-hero p-4 flex items-center justify-center">
          <SkeletonAnimator exerciseId={selectedEx} width={200} height={200} strokeColor="#2B1B3D" />
        </div>
      </section>
    </div>
  );
}
