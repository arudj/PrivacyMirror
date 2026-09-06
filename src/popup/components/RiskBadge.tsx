import { RiskLevel } from "../../types";

const COLORS: Record<RiskLevel, string> = {
  low: "#2e7d32",
  medium: "#ed6c02",
  high: "#c62828",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      style={{
        backgroundColor: COLORS[level],
        color: "white",
        padding: "2px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 700,
        textTransform: "uppercase",
      }}
    >
      {level}
    </span>
  );
}