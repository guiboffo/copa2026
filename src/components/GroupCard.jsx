import Flag from "./Flag.jsx";
import { GM } from "../data/matches.js";
import { GROUP_TEAMS, FIFA_RANKING, teamName, isBigMatch, isBrazilMatch } from "../data/teams.js";

function RankBadge({ rank }) {
  return <span className="rank-badge">#{rank}</span>;
}

export default function GroupCard({ group, standings, scores, onScore, expanded, onToggle, complete, isDesk, filter }) {
  const teams    = GROUP_TEAMS[group];
  const matches  = GM.filter(m => m.g === group);
  const flagSz   = isDesk ? 20 : 17;
  const nameSz   = isDesk ? 13 : 12;
  const scoreSz  = isDesk ? 32 : 28;

  return (
    <div className="card" style={{ marginBottom: isDesk ? 0 : 14 }}>

      {/* ── Group Header ─────────────────────────── */}
      <div className="group-header">
        <span className="group-header-letter" style={{ fontSize: isDesk ? 30 : 26 }}>{group}</span>
        <div>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: isDesk ? 13 : 12, color: "var(--t1)" }}>
            Grupo {group}
          </div>
          <div style={{ fontFamily: "var(--f-body)", fontSize: 10, color: "var(--t3)", marginTop: 1 }}>
            {teams.map(t => teamName(t, true)).join(" · ")}
          </div>
        </div>
        {complete && (
          <span style={{ marginLeft: "auto", fontFamily: "var(--f-display)", fontSize: 10, fontWeight: 800, color: "var(--green)", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", padding: "2px 10px", borderRadius: 20 }}>
            Completo
          </span>
        )}
        <span className="group-header-bg-letter">{group}</span>
      </div>

      {/* ── Team Pills ───────────────────────────── */}
      <div className="team-pills">
        {teams.map(t => (
          <div key={t} className="team-pill">
            <Flag team={t} size={flagSz} />
            <span>{teamName(t, isDesk)}</span>
          </div>
        ))}
      </div>

      {/* ── Standings Table ──────────────────────── */}
      <div style={{ overflowX: "auto" }}>
        <table className="standings-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left", paddingLeft: 12, width: "36%" }}>#</th>
              {["J","V","E","D","GP","GC","SG"].map(h => <th key={h}>{h}</th>)}
              <th style={{ color: "var(--gold)", fontWeight: 800 }}>P</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t, i) => {
              const q = i < 2, third = i === 2;
              return (
                <tr key={t.team}>
                  <td style={{ textAlign: "left", paddingLeft: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 18, height: 18, borderRadius: 4, fontSize: 9, fontWeight: 900,
                      marginRight: 5,
                      background: q ? "var(--green)" : third ? "rgba(251,146,60,0.25)" : "rgba(255,255,255,0.06)",
                      color: q ? "#070b15" : third ? "var(--orange)" : "var(--t3)",
                    }}>{i + 1}</span>
                    <Flag team={t.team} size={15} />
                    <span style={{ marginLeft: 5, fontWeight: q ? 700 : 500, color: q ? "var(--t1)" : "var(--t2)", fontSize: nameSz }}>
                      {teamName(t.team, isDesk)}
                    </span>
                  </td>
                  {[t.p, t.w, t.d, t.l, t.gf, t.ga].map((v, vi) => <td key={vi}>{v}</td>)}
                  <td style={{ color: t.gd > 0 ? "var(--green)" : t.gd < 0 ? "var(--red)" : "var(--t3)" }}>
                    {t.gd > 0 ? "+" : ""}{t.gd}
                  </td>
                  <td style={{ fontWeight: 900, color: "var(--gold)", fontSize: isDesk ? 14 : 13 }}>{t.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Matches by Round ─────────────────────── */}
      {[1, 2, 3].map(round => (
        <div key={round}>
          <div className="round-section-label">{round}ª Rodada</div>
          {matches.filter(m => m.r === round).map(m => {
            const idx  = GM.indexOf(m);
            const s    = scores[idx] || { h: "", a: "" };
            const key  = `g-${idx}`;
            const isExp = expanded[key];
            const hasScore = s.h !== "" && s.a !== "";
            const hg = parseInt(s.h), ag = parseInt(s.a);
            const hWin = hasScore && hg > ag;
            const aWin = hasScore && ag > hg;
            const rankH = FIFA_RANKING[m.h], rankA = FIFA_RANKING[m.a];
            const mBrazil = isBrazilMatch(m.h, m.a);
            const mBig    = isBigMatch(m.h, m.a);
            const dimmed  = (filter === "brazil" && !mBrazil) || (filter === "big" && !mBig);
            const hl      = (filter === "brazil" && mBrazil) || (filter === "big" && mBig);
            const hlColor = filter === "brazil" ? "var(--green)" : "var(--orange)";

            return (
              <div key={idx} className="match-row" style={{ opacity: dimmed ? 0.28 : 1 }} onClick={() => onToggle(key)}>

                {/* Main row */}
                <div className="match-main" style={{ background: hl ? (filter === "brazil" ? "rgba(34,197,94,0.05)" : "rgba(251,146,60,0.05)") : "transparent" }}>

                  {hl && <div className="highlight-bar" style={{ background: hlColor }} />}

                  {/* time */}
                  <span className="match-time">{m.t}</span>

                  {/* home team */}
                  <div className={`match-team home${hWin ? " winner" : ""}`} style={{ fontSize: nameSz }}>
                    {rankH && <RankBadge rank={rankH} />}
                    <span className="match-team-name">{teamName(m.h, isDesk)}</span>
                    <Flag team={m.h} size={flagSz} />
                  </div>

                  {/* score center */}
                  <div className="match-score">
                    <input
                      className="score-input"
                      value={s.h}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { e.stopPropagation(); onScore(idx, "h", e.target.value); }}
                      style={{ width: scoreSz, height: scoreSz, fontSize: isDesk ? 14 : 13 }}
                      placeholder="–" maxLength={2} inputMode="numeric"
                    />
                    <span className="score-sep">:</span>
                    <input
                      className="score-input"
                      value={s.a}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { e.stopPropagation(); onScore(idx, "a", e.target.value); }}
                      style={{ width: scoreSz, height: scoreSz, fontSize: isDesk ? 14 : 13 }}
                      placeholder="–" maxLength={2} inputMode="numeric"
                    />
                  </div>

                  {/* away team */}
                  <div className={`match-team away${aWin ? " winner" : ""}`} style={{ fontSize: nameSz }}>
                    <Flag team={m.a} size={flagSz} />
                    <span className="match-team-name">{teamName(m.a, isDesk)}</span>
                    {rankA && <RankBadge rank={rankA} />}
                  </div>

                  <span className="match-expand">{isExp ? "▲" : "▼"}</span>
                </div>

                {/* Meta row */}
                <div className="match-meta">
                  <div className="match-meta-text">
                    <span>{m.d}/2026</span>
                    <span>·</span>
                    <span>{m.c}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExp && (
                  <div className="match-detail" style={{ gridTemplateColumns: isDesk ? "1fr 1fr" : "1fr", columnGap: 24 }}>
                    {[
                      ["Fase",      `Grupo ${m.g} · ${m.r}ª Rodada`],
                      ["Data",      `${m.d}/2026 (${m.day})`],
                      ["Horário",   `${m.t} (Brasília)`],
                      ["Cidade",    m.c],
                      ...(hasScore ? [["Resultado", `${m.h} ${s.h}:${s.a} ${m.a}`]] : []),
                      ["Transmissão","A definir"],
                    ].map(([label, val]) => (
                      <div key={label} className="match-detail-row">
                        <span className="match-detail-label">{label}</span>
                        <span className="match-detail-value">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
