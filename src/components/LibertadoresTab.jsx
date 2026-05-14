import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const LEAGUES = [
  { id: 384, name: "Libertadores",  supabaseSeasonId: 2 },
  { id: 480, name: "Sudamericana",  supabaseSeasonId: 3 },
  { id: 373, name: "Copa do Brasil", supabaseSeasonId: null },
];

// Cronômetro calculado pelo horário de início
function useMatchMinute(startTimestamp, isLive) {
  const [minute, setMinute] = useState(null);
  useEffect(() => {
    if (!isLive || !startTimestamp) { setMinute(null); return; }
    const calc = () => {
      const elapsed = Math.floor((Date.now() / 1000 - startTimestamp) / 60);
      // Desconta ~15min de intervalo se passou da metade
      const adj = elapsed > 45 ? Math.max(45, elapsed - 15) : elapsed;
      setMinute(Math.min(adj, 90));
    };
    calc();
    const t = setInterval(calc, 30000);
    return () => clearInterval(t);
  }, [startTimestamp, isLive]);
  return minute;
}

// Avatar de time quando logo não carrega
function TeamLogo({ teamId, teamName, size = 26 }) {
  const [err, setErr] = useState(false);
  const initials = (teamName ?? "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  if (err || !teamId) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--blue), var(--t3))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.35, fontWeight: 800, color: "#fff",
      }}>{initials}</div>
    );
  }
  return (
    <img
      src={`https://img.sofascore.com/api/v1/team/${teamId}/image`}
      alt={teamName}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
      onError={() => setErr(true)}
    />
  );
}

