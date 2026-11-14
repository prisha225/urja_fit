export type CareAnswer = "yes" | "no" | undefined;
export type CareOutcome = "GO" | "GO_GENTLE" | "STOP_CONSULT";

export const careQuestions = [
  "Are you pregnant, or had a baby in the last 6 months?",
  "Have you had surgery or an injury in the last 3 months that you are still recovering from?",
  "Have you ever had chest pain or breathlessness when resting or doing light activity?",
  "Do you often feel dizzy or faint?",
  "Has a doctor told you to avoid or limit exercise?",
  "Do you have ongoing joint, back, or pelvic pain?",
  "Is there anything else your doctor has asked you to be careful about with exercise or food?",
] as const;

/** Pure, local safety logic. Free text is only checked for presence, never interpreted. */
export function assessCare(answers: CareAnswer[], optionalText: string): CareOutcome {
  if (answers.slice(0, 5).some((answer) => answer === "yes")) return "STOP_CONSULT";
  if (answers[5] === "yes" || optionalText.trim().length > 0) return "GO_GENTLE";
  return "GO";
}
