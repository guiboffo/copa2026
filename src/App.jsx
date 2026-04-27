import { useState, useMemo, useEffect, useCallback } from "react";
import "./styles.css";

import { useWidth } from "./hooks/useWidth.js";
import { GROUPS_LIST, GROUP_TEAMS, TEAMS, isBigMatch } from "./data/teams.js";
import { GM } from "./data/matches.js";
import { computeStandings, getQualifiedThirds } from "./utils/standings.js";
import { load, save } from "./utils/storage.js";

import GroupCard from "./components/GroupCard.jsx";
import BracketView from "./components/BracketView.jsx";
import CalendarView from "./components/CalendarView.jsx";
import BolaoMaker from "./components/BolaoMaker.jsx";

export default function App() {
  const W = useWidth();
  const isDesk = W >= 768;
  const isWide = W >= 1100;

  const [mainTab, setMainTab] = useState("tabela");
  const [subTab, setSubTab]   = useState("grupos");
  const [scores, setScores]     = useState({});
  const [koScores, setKoScores] = useState({});
  const [loaded, setLoaded]     = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const d = load();
    if (d) { if (d.g) setScores(d.g); if (d.k) setKoScores(d.k); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) save({ g: scores, k: koScores });
  }, [scores, koScores, loaded]);

  const allSt = useMemo(() => {
    const s = {};
    GROUPS_LIST.forEach(g => { s[g] = computeStandings(g, scores); });
    return s;
  }, [scores]);

  const qt = useMemo(() => getQualifiedThirds(allSt), [allSt]);

  const updScore = (i, side, val) => {
    const v = val.replace(/[^0-9]/g, "").slice(0, 2);
    setScores(p => ({ ...p, [i]: { ...p[i], h: side === "h" ? v : (p[i]?.h ?? ""), a: side === "a" ? v : (p[i]?.a ?? "") } }));
  };
  const updKo = (mn, side, val) => {
    const v = val.replace(/[^0-9]/g, "").slice(0, 2);
    setKoScores(p => ({ ...p, [mn]: { ...p[mn], h: side === "h" ? v : (p[mn]?.h ?? ""), a: side === "a" ? v : (p[mn]?.a ?? "") } }));
  };
  const toggleRow = (key) => setExpandedRows(p => ({ ...p, [key]: !p[key] }));

  const groupComplete = useCallback(g =>
    GM.filter(m => m.g === g).every(m => {
      const k = GM.indexOf(m), s = scores[k];
      return s && s.h !== "" && s.a !== "" && !isNaN(parseInt(s.h)) && !isNaN(parseInt(s.a));
    }), [scores]);

  const gc = useMemo(() => GROUPS_LIST.filter(g => groupComplete(g)).length, [groupComplete]);

  const resetAll = () => {
    if (window.confirm("Apagar todos os resultados? Isso não afeta o bolão.")) {
      setScores({}); setKoScores({});
    }
  };

  const maxW = isWide ? 1280 : isDesk ? 960 : "100%";
  const pad  = isDesk ? "24px 28px 80px" : "12px 12px 60px";
  const isTeamFilter = !["all", "brazil", "big"].includes(filter);

  return (
    <div style={{ fontFamily: "var(--f-body)", background: "var(--bg-base)", minHeight: "100vh", color: "var(--t1)", maxWidth: maxW, margin: "0 auto" }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="app-header" style={{
        background: "linear-gradient(180deg, #0c1830 0%, var(--bg-base) 100%)",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 4px 32px rgba(0,0,0,0.55)",
      }}>
        {/* tri-nation top bar: Canada · USA · Mexico */}
        <div style={{ height: 3, background: "linear-gradient(90deg, var(--red) 0%, var(--blue) 50%, var(--green) 100%)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isDesk ? "14px 28px" : "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isDesk ? 16 : 12 }}>
            {/* FIFA badge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "var(--gold)", borderRadius: 6, padding: isDesk ? "4px 10px" : "3px 7px", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: isDesk ? 11 : 9, color: "#070b15", letterSpacing: 2, lineHeight: 1 }}>FIFA</span>
              <span style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: isDesk ? 14 : 11, color: "#070b15", letterSpacing: -0.5, lineHeight: 1.1 }}>2026</span>
            </div>
            <div>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: isDesk ? 22 : 17, color: "#fff", lineHeight: 1.1, letterSpacing: -0.3 }}>
                Copa do Mundo
              </div>
              <div style={{ fontFamily: "var(--f-body)", fontSize: isDesk ? 11 : 9, color: "var(--t3)", marginTop: 2 }}>
                EUA · México · Canadá &nbsp;·&nbsp; Horários de Brasília
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* progress pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 20, padding: "5px 12px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: gc === 12 ? "var(--green)" : "var(--t3)" }} />
              <span style={{ fontFamily: "var(--f-display)", fontSize: isDesk ? 12 : 10, fontWeight: 700, color: gc === 12 ? "var(--green)" : "var(--t2)" }}>{gc}/12</span>
            </div>
            <button
              onClick={resetAll}
              title="Resetar resultados"
              className="btn-icon"
              aria-label="Resetar resultados"
            >↺</button>
          </div>
        </div>
      </header>

      {/* ── MAIN NAVIGATION ───────────────────────────── */}
      <nav className="main-nav">
        {[
          { id: "tabela",    label: "Tabela"     },
          { id: "calendario",label: "Calendário" },
          { id: "bolao",     label: "Bolão"      },
        ].map(t => (
          <button
            key={t.id}
            className={`main-tab${mainTab === t.id ? " active" : ""}`}
            onClick={() => setMainTab(t.id)}
          >{t.label}</button>
        ))}
      </nav>

      {/* ── FILTER BAR ────────────────────────────────── */}
      {mainTab !== "bolao" && (
        <div className="filter-bar">
          {[
            { id: "all",    label: "Todos",        emoji: "",   cls: "" },
            { id: "brazil", label: "Brasil",        emoji: "🇧🇷 ", cls: "active-green" },
            { id: "big",    label: "Jogos Grandes", emoji: "🔥 ", cls: "active-orange" },
          ].map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                className={`chip${active ? " active" + (f.cls ? " " + f.cls : "") : ""}`}
                onClick={() => setFilter(filter === f.id && f.id !== "all" ? "all" : f.id)}
                style={active && f.cls ? { background: f.cls === "active-green" ? "rgba(34,197,94,0.1)" : "rgba(251,146,60,0.1)", borderColor: f.cls === "active-green" ? "rgba(34,197,94,0.35)" : "rgba(251,146,60,0.35)", color: f.cls === "active-green" ? "var(--green)" : "var(--orange)" } : undefined}
              >
                {f.emoji}{f.label}
              </button>
            );
          })}

          {/* Team dropdown */}
          <div className={`team-select-wrap${isTeamFilter ? " is-active" : ""}`}>
            <select
              className={`chip team-select${isTeamFilter ? " team-select-active" : ""}`}
              value={isTeamFilter ? filter : ""}
              onChange={e => setFilter(e.target.value || "all")}
            >
              <option value="">Outra seleção…</option>
              {GROUPS_LIST.map(g => (
                <optgroup key={g} label={`Grupo ${g}`}>
                  {GROUP_TEAMS[g].map(t => (
                    <option key={t} value={t}>{TEAMS[t]?.emoji} {t}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {filter === "big" && (
            <span style={{ fontFamily: "var(--f-body)", fontSize: 10, color: "var(--t3)", alignSelf: "center", flexShrink: 0, marginLeft: 2 }}>
              Top 20 FIFA
            </span>
          )}
        </div>
      )}

      {/* ── TABELA ────────────────────────────────────── */}
      {mainTab === "tabela" && (
        <>
          <nav className="sub-nav">
            {[{ id: "grupos", label: "Fase de Grupos" }, { id: "matamata", label: "Mata-mata" }].map(s => (
              <button key={s.id} className={`sub-tab${subTab === s.id ? " active" : ""}`} onClick={() => setSubTab(s.id)}>
                {s.label}
              </button>
            ))}
          </nav>

          {subTab === "grupos" && (
            <div style={{ padding: pad, display: isDesk ? "grid" : "block", gridTemplateColumns: isWide ? "1fr 1fr" : "1fr 1fr", gap: 16 }}>
              {GROUPS_LIST.map(g => {
                const isTeamFilter = !["all","brazil","big"].includes(filter);
                if (filter === "brazil" && !GROUP_TEAMS[g].includes("Brasil")) return null;
                if (filter === "big" && !GM.filter(m => m.g === g).some(m => isBigMatch(m.h, m.a))) return null;
                if (isTeamFilter && !GROUP_TEAMS[g].includes(filter)) return null;
                return (
                  <GroupCard
                    key={g} group={g} standings={allSt[g]} scores={scores}
                    onScore={updScore} expanded={expandedRows} onToggle={toggleRow}
                    complete={groupComplete(g)} isDesk={isDesk} filter={filter}
                  />
                );
              })}
            </div>
          )}

          {subTab === "matamata" && (
            <div style={{ padding: pad }}>
              <BracketView allSt={allSt} qt={qt} koScores={koScores} onKoScore={updKo} isDesk={isDesk} isWide={isWide} filter={filter} />
            </div>
          )}
        </>
      )}

      {/* ── CALENDÁRIO ────────────────────────────────── */}
      {mainTab === "calendario" && (
        <div style={{ padding: pad }}>
          <CalendarView scores={scores} koScores={koScores} allSt={allSt} qt={qt} isDesk={isDesk} isWide={isWide} filter={filter} />
        </div>
      )}

      {/* ── BOLÃO ─────────────────────────────────────── */}
      {mainTab === "bolao" && (
        <div style={{ padding: pad }}>
          <BolaoMaker scores={scores} koScores={koScores} allSt={allSt} qt={qt} isDesk={isDesk} />
        </div>
      )}
    </div>
  );
}
