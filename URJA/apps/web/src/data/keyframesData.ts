// apps/web/src/data/keyframesData.ts
export interface KeyframePhase {
  phase: string;
  timeFraction: number;
  joints: Record<string, number[]>;
}

export interface ExerciseKeyframe {
  exerciseId: string;
  fps: number;
  durationMs: number;
  recordedBy: string;
  frames: KeyframePhase[];
}

import chairSquat from "../../../../data/exercises/keyframes/chair_squat.json";
import wallPushup from "../../../../data/exercises/keyframes/wall_pushup.json";
import forearmPlank from "../../../../data/exercises/keyframes/forearm_plank.json";
import treePose from "../../../../data/exercises/keyframes/tree_pose.json";
import gluteBridge from "../../../../data/exercises/keyframes/glute_bridge.json";
import birdDog from "../../../../data/exercises/keyframes/bird_dog.json";
import seatedShoulderRolls from "../../../../data/exercises/keyframes/seated_shoulder_rolls.json";
import standingCalfRaise from "../../../../data/exercises/keyframes/standing_calf_raise.json";
import catCow from "../../../../data/exercises/keyframes/cat_cow.json";
import marching from "../../../../data/exercises/keyframes/marching.json";
import doorwayStretch from "../../../../data/exercises/keyframes/doorway_stretch.json";
import childsPose from "../../../../data/exercises/keyframes/childs_pose.json";

export const KEYFRAMES_MAP: Record<string, ExerciseKeyframe> = {
  chair_squat: chairSquat as unknown as ExerciseKeyframe,
  wall_pushup: wallPushup as unknown as ExerciseKeyframe,
  forearm_plank: forearmPlank as unknown as ExerciseKeyframe,
  tree_pose: treePose as unknown as ExerciseKeyframe,
  glute_bridge: gluteBridge as unknown as ExerciseKeyframe,
  bird_dog: birdDog as unknown as ExerciseKeyframe,
  seated_shoulder_rolls: seatedShoulderRolls as unknown as ExerciseKeyframe,
  standing_calf_raise: standingCalfRaise as unknown as ExerciseKeyframe,
  cat_cow_stretch: catCow as unknown as ExerciseKeyframe,
  low_impact_marching: marching as unknown as ExerciseKeyframe,
  doorway_chest_stretch: doorwayStretch as unknown as ExerciseKeyframe,
  childs_pose: childsPose as unknown as ExerciseKeyframe,
};
