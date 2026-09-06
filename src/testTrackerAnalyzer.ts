import { analyzeTrackers } from "./analyzer/trackerAnalyzer";

// Simule les domaines détectés par le scanner sur une page nike.com
const pageDomain = "nike.com";
const detectedDomains = [
  "nike.com",
  "google-analytics.com",
  "facebook.net",
  "doubleclick.net",
  "some-random-cdn.io",
];

const results = analyzeTrackers(detectedDomains, pageDomain);

console.log(`Page: ${pageDomain}\n`);
for (const r of results) {
  console.log(`${r.domain.padEnd(24)} ${r.category.padEnd(12)} risk=${r.risk.padEnd(6)} "${r.explanation}"`);
}