/**
 * Types partagés entre Personne A (background/content/blocking) et
 * Personne B (analyzer/popup). Ne pas mettre de logique ici, uniquement
 * des formes de données + le contrat de messages chrome.runtime.
 */

// ---------- Réseau / trackers ----------

export type TrackerCategory =
  | 'first-party'
  | 'analytics'
  | 'advertising'
  | 'social'
  | 'cdn'
  | 'unknown';

export interface ThirdPartyRequest {
  domain: string;
  category: TrackerCategory;
  url: string;
  timestamp: number;
}

// ---------- Fingerprinting ----------

export type FingerprintSignalType =
  | 'canvas'
  | 'webgl'
  | 'audio'
  | 'screen'
  | 'timezone'
  | 'fonts'
  | 'hardwareConcurrency'
  | 'deviceMemory'
  | 'plugins';

export type SignalSeverity = 'red' | 'orange' | 'yellow';

export interface FingerprintSignal {
  type: FingerprintSignalType;
  severity: SignalSeverity;
}

// ---------- Inference ----------

export interface InferenceResult {
  label: string;
  confidence: number; // 0-1
  reasons: string[];
  sensitive: boolean;
}

// ---------- Risk score ----------

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskScoreResult {
  score: number; // 0-100
  level: RiskLevel;
}

// ---------- Analyse complète d'une page ----------
// C'est l'objet central stocké dans chrome.storage.local, clé = domaine.

export interface PageAnalysis {
  domain: string;
  requests: ThirdPartyRequest[];
  fingerprintSignals: FingerprintSignal[];
  inferences: InferenceResult[];
  risk: RiskScoreResult;
  protectionActive: boolean;
  updatedAt: number;
}

// ---------- Messages chrome.runtime.sendMessage ----------
// scanner.ts -> service-worker.ts -> popup

export type PrivacyMirrorMessage =
  | { type: 'SCANNER_REQUEST_DETECTED'; payload: { request: ThirdPartyRequest } }
  | { type: 'SCANNER_FINGERPRINT_DETECTED'; payload: { signal: FingerprintSignal } }
  | { type: 'GET_ANALYSIS'; payload: { domain: string } }
  | { type: 'ANALYSIS_RESULT'; payload: { analysis: PageAnalysis | null } }
  | { type: 'ENABLE_PROTECTION'; payload: { domain: string } }
  | { type: 'DISABLE_PROTECTION'; payload: { domain: string } };
