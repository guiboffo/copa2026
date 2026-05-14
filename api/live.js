// Ao vivo via ESPN (grátis, sem chave, sem limite)
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";

const LEAGUE_SLUGS = [
  { tournamentId: 384, slug: "conmebol.libertadores", name: "Copa Libertadores" },
  { tournamentId: 480, slug: "conmebol.sudamericana", name: "Copa Sudamericana" },
];

function parseESPN(events, tournamentId) {
  return events.map(event => {
    const comp = event.competitions?.[0];
    if (!comp) return null;

    const ht = comp.competitors?.find(c => c.homeAway === "home");
    const at = comp.competitors?.find(c => c.homeAway === "away");
    if (!ht || !at) return null;

    const state     = comp.status?.type?.state ?? "pre";
    const completed = comp.status?.type?.completed ?? false;
    const status    = completed ? "finished" : state === "in" ? "inprogress" : "notstarted";
    const hasScore  = completed || state === "in";

    return {
      id:             event.id,
      tournamentId,
      homeTeam:       ht.team?.displayName ?? "",
      awayTeam:       at.team?.displayName ?? "",
      homeTeamId:     null,
      awayTeamId:     null,
      homeLogo:       ht.team?.logo ?? null,
      awayLogo:       at.team?.logo ?? null,
      homeScore:      hasScore ? parseInt(ht.score) || 0 : null,
      awayScore:      hasScore ? parseInt(at.score) || 0 : null,
      status,
      statusLabel:    comp.status?.type?.description ?? "",
      minute:         null,
      startTimestamp: event.date ? Math.floor(new Date(event.date).getTime() / 1000) : null,
    };
  }).filter(Boolean);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const results = await Promise.all(
      LEAGUE_SLUGS.map(async ({ tournamentId, slug }) => {
        const r = await fetch(`${ESPN_BASE}/${slug}/scoreboard`);
        if (!r.ok) return [];
        const data = await r.json();
        return parseESPN(data.events ?? [], tournamentId);
      })
    );

    const events = results.flat();
    return res.status(200).json({ ok: true, events, timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
