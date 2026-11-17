import { ScreeningResult } from "@packages/contracts/types";

export interface CareAnswers {
  q1_pregnant: boolean;
  q2_recent_surgery: boolean;
  q3_chest_pain: boolean;
  q4_dizzy: boolean;
  q5_doctor_limit: boolean;
  q6_joint_pain: boolean;
  q7_extra_notes?: string;
}

export function evaluateCareCheck(answers: CareAnswers): ScreeningResult {
  const flags: string[] = [];

  if (answers.q1_pregnant) flags.push("pregnant_or_postpartum");
  if (answers.q2_recent_surgery) flags.push("recent_surgery_or_injury");
  if (answers.q3_chest_pain) flags.push("chest_pain_breathlessness");
  if (answers.q4_dizzy) flags.push("dizziness_or_fainting");
  if (answers.q5_doctor_limit) flags.push("doctor_advised_limit");

  // Any Yes on 1-5 -> STOP_CONSULT
  if (flags.length > 0) {
    return {
      outcome: "STOP_CONSULT",
      flags,
    };
  }

  // Yes on 6 or non-empty on 7 -> GO_GENTLE
  if (answers.q6_joint_pain) {
    flags.push("joint_back_pelvic_pain");
  }
  if (answers.q7_extra_notes && answers.q7_extra_notes.trim().length > 0) {
    flags.push("extra_doctor_precautions_noted");
  }

  if (flags.length > 0) {
    return {
      outcome: "GO_GENTLE",
      flags,
    };
  }

  // All No -> GO
  return {
    outcome: "GO",
    flags: [],
  };
}
