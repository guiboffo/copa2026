const BASE = "https://sportapi7.p.rapidapi.com/api/v1";
const HEADERS = {
  "x-rapidapi-key":  process.env.RAPIDAPI_KEY,
  "x-rapidapi-host": "sportapi7.p.rapidapi.com",
};

// IDs dos torneios suportados
const SUPPORTED_IDS = new Set([384, 480, 373]); // Libertadores, Sudamericana, Copa do Brasil

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const today = new Date().toISOString().slice(0, 10);

  try {
    const r = await fetch(`${BASE}/sport/football/scheduled-events/${today}`, { headers: HEADERS });
    if (!r.ok) throw new Error(`SportAPI7 ${r.status}`);
    const data = await r.json();

    const events = (data.events ?? [])
      .filter(e => SUPPORTED_IDS.has(e.tournament?.uniqueTournament?.id))
      .map(e => ({
        id:            e.id,
        tournamentId:  e.tournament?.uniqueTournament?.id,
        tournament:    e.tournament?.name,
        homeTeam:      e.homeTeam?.name,
        awayTeam:      e.awayTeam?.name,
        homeTeamId:    e.homeTeam?.id,
        awayTeamId:    e.awayTeam?.id,
        homeScore:     e.homeScore?.current ?? null,
        awayScore:     e.awayScore?.current ?? null,
        status:        e.status?.type,
        statusLabel:   e.status?.description,
        minute:        e.status?.type === "inprogress" ? (e.time?.played ?? null) : null,
        startTimestamp: e.startTimestamp,
      }));

    return res.status(200).json({ ok: true, events, timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
