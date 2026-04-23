import Flag from "./Flag.jsx";
import RankBadge from "./RankBadge.jsx";
import { KO, ROUND_ORDER, RC } from "../data/knockout.js";
import { teamName, FIFA_RANKING, isBigMatch, isBrazilMatch } from "../data/teams.js";
import { resolveTeam, labelToText } from "../utils/standings.js";

export default function BracketView({ allSt, qt, koScores, onKoScore, isDesk, isWide, filter }) {
  const champion = resolveTeam("W104", allSt, qt, koScores);
  const f = isDesk ? 1.08 : 1;

  const renderSlot = (mn) => {
    const ko = KO[mn];
    const ht = resolveTeam(ko.hs, allSt, qt, koScores);
    const at = resolveTeam(ko.as, allSt, qt, koScores);
    const s = koScores[mn] || { h: "", a: "" };
    const hasTeams = ht && at;
    const hasScore = s.h !== "" && s.a !== "";
    const hg = parseInt(s.h), ag = parseInt(s.a);
    const hWin = hasScore && hg > ag, aWin = hasScore && ag > hg;
    const color = RC[ko.rn] || "#5b9bd5";
    const inSz = isDesk ? 34 : 29;
    const matchBrazil = isBrazilMatch(ht, at);
    const matchBig = isBigMatch(ht, at);
    const dimmed = hasTeams && ((filter === "brazil" && !matchBrazil) || (filter === "big" && !matchBig));
    const highlighted = hasTeams && ((filter === "brazil" && matchBrazil) || (filter === "big" && matchBig));
    const hlBg = filter === "brazil" ? "rgba(72,187,120,0.07)" : "rgba(237,137,54,0.07)";

    return (
      <div
        key={mn}
        className="card"
        style={{
          borderLeft: `3px solid ${color}`,
          background: highlighted ? hlBg : "var(--bg-card)",
          opacity: dimmed ? 0.3 : 1,
          transition: "opacity .2s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isDesk ? "8px 14px" : "6px 10px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10 * f, padding: "2px 7px", borderRadius: 4, border: `1px solid ${color}55`, background: color + "22", color }}>
            #{mn}
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 10 * f, color: "var(--text-muted)" }}>
            {ko.d}{ko.t !== "—" ? ` · ${ko.t}` : ""} · {ko.c}
          </span>
        </div>
        {[{ team: ht, label: ko.hs, win: hWin, side: "h" }, { team: at, label: ko.as, win: aWin, side: "a" }].map((row, ri) => (
          <div
            key={ri}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: isDesk ? "9px 14px" : "7px 10px",
              background: row.win ? "rgba(72,187,120,0.08)" : "transparent",
              borderTop: ri ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-body)", fontSize: 13 * f, flex: 1, minWidth: 0 }}>
              {row.team ? (
                <>
                  <Flag team={row.team} size={isDesk ? 20 : 17} />
                  <span style={{ fontWeight: row.win ? 800 : 500, color: row.win ? "var(--green)" : "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {teamName(row.team, isDesk)}
                  </span>
                  {FIFA_RANKING[row.team] && <RankBadge rank={FIFA_RANKING[row.team]} />}
                </>
              ) : (
                <span style={{ color: "var(--text-dim)", fontSize: 11, fontStyle: "italic" }}>{labelToText(row.label)}</span>
              )}
            </div>
            {hasTeams ? (
              <input
                className="score-input"
                value={s[row.side]}
                onChange={e => onKoScore(mn, row.side, e.target.value)}
                style={{ width: inSz, height: inSz - 2, fontSize: 14 * f, flexShrink: 0 }}
                placeholder="–" maxLength={2} inputMode="numeric"
              />
            ) : (
              <div style={{ width: inSz, height: inSz - 2, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>–</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {champion && (
        <div className="champion-banner">
          <div style={{ fontSize: isDesk ? 56 : 44 }}>🏆</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: isDesk ? 13 : 11, letterSpacing: 4, color: "var(--accent)", textTransform: "uppercase", marginTop: 8 }}>Campeão do Mundo 2026</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: isDesk ? 32 : 26, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginTop: 8 }}>
            <Flag team={champion} size={isDesk ? 42 : 32} />{champion}
          </div>
        </div>
      )}

      {ROUND_ORDER.map(rn => {
        const mns = Object.keys(KO).filter(k => KO[k].rn === rn).map(Number).sort((a, b) => a - b);
        const cols =
          rn === "Rodada de 32" ? (isWide ? "1fr 1fr 1fr" : isDesk ? "1fr 1fr" : "1fr") :
          rn === "Oitavas" ? (isDesk ? "1fr 1fr" : "1fr") :
          "1fr";
        return (
          <div key={rn} style={{ marginBottom: 24 }}>
            <div
              className="round-header"
              style={{ fontSize: 15 * f, color: RC[rn], borderColor: RC[rn] }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: RC[rn], display: "inline-block", flexShrink: 0 }} />
              {rn}
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
                — {mns.length} {mns.length === 1 ? "jogo" : "jogos"}
              </span>
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
