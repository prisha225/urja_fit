// packages/contracts/types.ts
// Contract definitions frozen at Phase 0 according to Build Spec §4

export type Space = "tiny" | "room" | "balcony";
export type Equip = "none" | "bottle" | "chair" | "band" | "mat" | "towel";
export type Lang  = "en" | "hinglish" | "hi";

export interface UserProfile {
  ageBand: "18-29" | "30-44" | "45-59" | "60+";   // 18+ only in prototype
  goal: "energy" | "strength" | "gentle_weight_loss" | "mobility";
  level: "new" | "some" | "regular";
  pockets: { start: string; minutes: number }[];   // from Day Dial, e.g. [{"start": "06:10", "minutes": 15}]
  space: Space;
  equipment: Equip[];
  quiet: boolean;
  lang: Lang;
  diet: "veg" | "egg" | "nonveg" | "jain";
  region: "north" | "south" | "east" | "west" | "maharashtrian" | "gujarati" | "bengali" | "other";
  budgetBand: "low" | "mid" | "flex";
  cookMinutes: 20 | 40 | 60;
  avoidFoods: string[];
  tracks: ("home" | "yoga" | "cycle_wellness")[];
}

export interface ScreeningResult {
  outcome: "GO" | "GO_GENTLE" | "STOP_CONSULT";
  flags: string[];             // internal ids, never shown as diagnoses
}

export interface Exercise {
  id: string;
  name: { en: string; hinglish: string };
  pattern: "squat" | "hinge" | "push" | "core" | "mobility" | "cardio_low" | "balance" | "yoga";
  level: "new" | "some" | "regular";
  equipment: Equip[];
  space: Space;
  quiet: boolean;
  intensityRPE: number;          // 1–10
  contraindicatedFlags: string[];
  gentleOk: boolean;             // allowed in GO_GENTLE
  cues: { en: string[]; hinglish: string[] };   // each cue <= 7 words
  keyframes: string;             // path to keyframes json
  cv?: { ruleId: string };       // present only if pose tracking exists for it
  review?: { by: string; role: string; date: string };  // UI shows a reviewed badge ONLY if present
}

export interface Block {
  exerciseId: string;
  sets: number;
  reps?: number;
  holdSec?: number;
  restSec: number;
  note?: string;
}

export interface Session {
  pocketStart: string;
  minutes: number;
  warmup: Block[];
  main: Block[];
  cooldown: Block[];
  rationale: string;
}

export interface DayPlan {
  date: string;
  kind: "train" | "gentle" | "rest";
  sessions: Session[];
  source?: "llm" | "fallback";
}

export interface MealItem {
  foodId: string;
  grams: number;
}

export interface Meal {
  id: string;
  slot: "breakfast" | "lunch" | "dinner" | "snack";
  items: MealItem[];
  kcal: number;
  proteinG: number;
  costInr: number;
  cookMin: number;
  tags: string[];
  familyShareable: boolean;
}

export interface MealPlanTargets {
  kcal: number;
  proteinG: number;
}

export interface MealPlanTotals {
  kcal: number;
  proteinG: number;
  costInr: number;
}

export interface MealPlan {
  date: string;
  meals: Meal[];
  targets: MealPlanTargets;
  totals: MealPlanTotals;
}

export interface Food {
  id: string;
  name: { en: string; hinglish: string; hi?: string };
  category: "grain" | "dal" | "sabzi" | "protein" | "salad" | "extra";
  servingGrams: number;
  kcalPer100g: number;
  proteinGPer100g: number;
  carbsGPer100g: number;
  fatGPer100g: number;
  fibreGPer100g: number;
  costInrPer100g: number;
  source: string; // e.g. "IFCT 2017, Table 2" or "TODO_VERIFY"
  diet: ("veg" | "egg" | "nonveg" | "jain")[];
  region: string[];
}

export interface BuddyToolCall {
  tool: "shorten_session" | "make_quieter" | "swap_exercise" | "swap_meal" | "explain_exercise" | "log_feeling";
  args: Record<string, any>;
}

export interface BuddyActionResponse {
  reply: string;
  action?: {
    id: string;
    description: string;
    undoData?: any;
    toolCall: BuddyToolCall;
  };
  safetyTriggered?: boolean;
}
