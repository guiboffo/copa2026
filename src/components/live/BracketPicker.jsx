import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import { GROUPS_LIST, GROUP_TEAMS, TEAMS } from "../../data/teams";
import Flag from "../Flag";

const ALL_TEAMS = GROUPS_LIST.flatMap(g => GROUP_TEAMS[g]);

const SLOTS = [
  { key: "champion",   label: "Campeão",         pts: 10, icon: "🏆" },
  { key: "finalist_1", label: "Finalista 1",      pts: 5,  icon: "🥈" },
  { key: "finalist_2", label: "Finalista 2",      pts: 5,  icon: "🥈" },
  { key: "semi_1",     label: "Semifinalista 1",  pts: 3,  icon: "4️⃣" },
  { key: "semi_2",     label: "Semifinalista 2",  pts: 3,  icon: "4️⃣" },
  { key: "semi_3",     label: "Semifinalista 3",  pts: 3,  icon: "4️⃣" },
  { key: "semi_4",     label: "Semifinalista 4",  pts: 3,  icon: "4️⃣" },
];

function TeamSelect({ value, onChange, exclude = [], disabled }) {
  const team = value ? TEAMS[value] : null;
  return (
    <div style={{ position: "relative" }}>
      <select
        disabled={disabled}
        value={value ?? ""}
        onChange={e => onChange(e.target.value || null)}
        style={{
          width: "100%", padding: "8px 12px", paddingLeft: value ? 36 : 12,
          background: "var(--bg-base)", border: `1px solid ${value ? "rgba(240,201,58,0.4)" : "var(--border)"}`,
          borderRadius: 8, color: value ? "var(--t1)" : "var(--t3)",
          fontSize: 13, fontWeight: value ? 600 : 400, cursor: disabled ? "default" : "pointer",
          appearance: "none", WebkitAppearance: "none",
        }}
      >
        <option value="">Escolher seleção…</option>
        {GROUPS_LIST.map(g => (
          <optgroup key={g} label={`Grupo ${g}`}>
            {GROUP_TEAMS[g].map(t => (
              <option key={t} value={t} disabled={exclude.includes(t) && t !== value}>
                {TEAMS[t]?.short ?? t}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {team && (
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Flag team={value} size={18} />
        </div>
      )}
    </div>
  );
}

export default function BracketPicker({ group }) {
  const { user } = useAuth();
  const [picks, setPicks] = useState({});
  const [existingId, setExistingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPicks(); }, [group]);

  async function fetchPicks() {
    setLoading(true);
    const { data } = await supabase
      .from("bracket_picks")
      .select("*")
      .eq("user_id", user.id)
      .eq("group_id", group.id)
      .maybeSingle();
    if (data) {
      setExistingId(data.id);
      setPicks({
        champion: data.champion,
        finalist_1: data.finalist_1,
        finalist_2: data.finalist_2,
        semi_1: data.semi_1,
        semi_2: data.semi_2,
        semi_3: data.semi_3,
        semi_4: data.semi_4,
      });
    }
    setLoading(false);
  }

  function updatePick(key, val) {
    setPicks(p => ({ ...p, [key]: val }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { user_id: user.id, group_id: group.id, updated_at: new Date().toISOString(), ...picks };
    if (existingId) {
      await supabase.from("bracket_picks").update(payload).eq("id", existingId);
    } else {
      const { data } = await supabase.from("bracket_picks").insert(payload).select().single();
      if (data) setExistingId(data.id);
    }
    setSaved(true);
    setSaving(false);
  }

  const filledCount = SLOTS.filter(s => picks[s.key]).length;
  const allFilled = filledCount === SLOTS.length;
  const usedTeams = SLOTS.map(s => picks[s.key]).filter(Boolean);

  if (loading) return <div style={{ color: "var(--t3)", textAlign: "center", padding: 40 }}>Carregando...</div>;

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: "var(--t1)" }}>Bracket — {group.name}</div>
        <div style={{ color: "var(--t3)", fontSize: 13, marginTop: 4 }}>
          Escolha quem vai chegar longe. Palpites travam quando o mata-mata começa.
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 16, fontSize: 12, color: "var(--t3)" }}>
          <span>🏆 Campeão = <b style={{ color: "var(--gold)" }}>10 pts</b></span>
          <span>🥈 Finalista = <b style={{ color: "var(--gold)" }}>5 pts</b></span>
          <span>4️⃣ Semifinal = <b style={{ color: "var(--gold)" }}>3 pts</b></span>
        </div>
      </div>

      {/* Campeão */}
      <div style={{ background: "rgba(240,201,58,0.06)", border: "1px solid rgba(240,201,58,0.25)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "var(--gold)", fontSize: 13, marginBottom: 8 }}>🏆 Campeão · 10 pts</div>
        <TeamSelect
          value={picks.champion}
          onChange={v => updatePick("champion", v)}
          exclude={usedTeams.filter(t => t !== picks.champion)}
        />
      </div>

      {/* Finalistas */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "var(--t2)", fontSize: 13, marginBottom: 10 }}>🥈 Finalistas · 5 pts cada</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["finalist_1", "finalist_2"].map(key => (
            <TeamSelect
              key={key}
              value={picks[key]}
              onChange={v => updatePick(key, v)}
              exclude={usedTeams.filter(t => t !== picks[key])}
            />
          ))}
        </div>
      </div>

      {/* Semifinalistas */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: "var(--t2)", fontSize: 13, marginBottom: 10 }}>4️⃣ Semifinalistas · 3 pts cada</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["semi_1", "semi_2", "semi_3", "semi_4"].map(key => (
            <TeamSelect
              key={key}
              value={picks[key]}
              onChange={v => updatePick(key, v)}
              exclude={usedTeams.filter(t => t !== picks[key])}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "var(--t3)" }}>
          {filledCount}/{SLOTS.length} preenchidos
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || filledCount === 0}
          style={{ padding: "10px 28px", opacity: filledCount === 0 ? 0.4 : 1 }}
        >
          {saving ? "Salvando..." : saved ? "✓ Salvo!" : "Salvar bracket"}
        </button>
      </div>

      {!allFilled && filledCount > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--t3)", textAlign: "right" }}>
          Você pode salvar parcialmente e completar depois.
        </div>
      )}
    </div>
  );
}
