import { useState } from "react";
import { PageAnalysis } from "../types";
import { NetworkSection } from "./components/NetworkSection";
import { FingerprintSection } from "./components/FingerprintSection";
import { InferenceSection } from "./components/InferenceSection";
import { ProtectButton } from "./components/ProtectButton";
import { RiskBadge } from "./components/RiskBadge";

interface AppProps {
  analysis: PageAnalysis;
  onProtect: () => void;
}

export function App({ analysis, onProtect }: AppProps) {
  const [protectedState, setProtectedState] = useState(false);

  const handleProtect = () => {
    onProtect();
    setProtectedState(true);
  };

  return (
    <div style={{ width: 320, fontFamily: "system-ui, sans-serif", padding: "12px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>Privacy Mirror</div>
          <div style={{ fontSize: "12px", color: "#555" }}>{analysis.domain}</div>
        </div>
        <RiskBadge level={analysis.riskScore.level} />
      </header>

      <NetworkSection trackers={analysis.trackers} />
      <FingerprintSection signals={analysis.fingerprintSignals} />
      <InferenceSection inferences={analysis.inferences} />

      <ProtectButton onProtect={handleProtect} disabled={protectedState} />
    </div>
  );
}