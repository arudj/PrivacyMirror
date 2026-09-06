import { InferenceResult } from "../../types";

export function InferenceSection({ inferences }: { inferences: InferenceResult[] }) {
  return (
    <section style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
      <h3 style={{ margin: "0 0 8px" }}>What they may infer</h3>
      {inferences.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>No inference detected.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {inferences.map((i) => (
            <li key={i.label} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span>
                  {i.label}
                  {i.sensitive && (
                    <span style={{ color: "#c62828", fontWeight: 700, marginLeft: 6 }} title="Sensitive category">
                      ⚠ sensitive
                    </span>
                  )}
                </span>
                <span>{Math.round(i.confidence * 100)}%</span>
              </div>
              <div style={{ background: "#eee", borderRadius: 4, height: 6, marginTop: 3 }}>
                <div
                  style={{
                    width: `${i.confidence * 100}%`,
                    background: i.sensitive ? "#c62828" : "#1565c0",
                    height: "100%",
                    borderRadius: 4,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}