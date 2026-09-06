import { inferFromPage } from "./analyzer/inferenceEngine";

const cases = [
  { title: "Best Gaming GPUs 2026", url: "example.com/gaming-gpu" },
  { title: "Local mosque prayer times", url: "example.com/prayer-times" },
  { title: "Weather forecast for tomorrow", url: "example.com/weather" },
];

for (const c of cases) {
  console.log(`\nPage: "${c.title}" (${c.url})`);
  const results = inferFromPage(c.title, c.url);
  if (results.length === 0) {
    console.log("  -> no inference");
  }
  for (const r of results) {
    console.log(`  -> ${r.label} confidence=${r.confidence} sensitive=${r.sensitive}`);
    r.reasons.forEach((reason) => console.log(`     - ${reason}`));
  }
}