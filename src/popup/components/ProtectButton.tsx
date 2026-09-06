export function ProtectButton({ onProtect, disabled }: { onProtect: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onProtect}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "10px",
        marginTop: "12px",
        background: disabled ? "#999" : "#1565c0",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {disabled ? "Protected ✓" : "Protect me"}
    </button>
  );
}