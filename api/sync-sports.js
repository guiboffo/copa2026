import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE = "https://sportapi7.p.rapidapi.com/api/v1";
const HEADERS = {
  "x-rapidapi-key":  process.env.RAPIDAPI_KEY,
  "x-rapidapi-host": "sportapi7.p.rapidapi.com",
};

function dateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function fetchDay(date) {
  const res = await fetch(`${BASE}/sport/football/scheduled-events/${date}`, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return data.events ?? [];
}

function parseEvent(ev, seasonId) {
  const statusType = ev.status?.type ?? "notstarted";
  const status =
    statusType === "finished"    ? "post" :
    statusType === "inprogress"  ? "in"   : "pre";

  const hasScore = status !== "pre";

  return {
    external_id:   String(ev.id),
    season_id:     seasonId,
    home_team:     ev.homeTeam?.name ?? "",
    away_team:     ev.awayTeam?.name ?? "",
    home_logo:     `https://img.sofascore.com/api/v1/team/${ev.homeTeam?.id}/image`,
    away_logo:     `https://img.sofascore.com/api/v1/team/${ev.awayTeam?.id}/image`,
    home_score:    hasScore ? (ev.homeScore?.current ?? null) : null,
    away_score:    hasScore ? (ev.awayScore?.current ?? null) : null,
    status,
    status_detail: ev.status?.description ?? null,
    match_date:    ev.startTimestamp ? new Date(ev.startTimestamp * 1000).toISOString() : null,
    venue:         ev.venue?.stadium?.name ?? null,
    updated_at:    new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Busca ligas ativas com seus IDs
    const { data: seasons } = await supabase
      .from("seasons")
      .select("id, sport_api_season_id, leagues(sport_api_id)")
      .eq("is_current", true)
      .not("sport_api_season_id", "is", null);

    // Monta mapa: tournamentId → supabase season_id
    const tidMap = {};
    for (const s of seasons ?? []) {
      const tid = s.leagues?.sport_api_id;
      if (tid) tidMap[tid] = s.id;
    }

    if (Object.keys(tidMap).length === 0) {
      return res.status(200).json({ ok: true, synced: 0, message: "Nenhuma liga configurada" });
    }

    // Busca -1 até +3 dias (4 requests)
    const offsets = [-1, 0, 1, 2, 3];
    const seen = new Set();
    const rows = [];

    for (const offset of offsets) {
      const events = await fetchDay(dateStr(offset));
      for (const ev of events) {
        const tid = ev.tournament?.uniqueTournament?.id;
        const seasonId = tidMap[tid];
        if (!seasonId || seen.has(ev.id)) continue;
        seen.add(ev.id);
        rows.push(parseEvent(ev, seasonId));
      }
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from("league_matches")
        .upsert(rows, { onConflict: "external_id,season_id" });
      if (error) throw error;
    }

    return res.status(200).json({ ok: true, synced: rows.length, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("sync-sports error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
