"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Meal, Food } from "@packages/contracts/types";
import { FOODS } from "../data/foodsData";
import { Users, Clock, ArrowRightLeft, Sparkles, Check } from "lucide-react";

interface ThaliPlateProps {
  meal: Meal;
  targetKcal?: number;
  targetProteinG?: number;
  onSwapFood?: (oldFoodId: string, newFoodId: string) => void;
  size?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  grain: "#F7E6C4",    // soft warm wheat/rice
  dal: "#F8D49D",      // golden pulse/lentil
  sabzi: "#CDE8D5",    // fresh greens/vegetables
  protein: "#E8D5C4",  // curd / paneer / egg tone
  salad: "#D6ECD2",    // cucumber / tomato garden
  extra: "#F5ECD7",    // chaas / makhana
};

export const ThaliPlate: React.FC<ThaliPlateProps> = ({
  meal,
  targetKcal = 1350,
  targetProteinG = 48,
  onSwapFood,
  size = 320,
}) => {
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  const foodMap = new Map(FOODS.map((f) => [f.id, f]));
  const totalGrams = meal.items.reduce((sum, it) => sum + it.grams, 0);

  // Calculate sector angles based on grams proportion
  let currentAngle = 0;
  const sectors = meal.items.map((item) => {
    const food = foodMap.get(item.foodId);
    const fraction = item.grams / (totalGrams || 1);
    const sweep = fraction * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;
    currentAngle += sweep;

    return {
      item,
      food,
      startAngle,
      endAngle,
      sweep,
    };
  });

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.12;

  // Polar to cartesian helper for sector paths
  const getSectorPath = (startDeg: number, endDeg: number) => {
    const degToRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const r1 = innerR;
    const r2 = outerR;

    const x1 = cx + r1 * Math.cos(degToRad(startDeg));
    const y1 = cy + r1 * Math.sin(degToRad(startDeg));
    const x2 = cx + r2 * Math.cos(degToRad(startDeg));
    const y2 = cy + r2 * Math.sin(degToRad(startDeg));
    const x3 = cx + r2 * Math.cos(degToRad(endDeg));
    const y3 = cy + r2 * Math.sin(degToRad(endDeg));
    const x4 = cx + r1 * Math.cos(degToRad(endDeg));
    const y4 = cy + r1 * Math.sin(degToRad(endDeg));

    const largeArc = endDeg - startDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  const selectedFood = selectedFoodId ? foodMap.get(selectedFoodId) : null;
  const swapAlternatives = selectedFood
    ? FOODS.filter((f) => f.category === selectedFood.category && f.id !== selectedFood.id)
    : [];

  return (
    <div className="flex flex-col items-center">
      {/* Thali Plate SVG */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="drop-shadow-sm">
          {/* Rim of Thali */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 6}
            fill="#F4F3F8"
            stroke="#2B1B3D"
            strokeWidth="3"
            strokeOpacity="0.15"
          />

          {/* Thin Macro progress ring on rim */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 4}
            fill="none"
            stroke="#0F7B83"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * (outerR + 4)}`}
            strokeDashoffset={`${2 * Math.PI * (outerR + 4) * (1 - Math.min(1, meal.kcal / 600))}`}
            strokeLinecap="round"
          />

          {/* Plate Compartments (sectors proportional to grams) */}
          {sectors.map((sec, idx) => {
            const isSelected = selectedFoodId === sec.item.foodId;
            const cat = sec.food?.category || "extra";
            const fillColor = CATEGORY_COLORS[cat] || "#FFFFFF";

            return (
              <g key={`sec-${idx}`} onClick={() => setSelectedFoodId(sec.item.foodId)} className="cursor-pointer">
                <path
                  d={getSectorPath(sec.startAngle, sec.endAngle)}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-all hover:opacity-90"
                />
              </g>
            );
          })}

          {/* Center Brass/Steel Hub */}
          <circle cx={cx} cy={cy} r={innerR} fill="#FFFFFF" stroke="rgba(43,27,61,0.12)" strokeWidth="2" />
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            className="fill-aubergine font-display text-[11px] font-bold select-none pointer-events-none"
          >
            Thali
          </text>
        </svg>
      </div>

      {/* Meta indicators: Cook time, cost, family shareable */}
      <div className="flex items-center gap-4 mt-3 text-xs text-ink-70">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{meal.cookMin} min cook</span>
        </div>
        <div className="flex items-center gap-1 font-medium text-aubergine">
          <span>₹{Math.round(meal.costInr)} approx.</span>
        </div>
        {meal.familyShareable && (
          <div className="flex items-center gap-1 text-peacock font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>Family-friendly</span>
          </div>
        )}
      </div>

      {/* Foods on the plate with grams */}
      <div className="w-full max-w-sm mt-4 space-y-1.5">
        <div className="text-xs text-ink-70 px-1 font-medium">Tap any item to swap:</div>
        <div className="grid grid-cols-2 gap-2">
          {meal.items.map((it) => {
            const f = foodMap.get(it.foodId);
            const isSelected = selectedFoodId === it.foodId;
            return (
              <button
                key={it.foodId}
                type="button"
                onClick={() => setSelectedFoodId(it.foodId)}
                className={`p-2.5 rounded-field text-left border text-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-aubergine bg-white shadow-sm ring-1 ring-aubergine"
                    : "border-ink-12 bg-white hover:bg-mist"
                }`}
              >
                <span className="font-semibold text-aubergine truncate">{f?.name.hinglish || it.foodId}</span>
                <span className="text-[11px] text-ink-70 mt-1">
                  {it.grams}g · {f?.source.includes("TODO") ? "approx." : f?.source || "IFCT 2017"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Swap Sheet / Modal when food selected */}
      <AnimatePresence>
        {selectedFood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-sm mt-3 p-3 bg-white rounded-field border border-ink-12 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-aubergine">
                Swap {selectedFood.name.hinglish}
              </span>
              <button
                type="button"
                onClick={() => setSelectedFoodId(null)}
                className="text-[11px] text-ink-70 hover:text-aubergine"
              >
                Close
              </button>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {swapAlternatives.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => {
                    onSwapFood?.(selectedFood.id, alt.id);
                    setSelectedFoodId(null);
                  }}
                  className="p-2 rounded-md hover:bg-mist cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="text-aubergine font-medium">{alt.name.hinglish}</span>
                  <span className="text-peacock font-semibold flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3" /> Swap
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
