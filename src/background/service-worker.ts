// src/background/service-worker.ts
import type { FingerprintSignal, PageAnalysis, PrivacyMirrorMessage } from "@/types";
import { extractDomain } from "@/utils/domain";
import { enableProtection, disableProtection } from "@/blocking/rules";
import { analyzeTrackers } from "@/analyzer/trackerAnalyzer";
import { inferFromPage } from "@/analyzer/inferenceEngine";
import { computeRiskScore } from "@/analyzer/riskScore";
import { isKnownTrackerDomain } from "@/data/trackers";

interface RawPageState {
  domain: string;
  pageTitle: string;
  pageUrl: string;
  requestDomains: string[];
  fingerprintSignals: FingerprintSignal[];
  protectionActive: boolean;
  resetAt: number;
}

const rawStateByDomain = new Map<string, RawPageState>();

function createEmptyState(domain: string, keepProtection = false): RawPageState {
  return {
    domain,
    pageTitle: "",
    pageUrl: "",
    requestDomains: [],
    fingerprintSignals: [],
    protectionActive: keepProtection
      ? (rawStateByDomain.get(domain)?.protectionActive ?? false)
      : false,
    resetAt: Date.now(),
  };
}

function getOrCreateState(domain: string): RawPageState {
  let state = rawStateByDomain.get(domain);
  if (!state) {
    state = createEmptyState(domain);
    rawStateByDomain.set(domain, state);
  }
  return state;
}

function buildPageAnalysis(state: RawPageState): PageAnalysis {
  const effectiveDomains = state.protectionActive
    ? state.requestDomains.filter((domain) => !isKnownTrackerDomain(domain))
    : state.requestDomains;

  const trackers = analyzeTrackers(effectiveDomains, state.domain);
  const inferences = inferFromPage(state.pageTitle, state.pageUrl);
  const riskScore = computeRiskScore(trackers, state.fingerprintSignals, inferences);

  return {
    domain: state.domain,
    trackers,
    fingerprintSignals: state.fingerprintSignals,
    inferences,
    riskScore,
    protectionActive: state.protectionActive,
    updatedAt: Date.now(),
  };
}

async function persist(domain: string): Promise<void> {
  const state = rawStateByDomain.get(domain);
  if (!state) return;
  const analysis = buildPageAnalysis(state);
  await chrome.storage.local.set({ [`analysis:${domain}`]: analysis });
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  const domain = extractDomain(details.url);
  if (!domain) return;
  rawStateByDomain.set(domain, createEmptyState(domain, /* keepProtection */ true));
  void persist(domain);
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.tabId < 0) return;

    const requestDomain = extractDomain(details.url);
    if (!requestDomain) return;

    const pageDomain =
      details.type === "main_frame" ? requestDomain : extractDomain(details.initiator);
    if (!pageDomain) return;

    const state = getOrCreateState(pageDomain);

    if (details.timeStamp < state.resetAt) return;

    state.requestDomains.push(requestDomain);
    void persist(pageDomain);
  },
  { urls: ["<all_urls>"] },
);

chrome.runtime.onMessage.addListener(
  (message: PrivacyMirrorMessage, sender, sendResponse) => {
    switch (message.type) {
      case "SCANNER_FINGERPRINT_DETECTED": {
        const domain = extractDomain(sender.tab?.url);
        if (!domain) break;
        const state = getOrCreateState(domain);
        const alreadySeen = state.fingerprintSignals.some(
          (s) => s.type === message.payload.signal.type,
        );
        if (!alreadySeen) state.fingerprintSignals.push(message.payload.signal);
        void persist(domain);
        break;
      }

      case "PAGE_METADATA": {
        const domain = extractDomain(sender.tab?.url);
        if (!domain) break;
        const state = getOrCreateState(domain);
        state.pageTitle = message.payload.title;
        state.pageUrl = message.payload.url;
        void persist(domain);
        break;
      }

      case "GET_ANALYSIS": {
        const state = rawStateByDomain.get(message.payload.domain);
        const analysis = state ? buildPageAnalysis(state) : null;
        const response: PrivacyMirrorMessage = { type: "ANALYSIS_RESULT", payload: { analysis } };
        sendResponse(response);
        break;
      }

      case "ENABLE_PROTECTION": {
        const { domain } = message.payload;
        void enableProtection(domain).then(() => {
          const state = getOrCreateState(domain);
          state.protectionActive = true;
          void persist(domain);
        });
        break;
      }

      case "DISABLE_PROTECTION": {
        const { domain } = message.payload;
        void disableProtection().then(() => {
          const state = getOrCreateState(domain);
          state.protectionActive = false;
          void persist(domain);
        });
        break;
      }

      default:
        break;
    }
    return false;
  },
);

console.log("[Privacy Mirror] service worker ready");