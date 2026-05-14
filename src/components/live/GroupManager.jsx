import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";

export default function GroupManager({ onGroupSelect }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [mode, setMode] = useState(null); // "create" | "join"
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  async function fetchGroups() {
    const { data } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name, invite_code, owner_id)")
      .eq("user_id", user.id);
    setGroups(data?.map(d => d.groups) ?? []);
  }

  async function createGroup() {
    if (!groupName.trim()) { setError("Digite um nome para o grupo."); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase
      .from("groups")
      .insert({ name: groupName.trim(), owner_id: user.id })
      .select()
      .single();
    if (err) { setError(err.message); setLoading(false); return; }
    await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id });
    setGroupName(""); setMode(null);
    await fetchGroups();
    setLoading(false);
  }

  async function joinGroup() {
    if (!inviteCode.trim()) { setError("Digite o código do grupo."); return; }
    setLoading(true); setError("");
    const { data: group, error: err } = await supabase
      .from("groups")
      .select("id, name")
      .eq("invite_code", inviteCode.trim().toLowerCase())
      .single();
    if (err || !group) { setError("Código inválido. Verifique e tente novamente."); setLoading(false); return; }
    const { error: joinErr } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: user.id });
    if (joinErr && joinErr.code !== "23505") { setError(joinErr.message); setLoading(false); return; }
    setInviteCode(""); setMode(null);
    await fetchGroups();
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: "var(--t1)", marginBottom: 4 }}>Meus Grupos</div>
      <div style={{ color: "var(--t3)", fontSize: 13, marginBottom: 20 }}>Entre em um grupo para competir com amigos</div>

      {groups.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {groups.map(g => (
            <button key={g.id} onClick={() => onGroupSelect(g)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left",
                transition: "border-color .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div>
                <div style={{ fontWeight: 700, color: "var(--t1)", fontSize: 15 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>
                  Código: <span style={{ color: "var(--gold)", fontFamily: "monospace", letterSpacing: 1 }}>{g.invite_code}</span>
                  {g.owner_id === user.id && <span style={{ marginLeft: 8, color: "var(--green)" }}>• Dono</span>}
                </div>
              </div>
              <span style={{ color: "var(--t3)", fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      )}

      {mode === null && (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setMode("create"); setError(""); }}>
            + Criar grupo
          </button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setMode("join"); setError(""); }}>
            Entrar com código
          </button>
        </div>
      )}

      {mode === "create" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>Novo grupo</div>
          <input className="input" placeholder="Nome do grupo" value={groupName}
            onChange={e => setGroupName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createGroup()}
            style={{ marginBottom: 10, width: "100%", boxSizing: "border-box" }}
          />
          {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={createGroup} disabled={loading}>
              {loading ? "Criando..." : "Criar"}
            </button>
            <button className="btn btn-outline" onClick={() => { setMode(null); setError(""); }}>Cancelar</button>
          </div>
        </div>
      )}

      {mode === "join" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>Entrar em grupo</div>
          <input className="input" placeholder="Código do grupo (ex: a3f9b2c1)" value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && joinGroup()}
            style={{ marginBottom: 10, width: "100%", boxSizing: "border-box" }}
          />
          {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={joinGroup} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <button className="btn btn-outline" onClick={() => { setMode(null); setError(""); }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
