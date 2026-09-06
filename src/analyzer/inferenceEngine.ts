import { InferenceResult } from "../types";
import { inferenceRules } from "../data/inferenceRules";

/**
 * Cherche les mots-clés d'une règle dans le texte (titre + URL) de la page.
 * On ne stocke ni ne réutilise jamais le texte complet (cf. PDF section 8) :
 * seul le résultat agrégé (label + confidence) sera conservé par l'appelant.
 */
function matchKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Analyse les métadonnées d'UNE page (titre + URL) et retourne les inférences
 * détectées par le moteur de règles local.
 */
export function inferFromPage(pageTitle: string, pageUrl: string): InferenceResult[] {
  const combinedText = `${pageTitle} ${pageUrl}`;
  const results: InferenceResult[] = [];

  for (const rule of inferenceRules) {
    const matched = matchKeywords(combinedText, rule.keywords);
    if (matched.length === 0) continue;

    // Confiance simple : plus de mots-clés matchés = plus de confiance,
    // plafonnée à 0.95 (jamais 100% certain avec une simple heuristique).
    const confidence = Math.min(0.95, 0.5 + matched.length * 0.15);

    results.push({
      label: rule.category,
      confidence: Math.round(confidence * 100) / 100,
      sensitive: rule.sensitive,
      reasons: matched.map((kw) => `Matched keyword "${kw}" in page title/URL`),
    });
  }

  // Les catégories les plus confiantes en premier (utile pour l'UI)
  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Agrège les inférences de plusieurs pages visitées (optionnel, pour un
 * usage multi-pages futur). Combine les confiances par catégorie sans
 * jamais garder trace des pages elles-mêmes.
 */
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