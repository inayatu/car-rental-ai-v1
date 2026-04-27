const colorStyles = {
  btnPrimary: {
    background: "linear-gradient(135deg, var(--teal) 0%, #0e7490 100%)",
    color: "#fff",
    border: "none",
  },
  btnGold: { background: "linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)", color: "#fff", border: "none" },
  btnSlate: { background: "var(--slate)", color: "#fff", border: "none" },
  btnOutline: { background: "transparent", color: "var(--ink2)", border: "1.5px solid var(--border)" },
  btnOutlineWhite: { background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)" },
  btnGhost: { background: "var(--teal-pale)", color: "var(--teal)", border: "1.5px solid var(--teal-border)" },
};

export function Btn({ variant = "primary", size = "md", block, onClick, children, disabled, type = "button" }) {
  const sizeMap = { sm: "8px 16px", md: "10px 22px", lg: "14px 32px" };
  const fontMap = { sm: "12px", md: "13px", lg: "15px" };
  const colorMap = {
    primary: colorStyles.btnPrimary,
    gold: colorStyles.btnGold,
    slate: colorStyles.btnSlate,
    outline: colorStyles.btnOutline,
    "outline-white": colorStyles.btnOutlineWhite,
    ghost: colorStyles.btnGhost,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        padding: sizeMap[size],
        borderRadius: "var(--r)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)",
        fontSize: fontMap[size],
        fontWeight: 600,
        transition: "all 0.2s",
        width: block ? "100%" : "auto",
        opacity: disabled ? 0.6 : 1,
        letterSpacing: "0.01em",
        ...colorMap[variant],
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(13,27,42,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}
