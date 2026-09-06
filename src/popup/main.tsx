import { createRoot } from "react-dom/client";
import { App } from "./App";
import type { PageAnalysis, PrivacyMirrorMessage } from "../types";

async function getCurrentTab(): Promise<{ id: number; domain: string } | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) return null;
  try {
    return { id: tab.id, domain: new URL(tab.url).hostname };
  } catch {
    return null;
  }
}

async function fetchAnalysis(domain: string): Promise<PageAnalysis | null> {
  const message: PrivacyMirrorMessage = { type: "GET_ANALYSIS", payload: { domain } };
  const response = (await chrome.runtime.sendMessage(message)) as PrivacyMirrorMessage;
  if (response.type !== "ANALYSIS_RESULT") return null;
  return response.payload.analysis;
}

function sendProtectMessage(domain: string): void {
  const message: PrivacyMirrorMessage = { type: "ENABLE_PROTECTION", payload: { domain } };
  chrome.runtime.sendMessage(message);
}

function sendResetMessage(domain: string, tabId: number): void {
  const message: PrivacyMirrorMessage = { type: "DISABLE_PROTECTION", payload: { domain } };
  chrome.runtime.sendMessage(message);
  chrome.tabs.reload(tabId, { bypassCache: true });
}

async function bootstrap(): Promise<void> {
  const rootEl = document.getElementById("root");
  if (!rootEl) return;
  const root = createRoot(rootEl);

  const current = await getCurrentTab();
  if (!current) {
    root.render(<p style={{ padding: 12, fontFamily: "system-ui" }}>Can't read this tab's URL.</p>);
    return;
  }

  const renderFor = async (): Promise<void> => {
    const analysis = await fetchAnalysis(current.domain);
    if (!analysis) {
      root.render(
        <p style={{ padding: 12, fontFamily: "system-ui" }}>
          No data for this page yet — try reloading the tab.
        </p>,
      );
      return;
    }

    root.render(
      <App
        analysis={analysis}
        onProtect={() => sendProtectMessage(analysis.domain)}
        onReset={() => sendResetMessage(analysis.domain, current.id)}
      />,
    );
  };

  await renderFor();

  setTimeout(renderFor, 1500);
}

bootstrap();