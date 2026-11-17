export interface Point2D {
  x: number;
  y: number;
  visibility?: number;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

// Aspect ratio corrected 2D angle
export const calculateAngle = (a: Point2D, b: Point2D, c: Point2D, aspectRatio: number = 1.0): number => {
  // b is the vertex
  const ax = a.x * aspectRatio;
  const bx = b.x * aspectRatio;
  const cx = c.x * aspectRatio;

  const v1 = { x: ax - bx, y: a.y - b.y };
  const v2 = { x: cx - bx, y: c.y - b.y };

  const m1 = Math.hypot(v1.x, v1.y) || 1;
  const m2 = Math.hypot(v2.x, v2.y) || 1;

  const dot = v1.x * v2.x + v1.y * v2.y;
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
};

// Angle between shoulder-hip line and vertical (0 degrees = upright)
export const calculateTorsoLean = (shoulder: Point2D, hip: Point2D): number => {
  const dx = shoulder.x - hip.x;
  const dy = hip.y - shoulder.y; // shoulder is higher (smaller y)
  const angleRad = Math.atan2(Math.abs(dx), Math.max(0.001, dy));
  return (angleRad * 180) / Math.PI;
};

// Simple One-Euro Filter simulation for coordinate smoothing
export class CoordinateSmoother {
  private prevX: number | null = null;
  private prevY: number | null = null;
  private alpha: number = 0.35; // filter responsiveness

  filter(x: number, y: number): { x: number; y: number } {
    if (this.prevX === null || this.prevY === null) {
      this.prevX = x;
      this.prevY = y;
      return { x, y };
    }
    const filteredX = this.alpha * x + (1 - this.alpha) * this.prevX;
    const filteredY = this.alpha * y + (1 - this.alpha) * this.prevY;
    this.prevX = filteredX;
    this.prevY = filteredY;
    return { x: filteredX, y: filteredY };
  }

  reset() {
    this.prevX = null;
    this.prevY = null;
  }
}

export interface RepStateResult {
  reps: number;
  holdSeconds: number;
  phase: "up" | "down" | "hold" | "neutral";
  formBand: "Steady" | "Needs work" | "Ready";
  cue: string;
  offFormJoints: string[];
  visibilityWarning: boolean;
}

export class ExerciseTracker {
  private ruleId: string;
  private reps: number = 0;
  private holdSeconds: number = 0;
  private phase: "up" | "down" | "hold" | "neutral" = "up";
  private repStartTime: number = 0;
  private minPrimaryAngleDuringRep: number = 180;
  private maxTorsoLeanDuringRep: number = 0;
  private lastHoldTickTime: number = 0;
  private lowVisibilityStartTime: number = 0;

  constructor(ruleId: string) {
    this.ruleId = ruleId;
  }

  reset() {
    this.reps = 0;
    this.holdSeconds = 0;
    this.phase = this.ruleId === "forearm_plank" || this.ruleId === "tree_pose" ? "hold" : "up";
    this.repStartTime = 0;
    this.minPrimaryAngleDuringRep = 180;
    this.maxTorsoLeanDuringRep = 0;
    this.lastHoldTickTime = 0;
    this.lowVisibilityStartTime = 0;
  }

  processFrame(
    landmarks: PoseLandmark[],
    aspectRatio: number,
    currentTimeMs: number
  ): RepStateResult {
    // MediaPipe pose landmark indices:
    // Left: shoulder 11, elbow 13, wrist 15, hip 23, knee 25, ankle 27
    // Right: shoulder 12, elbow 14, wrist 16, hip 24, knee 26, ankle 28
    const leftSideMeanVis =
      ((landmarks[11]?.visibility ?? 0) +
        (landmarks[23]?.visibility ?? 0) +
        (landmarks[25]?.visibility ?? 0) +
        (landmarks[27]?.visibility ?? 0)) /
      4;
    const rightSideMeanVis =
      ((landmarks[12]?.visibility ?? 0) +
        (landmarks[24]?.visibility ?? 0) +
        (landmarks[26]?.visibility ?? 0) +
        (landmarks[28]?.visibility ?? 0)) /
      4;

    const useLeft = leftSideMeanVis >= rightSideMeanVis;
    const shoulder = useLeft ? landmarks[11] : landmarks[12];
    const elbow = useLeft ? landmarks[13] : landmarks[14];
    const wrist = useLeft ? landmarks[15] : landmarks[16];
    const hip = useLeft ? landmarks[23] : landmarks[24];
    const knee = useLeft ? landmarks[25] : landmarks[26];
    const ankle = useLeft ? landmarks[27] : landmarks[28];

    // Visibility gate (< 0.5 for > 500 ms)
    const keyJoints = [shoulder, hip, knee, ankle];
    const anyLowVis = keyJoints.some((j) => (j?.visibility ?? 0) < 0.45);

    if (anyLowVis) {
      if (this.lowVisibilityStartTime === 0) {
        this.lowVisibilityStartTime = currentTimeMs;
      }
      if (currentTimeMs - this.lowVisibilityStartTime > 500) {
        return {
          reps: this.reps,
          holdSeconds: Math.floor(this.holdSeconds),
          phase: this.phase,
          formBand: "Needs work",
          cue: "I can't see your feet. Step back a little.",
          offFormJoints: ["feet"],
          visibilityWarning: true,
        };
      }
    } else {
      this.lowVisibilityStartTime = 0;
    }

    if (!shoulder || !hip || !knee || !ankle) {
      return {
        reps: this.reps,
        holdSeconds: Math.floor(this.holdSeconds),
        phase: this.phase,
        formBand: "Ready",
        cue: "Step into view to begin",
        offFormJoints: [],
        visibilityWarning: false,
      };
    }

    // Chair Squat tracker
    if (this.ruleId === "chair_squat") {
      const kneeAngle = calculateAngle(hip, knee, ankle, aspectRatio);
      const torsoLean = calculateTorsoLean(shoulder, hip);

      let cue = "Steady and smooth";
      const offFormJoints: string[] = [];
      let formBand: "Steady" | "Needs work" = "Steady";

      if (torsoLean > 45) {
        cue = "Chest up";
        offFormJoints.push("shoulder", "hip");
        formBand = "Needs work";
      }

      if (this.phase === "up") {
        if (kneeAngle < 110) {
          // Down threshold reached
          this.phase = "down";
          this.repStartTime = currentTimeMs;
          this.minPrimaryAngleDuringRep = kneeAngle;
          this.maxTorsoLeanDuringRep = torsoLean;
        }
      } else if (this.phase === "down") {
        this.minPrimaryAngleDuringRep = Math.min(this.minPrimaryAngleDuringRep, kneeAngle);
        this.maxTorsoLeanDuringRep = Math.max(this.maxTorsoLeanDuringRep, torsoLean);

        if (kneeAngle > 160) {
          // Up threshold reached with hysteresis
          const repDuration = currentTimeMs - this.repStartTime;
          if (repDuration >= 900) {
            this.reps += 1;
            if (this.minPrimaryAngleDuringRep > 105) {
              cue = "Sit back a little lower, if comfortable";
              formBand = "Needs work";
            } else if (this.maxTorsoLeanDuringRep > 45) {
              cue = "Chest up tall";
              formBand = "Needs work";
            } else {
              cue = "Good depth and tempo!";
            }
          }
          this.phase = "up";
        }
      }

      return {
        reps: this.reps,
        holdSeconds: 0,
        phase: this.phase,
        formBand,
        cue,
        offFormJoints,
        visibilityWarning: false,
      };
    }

    // Wall Push-up tracker
    if (this.ruleId === "wall_pushup") {
      if (!elbow || !wrist) {
        return {
          reps: this.reps,
          holdSeconds: 0,
          phase: this.phase,
          formBand: "Ready",
          cue: "Place hands on the wall",
          offFormJoints: [],
          visibilityWarning: false,
        };
      }

      const elbowAngle = calculateAngle(shoulder, elbow, wrist, aspectRatio);
      const bodyLineAngle = calculateAngle(shoulder, hip, ankle, aspectRatio);

      let cue = "Keep one straight line";
      const offFormJoints: string[] = [];
      let formBand: "Steady" | "Needs work" = "Steady";

      if (bodyLineAngle < 155) {
        cue = "Keep one straight line";
        offFormJoints.push("hip");
        formBand = "Needs work";
      }

      if (this.phase === "up") {
        if (elbowAngle < 100) {
          this.phase = "down";
          this.repStartTime = currentTimeMs;
          this.minPrimaryAngleDuringRep = elbowAngle;
        }
      } else if (this.phase === "down") {
        this.minPrimaryAngleDuringRep = Math.min(this.minPrimaryAngleDuringRep, elbowAngle);
        if (elbowAngle > 155) {
          const repDuration = currentTimeMs - this.repStartTime;
          if (repDuration >= 700) {
            this.reps += 1;
            cue = "Smooth press!";
          }
          this.phase = "up";
        }
      }

      return {
        reps: this.reps,
        holdSeconds: 0,
        phase: this.phase,
        formBand,
        cue,
        offFormJoints,
        visibilityWarning: false,
      };
    }

    // Forearm Plank Hold tracker
    if (this.ruleId === "forearm_plank") {
      const bodyLineAngle = calculateAngle(shoulder, hip, ankle, aspectRatio);
      const inBand = bodyLineAngle >= 165 && bodyLineAngle <= 195;

      let cue = "Hold steady and breathe";
      const offFormJoints: string[] = [];
      let formBand: "Steady" | "Needs work" = "Steady";

      if (bodyLineAngle < 165) {
        cue = "Lift hips a little";
        offFormJoints.push("hip");
        formBand = "Needs work";
      } else if (bodyLineAngle > 195) {
        cue = "Lower hips a little";
        offFormJoints.push("hip");
        formBand = "Needs work";
      }

      if (inBand) {
        if (this.lastHoldTickTime > 0) {
          this.holdSeconds += (currentTimeMs - this.lastHoldTickTime) / 1000;
        }
        this.lastHoldTickTime = currentTimeMs;
      } else {
        this.lastHoldTickTime = currentTimeMs;
      }

      return {
        reps: 0,
        holdSeconds: Math.floor(this.holdSeconds),
        phase: "hold",
        formBand,
        cue,
        offFormJoints,
        visibilityWarning: false,
      };
    }

    // Tree Pose Hold tracker
    if (this.ruleId === "tree_pose") {
      const standingKneeAngle = calculateAngle(hip, knee, ankle, aspectRatio);
      const isStandingStraight = standingKneeAngle >= 162;

      let cue = "Find one focal point ahead";
      const offFormJoints: string[] = [];
      let formBand: "Steady" | "Needs work" = "Steady";

      if (!isStandingStraight) {
        cue = "Press into the standing leg";
        offFormJoints.push("knee");
        formBand = "Needs work";
      }

      if (isStandingStraight) {
        if (this.lastHoldTickTime > 0) {
          this.holdSeconds += (currentTimeMs - this.lastHoldTickTime) / 1000;
        }
        this.lastHoldTickTime = currentTimeMs;
      } else {
        this.lastHoldTickTime = currentTimeMs;
      }

      return {
        reps: 0,
        holdSeconds: Math.floor(this.holdSeconds),
        phase: "hold",
        formBand,
        cue,
        offFormJoints,
        visibilityWarning: false,
      };
    }

    return {
      reps: this.reps,
      holdSeconds: Math.floor(this.holdSeconds),
      phase: "neutral",
      formBand: "Steady",
      cue: "Keep moving at your own pace",
      offFormJoints: [],
      visibilityWarning: false,
    };
  }
}
