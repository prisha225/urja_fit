"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkeletonAnimator } from "../../components/SkeletonAnimator";
import { ExerciseTracker, PoseLandmark } from "../../lib/poseEngine";
import { EXERCISES } from "../../data/exercisesData";
import {
  Camera,
  CameraOff,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function StudioPage() {
  const router = useRouter();

  // Exercise queue for today's session (Chair Squat -> Wall Push-up -> Plank -> Cooldown)
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const currentExercise = EXERCISES[exerciseIndex] || EXERCISES[0];

  // Studio setup & camera state
  const [setupPassed, setSetupPassed] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [ghostCoachEnabled, setGhostCoachEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // HUD stats
  const [repCount, setRepCount] = useState(0);
  const [holdSec, setHoldSec] = useState(0);
  const [cue, setCue] = useState(currentExercise.cues.hinglish[0]);
  const [formBand, setFormBand] = useState<"Steady" | "Needs work" | "Ready">("Ready");
  const [offFormJoints, setOffFormJoints] = useState<string[]>([]);
  const [visibilityAlert, setVisibilityAlert] = useState(false);

  // Pain / Discomfort check state after set
  const [showPainCheck, setShowPainCheck] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<ExerciseTracker>(new ExerciseTracker(currentExercise.cv?.ruleId || "chair_squat"));

  // Switch tracker when exercise changes
  useEffect(() => {
    trackerRef.current = new ExerciseTracker(currentExercise.cv?.ruleId || "chair_squat");
    setRepCount(0);
    setHoldSec(0);
    setCue(currentExercise.cues.hinglish[0]);
    setFormBand("Ready");
  }, [currentExercise]);

  // Camera initialization
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraPermissionGranted(true);
          };
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable. Falling back to Guided Mode.", err);
        setCameraPermissionGranted(false);
        setIsGuidedMode(true);
        setSetupPassed(true);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Guided Mode fallback timer
  useEffect(() => {
    if (!isGuidedMode || isPaused || !setupPassed) return;
    const interval = setInterval(() => {
      if (currentExercise.cv?.ruleId === "forearm_plank" || currentExercise.cv?.ruleId === "tree_pose") {
        setHoldSec((s) => s + 1);
      } else {
        setRepCount((r) => (r < 10 ? r + 1 : r));
      }
    }, 2400);

    return () => clearInterval(interval);
  }, [isGuidedMode, isPaused, setupPassed, currentExercise]);

  // Live video frame processing with MediaPipe PoseLandmarker
  useEffect(() => {
    if (isGuidedMode || !setupPassed || isPaused) return;

    let animId: number;
    let poseLandmarker: any = null;

    async function setupPoseLandmarker() {
      try {
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      } catch (e) {
        console.warn("MediaPipe load failed, switching to guided mode", e);
        setIsGuidedMode(true);
      }
    }

    setupPoseLandmarker();

    const renderLoop = (timeMs: number) => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (poseLandmarker) {
            const results = poseLandmarker.detectForVideo(video, timeMs);
            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks: PoseLandmark[] = results.landmarks[0];
              const aspectRatio = canvas.width / canvas.height;

              // Process rep logic
              const res = trackerRef.current.processFrame(landmarks, aspectRatio, timeMs);
              setRepCount(res.reps);
              setHoldSec(res.holdSeconds);
              setCue(res.cue);
              setFormBand(res.formBand);
              setOffFormJoints(res.offFormJoints);
              setVisibilityAlert(res.visibilityWarning);

              // Draw white skeleton (2.5px round caps)
              drawSkeleton(ctx, landmarks, canvas.width, canvas.height, res.offFormJoints);
            }
          }
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [setupPassed, isPaused, isGuidedMode]);

  // Skeleton drawing helper
  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: PoseLandmark[],
    w: number,
    h: number,
    offJoints: string[]
  ) => {
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
    ];

    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    for (const [i1, i2] of connections) {
      const p1 = landmarks[i1];
      const p2 = landmarks[i2];
      if (p1 && p2 && (p1.visibility ?? 1) > 0.4 && (p2.visibility ?? 1) > 0.4) {
        ctx.beginPath();
        // Mirrored coordinate
        ctx.moveTo((1 - p1.x) * w, p1.y * h);
        ctx.lineTo((1 - p2.x) * w, p2.y * h);
        ctx.stroke();
      }
    }

    // Draw joints
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      if (!p || (p.visibility ?? 1) < 0.4) continue;
      const isOff = offJoints.some((oj) =>
        (oj === "hip" && (i === 23 || i === 24)) ||
        (oj === "knee" && (i === 25 || i === 26)) ||
        (oj === "shoulder" && (i === 11 || i === 12))
      );

      ctx.fillStyle = isOff ? "#D6336C" : "#FFFFFF";
      ctx.beginPath();
      ctx.arc((1 - p.x) * w, p.y * h, isOff ? 6 : 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const handleFinishSet = () => {
    setShowPainCheck(true);
  };

  const handlePainResponse = (feltPain: boolean) => {
    setShowPainCheck(false);
    if (exerciseIndex < 3) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      router.push("/today");
    }
  };

  return (
    <div className="relative flex-1 bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Setup Check Modal Screen if not yet passed */}
      {!setupPassed && (
        <div className="absolute inset-0 z-50 bg-aubergine/95 flex flex-col items-center justify-between p-6 text-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-ink-70 font-semibold uppercase tracking-wider">
              Studio Setup Check
            </span>
            <button
              type="button"
              onClick={() => {
                setIsGuidedMode(true);
                setSetupPassed(true);
              }}
              className="text-xs text-marigold underline"
            >
              Skip camera (Guided mode)
            </button>
          </div>

          {/* Silhouette outline indicator */}
          <div className="flex flex-col items-center my-6">
            <div className="w-44 h-72 border-2 border-dashed border-peacock/60 rounded-hero flex flex-col items-center justify-center p-4">
              <Camera className="w-8 h-8 text-peacock mb-2" />
              <span className="text-xs text-white/90 font-medium">
                Step back until your full body fits inside the frame (~2m)
              </span>
            </div>
            <p className="text-xs text-white/70 mt-4 max-w-xs leading-relaxed">
              Side-on view works best. Make sure room has enough light.
            </p>
          </div>

          <div className="w-full space-y-3">
            {/* Privacy notice - non-negotiable */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/70">
              <ShieldCheck className="w-4 h-4 text-peacock" />
              <span>Video stays on this device. Nothing is uploaded.</span>
            </div>

            <button
              type="button"
              onClick={() => setSetupPassed(true)}
              className="w-full py-4 px-6 rounded-chip bg-marigold text-aubergine font-bold text-base shadow-sm hover:brightness-105"
            >
              Ready, let's start
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Live View (Video / Canvas / Ghost Coach) */}
      <div className="relative flex-1 flex items-center justify-center bg-black">
        {/* Mirrored User Camera */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${
            isGuidedMode ? "hidden" : "block"
          }`}
        />

        {/* Skeleton Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
            isGuidedMode ? "hidden" : "block"
          }`}
        />

        {/* Guided Mode Fallback Animation */}
        {isGuidedMode && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-64 h-64 bg-white/5 rounded-hero p-4 flex items-center justify-center mb-4">
              <SkeletonAnimator
                exerciseId={currentExercise.id}
                width={220}
                height={220}
                strokeColor="#FFFFFF"
              />
            </div>
            <span className="text-xs text-white/70">
              Guided mode: follow the animated guide at your own pace
            </span>
          </div>
        )}

        {/* Ghost Coach Overlay beside user if enabled */}
        {ghostCoachEnabled && !isGuidedMode && (
          <div className="absolute top-16 right-4 w-32 h-44 bg-black/40 backdrop-blur-xs rounded-hero p-2 border border-white/20 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-white/70 mb-1">Ghost Coach</span>
            <SkeletonAnimator
              exerciseId={currentExercise.id}
              width={100}
              height={120}
              isGhostCoach={true}
              showCues={false}
            />
          </div>
        )}

        {/* Visibility Alert Banner */}
        {visibilityAlert && (
          <div className="absolute top-20 px-4 py-2 bg-hibiscus/90 text-white rounded-chip text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <AlertCircle className="w-4 h-4" />
            <span>I can't see your feet. Step back a little.</span>
          </div>
        )}
      </div>

      {/* 3. Live HUD Overlay */}
      <div className="relative z-30 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-between">
        {/* Top HUD Bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] text-white/70 uppercase tracking-wider block">
              Exercise {exerciseIndex + 1} of 4
            </span>
            <h2 className="font-display text-xl text-white font-bold">
              {currentExercise.name.hinglish}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Ghost coach toggle button */}
            <button
              type="button"
              onClick={() => setGhostCoachEnabled(!ghostCoachEnabled)}
              className={`p-2.5 rounded-chip border text-xs flex items-center gap-1 ${
                ghostCoachEnabled ? "bg-peacock border-peacock text-white" : "border-white/30 text-white/80"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ghost</span>
            </button>

            {/* Pause button */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-2.5 rounded-chip border border-white/30 text-white hover:bg-white/10"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Middle: Rep Counter & Form Band */}
        <div className="flex items-center justify-between my-2">
          {/* Peacock Circular Rep / Hold Counter Ring */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full border-4 border-peacock flex flex-col items-center justify-center bg-black/40">
              <span className="font-display text-2xl font-bold text-white">
                {currentExercise.cv?.ruleId === "forearm_plank" || currentExercise.cv?.ruleId === "tree_pose"
                  ? holdSec
                  : repCount}
              </span>
              <span className="text-[9px] text-white/70 -mt-1">
                {currentExercise.cv?.ruleId === "forearm_plank" || currentExercise.cv?.ruleId === "tree_pose"
                  ? "sec"
                  : "reps"}
              </span>
            </div>

            <div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-chip font-medium inline-block ${
                  formBand === "Steady"
                    ? "bg-peacock/30 text-peacock border border-peacock"
                    : "bg-hibiscus/30 text-hibiscus border border-hibiscus"
                }`}
              >
                {formBand}
              </span>
              <span className="text-[11px] text-white/70 block mt-1">
                Stop if anything hurts
              </span>
            </div>
          </div>

          {/* Finish set button */}
          <button
            type="button"
            onClick={handleFinishSet}
            className="py-3 px-5 rounded-chip bg-white text-aubergine font-bold text-xs hover:bg-mist flex items-center gap-1"
          >
            <span>Done</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Cue Line (<= 7 words, large bottom third) */}
        <div className="mt-3 p-3 bg-black/60 backdrop-blur-xs rounded-hero border border-white/10 text-center">
          <p className="text-base text-white font-medium">
            "{cue}"
          </p>
        </div>
      </div>

      {/* Post-Set Pain Check Modal (§8.3) */}
      {showPainCheck && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm bg-white rounded-hero p-6 text-aubergine text-center">
            <h3 className="font-display text-xl mb-2">Felt any pain or discomfort?</h3>
            <p className="text-xs text-ink-70 mb-6">
              Checking in after your set keeps your body safe.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePainResponse(false)}
                className="py-3 px-4 rounded-chip bg-aubergine text-white text-sm font-semibold"
              >
                Felt good
              </button>
              <button
                type="button"
                onClick={() => handlePainResponse(true)}
                className="py-3 px-4 rounded-chip border border-hibiscus text-hibiscus text-sm font-semibold hover:bg-red-50"
              >
                Felt pain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
