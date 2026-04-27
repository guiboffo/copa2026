import { TEAMS, flagUrl } from "../data/teams.js";

export default function Flag({ team, size = 20 }) {
  const url = flagUrl(team);
  if (!url) return <span style={{ fontSize: size * 0.8 }}>{TEAMS[team]?.emoji || "🏳️"}</span>;
  return (
    <img
      src={url}
      alt={team}
      crossOrigin="anonymous"
      style={{ width: size, height: size * 0.7, objectFit: "cover", borderRadius: 3, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}
      onError={e => { e.target.style.display = "none"; }}
    />
  );
}
