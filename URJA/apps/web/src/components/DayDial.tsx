"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export interface DialPocket {
  start: string; // e.g. "06:15"
  minutes: number;
}

interface DayDialProps {
  interactive?: boolean;
  pockets: DialPocket[];
  onPocketsChange?: (pockets: DialPocket[]) => void;
  sessionPocket?: DialPocket | null;
  completedMinutes?: number;
  size?: number;
  className?: string;
  animateFill?: boolean;
}

// Convert "HH:MM" to angle (0° = 00:00 at top, 360° = 24 hours, clockwise)
const timeToAngle = (timeStr: string): number => {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMin = (h || 0) * 60 + (m || 0);
  return (totalMin / 1440) * 360;
};

// Convert angle to "HH:MM" rounded to nearest 5 minutes
const angleToTime = (angle: number): string => {
  const normalized = (angle % 360 + 360) % 360;
  const totalMin = Math.round((normalized / 360) * 1440 / 5) * 5;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

// SVG arc path helper
const describeArc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(" ");
};

export const DayDial: React.FC<DayDialProps> = ({
  interactive = false,
  pockets = [],
  onPocketsChange,
  sessionPocket = null,
  completedMinutes = 0,
  size = 280,
  className = "",
  animateFill = false,
}) => {
  const dialRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.30;
  const strokeWidth = outerRadius - innerRadius;

  // Major hour markers (6:00, 12:00, 18:00, 22:00)
  const hourMarkers = [
    { label: "6:00", angle: timeToAngle("06:00") },
    { label: "12:00", angle: timeToAngle("12:00") },
    { label: "18:00", angle: timeToAngle("18:00") },
    { label: "22:00", angle: timeToAngle("22:00") },
  ];

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    const normAngle = (angle % 360 + 360) % 360;

    setIsDragging(true);
    setDragStartAngle(normAngle);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive || !isDragging || dragStartAngle === null || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    const normAngle = (angle % 360 + 360) % 360;

    let deltaAngle = normAngle - dragStartAngle;
    if (deltaAngle < 0) deltaAngle += 360;

    // Minimum 10 minutes (2.5 degrees), maximum 90 minutes
    const minutes = Math.max(10, Math.min(60, Math.round((deltaAngle / 360) * 1440 / 5) * 5));
    const startTime = angleToTime(dragStartAngle);

    const newPockets = [...pockets, { start: startTime, minutes }];
    onPocketsChange?.(newPockets);

    setIsDragging(false);
    setDragStartAngle(null);
  };

  // Total free minutes
  const totalFreeMin = pockets.reduce((acc, p) => acc + p.minutes, 0);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        ref={dialRef}
        width={size}
        height={size}
        className={`touch-none ${interactive ? "cursor-crosshair" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Background 24h dial track */}
        <circle
          cx={cx}
          cy={cy}
          r={(outerRadius + innerRadius) / 2}
          fill="none"
          stroke="rgba(43,27,61,0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Waking hours arc (5:00 - 23:00) */}
        <path
          d={describeArc(cx, cy, (outerRadius + innerRadius) / 2, timeToAngle("05:00"), timeToAngle("23:00"))}
          fill="none"
          stroke="rgba(43,27,61,0.14)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* User Free Pockets (drawn in soft ink) */}
        {pockets.map((p, idx) => {
          const startAngle = timeToAngle(p.start);
          const endAngle = startAngle + (p.minutes / 1440) * 360;
          return (
            <path
              key={`pocket-${idx}`}
              d={describeArc(cx, cy, (outerRadius + innerRadius) / 2, startAngle, endAngle)}
              fill="none"
              stroke="rgba(43,27,61,0.30)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}

        {/* Planned Session segment - strictly MARIGOLD (#F5B427) */}
        {sessionPocket && (
          <motion.path
            d={describeArc(
              cx,
              cy,
              (outerRadius + innerRadius) / 2,
              timeToAngle(sessionPocket.start),
              timeToAngle(sessionPocket.start) + (sessionPocket.minutes / 1440) * 360
            )}
            fill="none"
            stroke="#F5B427"
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
            initial={animateFill ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}

        {/* Completed segment in PEACOCK (#0F7B83) */}
        {completedMinutes > 0 && sessionPocket && (
          <path
            d={describeArc(
              cx,
              cy,
              (outerRadius + innerRadius) / 2,
              timeToAngle(sessionPocket.start),
              timeToAngle(sessionPocket.start) + (completedMinutes / 1440) * 360
            )}
            fill="none"
            stroke="#0F7B83"
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
          />
        )}

        {/* Hour markers & labels */}
        {hourMarkers.map((m, i) => {
          const rad = ((m.angle - 90) * Math.PI) / 180;
          const textR = innerRadius - 16;
          const tx = cx + textR * Math.cos(rad);
          const ty = cy + textR * Math.sin(rad) + 4;
          return (
            <text
              key={i}
              x={tx}
              y={ty}
              textAnchor="middle"
              className="fill-ink-70 text-[10px] font-sans pointer-events-none select-none"
            >
              {m.label}
            </text>
          );
        })}

        {/* Center content */}
        <circle cx={cx} cy={cy} r={innerRadius - 28} fill="#FFFFFF" />
      </svg>

      {/* Center Dial Label */}
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
        {sessionPocket ? (
          <>
            <span className="text-xs text-ink-70 font-medium">Session</span>
            <span className="font-display text-2xl text-aubergine font-bold">
              {sessionPocket.minutes} min
            </span>
            <span className="text-[11px] text-ink-70">{sessionPocket.start}</span>
          </>
        ) : (
          <>
            <span className="font-display text-xl text-aubergine font-bold">
              {pockets.length} {pockets.length === 1 ? "pocket" : "pockets"}
            </span>
            <span className="text-xs text-ink-70">
              {totalFreeMin} min total
            </span>
          </>
        )}
      </div>

      {interactive && (
        <p className="mt-3 text-xs text-ink-70 text-center">
          {pockets.length === 0
            ? "Drag on the dial to mark when you can move"
            : "Tap or drag to add another pocket"}
        </p>
      )}
    </div>
  );
};
