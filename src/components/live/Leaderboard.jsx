import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";

function calcPoints(pred, official) {
  if (!pred || official.h == null || official.a == null) return null;
  const ph = pred.home_score, pa = pred.away_score;
  const oh = official.h, oa = official.a;
  if (ph === oh && pa === oa) return 3;
  const predWinner = ph > pa ? "h" : ph < pa ? "a" : "d";
  const realWinner = oh > oa ? "h" : oh < oa ? "a" : "d";
  if (predWinner === realWinner) return 1;
  return 0;
}

export default function Leaderboard({ group }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [group]);

  async function fetchData() {
    setLoading(true);
    const [{ data: members }, { data: predictions }, { data: matches }] = await Promise.all([
      supabase.from("group_members").select("user_id, profiles(display_name)").eq("group_id", group.id),
      supabase.from("predictions").select("*").eq("group_id", group.id),
      supabase.from("matches").select("id, home_score_official, away_score_official").eq("stage", "group"),
    ]);

    const officialMap = {};
    (matches ?? []).forEach(m => { officialMap[m.id] = { h: m.home_score_official, a: m.away_score_official }; });

    const ranked = (members ?? []).map(member => {
      const userPreds = (predictions ?? []).filter(p => p.user_id === member.user_id);
      let pts = 0, exact = 0, correct = 0;
      userPreds.forEach(p => {
        const official = officialMap[p.match_id];
        if (!official) return;
        const result = calcPoints(p, official);
        if (result === 3) { pts += 3; exact++; correct++; }
        else if (result === 1) { pts += 1; correct++; }
      });
      return {
        userId: member.user_id,
        name: member.profiles?.display_name ?? "Usuário",
        pts, exact, correct,
        preds: userPreds.length,
        isMe: member.user_id === user.id,
      };
    }).sort((a, b) => b.pts - a.pts || b.exact - a.exact);

    setRows(ranked);
    setLoading(false);
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 17, color: "var(--t1)", marginBottom: 4 }}>Ranking</div>
      <div style={{ color: "var(--t3)", fontSize: 12, marginBottom: 20 }}>
        3 pts placar exato · 1 pt resultado certo
      </div>

      {loading ? (
        <div style={{ color: "var(--t3)", textAlign: "center", padding: 40 }}>Carregando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row, i) => (
            <div key={row.userId} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 16px", borderRadius: 12,
              background: row.isMe ? "rgba(240,201,58,0.07)" : "var(--bg-card)",
              border: `1px solid ${row.isMe ? "rgba(240,201,58,0.3)" : "var(--border)"}`,
            }}>
              <div style={{ width: 28, textAlign: "center", fontSize: i < 3 ? 20 : 14, color: "var(--t3)", fontWeight: 700 }}>
                {i < 3 ? medals[i] : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: row.isMe ? "var(--gold)" : "var(--t1)", fontSize: 14 }}>
                  {row.name}{row.isMe && " (você)"}
                </div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                  {row.preds} palpites · {row.exact} exatos · {row.correct} certos
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 22, color: i === 0 ? "var(--gold)" : "var(--t1)" }}>{row.pts}</div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
