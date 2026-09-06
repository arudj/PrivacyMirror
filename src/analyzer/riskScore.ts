import {
  AnalyzedTracker,
  FingerprintSignal,
  InferenceResult,
  RiskLevel,
  RiskScoreResult,
} from "../types";

// Pondération telle que définie dans le PDF (section 4.2.3).
// Ce n'est pas une mesure scientifique : un indicateur pédagogique.
const WEIGHTS = {
  THIRD_PARTY_TRACKERS: 20,
  FINGERPRINTING: 25,
  SENSITIVE_INFERENCE: 30,
  MANY_THIRD_PARTIES: 15,
  CROSS_SITE_IDENTIFIERS: 10,
};

// Seuil au-delà duquel on considère qu'il y a "beaucoup" de tiers
const MANY_THIRD_PARTIES_THRESHOLD = 5;

function levelFromScore(score: number): RiskLevel {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  return "high";
}

export function computeRiskScore(
  trackers: AnalyzedTracker[],
  fingerprintSignals: FingerprintSignal[],
  inferences: InferenceResult[]
): RiskScoreResult {
  const breakdown: { label: string; points: number }[] = [];

  const thirdPartyTrackers = trackers.filter((t) => t.category !== "first-party");
  const crossSiteTrackers = trackers.filter(
    (t) => t.category === "advertising" || t.category === "social"
  );
  const hasSensitiveInference = inferences.some((i) => i.sensitive);

  if (thirdPartyTrackers.length > 0) {
    breakdown.push({
      label: `${thirdPartyTrackers.length} third-party tracker(s) detected`,
      points: WEIGHTS.THIRD_PARTY_TRACKERS,
    });
  }

  if (fingerprintSignals.length > 0) {
    breakdown.push({
      label: `${fingerprintSignals.length} fingerprinting signal(s) detected`,
      points: WEIGHTS.FINGERPRINTING,
    });
  }

  if (hasSensitiveInference) {
    breakdown.push({
      label: "Sensitive category inferred from page content",
      points: WEIGHTS.SENSITIVE_INFERENCE,
    });
  }

  if (thirdPartyTrackers.length > MANY_THIRD_PARTIES_THRESHOLD) {
    breakdown.push({
      label: `More than ${MANY_THIRD_PARTIES_THRESHOLD} third parties on this page`,
      points: WEIGHTS.MANY_THIRD_PARTIES,
    });
  }

  if (crossSiteTrackers.length > 0) {
    breakdown.push({
      label: "Cross-site identifiers likely used (ad/social trackers)",
      points: WEIGHTS.CROSS_SITE_IDENTIFIERS,
    });
  }

  const rawScore = breakdown.reduce((sum, item) => sum + item.points, 0);
  const score = Math.min(100, rawScore);

  return {
    score,
    level: levelFromScore(score),
    breakdown,
  };
}