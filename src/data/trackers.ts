// src/data/trackers.ts
import { TrackerCategory } from "../types";

export const KNOWN_TRACKERS: Record<string, TrackerCategory> = {
  "google-analytics.com": "analytics",
  "googletagmanager.com": "analytics",
  "analytics.google.com": "analytics",
  "hotjar.com": "analytics",
  "mixpanel.com": "analytics",

  "doubleclick.net": "advertising",
  "googlesyndication.com": "advertising",
  "adservice.google.com": "advertising",
  "criteo.com": "advertising",
  "taboola.com": "advertising",
  "outbrain.com": "advertising",

  "facebook.net": "social",
  "facebook.com": "social",
  "connect.facebook.net": "social",
  "twitter.com": "social",
  "linkedin.com": "social",
  "tiktok.com": "social",
};

const CATEGORY_HINTS: [RegExp, TrackerCategory][] = [
  [/analytics|stats|metrics/i, "analytics"],
  [/ads|advert|doubleclick|adserver/i, "advertising"],
  [/facebook|twitter|linkedin|tiktok|social/i, "social"],
];

export function categorizeDomain(domain: string): TrackerCategory {
  for (const [knownDomain, category] of Object.entries(KNOWN_TRACKERS)) {
    if (domain === knownDomain || domain.endsWith(`.${knownDomain}`)) {
      return category;
    }
  }
  for (const [pattern, category] of CATEGORY_HINTS) {
    if (pattern.test(domain)) return category;
  }
  return "unknown";
}

export function isKnownTrackerDomain(domain: string): boolean {
  return Object.keys(KNOWN_TRACKERS).some(
    (known) => domain === known || domain.endsWith(`.${known}`),
  );
}