import { useMemo } from "react";
import Flag from "./Flag.jsx";
import { GM } from "../data/matches.js";
import { KO, RC } from "../data/knockout.js";
import { teamName, FIFA_RANKING, isRanked, isBigMatch, isBrazilMatch } from "../data/teams.js";
import { resolveTeam, labelToText, makeSortKey } from "../utils/standings.js";

const ROUND_CSS = {
  "Rodada de 32": "var(--r32)",
  "Oitavas":      "var(--r16)",
  "Quartas":      "var(--qf)",
  "Semifinal":    "var(--sf)",
  "3º Lugar":     "var(--3p)",
  "Final":        "var(--final)",
};

const DAY_PT = { Qui:"Quinta-feira", Sex:"Sexta-feira", Sáb:"Sábado", Dom:"Domingo", Seg:"Segunda-feira", Ter:"Terça-feira", Qua:"Quarta-feira" };

function RankBadge({ rank }) {
  return <span className="rank-badge">#{rank}</span>;
}

export default function CalendarView({ scores, koScores, allSt, qt, isDesk, isWide, filter }) {
  const all = useMemo(() => {
    const list = [];
    GM.forEach((m, i) => {
      const s = scores[i] || { h: "", a: "" };
      list.push({ type: "group", d: m.d, t: m.t, day: m.day, c: m.c, h: m.h, a: m.a, g: m.g, r: m.r, sh: s.h, sa: s.a, sortKey: makeSortKey(m.d, m.t) });
    });
    Object.entries(KO).forEach(([mn, ko]) => {
      const num = parseInt(mn);
      const ht  = resolveTeam(ko.hs, allSt, qt, koScores);
      const at  = resolveTeam(ko.as, allSt, qt, koScores);
      const s   = koScores[num] || { h: "", a: "" };
      list.push({ type: "ko", d: ko.d, t: ko.t, day: null, c: ko.c, h: ht, a: at, hLabel: ko.hs, aLabel: ko.as, rn: ko.rn, mn: num, sh: s.h, sa: s.a, sortKey: makeSortKey(ko.d, ko.t) });
    });
    list.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    return list;
  }, [scores, koScores, allSt, qt]);

  const byDate = useMemo(() => {
    const map = new Map();
    all.forEach(m => { if (!map.has(m.d)) map.set(m.d, []); map.get(m.d).push(m); });
    return map;
  }, [all]);

  const flagSz = isDesk ? 18 : 15;

  return (
    <div>
      {[...byDate.entries()].map(([date, matches]) => {
        const first = matches[0];
        const [dd, mm] = date.split("/");
        const monthLabel = mm === "06" ? "Junho" : "Julho";

        return (
          <div key={date} style={{ marginBottom: 24 }}>
            {/* Date Header */}
            <div className="cal-date-header">
              <div className="cal-date-num" style={{ fontSize: isDesk ? 40 : 30, width: isDesk ? 52 : 40 }}>{dd}</div>
              <div className="cal-date-info">
                <div className="month" style={{ fontSize: isDesk ? 15 : 12 }}>{monthLabel} 2026</div>
                <div className="weekday">{first.day ? (DAY_PT[first.day] || first.day) : ""}</div>
              </div>
              <div className="cal-divider" />
              <span className="cal-count">{matches.length} jogo{matches.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Match grid */}
            <div style={{
              display: isDesk ? "grid" : "flex",
              gridTemplateColumns: isWide ? "1fr 1fr 1fr" : isDesk ? "1fr 1fr" : "1fr",
              flexDirection: "column",
              gap: isDesk ? 6 : 0,
            }}>
              {matches.map((m, i) => {
                const hasScore = m.sh !== "" && m.sa !== "";
                const hg = parseInt(m.sh), ag = parseInt(m.sa);
                const hWin = hasScore && hg > ag, aWin = hasScore && ag > hg;
                const isKo = m.type === "ko";
                const color = isKo ? (ROUND_CSS[m.rn] || "var(--r32)") : "transparent";
                const mBrazil = isBrazilMatch(m.h, m.a);
                const mBig    = isBigMatch(m.h, m.a);
                const isTeamFilter = !["all","brazil","big"].includes(filter);
                const mTeam   = isTeamFilter && (m.h === filter || m.a === filter);
                const dimmed  = (filter === "brazil" && !mBrazil) || (filter === "big" && !mBig) || (isTeamFilter && !mTeam);
                const hl      = (filter === "brazil" && mBrazil) || (filter === "big" && mBig) || mTeam;
                const hlColor = filter === "brazil" ? "var(--green)" : isTeamFilter ? "var(--blue)" : "var(--orange)";

                return (
                  <div
                    key={i}
                    className="cal-match"
                    style={{
                      borderLeftColor: hl ? hlColor : (isDesk ? color : "transparent"),
                      background: isDesk ? (hl ? (filter === "brazil" ? "rgba(34,197,94,0.05)" : "rgba(251,146,60,0.05)") : "var(--bg-card)") : "transparent",
                      borderRadius: isDesk ? 8 : 0,
                      borderBottom: isDesk ? "none" : "1px solid var(--border)",
                      opacity: dimmed ? 0.22 : 1,
                      boxShadow: isDesk ? "var(--shadow-card)" : "none",
                    }}
                  >
                    {/* time */}
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 11, fontWeight: 700, color: "var(--t3)", width: isDesk ? 44 : 36, flexShrink: 0, textAlign: "center" }}>
                      {m.t || "—"}
                    </div>

                    {/* match info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--f-body)", fontSize: isDesk ? 13 : 12, flexWrap: "wrap" }}>
                        {m.h ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: hWin ? 800 : 500, color: hWin ? "var(--win)" : "var(--t1)" }}>
                            <Flag team={m.h} size={flagSz} />
                            {teamName(m.h, isDesk)}
                            {isRanked(m.h) && <RankBadge rank={FIFA_RANKING[m.h]} />}
                          </span>
                        ) : (
                          <span style={{ color: "var(--t3)", fontSize: 11, fontStyle: "italic" }}>{isKo ? labelToText(m.hLabel) : "?"}</span>
                        )}

                        <span style={{ fontFamily: "var(--f-display)", fontSize: 12, color: "var(--gold)", flexShrink: 0, fontWeight: 800 }}>
                          {hasScore ? `${m.sh}:${m.sa}` : <span style={{ color: "var(--t3)", fontWeight: 400 }}>×</span>}
                        </span>

                        {m.a ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: aWin ? 800 : 500, color: aWin ? "var(--win)" : "var(--t1)" }}>
                            <Flag team={m.a} size={flagSz} />
                            {teamName(m.a, isDesk)}
                            {isRanked(m.a) && <RankBadge rank={FIFA_RANKING[m.a]} />}
                          </span>
                        ) : (
                          <span style={{ color: "var(--t3)", fontSize: 11, fontStyle: "italic" }}>{isKo ? labelToText(m.aLabel) : "?"}</span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        {isKo && (
                          <span style={{ fontFamily: "var(--f-display)", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: `color-mix(in srgb, ${ROUND_CSS[m.rn] || "var(--r32)"} 15%, transparent)`, color: ROUND_CSS[m.rn] || "var(--r32)" }}>
                            {m.rn}
                          </span>
                        )}
                        {!isKo && <span style={{ fontFamily: "var(--f-body)", fontSize: 9, color: "var(--t3)" }}>Grupo {m.g} · {m.r}ª</span>}
                        <span style={{ color: "var(--t3)", fontSize: 10 }}>{m.c}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
