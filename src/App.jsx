import { useState, useMemo, useEffect, useCallback } from "react";
import "./styles.css";

import { useWidth } from "./hooks/useWidth.js";
import { GROUPS_LIST, GROUP_TEAMS, isBigMatch } from "./data/teams.js";
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
    if (window.confirm("Apagar todos os resultados? Isso não afeta seu bolão.")) {
      setScores({}); setKoScores({});
    }
  };

  const pad = isDesk ? "20px 28px 60px" : "12px 10px 50px";
  const maxW = isWide ? 1280 : isDesk ? 960 : "100%";

  const MAIN_TABS = [
    { id: "tabela",    label: "Tabela"    },
    { id: "calendario",label: "Calendário"},
    { id: "bolao",     label: "Bolão"     },
  ];

  const FILTER_OPTIONS = [
    { id: "all",    label: "Todos",        emoji: "",   color: "#718096" },
    { id: "brazil", label: "Brasil",       emoji: "🇧🇷", color: "#48bb78" },
    { id: "big",    label: "Jogos Grandes",emoji: "🔥", color: "#ed8936" },
  ];

  return (
    <div style={{ fontFamily: "var(--font-body)", background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)", maxWidth: maxW, margin: "0 auto" }}>

      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header style={{ background: "linear-gradient(135deg, #141b2d, #0f1319)", borderBottom: "2px solid var(--accent)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isDesk ? "14px 32px" : "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isDesk ? 14 : 10 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: isDesk ? 12 : 10, letterSpacing: 2, color: "#0f1319", background: "var(--accent)", padding: isDesk ? "5px 12px" : "4px 8px", borderRadius: 5 }}>
              FIFA 26
            </span>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: isDesk ? 24 : 17, fontWeight: 800, margin: 0, color: "#fff", lineHeight: 1.1 }}>
                Copa do Mundo
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: isDesk ? 11 : 9, color: "var(--text-muted)", margin: 0, marginTop: 1 }}>
                🇺🇸 🇲🇽 🇨🇦 · Simulador Interativo · Horários de Brasília
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: isDesk ? 12 : 10, fontWeight: 600, color: "var(--green)", background: "var(--green-dim)", padding: "4px 10px", borderRadius: 20 }}>
              {gc}/12 grupos
            </span>
            <button
              onClick={resetAll}
              title="Resetar resultados"
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", transition: "var(--transition)" }}
            >
              ↺
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN TABS ───────────────────────────────────────────── */}
      <nav style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", background: "#141b2d" }}>
        {MAIN_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setMainTab(t.id)}
            className={`main-tab-btn${mainTab === t.id ? " active" : ""}`}
            style={{ padding: isDesk ? "13px 0" : "11px 0", fontSize: isDesk ? 14 : 12, color: mainTab === t.id ? "var(--accent)" : "var(--text-muted)" }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ─── FILTER BAR (shown on tabela + calendario) ───────────── */}
      {mainTab !== "bolao" && (
        <div style={{ display: "flex", gap: 6, padding: isDesk ? "9px 28px" : "7px 12px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)", overflowX: "auto" }}>
          {FILTER_OPTIONS.map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(filter === f.id && f.id !== "all" ? "all" : f.id)}
                className="filter-chip"
                style={{
                  padding: isDesk ? "6px 14px" : "5px 11px",
                  border: active ? `1.5px solid ${f.color}` : "1.5px solid var(--border)",
                  background: active ? f.color + "18" : "transparent",
                  color: active ? f.color : "var(--text-muted)",
                  fontWeight: active ? 700 : 500,
                  fontSize: isDesk ? 12 : 11,
                }}
              >
                {f.emoji && <span>{f.emoji}</span>}{f.label}
              </button>
            );
          })}
          {filter === "big" && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-dim)", alignSelf: "center", flexShrink: 0 }}>
              Top 20 FIFA vs Top 20
            </span>
          )}
        </div>
      )}

      {/* ─── TABELA ──────────────────────────────────────────────── */}
      {mainTab === "tabela" && (
        <>
          <div style={{ display: "flex", background: "var(--bg-base)", borderBottom: "1px solid var(--border-subtle)" }}>
            {[{ id: "grupos", label: "Fase de Grupos" }, { id: "matamata", label: "Mata-mata" }].map(s => (
              <button
                key={s.id}
                onClick={() => setSubTab(s.id)}
                className={`sub-tab-btn${subTab === s.id ? " active" : ""}`}
                style={{ padding: isDesk ? "10px 0" : "9px 0", fontSize: isDesk ? 13 : 12, color: subTab === s.id ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {subTab === "grupos" && (
            <div style={{ padding: pad, display: isDesk ? "grid" : "block", gridTemplateColumns: isWide ? "1fr 1fr" : "1fr 1fr", gap: isDesk ? 18 : 0 }}>
              {GROUPS_LIST.map(g => {
                if (filter === "brazil" && !GROUP_TEAMS[g].includes("Brasil")) return null;
                if (filter === "big") {
                  const hasAny = GM.filter(m => m.g === g).some(m => isBigMatch(m.h, m.a));
                  if (!hasAny) return null;
                }
                return (
                  <GroupCard
                    key={g}
                    group={g}
                    standings={allSt[g]}
                    scores={scores}
                    onScore={updScore}
                    expanded={expandedRows}
                    onToggle={toggleRow}
                    complete={groupComplete(g)}
                    isDesk={isDesk}
                    filter={filter}
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

      {/* ─── CALENDÁRIO ──────────────────────────────────────────── */}
      {mainTab === "calendario" && (
        <div style={{ padding: pad }}>
          <CalendarView scores={scores} koScores={koScores} allSt={allSt} qt={qt} isDesk={isDesk} isWide={isWide} filter={filter} />
        </div>
      )}

      {/* ─── BOLÃO ───────────────────────────────────────────────── */}
      {mainTab === "bolao" && (
        <div style={{ padding: pad }}>
          <BolaoMaker scores={scores} koScores={koScores} allSt={allSt} qt={qt} isDesk={isDesk} />
        </div>
      )}
    </div>
  );
}
