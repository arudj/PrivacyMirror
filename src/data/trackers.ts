/* la table de référence des domaines connus. */

import { TrackerCategory } from "../types";

// Table statique de référence : domaine -> catégorie.
// Volontairement limitée à des exemples représentatifs pour la démo,
// pas une liste exhaustive (voir consigne "ne pas tout détecter").
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

// Une simple heuristique de mots-clés pour les domaines pas dans la table,
// utile pour la démo sans avoir à tout lister à la main.
const CATEGORY_HINTS: [RegExp, TrackerCategory][] = [
  [/analytics|stats|metrics/i, "analytics"],
  [/ads|advert|doubleclick|adserver/i, "advertising"],
  [/facebook|twitter|linkedin|tiktok|social/i, "social"],
];

export function categorizeDomain(domain: string): TrackerCategory {
  if (KNOWN_TRACKERS[domain]) {
    return KNOWN_TRACKERS[domain];
  }
  for (const [pattern, category] of CATEGORY_HINTS) {
    if (pattern.test(domain)) return category;
  }
  return "unknown";
}