import { useMemo } from "react";
import Flag from "./Flag.jsx";
import RankBadge from "./RankBadge.jsx";
import { GM } from "../data/matches.js";
import { KO, RC } from "../data/knockout.js";
import { teamName, FIFA_RANKING, isRanked, isBigMatch, isBrazilMatch } from "../data/teams.js";
import { resolveTeam, labelToText, makeSortKey } from "../utils/standings.js";

const DAY_NAMES = { Qui:"Quinta-feira", Sex:"Sexta-feira", Sáb:"Sábado", Dom:"Domingo", Seg:"Segunda-feira", Ter:"Terça-feira", Qua:"Quarta-feira" };

export default function CalendarView({ scores, koScores, allSt, qt, isDesk, isWide, filter }) {
  const f = isDesk ? 1.08 : 1;

  const all = useMemo(() => {
    const list = [];
    GM.forEach((m, i) => {
      const s = scores[i] || { h: "", a: "" };
      list.push({ type: "group", d: m.d, t: m.t, day: m.day, c: m.c, h: m.h, a: m.a, g: m.g, r: m.r, sh: s.h, sa: s.a, sortKey: makeSortKey(m.d, m.t) });
    });
    Object.entries(KO).forEach(([mn, ko]) => {
      const num = parseInt(mn);
      const ht = resolveTeam(ko.hs, allSt, qt, koScores);
      const at = resolveTeam(ko.as, allSt, qt, koScores);
      const s = koScores[num] || { h: "", a: "" };
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

  return (
    <div>
      {[...byDate.entries()].map(([date, matches]) => {
        const first = matches[0];
        const [dd, mm] = date.split("/");
        const monthLabel = mm === "06" ? "Junho" : "Julho";

        return (
          <div key={date} style={{ marginBottom: 22 }}>
            {/* Date Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 4px 8px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: isDesk ? 38 : 30, color: "var(--accent)", lineHeight: 1, width: isDesk ? 52 : 40, textAlign: "center" }}>{dd}</div>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: isDesk ? 16 : 13, color: "var(--text-primary)" }}>{monthLabel} 2026</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: isDesk ? 12 : 10, color: "var(--text-muted)" }}>{first.day ? (DAY_NAMES[first.day] || first.day) : ""}</div>
              </div>
              <div style={{ flex: 1, height: 1, background: "var(--border)", marginLeft: 4 }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--text-dim)", flexShrink: 0 }}>{matches.length} {matches.length === 1 ? "jogo" : "jogos"}</span>
            </div>

            {/* Match Grid */}
            <div style={{ display: isDesk ? "grid" : "flex", gridTemplateColumns: isWide ? "1fr 1fr 1fr" : isDesk ? "1fr 1fr" : "1fr", flexDirection: "column", gap: isDesk ? 6 : 0 }}>
              {matches.map((m, i) => {
                const hasScore = m.sh !== "" && m.sa !== "";
                const hg = parseInt(m.sh), ag = parseInt(m.sa);
                const hWin = hasScore && hg > ag, aWin = hasScore && ag > hg;
                const isKo = m.type === "ko";
                const color = isKo ? RC[m.rn] : "transparent";
                const mBrazil = isBrazilMatch(m.h, m.a);
                const mBig = isBigMatch(m.h, m.a);
                const dimmed = (filter === "brazil" && !mBrazil) || (filter === "big" && !mBig);
                const highlighted = (filter === "brazil" && mBrazil) || (filter === "big" && mBig);
                const hlColor = filter === "brazil" ? "var(--green)" : "var(--orange)";
                const hlBg = filter === "brazil" ? "rgba(72,187,120,0.06)" : "rgba(237,137,54,0.06)";

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: isDesk ? 12 : 8,
                      padding: isDesk ? "10px 14px" : "8px 8px",
                      borderBottom: isDesk ? "none" : "1px solid var(--border-subtle)",
                      borderLeft: `3px solid ${highlighted ? hlColor : color}`,
                      background: isDesk ? (highlighted ? hlBg : "var(--bg-card)") : (highlighted ? hlBg : "transparent"),
                      borderRadius: isDesk ? 8 : 0,
                      opacity: dimmed ? 0.25 : 1,
                      transition: "opacity .2s",
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 11 * f, fontWeight: 700, color: "var(--text-secondary)", width: isDesk ? 48 : 38, flexShrink: 0, textAlign: "center", paddingTop: 2 }}>
                      {m.t || "—"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 13 * f, flexWrap: "wrap" }}>
                        {mBig && highlighted && <span style={{ fontSize: 11, flexShrink: 0 }}>🔥</span>}
                        {m.h ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: hWin ? 800 : 500, color: hWin ? "var(--green)" : "var(--text-primary)" }}>
                            <Flag team={m.h} size={isDesk ? 17 : 14} />
                            {teamName(m.h, isDesk)}
                            {isRanked(m.h) && <RankBadge rank={FIFA_RANKING[m.h]} />}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 12, fontStyle: "italic" }}>{isKo ? labelToText(m.hLabel) : "?"}</span>
                        )}
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 12 * f, color: "var(--accent)", flexShrink: 0 }}>
                          {hasScore ? <span style={{ fontWeight: 800 }}>{m.sh} × {m.sa}</span> : <span style={{ color: "var(--text-dim)" }}>×</span>}
                        </span>
                        {m.a ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: aWin ? 800 : 500, color: aWin ? "var(--green)" : "var(--text-primary)" }}>
                            <Flag team={m.a} size={isDesk ? 17 : 14} />
                            {teamName(m.a, isDesk)}
                            {isRanked(m.a) && <RankBadge rank={FIFA_RANKING[m.a]} />}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 12, fontStyle: "italic" }}>{isKo ? labelToText(m.aLabel) : "?"}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        {isKo && (
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 9 * f, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: (RC[m.rn] || "#5b9bd5") + "22", color: RC[m.rn] }}>
                            {m.rn}
                          </span>
                        )}
                        {!isKo && (
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 9 * f, fontWeight: 600, color: "var(--text-dim)" }}>Grupo {m.g} · {m.r}ª</span>
                        )}
                        <span style={{ color: "var(--text-muted)", fontSize: 10 * f }}>{m.c}</span>
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
