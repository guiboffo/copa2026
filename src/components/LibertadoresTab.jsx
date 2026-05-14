import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

const TOURNAMENT_NAMES = {
  384: "Copa Libertadores",
  480: "Copa Sudamericana",
  373: "Copa do Brasil",
};

function LiveCard({ e }) {
  const isLive = e.status === "inprogress";
  const isFinished = e.status === "finished";
  const hasScore = e.homeScore != null;

  return (
    <div style={{
      background: isLive ? "rgba(34,197,94,0.06)" : "var(--bg-card)",
      border: `1px solid ${isLive ? "rgba(34,197,94,0.35)" : "var(--border)"}`,
      borderRadius: 12, padding: "12px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isLive && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: isLive ? "var(--green)" : "var(--t3)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {isLive ? (e.minute ? `${e.minute}'` : "Ao vivo") : isFinished ? "Encerrado" : "Agendado"}
          </span>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>· {TOURNAMENT_NAMES[e.tournamentId] ?? e.tournament}</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>
          {e.startTimestamp ? new Date(e.startTimestamp * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", textAlign: "right" }}>{e.homeTeam}</span>
          <img src={`https://img.sofascore.com/api/v1/team/${e.homeTeamId}/image`} alt=""
            style={{ width: 26, height: 26, objectFit: "contain" }} onError={ev => { ev.target.style.display = "none"; }} />
        </div>
        <div style={{
          minWidth: 68, textAlign: "center",
          background: hasScore ? "rgba(240,201,58,0.08)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${hasScore ? "rgba(240,201,58,0.2)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 8, padding: "5px 8px",
        }}>
          {hasScore
            ? <span style={{ fontSize: 20, fontWeight: 900, color: "var(--t1)", letterSpacing: 2 }}>{e.homeScore} <span style={{ color: "var(--t3)" }}>–</span> {e.awayScore}</span>
            : <span style={{ fontSize: 13, color: "var(--t3)", fontWeight: 700 }}>vs</span>
          }
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <img src={`https://img.sofascore.com/api/v1/team/${e.awayTeamId}/image`} alt=""
            style={{ width: 26, height: 26, objectFit: "contain" }} onError={ev => { ev.target.style.display = "none"; }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{e.awayTeam}</span>
        </div>
      </div>
    </div>
  );
}

function LiveSection() {
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  async function fetchLive() {
    try {
      const res = await fetch("/api/live");
      const data = await res.json();
      if (data.ok) {
        setEvents(data.events);
        setLastUpdate(new Date());
      }
    } catch {}
  }

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 60000); // atualiza a cada 60s
    return () => clearInterval(intervalRef.current);
  }, []);

  const live = events.filter(e => e.status === "inprogress");
  const today = events.filter(e => e.status !== "inprogress");

  if (events.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--green)", textTransform: "uppercase", letterSpacing: 1 }}>
            Ao vivo {live.length > 0 ? `· ${live.length} jogos` : ""}
          </span>
        </div>
        {lastUpdate && (
          <span style={{ fontSize: 11, color: "var(--t3)" }}>
            Atualizado às {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...live, ...today].map(e => <LiveCard key={e.id} e={e} />)}
      </div>
    </div>
  );
}

const STATUS_LABEL = {
  pre:  { label: "Agendado",  color: "var(--t3)" },
  in:   { label: "AO VIVO",   color: "var(--green)" },
  post: { label: "Encerrado", color: "var(--t3)" },
};

function MatchCard({ m }) {
  const st = STATUS_LABEL[m.status] ?? STATUS_LABEL.pre;
  const isLive = m.status === "in";
  const hasScore = m.home_score != null && m.away_score != null;

  const dateLabel = m.match_date
    ? new Date(m.match_date).toLocaleString("pt-BR", {
        weekday: "short", day: "2-digit", month: "2-digit",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${isLive ? "rgba(34,197,94,0.35)" : "var(--border)"}`,
      borderRadius: 12, padding: "14px 16px",
      boxShadow: isLive ? "0 0 16px rgba(34,197,94,0.08)" : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isLive && (
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: st.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {isLive ? (m.status_detail || "Ao vivo") : st.label}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>{dateLabel}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", textAlign: "right" }}>{m.home_team}</span>
          {m.home_logo && (
            <img src={m.home_logo} alt={m.home_team}
              style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }}
              onError={e => { e.target.style.display = "none"; }} />
          )}
        </div>

        <div style={{
          minWidth: 72, textAlign: "center",
          background: hasScore ? "rgba(240,201,58,0.07)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${hasScore ? "rgba(240,201,58,0.2)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 8, padding: "6px 10px",
        }}>
          {hasScore ? (
            <span style={{ fontSize: 20, fontWeight: 900, color: "var(--t1)", letterSpacing: 2 }}>
              {m.home_score} <span style={{ color: "var(--t3)" }}>–</span> {m.away_score}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: "var(--t3)", fontWeight: 700 }}>vs</span>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          {m.away_logo && (
            <img src={m.away_logo} alt={m.away_team}
              style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }}
              onError={e => { e.target.style.display = "none"; }} />
          )}
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{m.away_team}</span>
        </div>
      </div>

      {m.venue && (
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--t3)", textAlign: "center" }}>
          {m.venue}
        </div>
      )}
    </div>
  );
}

export default function LibertadoresTab() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchLeagues(); }, []);
  useEffect(() => { if (selectedLeague) fetchMatches(selectedLeague); }, [selectedLeague]);

  async function fetchLeagues() {
    const { data } = await supabase
      .from("leagues")
      .select("*, seasons(id, year, label, is_current)")
      .eq("is_active", true)
      .order("id");
    setLeagues(data ?? []);
    // Seleciona Libertadores por padrão
    const lib = data?.find(l => l.slug === "conmebol.libertadores");
    if (lib) setSelectedLeague(lib);
  }

  async function fetchMatches(league) {
    setLoading(true);
    const currentSeason = league.seasons?.find(s => s.is_current) ?? league.seasons?.[0];
    if (!currentSeason) { setMatches([]); setLoading(false); return; }

    const { data } = await supabase
      .from("league_matches")
      .select("*")
      .eq("season_id", currentSeason.id)
      .order("match_date", { ascending: true });
    setMatches(data ?? []);
    setLoading(false);
  }

  async function syncNow() {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync-sports");
      const json = await res.json();
      setLastSync(`${json.synced} partidas atualizadas`);
      if (selectedLeague) await fetchMatches(selectedLeague);
    } catch {
      setLastSync("Erro ao sincronizar");
    }
    setSyncing(false);
  }

  const filtered = matches.filter(m => {
    if (filter === "live")     return m.status === "in";
    if (filter === "today") {
      return m.match_date &&
        new Date(m.match_date).toDateString() === new Date().toDateString();
    }
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

  const liveCount = matches.filter(m => m.status === "in").length;

  return (
    <div>
      {/* Seletor de liga */}
      {leagues.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {leagues.map(l => (
            <button key={l.id}
              onClick={() => { setSelectedLeague(l); setFilter("all"); }}
              className={`chip${selectedLeague?.id === l.id ? " active" : ""}`}
              style={selectedLeague?.id === l.id
                ? { background: "rgba(240,201,58,0.12)", borderColor: "rgba(240,201,58,0.4)", color: "var(--gold)" }
                : {}}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "var(--t1)", display: "flex", alignItems: "center", gap: 8 }}>
            🏆 {selectedLeague?.name ?? "Ligas"}
            {liveCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "2px 8px" }}>
                {liveCount} ao vivo
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>
            Via ESPN · {lastSync ?? "Sincroniza a cada hora"}
          </div>
        </div>
        <button className="btn btn-outline" onClick={syncNow} disabled={syncing}
          style={{ fontSize: 12, padding: "7px 14px" }}>
          {syncing ? "Buscando..." : "⟳ Atualizar"}
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {[["all","Todos"],["live","Ao vivo"],["today","Hoje"],["upcoming","Próximos"],["done","Encerrados"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`chip${filter === val ? " active" : ""}`}
            style={filter === val ? { background: "rgba(240,201,58,0.12)", borderColor: "rgba(240,201,58,0.4)", color: "var(--gold)" } : {}}
          >{label}</button>
        ))}
      </div>

      {/* AO VIVO — direto da API, sem banco */}
      <LiveSection />

      {/* Partidas */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--t3)" }}>Carregando...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--t3)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Nenhum jogo encontrado</div>
          <div style={{ fontSize: 13 }}>Clique em "Atualizar" para buscar dados da ESPN</div>
        </div>
      ) : (
        Object.entries(grouped).map(([date, dayMatches]) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: "var(--t3)",
              textTransform: "uppercase", letterSpacing: 1,
              marginBottom: 10, paddingBottom: 6,
              borderBottom: "1px solid var(--border)",
            }}>
              {date}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dayMatches.map(m => <MatchCard key={m.id} m={m} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
