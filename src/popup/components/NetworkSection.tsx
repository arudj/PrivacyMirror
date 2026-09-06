import { AnalyzedTracker } from "../../types";

const RISK_COLOR: Record<string, string> = {
  low: "#2e7d32",
  medium: "#ed6c02",
  high: "#c62828",
};

export function NetworkSection({ trackers }: { trackers: AnalyzedTracker[] }) {
  const thirdParties = trackers.filter((t) => t.category !== "first-party");

  return (
    <section style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
      <h3 style={{ margin: "0 0 8px" }}>Network</h3>
      <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#555" }}>
        {trackers.length} request(s) · {thirdParties.length} third part{thirdParties.length === 1 ? "y" : "ies"}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {thirdParties.map((t) => (
          <li
            key={t.domain}
            title={t.explanation}
            style={{ fontSize: "13px", padding: "2px 0", display: "flex", justifyContent: "space-between" }}
          >
            <span>{t.domain}</span>
            <span style={{ color: RISK_COLOR[t.risk], textTransform: "capitalize" }}>{t.category}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}