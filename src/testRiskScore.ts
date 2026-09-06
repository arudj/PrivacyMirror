import { analyzeTrackers } from "./analyzer/trackerAnalyzer";
import { inferFromPage } from "./analyzer/inferenceEngine";
import { computeRiskScore } from "./analyzer/riskScore";
import { FingerprintSignal } from "./types";

// Scénario proche de la démo (section 9 du PDF)
const pageDomain = "example.com";
const detectedDomains = [
  "example.com",
  "google-analytics.com",
  "facebook.net",
  "doubleclick.net",
];

const fingerprintSignals: FingerprintSignal[] = [
  { type: "canvas", severity: "high" },
  { type: "webgl", severity: "high" },
  { type: "timezone", severity: "medium" },
];

const trackers = analyzeTrackers(detectedDomains, pageDomain);
const inferences = inferFromPage("Best Gaming GPUs 2026", "example.com/gaming-gpu");
const risk = computeRiskScore(trackers, fingerprintSignals, inferences);

console.log("Trackers:", trackers.map((t) => `${t.domain}(${t.category})`).join(", "));
console.log("Inferences:", inferences.map((i) => `${i.label}=${i.confidence}`).join(", "));
console.log("\nRisk score:", risk.score, "->", risk.level.toUpperCase());
risk.breakdown.forEach((b) => console.log(`  +${b.points}  ${b.label}`));