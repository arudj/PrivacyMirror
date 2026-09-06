import { InferenceResult } from "../types";
import { inferenceRules } from "../data/inferenceRules";

function matchKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase()));
}

export function inferFromPage(pageTitle: string, pageUrl: string): InferenceResult[] {
  const combinedText = `${pageTitle} ${pageUrl}`;
  const results: InferenceResult[] = [];

  for (const rule of inferenceRules) {
    const matched = matchKeywords(combinedText, rule.keywords);
    if (matched.length === 0) continue;

    const confidence = Math.min(0.95, 0.5 + matched.length * 0.15);

    results.push({
      label: rule.category,
      confidence: Math.round(confidence * 100) / 100,
      sensitive: rule.sensitive,
      reasons: matched.map((kw) => `Matched keyword "${kw}" in page title/URL`),
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

export function aggregateInferences(allResults: InferenceResult[][]): InferenceResult[] {
  const byCategory = new Map<string, InferenceResult>();

  for (const pageResults of allResults) {
    for (const r of pageResults) {
      const existing = byCategory.get(r.label);
      if (!existing) {
        byCategory.set(r.label, { ...r });
      } else {
        existing.confidence = Math.min(0.95, existing.confidence + 0.1);
        existing.reasons.push(...r.reasons);
      }
    }
  }

  return Array.from(byCategory.values()).sort((a, b) => b.confidence - a.confidence);
}