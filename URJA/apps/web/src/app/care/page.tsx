"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, HeartPulse } from "lucide-react";
import { evaluateCareCheck, CareAnswers } from "../../lib/careCheck";

const QUESTIONS = [
  {
    key: "q1_pregnant",
    text: "Are you pregnant, or had a baby in the last 6 months?",
    why: "Pregnancy requires specialized prenatal guidance from your doctor.",
  },
  {
    key: "q2_recent_surgery",
    text: "Have you had surgery or an injury in the last 3 months that you are still recovering from?",
    why: "Tissue and joint healing needs medical clearance first.",
  },
  {
    key: "q3_chest_pain",
    text: "Have you ever had chest pain or breathlessness when resting or doing light activity?",
    why: "Cardiopulmonary symptoms must be examined by a physician.",
  },
  {
    key: "q4_dizzy",
    text: "Do you often feel dizzy or faint?",
    why: "Frequent fainting or loss of balance can cause injury during movement.",
  },
  {
    key: "q5_doctor_limit",
    text: "Has a doctor told you to avoid or limit exercise?",
    why: "We honor your doctor's recommendations above all else.",
  },
  {
    key: "q6_joint_pain",
    text: "Do you have ongoing joint, back, or pelvic pain?",
    why: "If yes, we route you strictly to gentle, joint-friendly movements.",
  },
  {
    key: "q7_extra_notes",
    text: "Is there anything else your doctor asked you to be careful about?",
    isText: true,
    why: "Optional notes for your own reference; never stored or sent to AI.",
  },
];

export default function CareCheckPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CareAnswers>({
    q1_pregnant: false,
    q2_recent_surgery: false,
    q3_chest_pain: false,
    q4_dizzy: false,
    q5_doctor_limit: false,
    q6_joint_pain: false,
    q7_extra_notes: "",
  });

  const currentQ = QUESTIONS[step];

  const handleAnswer = (value: boolean | string) => {
    const updated = { ...answers, [currentQ.key]: value };
    setAnswers(updated);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Evaluate result
      const result = evaluateCareCheck(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("sakhi_screening_result", JSON.stringify(result));
      }

      if (result.outcome === "STOP_CONSULT") {
        router.push("/referral");
      } else {
        router.push("/today?animate=1");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white">
      <div>
        {/* Navigation & Progress */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => (step > 0 ? setStep(step - 1) : router.push("/"))}
            className="text-xs text-ink-70 hover:text-aubergine flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-xs font-semibold text-peacock">
            Question {step + 1} of {QUESTIONS.length}
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-peacock mb-1">
            <HeartPulse className="w-4 h-4" />
            <span>Care Check</span>
          </div>
          <h2 className="font-display text-2xl text-aubergine font-bold leading-snug">
            {currentQ.text}
          </h2>
          <p className="text-xs text-ink-70 mt-2 leading-relaxed">
            {currentQ.why}
          </p>
        </div>

        {/* Question Input */}
        {!currentQ.isText ? (
          <div className="space-y-3 my-8">
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="w-full py-4 px-6 rounded-hero border border-ink-12 bg-white hover:bg-mist text-left flex items-center justify-between text-aubergine font-semibold text-base transition-all shadow-xs"
            >
              <span>No</span>
              <span className="text-xs text-ink-70 font-normal">I have not had this</span>
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="w-full py-4 px-6 rounded-hero border border-ink-12 bg-white hover:bg-mist text-left flex items-center justify-between text-aubergine font-semibold text-base transition-all shadow-xs"
            >
              <span>Yes</span>
              <span className="text-xs text-ink-70 font-normal">Applies to me</span>
            </button>
          </div>
        ) : (
          <div className="my-6 space-y-4">
            <textarea
              value={answers.q7_extra_notes}
              onChange={(e) => setAnswers({ ...answers, q7_extra_notes: e.target.value })}
              placeholder="e.g. Mild lower back sensitivity after lifting (Optional)"
              rows={3}
              className="w-full p-3.5 rounded-field border border-ink-12 bg-mist text-sm text-aubergine focus:outline-none focus:ring-1 focus:ring-aubergine"
            />
            <button
              type="button"
              onClick={() => handleAnswer(answers.q7_extra_notes || "")}
              className="w-full py-4 rounded-chip bg-marigold text-aubergine font-semibold text-base shadow-sm"
            >
              Complete Check
            </button>
          </div>
        )}
      </div>

      {/* Safety Footer */}
      <div className="pt-4 border-t border-ink-12 text-center text-[11px] text-ink-70">
        Sakhi is for general wellness guidance. Not medical diagnosis or treatment.
      </div>
    </div>
  );
}
