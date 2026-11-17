# Demo Script: 90-Second & 3-Minute Golden Path

## 90-Second Demo Video Script (§14)

1. **0:00–0:05 | Problem Statement**
   - *Visual:* Close-up of ordinary busy Indian home life.
   - *Voiceover:* "Most fitness apps ask an Indian woman to reshape her life around their goals. Sakhi reshapes fitness around her day."

2. **0:05–0:20 | The Day Dial (Beat 1)**
   - *Visual:* Onboarding screen. Dragging around the 24-hour circular dial to highlight 2 free pockets: 15 min at 06:15 and 20 min at 17:30.
   - *Voiceover:* "She paints when she's free. Pockets of time, space she has—even a tiny balcony—and whether she needs quiet moves."

3. **0:20–0:30 | Care Check & Safety Routing (Beat 2 & Beat 7)**
   - *Visual:* 7 calm Yes/No questions. First show a red-flag answer (e.g. chest pain) immediately routing to the calm Referral screen with the "Note for your doctor" button. Then show standard clearance.
   - *Voiceover:* "Safety is a hard gate. If anything flags, Sakhi stops, explains calmly, and prepares a summary note for her doctor."

4. **0:30–0:40 | The Signature Dial Fill & Today (Beat 3)**
   - *Visual:* The signature dial fill animation: marigold session segment slides into her pocket. Hero card: *18 min · quiet · no equipment*.
   - *Voiceover:* "Her day fills. Exactly inside her pocket. Legs today, quiet moves so the kids don't wake up."

5. **0:40–1:00 | Studio Live with On-Device Pose (Beat 4)**
   - *Visual:* Camera setup outline turns green. Chair squat reps counted live with hysteresis. Joint angle turns hibiscus with cue "sit back a little lower". Notice: "Video stays on this device."
   - *Voiceover:* "The studio runs entirely in her browser. No video is ever uploaded. Clear cues, rep counts, and steady form checks."

6. **1:00–1:10 | The Thali (Beat 5)**
   - *Visual:* Circular thali plate divided into dal, sabzi, roti, curd. Tap roti → swap to brown rice; segments smoothly rebalance; rim macro ring updates.
   - *Voiceover:* "Food is visualized on her thali plate. Swapping dal or grains rebalances portion sizes instantly based on ICMR-NIN Indian food data."

7. **1:10–1:25 | Sakhi Buddy Reshapes the Plan (Beat 6)**
   - *Visual:* Bottom sheet opens. She types or speaks in Hinglish: *"aaj 10 minute hi hain"*. Buddy replies in warm Hinglish, triggers `shorten_session(10)`, and the Day Dial animates to a 10-minute segment with an "Undo" chip.
   - *Voiceover:* "Life happens. In natural Hinglish, she tells Sakhi she only has 10 minutes. Her plan reshapes in real time."

8. **1:25–1:30 | Closing & Roadmap**
   - *Visual:* Summary screen with "Built with on-device AI for Indian women."
   - *Voiceover:* "Sakhi: fitness that fits her day, honors her safety, and speaks her language."

---

## Stage Reliability Protocol
- **Primary device:** Run on `?demo=1` with full offline fallback capability.
- **Kill-switch ready:** `NEXT_PUBLIC_FORCE_FALLBACK=1` guarantees deterministic operation if network or LLM fails.
- **Camera Fallback:** If camera is not permitted or fails to initialize, Studio switches seamlessly to guided animator mode.
