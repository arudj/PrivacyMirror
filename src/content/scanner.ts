import type { FingerprintSignal, PrivacyMirrorMessage } from "../types";
import { SIGNAL_SEVERITY } from "../data/fingerprintSignals";

/**
 * Tourne en ISOLATED world : ne voit pas les appels JS de la page, mais a
 * accès à chrome.runtime. Deux responsabilités :
 * 1) relayer au service worker ce que fingerprinting-inject.ts (MAIN world)
 *    signale via window.postMessage.
 * 2) envoyer le titre + l'URL de la page une fois chargée, pour alimenter
 *    le moteur d'inférence (analyzer/inferenceEngine.ts, côté Personne B).
 */
window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== window) return;

  const data = event.data as { source?: string; type?: string; signalType?: string } | null;
  if (!data || data.source !== "privacy-mirror" || data.type !== "FINGERPRINTING_SIGNAL") return;

  const signalType = data.signalType as FingerprintSignal["type"];
  const signal: FingerprintSignal = {
    type: signalType,
    severity: SIGNAL_SEVERITY[signalType] ?? "low",
  };

  const message: PrivacyMirrorMessage = { type: "SCANNER_FINGERPRINT_DETECTED", payload: { signal } };
  chrome.runtime.sendMessage(message);
});

function sendPageMetadata(): void {
  const message: PrivacyMirrorMessage = {
    type: "PAGE_METADATA",
    payload: { title: document.title, url: location.href },
  };
  chrome.runtime.sendMessage(message);
}

// document.title n'est souvent pas encore final à document_start -> on
// attend le chargement complet de la page avant de l'envoyer.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", sendPageMetadata, { once: true });
} else {
  sendPageMetadata();
}

console.log("[Privacy Mirror] scanner ready");