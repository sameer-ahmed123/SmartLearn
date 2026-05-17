/**
 * PROCTOR JUDGE - System Logic
 * * This file acts as the 'Security Officer' for the quiz.
 * Its job is to evaluate AI detection events and decide if the quiz should continue.
 * * HOW IT WORKS:
 * 1. COOLDOWN: To prevent "spamming" errors, it only counts one violation
 * per type every 4 seconds.
 * * 2. THRESHOLDS: Each violation type has a specific limit (e.g., 2 tab switches).
 * Once a student hits a limit, the Judge returns a 'terminate' verdict.
 * * 3. GAZE AGGREGATION: Looking left, right, or down are all summed together
 * into a single 'GAZE_TOTAL' limit to catch persistent suspicious eye movement.
 */

export const VIOLATION_LIMITS = {
  TAB_SWITCH: 2, // Instant high-risk
  MULTI_FACE: 3, // Highly suspicious
  GAZE_TOTAL: 8, // Combined total for looking away
  NO_FACE: 8, // Room for technical glitches/sneeze
};

export interface ViolationStats {
  TAB_SWITCH: number;
  MULTI_FACE: number;
  LOOK_LEFT: number;
  LOOK_RIGHT: number;
  LOOK_DOWN: number;
  NO_FACE: number;
}

const COOLDOWN_PERIOD = 4000;
const lastTriggered: Record<string, number> = {};

export const getVerdict = (stats: ViolationStats, type: string) => {
  const now = Date.now();
  const isTimeRestricted =
    lastTriggered[type] && now - lastTriggered[type] < COOLDOWN_PERIOD;

  // 1. SPAM CHECK FIRST
  // If we just reported this type 4 seconds ago, ignore it completely
  if (type !== "TAB_SWITCH" && isTimeRestricted) {
    return {
      terminate: false,
      reason: "",
      isSpam: true,
    };
  }

  // 2. MARK AS VALID STRIKE
  // Update the timestamp ONLY for valid, non-spam strikes
  lastTriggered[type] = now;

  // 3. LIMIT CHECK
  // Note: We check if the NEXT count (stats[type]) hits the limit
  if (stats.TAB_SWITCH >= VIOLATION_LIMITS.TAB_SWITCH) {
    return {
      terminate: true,
      reason: "Security Breach: Unauthorized tab switching detected.",
      isSpam: false,
    };
  }

  if (stats.MULTI_FACE >= VIOLATION_LIMITS.MULTI_FACE) {
    return {
      terminate: true,
      reason: "Integrity Error: Multiple individuals detected.",
      isSpam: false,
    };
  }

  const totalGazeAway = stats.LOOK_LEFT + stats.LOOK_DOWN + stats.LOOK_RIGHT;
  if (totalGazeAway >= VIOLATION_LIMITS.GAZE_TOTAL) {
    return {
      terminate: true,
      reason: "Suspicious Behavior: Repeatedly looking away.",
      isSpam: false,
    };
  }

  if (stats.NO_FACE >= VIOLATION_LIMITS.NO_FACE) {
    return {
      terminate: true,
      reason: "Identification Error: Face not detected for too long.",
      isSpam: false,
    };
  }

  return {
    terminate: false,
    reason: "",
    isSpam: false,
  };
};
