import Flag from "./Flag.jsx";
import RankBadge from "./RankBadge.jsx";
import { GM } from "../data/matches.js";
import { GROUP_TEAMS, FIFA_RANKING, teamName, isBigMatch, isBrazilMatch } from "../data/teams.js";

export default function GroupCard({ group, standings, scores, onScore, expanded, onToggle, complete, isDesk, filter }) {
  const teams = GROUP_TEAMS[group];
  const matches = GM.filter(m => m.g === group);
  const f = isDesk ? 1.05 : 1;

  return (
    <div className="card" style={{ marginBottom: isDesk ? 0 : 16 }}>
      {/* Group Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: isDesk ? "14px 18px 10px" : "12px 14px 8px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26 * f, color: "var(--accent)", lineHeight: 1 }}>{group}</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 * f, color: "var(--text-primary)" }}>Grupo {group}</span>
        {complete && (
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 800, color: "var(--green)", background: "var(--green-dim)", padding: "2px 10px", borderRadius: 20 }}>
            ✓ Completo
          </span>
        )}
      </div>

      {/* Team Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "10px 12px 8px" }}>
        {teams.map(t => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, padding: isDesk ? "5px 10px" : "4px 8px", background: "var(--bg-row)", borderRadius: 8, flexShrink: 0 }}>
            <Flag team={t} size={isDesk ? 22 : 18} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11 * f, fontWeight: 600, color: "var(--text-secondary)" }}>{teamName(t, isDesk)}</span>
          </div>
        ))}
      </div>

      {/* Standings Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="standings-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingLeft: 10, width: "38%", fontSize: 9 * f }}>#</th>
              {["J","V","E","D","GP","GC","SG"].map(h => (
                <th key={h} style={{ fontSize: 9 * f }}>{h}</th>
              ))}
              <th style={{ color: "var(--accent)", fontWeight: 800, fontSize: 9 * f }}>P</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t, i) => {
              const qualified = i < 2, third = i === 2;
              return (
                <tr key={t.team} style={{ background: qualified ? "rgba(72,187,120,0.08)" : third ? "rgba(236,201,75,0.05)" : "transparent" }}>
                  <td style={{ textAlign: "left", paddingLeft: 6 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 4, fontSize: 10, fontWeight: 900, marginRight: 4, background: qualified ? "var(--green)" : third ? "var(--accent)" : "#4a5568", color: qualified || third ? "#1a202c" : "#a0aec0" }}>{i + 1}</span>
                    <Flag team={t.team} size={15} />
                    <span style={{ fontWeight: 700, fontSize: 12 * f, marginLeft: 4 }}>{teamName(t.team, isDesk)}</span>
                  </td>
                  {[t.p, t.w, t.d, t.l, t.gf, t.ga].map((v, vi) => (
                    <td key={vi}>{v}</td>
                  ))}
                  <td style={{ color: t.gd > 0 ? "var(--green)" : t.gd < 0 ? "var(--red)" : "var(--text-muted)" }}>
                    {t.gd > 0 ? "+" : ""}{t.gd}
                  </td>
                  <td style={{ fontWeight: 900, color: "var(--accent)", fontSize: 14 * f }}>{t.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matches by Round */}
      {[1, 2, 3].map(round => {
        const rm = matches.filter(m => m.r === round);
        return (
          <div key={round}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10 * f, color: "var(--text-dim)", letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 14px 4px", borderTop: "1px solid var(--border)" }}>
              {round}ª Rodada
            </div>
            {rm.map(m => {
              const idx = GM.indexOf(m);
              const s = scores[idx] || { h: "", a: "" };
              const key = `g-${idx}`, isExp = expanded[key];
              const hasScore = s.h !== "" && s.a !== "";
              const hg = parseInt(s.h), ag = parseInt(s.a);
              const hWin = hasScore && hg > ag, aWin = hasScore && ag > hg, draw = hasScore && hg === ag;
              const inSz = isDesk ? 32 : 28, fnSz = isDesk ? 13 * f : 12;
              const matchIsBrazil = isBrazilMatch(m.h, m.a);
              const matchIsBig = isBigMatch(m.h, m.a);
              const dimmed = (filter === "brazil" && !matchIsBrazil) || (filter === "big" && !matchIsBig);
              const highlighted = (filter === "brazil" && matchIsBrazil) || (filter === "big" && matchIsBig);
              const rankH = FIFA_RANKING[m.h], rankA = FIFA_RANKING[m.a];
              const hlColor = filter === "brazil" ? "var(--green)" : "var(--orange)";
              const hlBg = filter === "brazil" ? "rgba(72,187,120,0.06)" : "rgba(237,137,54,0.06)";

              return (
                <div key={idx} style={{ opacity: dimmed ? 0.3 : 1, transition: "opacity .2s" }}>
                  <div
                    onClick={() => onToggle(key)}
                    className="match-row"
                    style={{ padding: isDesk ? "9px 12px" : "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: highlighted ? hlBg : "transparent" }}
                  >
                    {highlighted && (
                      <div style={{ width: 3, height: 26, borderRadius: 2, background: hlColor, marginRight: 6, flexShrink: 0 }} />
                    )}
                    <div style={{ width: isDesk ? 60 : 42, flexShrink: 0, textAlign: "center" }}>
                      <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 10 * f, fontWeight: 700, color: "var(--text-secondary)" }}>{m.d}</span>
                      <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 10 * f, color: "var(--accent)", fontWeight: 600 }}>{m.t}</span>
                    </div>
                    {isDesk && (
                      <div style={{ width: 100, flexShrink: 0, fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-muted)", textAlign: "center", padding: "0 4px" }}>{m.c}</div>
                    )}
                    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", fontFamily: "var(--font-body)", fontSize: fnSz, fontWeight: hWin ? 800 : 500, color: hWin ? "var(--green)" : "var(--text-primary)", overflow: "hidden" }}>
                        {rankH && <RankBadge rank={rankH} />}
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{teamName(m.h, isDesk)}</span>
                        <Flag team={m.h} size={isDesk ? 17 : 15} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, margin: "0 6px" }}>
                        <input
                          className="score-input"
                          value={s.h}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { e.stopPropagation(); onScore(idx, "h", e.target.value); }}
                          style={{ width: inSz, height: inSz, fontSize: 13 * f }}
                          placeholder="–" maxLength={2} inputMode="numeric"
                        />
                        <span style={{ color: "var(--text-dim)", fontWeight: 900, fontSize: 10 }}>×</span>
                        <input
                          className="score-input"
                          value={s.a}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { e.stopPropagation(); onScore(idx, "a", e.target.value); }}
                          style={{ width: inSz, height: inSz, fontSize: 13 * f }}
                          placeholder="–" maxLength={2} inputMode="numeric"
                        />
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-start", fontFamily: "var(--font-body)", fontSize: fnSz, fontWeight: aWin ? 800 : 500, color: aWin ? "var(--green)" : "var(--text-primary)", overflow: "hidden" }}>
                        <Flag team={m.a} size={isDesk ? 17 : 15} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{teamName(m.a, isDesk)}</span>
                        {rankA && <RankBadge rank={rankA} />}
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: 6, width: 14, textAlign: "center", flexShrink: 0 }}>{isExp ? "▲" : "▼"}</div>
                  </div>

                  {isExp && (
                    <div style={{ background: "var(--bg-secondary)", padding: isDesk ? "12px 22px" : "10px 14px", borderBottom: "1px solid var(--border)", display: isDesk ? "grid" : "block", gridTemplateColumns: "1fr 1fr", gap: "2px 24px" }}>
                      {[
                        ["Fase", `Grupo ${m.g} — ${m.r}ª Rodada`],
                        ["Data", `${m.d}/2026 (${m.day})`],
                        ["Horário", `${m.t} (Brasília)`],
                        ["Cidade", m.c],
                        ...(hasScore ? [["Resultado", `${m.h} ${s.h} × ${s.a} ${m.a} ${draw ? "(Empate)" : hWin ? `(${m.h})` : `(${m.a})`}`]] : []),
                        ["Transmissão", "A definir"],
                      ].map(([label, val]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontFamily: "var(--font-body)", fontSize: 11 * f }}>
                          <span style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: .5 }}>{label}</span>
                          <span style={label === "Resultado" ? { fontWeight: 800, color: "var(--text-primary)" } : label === "Transmissão" ? { color: "var(--text-muted)", fontStyle: "italic" } : { color: "var(--text-secondary)" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
