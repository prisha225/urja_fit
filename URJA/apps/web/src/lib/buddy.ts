import { DayPlan, MealPlan, BuddyActionResponse, BuddyToolCall } from "@packages/contracts/types";

const SAFETY_TRIGGERS = [
  /pain|dard|dukh|chot|injury/i,
  /bleed|khoon/i,
  /dizz|chakkar|faint|behosh/i,
  /chest|seena.*dard|breath|saans.*phool/i,
  /pregnant|garbhavati|baccha/i,
  /eating disorder|vomit|starv|bhookh.*mar/i,
  /self harm|suicide|marna/i,
  /supplement|medicine|dawa|tablet|steroid/i,
  /lose \d+\s?kg|wajan.*kam.*din/i,
];

export function checkBuddySafety(message: string): { triggered: boolean; response?: string } {
  const lower = message.toLowerCase();

  // Supplements or medications
  if (/supplement|medicine|dawa|tablet|steroid|pcos supplement/i.test(lower)) {
    return {
      triggered: true,
      response: "Main koi dawai ya supplements prescribe nahi kar sakti. Please apne doctor ya qualified clinical dietitian se baat karein.",
    };
  }

  // Rapid weight loss or crash diet
  if (/lose \d+\s?kg|wajan.*kam.*(hafta|din)|crash diet/i.test(lower)) {
    return {
      triggered: true,
      response: "Hum kisi bhi jaldbazi ya crash dieting me vishwas nahi rakhte. Healthy aur safe pace par regular habit banana sabse zaroori hai.",
    };
  }

  // Chest / Heart / Breathing
  if (/chest|seena.*dard|tightness|breathless|saans/i.test(lower)) {
    return {
      triggered: true,
      response: "Seene me dard ya saans lene me takleef ko bilkul ignore na karein. Kripya turant nazdeeki doctor se checkup karwayein.",
    };
  }

  // Dizziness / Fainting
  if (/dizz|chakkar|faint|behosh/i.test(lower)) {
    return {
      triggered: true,
      response: "Chakkar aana ya behosh hona serious ho sakta hai. Exercise abhi pause karein, aaram se paani piyein aur pehle doctor ko dikhayein.",
    };
  }

  // Pain / Discomfort
  if (/pain|dard|dukh|chot/i.test(lower)) {
    return {
      triggered: true,
      response: "Agar kahin dard ya chot mehsus ho rahi hai, toh turant workout rok dijiye. Apne shareer ki sunein aur doctor se consult karein.",
    };
  }

  // General trigger scan
  for (const trigger of SAFETY_TRIGGERS) {
    if (trigger.test(lower)) {
      return {
        triggered: true,
        response: "Aapki safety sabse pehle hai. Please exercise abhi rokein aur kisi healthcare professional ya doctor se consult karein.",
      };
    }
  }

  return { triggered: false };
}

export function handleBuddyMessage(
  message: string,
  currentPlan: DayPlan,
  currentMealPlan?: MealPlan
): BuddyActionResponse {
  // 1. Safety Check
  const safety = checkBuddySafety(message);
  if (safety.triggered && safety.response) {
    return {
      reply: safety.response,
      safetyTriggered: true,
    };
  }

  const lower = message.toLowerCase();

  // 2. Shorten session intent ("aaj 10 minute hi hain", "shorten to 10 min", "kam time hai")
  if (/10\s?min|kam time|thoda kam|sirf 10|shorten/i.test(lower)) {
    const originalMinutes = currentPlan.sessions[0]?.minutes || 18;
    return {
      reply: "Koi baat nahi! Plan ko 10 minute ka kar diya hai. Aasan aur focused movements rakhe hain.",
      action: {
        id: "shorten_10",
        description: "Shortened to 10 min",
        undoData: { minutes: originalMinutes },
        toolCall: {
          tool: "shorten_session",
          args: { minutes: 10 },
        },
      },
    };
  }

  // 3. Make quieter intent ("make it quiet", "shor na ho", "bachhe so rahe hain")
  if (/quiet|shor|awaaz|sound|bachhe so/i.test(lower)) {
    return {
      reply: "Zaroor! Saare jumps aur loud moves hata diye hain. Bilkul silent, mat and chair moves set hain.",
      action: {
        id: "make_quiet",
        description: "Swapped to silent moves",
        toolCall: {
          tool: "make_quieter",
          args: { quiet: true },
        },
      },
    };
  }

  // 4. Swap meal / dinner intent ("swap dinner", "dinner badal do", "khana change")
  if (/swap dinner|dinner badal|dinner change|khana badal/i.test(lower)) {
    return {
      reply: "Dinner me light khichdi aur dahi add kar diya hai, jo pachan me aasan hai.",
      action: {
        id: "swap_dinner",
        description: "Dinner swapped to Oats Khichdi",
        toolCall: {
          tool: "swap_meal",
          args: { slot: "dinner", newMealId: "dinner_light_khichdi" },
        },
      },
    };
  }

  // 5. Default encouraging response
  return {
    reply: "Main yahan aapke saath hoon. Aap session chhota kar sakti hain, silent moves chun sakti hain, ya thali me food swap kar sakti hain.",
  };
}
