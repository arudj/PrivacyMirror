// src/analyzer/trackerAnalyzer.ts
import { AnalyzedTracker, RiskLevel, TrackerCategory } from "../types";
import { categorizeDomain } from "../data/trackers";

const CATEGORY_RISK: Record<TrackerCategory, RiskLevel> = {
  "first-party": "low",
  analytics: "medium",
  advertising: "high",
  social: "high",
  fingerprinting: "high",
  unknown: "low",
};

const CATEGORY_EXPLANATION: Record<TrackerCategory, string> = {
  "first-party": "Belongs to the site you are visiting.",
  analytics: "Can be used to measure your activity on this page.",
  advertising: "Can be used to track you across sites for ad targeting.",
  social: "Can link your browsing to your social media identity.",
  fingerprinting: "Can help identify your device without cookies.",
  unknown: "Third-party domain with unclear purpose.",
};

export function analyzeTracker(domain: string, pageDomain: string): AnalyzedTracker {
  const category: TrackerCategory =
    domain === pageDomain ? "first-party" : categorizeDomain(domain);

  return {
    domain,
    category,
    risk: CATEGORY_RISK[category],
    explanation: CATEGORY_EXPLANATION[category],
  };
}

export function analyzeTrackers(domains: string[], pageDomain: string): AnalyzedTracker[] {
  const uniqueDomains = Array.from(new Set(domains));
  return uniqueDomains.map((domain) => analyzeTracker(domain, pageDomain));
}