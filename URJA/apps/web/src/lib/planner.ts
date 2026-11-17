import { UserProfile, ScreeningResult, Exercise, DayPlan, Session, Block } from "@packages/contracts/types";
import { EXERCISES } from "../data/exercisesData";

const BANNED_PATTERNS = [
  /\bcure\b/i,
  /\btreat\b/i,
  /\bheal\b/i,
  /\bfix your\b/i,
  /\bdetox\b/i,
  /\bburn fat fast\b/i,
  /\blose \d+\s?kg\b/i,
  /\bin \d+ days\b/i,
  /\bbikini body\b/i,
  /\btoned body\b/i,
  /\bmelt fat\b/i,
];

export function lintCopy(text: string): boolean {
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return false;
    }
  }
  return true;
}

export function filterExercises(profile: UserProfile, screening: ScreeningResult): Exercise[] {
  if (screening.outcome === "STOP_CONSULT") {
    return [];
  }

  const userFlags = new Set(screening.flags);
  const userEquipment = new Set(profile.equipment);

  return EXERCISES.filter((ex) => {
    // Care check gentle gate
    if (screening.outcome === "GO_GENTLE" && !ex.gentleOk) {
      return false;
    }

    // Contraindications check
    for (const flag of ex.contraindicatedFlags) {
      if (userFlags.has(flag)) {
        return false;
      }
    }

    // Equipment check
    for (const eq of ex.equipment) {
      if (eq !== "none" && !userEquipment.has(eq)) {
        return false;
      }
    }

    // Space check
    if (profile.space === "tiny" && ex.space === "room") {
      return false;
    }

    // Quiet check
    if (profile.quiet && !ex.quiet) {
      return false;
    }

    return true;
  });
}

export function validateDayPlan(
  plan: DayPlan,
  profile: UserProfile,
  screening: ScreeningResult,
  allowedExercises: Exercise[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (screening.outcome === "STOP_CONSULT") {
    if (plan.sessions.length > 0) {
      errors.push("No sessions allowed for STOP_CONSULT outcome.");
    }
    return { valid: errors.length === 0, errors };
  }

  const allowedMap = new Map(allowedExercises.map((e) => [e.id, e]));

  // Volume caps by level
  const rpeCap = screening.outcome === "GO_GENTLE" ? 4 : profile.level === "new" ? 5 : profile.level === "some" ? 7 : 8;
  const maxSets = profile.level === "new" ? 3 : profile.level === "some" ? 4 : 5;
  const maxReps = profile.level === "new" ? 12 : profile.level === "some" ? 15 : 20;
  const maxHoldSec = profile.level === "new" ? 30 : profile.level === "some" ? 45 : 60;

  for (const session of plan.sessions) {
    // Session duration within ±10%
    const targetPocket = profile.pockets.find((p) => p.start === session.pocketStart) || profile.pockets[0];
    if (targetPocket) {
      const minAllow = targetPocket.minutes * 0.9;
      const maxAllow = targetPocket.minutes * 1.1;
      if (session.minutes < minAllow - 1 || session.minutes > maxAllow + 1) {
        errors.push(`Session duration ${session.minutes} min outside ±10% range of pocket ${targetPocket.minutes} min.`);
      }
    }

    // Check rationale
    if (!lintCopy(session.rationale)) {
      errors.push(`Rationale contains banned language: "${session.rationale}"`);
    }

    // Warmup >= 2 min and Cooldown >= 2 min
    if (session.warmup.length === 0) {
      errors.push("Session must contain at least 1 warmup exercise (>= 2 minutes).");
    }
    if (session.cooldown.length === 0) {
      errors.push("Session must contain at least 1 cooldown exercise (>= 2 minutes).");
    }

    const allBlocks = [...session.warmup, ...session.main, ...session.cooldown];
    for (const b of allBlocks) {
      const ex = allowedMap.get(b.exerciseId);
      if (!ex) {
        errors.push(`Exercise ${b.exerciseId} is not in allowed exercise list for this profile.`);
        continue;
      }
      if (ex.intensityRPE > rpeCap) {
        errors.push(`Exercise ${ex.id} RPE ${ex.intensityRPE} exceeds cap of ${rpeCap}.`);
      }
      if (b.sets > maxSets) {
        errors.push(`Exercise ${ex.id} sets (${b.sets}) exceed cap (${maxSets}) for level ${profile.level}.`);
      }
      if (b.reps && b.reps > maxReps) {
        errors.push(`Exercise ${ex.id} reps (${b.reps}) exceed cap (${maxReps}) for level ${profile.level}.`);
      }
      if (b.holdSec && b.holdSec > maxHoldSec) {
        errors.push(`Exercise ${ex.id} hold (${b.holdSec}s) exceeds cap (${maxHoldSec}s).`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function generateDeterministicPlan(
  profile: UserProfile,
  screening: ScreeningResult,
  dateStr: string = "2026-11-15"
): DayPlan {
  if (screening.outcome === "STOP_CONSULT" || profile.pockets.length === 0) {
    return {
      date: dateStr,
      kind: "rest",
      sessions: [],
      source: "fallback",
    };
  }

  const allowed = filterExercises(profile, screening);
  const pocket = profile.pockets[0];
  const minutes = pocket.minutes;

  // Categorize available patterns
  const warmupPool = allowed.filter((e) => e.pattern === "mobility" || e.pattern === "cardio_low");
  const mainPool = allowed.filter((e) => e.pattern === "squat" || e.pattern === "push" || e.pattern === "hinge" || e.pattern === "core" || e.pattern === "balance");
  const cooldownPool = allowed.filter((e) => e.pattern === "yoga" || e.pattern === "mobility");

  const warmupEx = warmupPool[0] || allowed[0];
  const mainEx1 = mainPool[0] || allowed[1] || allowed[0];
  const mainEx2 = mainPool[1] || allowed[2] || allowed[0];
  const cooldownEx = cooldownPool[0] || allowed[allowed.length - 1] || allowed[0];

  const setsCount = profile.level === "new" ? 2 : 3;
  const repsCount = profile.level === "new" ? 10 : 12;

  const session: Session = {
    pocketStart: pocket.start,
    minutes: minutes,
    warmup: [
      {
        exerciseId: warmupEx.id,
        sets: 1,
        reps: 10,
        restSec: 15,
        note: "Light mobility to start softly",
      },
    ],
    main: [
      {
        exerciseId: mainEx1.id,
        sets: setsCount,
        reps: mainEx1.cv?.ruleId === "forearm_plank" ? undefined : repsCount,
        holdSec: mainEx1.cv?.ruleId === "forearm_plank" ? 20 : undefined,
        restSec: 40,
        note: "Steady smooth movement",
      },
      {
        exerciseId: mainEx2.id,
        sets: setsCount,
        reps: mainEx2.cv?.ruleId === "tree_pose" ? undefined : repsCount,
        holdSec: mainEx2.cv?.ruleId === "tree_pose" ? 20 : undefined,
        restSec: 40,
        note: "Breathe gently through reps",
      },
    ],
    cooldown: [
      {
        exerciseId: cooldownEx.id,
        sets: 1,
        holdSec: 30,
        restSec: 0,
        note: "Gentle relaxing stretch",
      },
    ],
    rationale: profile.quiet
      ? `${minutes} quiet minutes fit your ${pocket.start} pocket; low noise moves so no one is disturbed.`
      : `${minutes} minutes fit your ${pocket.start} window; balanced strength today, mobility tomorrow.`,
  };

  return {
    date: dateStr,
    kind: screening.outcome === "GO_GENTLE" ? "gentle" : "train",
    sessions: [session],
    source: "fallback",
  };
}
