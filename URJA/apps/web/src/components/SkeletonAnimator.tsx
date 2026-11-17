"use client";

import React, { useEffect, useState } from "react";
import { KEYFRAMES_MAP, ExerciseKeyframe } from "../data/keyframesData";

interface SkeletonAnimatorProps {
  exerciseId: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  isGhostCoach?: boolean;
  className?: string;
  showCues?: boolean;
}

const CONNECTIONS: [string, string][] = [
  ["nose", "left_shoulder"],
  ["nose", "right_shoulder"],
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

export const SkeletonAnimator: React.FC<SkeletonAnimatorProps> = ({
  exerciseId,
  width = 240,
  height = 240,
  strokeColor = "#2B1B3D",
  isGhostCoach = false,
  className = "",
  showCues = true,
}) => {
  const [progress, setProgress] = useState(0);
  const kf: ExerciseKeyframe | undefined = KEYFRAMES_MAP[exerciseId] || KEYFRAMES_MAP.chair_squat;

  useEffect(() => {
    if (!kf) return;
    const duration = kf.durationMs || 2400;
    let start: number | null = null;
    let reqId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % duration;
      setProgress(elapsed / duration);
      reqId = requestAnimationFrame(step);
    };

    reqId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(reqId);
  }, [kf, exerciseId]);

  if (!kf || kf.frames.length < 2) {
    return <div className="text-xs text-ink-70">Guide unavailable</div>;
  }

  // Find two adjacent keyframes for interpolation
  const frames = kf.frames;
  let idx = 0;
  for (let i = 0; i < frames.length - 1; i++) {
    if (progress >= frames[i].timeFraction && progress <= frames[i + 1].timeFraction) {
      idx = i;
      break;
    }
  }

  const f1 = frames[idx];
  const f2 = frames[idx + 1] || frames[0];
  const span = (f2.timeFraction - f1.timeFraction) || 1;
  const localT = Math.max(0, Math.min(1, (progress - f1.timeFraction) / span));

  // Cosine ease-in-out interpolation
  const easeT = (1 - Math.cos(localT * Math.PI)) / 2;

  const currentJoints: Record<string, [number, number]> = {};
  for (const jKey of Object.keys(f1.joints)) {
    const p1 = f1.joints[jKey];
    const p2 = f2.joints[jKey] || p1;
    const x = p1[0] + (p2[0] - p1[0]) * easeT;
    const y = p1[1] + (p2[1] - p1[1]) * easeT;
    currentJoints[jKey] = [x * width, y * height];
  }

  const activeColor = isGhostCoach ? "rgba(255,255,255,0.75)" : strokeColor;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Skeleton bones */}
        {CONNECTIONS.map(([j1, j2], i) => {
          const pt1 = currentJoints[j1];
          const pt2 = currentJoints[j2];
          if (!pt1 || !pt2) return null;
          return (
            <line
              key={`bone-${i}`}
              x1={pt1[0]}
              y1={pt1[1]}
              x2={pt2[0]}
              y2={pt2[1]}
              stroke={activeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Skeleton joints */}
        {Object.entries(currentJoints).map(([name, [x, y]], i) => (
          <circle
            key={`joint-${i}`}
            cx={x}
            cy={y}
            r="3.5"
            fill={activeColor}
          />
        ))}
      </svg>

      {showCues && (
        <span className="mt-2 text-[11px] text-ink-70 font-medium">
          {f1.phase.replace("_", " ")}
        </span>
      )}
    </div>
  );
};
