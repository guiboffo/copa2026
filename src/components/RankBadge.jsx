export default function RankBadge({ rank }) {
  return (
    <span style={{ fontFamily: "var(--font-display)", fontSize: 8, fontWeight: 800, color: "#ed8936", background: "rgba(237,137,54,0.15)", padding: "1px 4px", borderRadius: 3, flexShrink: 0, lineHeight: 1.3 }}>
      #{rank}
    </span>
  );
}
