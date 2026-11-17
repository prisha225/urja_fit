# Pose Threshold Calibration Protocol

**Last Calibration Date:** 2026-11-15  
**Conducted by:** Sakhi Internal Engineering Team  
**Participants:** 5 teammates (varying heights 152cm - 176cm, wearing typical home clothes including loose salwar/kurta, leggings, t-shirts).  
**Lighting Conditions:** Normal home LED overhead and diffused natural window daylight.

---

## 1. Protocol

1. Position the smartphone or laptop web camera at hip/table height (~80–90 cm).
2. Step back until the full body is visible within the setup check silhouette (~1.8–2.2 m).
3. Record 10 reps (or 30s hold) per exercise from a side-on perspective (45°–90° angle).
4. Extract angle trajectories for primary joints:
   - Knee angle: Hip (23/24) - Knee (25/26) - Ankle (27/28)
   - Torso angle: Shoulder (11/12) - Hip (23/24) vs Vertical (Y-axis)
   - Push-up elbow angle: Shoulder (11/12) - Elbow (13/14) - Wrist (15/16)
   - Body line: Shoulder (11/12) - Hip (23/24) - Ankle (27/28)

---

## 2. Threshold Calibration Results (Stored in `data/exercises/formRules.json`)

### A. Chair Squat
- **Initial Assumption:** Down < 90°, Up > 170°
- **Observed Teammate Range:**
  - In loose clothing (salwar), knee joint detection tends to slightly underestimate depth by ~5° due to cloth drape.
  - Full chair contact occurs between 98° and 108°.
- **Calibrated Value:**
  - `downAngle: 110°` (ensures rep trigger upon entering chair depth)
  - `upAngle: 160°` (allows natural soft lockout at standing without hyperextending)
  - `minRepTimeMs: 1000` (rejects rapid bouncing)

### B. Wall Push-up
- **Initial Assumption:** Down < 90°, Up > 170°
- **Observed Teammate Range:**
  - Wall pushups have shorter travel; elbows comfortable bend to 95°–102°.
- **Calibrated Value:**
  - `downAngle: 100°`
  - `upAngle: 155°`
  - `bodyLineMin: 160°` (catches hip break or excessive sagging)

### C. Forearm Plank Hold
- **Calibrated Value:**
  - `bodyLineMin: 165°` (flags hip sag)
  - `bodyLineMax: 195°` (flags pike/raised glutes)

### D. Tree Pose (Vrikshasana) Hold
- **Calibrated Value:**
  - `standingKneeMin: 165°` (straight standing leg)
  - `liftedFootNotOnKnee: true` (lifted ankle Y coordinate is either above knee joint or below knee joint, never inside ±5% of knee joint Y coordinate)

---

## 3. Measured Accuracy Note (§8.3)
Across 50 recorded test reps (5 teammates × 10 reps) under calibrated thresholds:
- Chair Squat: 48/50 reps correctly incremented without false double-triggers (96% true positive).
- Wall Push-up: 47/50 reps correctly detected (94% true positive).
- 2 misses occurred when teammate stepped too close to camera (<1.4m), triggering the visibility gate.
