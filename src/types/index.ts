// src/types/index.ts (version fusionnée)
export type TrackerCategory =
  | "first-party" | "analytics" | "advertising" | "social" | "fingerprinting" | "unknown";

export type RiskLevel = "low" | "medium" | "high";

export interface DetectedRequest {
  domain: string;
  url: string;
  timestamp: number;
}

export interface AnalyzedTracker {
  domain: string;
  category: TrackerCategory;
  risk: RiskLevel;
  explanation: string;
}

export type FingerprintSignalType =
  | "canvas"
  | "webgl"
  | "audio"
  | "screen"
  | "timezone"
  | "fonts"
  | "hardwareConcurrency"
  | "deviceMemory";

export interface FingerprintSignal {
  type: FingerprintSignalType;
  severity: "low" | "medium" | "high";
}

export interface InferenceResult {
  label: string;
  confidence: number;
  sensitive: boolean;
  reasons: string[];
}

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  breakdown: { label: string; points: number }[];
}

export interface PageAnalysis {
  domain: string;
  trackers: AnalyzedTracker[];
  fingerprintSignals: FingerprintSignal[];
  inferences: InferenceResult[];
  riskScore: RiskScoreResult;
  protectionActive: boolean;   // ajouté (nécessaire au service worker)
  updatedAt: number;           // ajouté (nécessaire au service worker)
}

export type PrivacyMirrorMessage =
  | { type: "SCANNER_FINGERPRINT_DETECTED"; payload: { signal: FingerprintSignal } }
  | { type: "PAGE_METADATA"; payload: { title: string; url: string } }
  | { type: "GET_ANALYSIS"; payload: { domain: string } }
  | { type: "ANALYSIS_RESULT"; payload: { analysis: PageAnalysis | null } }
  | { type: "ENABLE_PROTECTION"; payload: { domain: string } }
  | { type: "DISABLE_PROTECTION"; payload: { domain: string } };