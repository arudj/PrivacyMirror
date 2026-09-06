// src/data/fingerprintSignals.ts
import type { FingerprintSignal } from "../types";

export const SIGNAL_SEVERITY: Record<FingerprintSignal["type"], FingerprintSignal["severity"]> = {
  canvas: "high",
  webgl: "high",
  audio: "high",
  screen: "medium",
  timezone: "medium",
  fonts: "low",
  hardwareConcurrency: "low",
  deviceMemory: "low",
};