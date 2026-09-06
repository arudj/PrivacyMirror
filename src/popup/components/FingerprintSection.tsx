import { FingerprintSignal } from "../../types";

const SEVERITY_COLOR: Record<string, string> = {
  low: "#fbc02d",
  medium: "#ed6c02",
  high: "#c62828",
};

const LABELS: Record<string, string> = {
  canvas: "Canvas",
  webgl: "WebGL",
  audio: "AudioContext",
  screen: "Screen dimensions",
  timezone: "Timezone",
  fonts: "Fonts",
  hardwareConcurrency: "Hardware concurrency",
  deviceMemory: "Device memory",
};

export function FingerprintSection({ signals }: { signals: FingerprintSignal[] }) {
  return (
    <section style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
      <h3 style={{ margin: "0 0 8px" }}>Fingerprinting</h3>
      {signals.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>No fingerprinting signal detected.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {signals.map((s) => (
            <li key={s.type} style={{ fontSize: "13px", padding: "2px 0", display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: SEVERITY_COLOR[s.severity],
                  display: "inline-block",
                }}
              />
              {LABELS[s.type] ?? s.type}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}