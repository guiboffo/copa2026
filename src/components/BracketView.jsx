import Flag from "./Flag.jsx";
import { KO, ROUND_ORDER, RC } from "../data/knockout.js";
import { teamName, FIFA_RANKING, isBigMatch, isBrazilMatch } from "../data/teams.js";
import { resolveTeam, labelToText } from "../utils/standings.js";

function RankBadge({ rank }) {
  return <span className="rank-badge">#{rank}</span>;
}

// Map CSS variable names to the round colors
const ROUND_CSS = {
  "Rodada de 32": "var(--r32)",
  "Oitavas":      "var(--r16)",
  "Quartas":      "var(--qf)",
  "Semifinal":    "var(--sf)",
  "3º Lugar":     "var(--3p)",
  "Final":        "var(--final)",
};

export default function BracketView({ allSt, qt, koScores, onKoScore, isDesk, isWide, filter }) {
  const champion = resolveTeam("W104", allSt, qt, koScores);
  const flagSz   = isDesk ? 20 : 17;

  const renderSlot = (mn) => {
    const ko = KO[mn];
    const ht = resolveTeam(ko.hs, allSt, qt, koScores);
    const at = resolveTeam(ko.as, allSt, qt, koScores);
    const s  = koScores[mn] || { h: "", a: "" };
    const hasTeams = ht && at;
    const hasScore = s.h !== "" && s.a !== "";
    const hg = parseInt(s.h), ag = parseInt(s.a);
    const hWin = hasScore && hg > ag, aWin = hasScore && ag > hg;
    const color = ROUND_CSS[ko.rn] || "var(--r32)";
    const inSz  = isDesk ? 33 : 28;
    const mBrazil = isBrazilMatch(ht, at);
    const mBig    = isBigMatch(ht, at);
    const isTeamFilter = !["all","brazil","big"].includes(filter);
    const mTeam   = isTeamFilter && hasTeams && (ht === filter || at === filter);
    const dimmed  = hasTeams && ((filter === "brazil" && !mBrazil) || (filter === "big" && !mBig) || (isTeamFilter && !mTeam));
    const hl      = hasTeams && ((filter === "brazil" && mBrazil) || (filter === "big" && mBig) || mTeam);

    return (
      <div
        key={mn}
        className="ko-card"
        style={{
          borderLeft: `3px solid ${color}`,
          opacity: dimmed ? 0.25 : 1,
          transition: "opacity .2s",
          background: hl ? (filter === "brazil" ? "rgba(34,197,94,0.05)" : "rgba(251,146,60,0.05)") : "var(--bg-card)",
        }}
      >
        {/* Card header */}
        <div className="ko-card-header">
          <span
            className="ko-round-badge"
            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}
          >
            #{mn}
          </span>
          <span className="ko-meta">{ko.d}{ko.t !== "—" ? ` · ${ko.t}` : ""} · {ko.c}</span>
        </div>

        {/* Team rows */}
        {[
          { team: ht, label: ko.hs, win: hWin, side: "h" },
          { team: at, label: ko.as, win: aWin, side: "a" },
        ].map((row, ri) => (
          <div
            key={ri}
            className={`ko-team-row${row.win ? " win" : ""}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--f-body)", fontSize: isDesk ? 13 : 12, flex: 1, minWidth: 0 }}>
              {row.team ? (
                <>
                  <Flag team={row.team} size={flagSz} />
                  <span style={{
                    fontWeight: row.win ? 800 : 500,
                    color: row.win ? "var(--win)" : "var(--t1)",
                    textShadow: row.win ? "0 0 12px rgba(34,197,94,0.35)" : "none",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {teamName(row.team, isDesk)}
                  </span>
                  {FIFA_RANKING[row.team] && <RankBadge rank={FIFA_RANKING[row.team]} />}
                </>
              ) : (
                <span style={{ color: "var(--t3)", fontSize: 11, fontStyle: "italic", fontFamily: "var(--f-display)" }}>
                  {labelToText(row.label)}
                </span>
              )}
            </div>
            {hasTeams ? (
              <input
                className="score-input"
                value={s[row.side]}
                onChange={e => onKoScore(mn, row.side, e.target.value)}
                style={{ width: inSz, height: inSz - 2, fontSize: isDesk ? 14 : 13, flexShrink: 0 }}
                placeholder="–" maxLength={2} inputMode="numeric"
              />
            ) : (
              <div style={{ width: inSz, height: inSz - 2, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t3)", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>–</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Champion */}
      {champion && (
        <div className="champion-banner">
          <div className="champion-trophy">🏆</div>
          <div className="champion-label">Campeão do Mundo 2026</div>
          <div className="champion-name" style={{ fontSize: isDesk ? 30 : 24 }}>
            <Flag team={champion} size={isDesk ? 40 : 32} />
            {champion}
          </div>
        </div>
      )}

      {/* Rounds */}
      {ROUND_ORDER.map(rn => {
        const mns  = Object.keys(KO).filter(k => KO[k].rn === rn).map(Number).sort((a, b) => a - b);
        const color = ROUND_CSS[rn] || "var(--r32)";
        const cols  =
          rn === "Rodada de 32" ? (isWide ? "1fr 1fr 1fr" : isDesk ? "1fr 1fr" : "1fr") :
          rn === "Oitavas"      ? (isDesk ? "1fr 1fr" : "1fr") :
          "1fr";

        return (
          <div key={rn} style={{ marginBottom: 28 }}>
            <div className="round-header">
              <span className="round-dot" style={{ background: color }} />
              <span style={{ color }}>{rn}</span>
              <span className="round-count">— {mns.length} {mns.length === 1 ? "jogo" : "jogos"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: cols, gap: isDesk ? 10 : 8 }}>
              {mns.map(mn => renderSlot(mn))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
