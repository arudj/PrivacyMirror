// Types partagés entre le scanner (Personne A), l'analyzer (Personne B) et l'UI.

export type TrackerCategory =
  | "first-party"
  | "analytics"
  | "advertising"
  | "social"
  | "fingerprinting"
  | "unknown";

export type RiskLevel = "low" | "medium" | "high";

// Une requête détectée brute par le content script / service worker
export interface DetectedRequest {
  domain: string;
  url: string;
  timestamp: number;
}

// Résultat de l'analyse d'un tracker par trackerAnalyzer.ts
export interface AnalyzedTracker {
  domain: string;
  category: TrackerCategory;
  risk: RiskLevel;
  explanation: string;
}

// Signal de fingerprinting détecté par Personne A
export interface FingerprintSignal {
  type:
    | "canvas"
    | "webgl"
    | "audio"
    | "screen"
    | "timezone"
    | "fonts"
    | "hardwareConcurrency"
    | "deviceMemory";
  severity: "low" | "medium" | "high";
}

// Résultat du moteur d'inférence
export interface InferenceResult {
  label: string;
  confidence: number; // 0 à 1
  sensitive: boolean;
  reasons: string[];
}

// Score de risque global de la page
export interface RiskScoreResult {
  score: number; // 0 à 100
  level: RiskLevel;
  breakdown: {
    label: string;
    points: number;
  }[];
}

// Objet final agrégé, stocké dans chrome.storage.local et consommé par l'UI React
export interface PageAnalysis {
  domain: string;
  trackers: AnalyzedTracker[];
  fingerprintSignals: FingerprintSignal[];
  inferences: InferenceResult[];
  riskScore: RiskScoreResult;
}