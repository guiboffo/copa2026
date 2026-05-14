import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import { GM } from "../../data/matches";
import { TEAMS } from "../../data/teams";
import Flag from "../Flag";

// Cross-reference banco (match_number) com dados locais (GM index = match_number - 1)
function getLocalMatch(match_number) {
  return GM[match_number - 1] ?? null;
}

function isLocked(matchDate) {
  return matchDate ? new Date() >= new Date(matchDate) : false;
}

function MatchRow({ match, prediction, onSave, locked }) {
  const [h, setH] = useState(prediction?.home_score ?? "");
  const [a, setA] = useState(prediction?.away_score ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setH(prediction?.home_score ?? "");
    setA(prediction?.away_score ?? "");
  }, [prediction]);

  const local = getLocalMatch(match.match_number);
  const homeName = local?.h ?? match.home_team;
  const awayName = local?.a ?? match.away_team;
  const homeShort = TEAMS[homeName]?.short ?? homeName;
  const awayShort = TEAMS[awayName]?.short ?? awayName;

  async function handleSave() {
    if (h === "" || a === "") return;
    setSaving(true);
    await onSave(match.id, parseInt(h), parseInt(a));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    setSaving(false);
  }

  const hasPred = prediction?.home_score != null;
  const changed = String(h) !== String(prediction?.home_score ?? "") || String(a) !== String(prediction?.away_score ?? "");

  const dateStr = match.match_date
    ? new Date(match.match_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 10,
      background: locked ? "rgba(255,255,255,0.02)" : "var(--bg-card)",
      border: `1px solid ${locked ? "rgba(255,255,255,0.05)" : hasPred ? "rgba(240,201,58,0.2)" : "var(--border)"}`,
      opacity: locked ? 0.6 : 1,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
          <Flag team={homeName} size={18} /> {homeShort}
          <span style={{ color: "var(--t3)" }}>vs</span>
          {awayShort} <Flag team={awayName} size={18} />
        </div>
        <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
          Grupo {match.group_name} · {dateStr}
          {locked && <span style={{ marginLeft: 6, color: "var(--red)" }}>🔒 Encerrado</span>}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <input
          type="number" min="0" max="20" disabled={locked}
          value={h} onChange={e => setH(e.target.value.replace(/\D/g, "").slice(0, 2))}
          style={{
            width: 40, textAlign: "center", padding: "5px 4px",
            background: "var(--bg-base)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--t1)", fontSize: 15, fontWeight: 700,
          }}
        />
        <span style={{ color: "var(--t3)", fontWeight: 700 }}>–</span>
        <input
          type="number" min="0" max="20" disabled={locked}
          value={a} onChange={e => setA(e.target.value.replace(/\D/g, "").slice(0, 2))}
          style={{
            width: 40, textAlign: "center", padding: "5px 4px",
            background: "var(--bg-base)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--t1)", fontSize: 15, fontWeight: 700,
          }}
        />
        {!locked && (
          <button
            onClick={handleSave} disabled={saving || h === "" || a === "" || (!changed && hasPred)}
            style={{
              padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: saved ? "var(--green)" : changed && h !== "" && a !== "" ? "var(--gold)" : "rgba(255,255,255,0.06)",
              color: saved ? "#fff" : changed ? "#000" : "var(--t3)",
              fontWeight: 700, fontSize: 12, transition: "all .15s", whiteSpace: "nowrap",
            }}
          >
            {saved ? "✓" : saving ? "..." : hasPred && !changed ? "Salvo" : "Salvar"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PredictionsPanel({ group }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [group]);

  async function fetchData() {
    setLoading(true);
    const [{ data: matchData }, { data: predData }] = await Promise.all([
      supabase.from("matches").select("*").eq("stage", "group").order("match_date"),
      supabase.from("predictions").select("*").eq("user_id", user.id).eq("group_id", group.id),
    ]);
    setMatches(matchData ?? []);
    const predMap = {};
    (predData ?? []).forEach(p => { predMap[p.match_id] = p; });
    setPredictions(predMap);
    setLoading(false);
  }

  async function savePrediction(matchId, homeScore, awayScore) {
    const existing = predictions[matchId];
    if (existing) {
      await supabase.from("predictions")
        .update({ home_score: homeScore, away_score: awayScore })
        .eq("id", existing.id);
      setPredictions(p => ({ ...p, [matchId]: { ...existing, home_score: homeScore, away_score: awayScore } }));
    } else {
      const { data } = await supabase.from("predictions")
        .insert({ user_id: user.id, group_id: group.id, match_id: matchId, home_score: homeScore, away_score: awayScore })
        .select().single();
      if (data) setPredictions(p => ({ ...p, [matchId]: data }));
    }
  }

  const filteredMatches = matches.filter(m => {
    const locked = isLocked(m.match_date);
    const hasPred = predictions[m.id] != null;
    if (filter === "pending") return !locked && !hasPred;
    if (filter === "done") return hasPred;
    if (filter === "locked") return locked;
    return true;
  });

  const total = matches.length;
  const done = Object.keys(predictions).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: "var(--t1)" }}>{group.name}</div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>
            {done}/{total} palpites · Código: <span style={{ color: "var(--gold)", fontFamily: "monospace" }}>{group.invite_code}</span>
          </div>
        </div>
        <div style={{ background: "rgba(240,201,58,0.1)", border: "1px solid rgba(240,201,58,0.25)", borderRadius: 20, padding: "4px 14px" }}>
          <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 13 }}>{Math.round((done / total) * 100)}%</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["pending", "Pendentes"], ["done", "Feitos"], ["locked", "Encerrados"], ["all", "Todos"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`chip${filter === val ? " active" : ""}`}
            style={filter === val ? { background: "rgba(240,201,58,0.12)", borderColor: "rgba(240,201,58,0.4)", color: "var(--gold)" } : {}}
          >{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "var(--t3)", textAlign: "center", padding: 40 }}>Carregando...</div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ color: "var(--t3)", textAlign: "center", padding: 40 }}>
          {filter === "pending" ? "Todos os palpites feitos! 🎯" : "Nenhuma partida aqui."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredMatches.map(m => (
            <MatchRow
              key={m.id}
              match={m}
              prediction={predictions[m.id]}
              onSave={savePrediction}
              locked={isLocked(m.match_date)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
