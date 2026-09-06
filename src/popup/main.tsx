import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PageAnalysis } from "../types";

// Déclaration minimale pour éviter de dépendre de @types/chrome ici.
declare const chrome: any;

async function loadAnalysis(): Promise<PageAnalysis | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;

  const domain = new URL(tab.url).hostname;
  const stored = await chrome.storage.local.get(domain);
  return stored[domain] ?? null;
}

function sendProtectMessage(domain: string) {
  chrome.runtime.sendMessage({ type: "PROTECT_ME", domain });
}

async function bootstrap() {
  const rootEl = document.getElementById("root");
  if (!rootEl) return;
  const root = createRoot(rootEl);

  const analysis = await loadAnalysis();

  if (!analysis) {
    root.render(<p style={{ padding: 12, fontFamily: "system-ui" }}>No data for this page yet.</p>);
    return;
  }

  root.render(<App analysis={analysis} onProtect={() => sendProtectMessage(analysis.domain)} />);
}

bootstrap();