function LiveCard({ e }) {
  const isLive = e.status === "inprogress";
  const isFinished = e.status === "finished";
  const minute = useMatchMinute(e.startTimestamp, isLive);
  const hasScore = e.homeScore != null;
  const league = LEAGUES.find(l => l.id === e.tournamentId);

  const timeLabel = isLive
    ? (minute != null ? `${minute}'` : "Ao vivo")
    : isFinished ? "Encerrado"
    : e.startTimestamp
      ? new Date(e.startTimestamp * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "Agendado";

  return (
    <div style={{
      background: isLive ? "rgba(34,197,94,0.05)" : "var(--bg-card)",
      border: `1px solid ${isLive ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
      borderRadius: 12, padding: "12px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isLive && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: isLive ? "var(--green)" : "var(--t3)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {timeLabel}
          </span>
          {league && <span style={{ fontSize: 11, color: "var(--t3)" }}>· {league.name}</span>}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {e.homeTeam}
          </span>
          <TeamLogo teamId={e.homeTeamId} teamName={e.homeTeam} />
        </div>

        <div style={{
          minWidth: 66, textAlign: "center", flexShrink: 0,
          background: hasScore ? "rgba(240,201,58,0.08)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${hasScore ? "rgba(240,201,58,0.2)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 8, padding: "5px 8px",
        }}>
          {hasScore
            ? <span style={{ fontSize: 19, fontWeight: 900, color: "var(--t1)", letterSpacing: 2 }}>
                {e.homeScore}<span style={{ color: "var(--t3)", margin: "0 2px" }}>–</span>{e.awayScore}
              </span>
            : <span style={{ fontSize: 13, color: "var(--t3)", fontWeight: 700 }}>vs</span>
          }
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <TeamLogo teamId={e.awayTeamId} teamName={e.awayTeam} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {e.awayTeam}
          </span>
        </div>
      </div>
    </div>
  );
}

// Seção ao vivo — busca direto da API, sem banco, auto-refresh 60s
function LiveSection({ activeTournamentId }) {
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  async function fetchLive(manual = false) {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/live");
      const data = await res.json();
      if (data.ok) { setEvents(data.events); setLastUpdate(new Date()); }
    } catch {}
    setLoading(false);
    if (manual) setRefreshing(false);
  }

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(() => fetchLive(), 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Mostra todos os jogos de hoje da liga ativa (ao vivo + agendados + encerrados)
  const filtered = events.filter(e => e.tournamentId === activeTournamentId);
  const live   = filtered.filter(e => e.status === "inprogress");
  const others = filtered.filter(e => e.status !== "inprogress");
  const all    = [...live, ...others];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {live.length > 0 && (
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
          )}
          <span style={{ fontWeight: 700, fontSize: 12, color: live.length > 0 ? "var(--green)" : "var(--t2)", textTransform: "uppercase", letterSpacing: 1 }}>
            {loading ? "Buscando..." : live.length > 0 ? `${live.length} ao vivo agora` : "Jogos de hoje"}
          </span>
          {lastUpdate && (
            <span style={{ fontSize: 11, color: "var(--t3)" }}>
              · {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
        <button
          className="btn btn-outline"
          onClick={() => fetchLive(true)}
          disabled={refreshing}
          style={{ fontSize: 11, padding: "4px 10px" }}
        >
          {refreshing ? "..." : "⟳ Atualizar"}
        </button>
      </div>

      {!loading && all.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--t3)", padding: "12px 0" }}>
          Nenhum jogo hoje nesta liga.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {all.map(e => <LiveCard key={e.id} e={e} />)}
        </div>
      )}
    </div>
  );
}

// Card de partida do banco (histórico/agendados)
function MatchCard({ m }) {
  const isLive = m.status === "in";
  const hasScore = m.home_score != null;
  const dateLabel = m.match_date
    ? new Date(m.match_date).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "12px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {m.status === "post" ? "Encerrado" : m.status === "in" ? "Ao vivo" : "Agendado"}
        </span>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>{dateLabel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", textAlign: "right" }}>{m.home_team}</span>
          <TeamLogo teamId={null} teamName={m.home_team} />
        </div>
        <div style={{
          minWidth: 66, textAlign: "center", flexShrink: 0,
          background: hasScore ? "rgba(240,201,58,0.08)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${hasScore ? "rgba(240,201,58,0.2)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 8, padding: "5px 8px",
        }}>
          {hasScore
            ? <span style={{ fontSize: 19, fontWeight: 900, color: "var(--t1)", letterSpacing: 2 }}>
                {m.home_score}<span style={{ color: "var(--t3)", margin: "0 2px" }}>–</span>{m.away_score}
              </span>
            : <span style={{ fontSize: 13, color: "var(--t3)", fontWeight: 700 }}>vs</span>
          }
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <TeamLogo teamId={null} teamName={m.away_team} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{m.away_team}</span>
        </div>
      </div>
      {m.venue && <div style={{ marginTop: 8, fontSize: 11, color: "var(--t3)", textAlign: "center" }}>{m.venue}</div>}
    </div>
  );
}

export default function JogosTab() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    if (activeLeague.supabaseSeasonId) fetchMatches(activeLeague.supabaseSeasonId);
    else setMatches([]);
  }, [activeLeague]);

  async function fetchMatches(seasonId) {
    setLoading(true);
    const { data } = await supabase
      .from("league_matches")
      .select("*")
      .eq("season_id", seasonId)
      .order("match_date", { ascending: true });
    setMatches(data ?? []);
    setLoading(false);
  }

  const filtered = matches.filter(m => {
    if (filter === "upcoming") return m.status === "pre";
    if (filter === "done")     return m.status === "post";
    return true;
  });

  const grouped = filtered.reduce((acc, m) => {
    const key = m.match_date
      ? new Date(m.match_date).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
      : "Sem data";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div>
      {/* Sub-abas por liga */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {LEAGUES.map(l => (
          <button key={l.id}
            onClick={() => { setActiveLeague(l); setFilter("all"); }}
            className={`chip${activeLeague.id === l.id ? " active" : ""}`}
            style={activeLeague.id === l.id
              ? { background: "rgba(240,201,58,0.12)", borderColor: "rgba(240,201,58,0.4)", color: "var(--gold)" }
              : {}}
          >{l.name}</button>
        ))}
      </div>

      {/* Ao vivo — sempre visível, filtrado pela liga ativa */}
      <LiveSection activeTournamentId={activeLeague.id} />

      {/* Histórico / agendados do banco */}
      {activeLeague.supabaseSeasonId && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["all","Todos"],["upcoming","Próximos"],["done","Encerrados"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`chip${filter === val ? " active" : ""}`}
                style={filter === val ? { background: "rgba(240,201,58,0.12)", borderColor: "rgba(240,201,58,0.4)", color: "var(--gold)" } : {}}
              >{label}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--t3)" }}>Carregando...</div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--t3)" }}>Nenhuma partida encontrada.</div>
          ) : (
            Object.entries(grouped).map(([date, dayMatches]) => (
              <div key={date} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
                  {date}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dayMatches.map(m => <MatchCard key={m.id} m={m} />)}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {!activeLeague.supabaseSeasonId && matches.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--t3)", fontSize: 13 }}>
          Histórico de jogos da Copa do Brasil disponível em breve.
        </div>
      )}
    </div>
  );
}
