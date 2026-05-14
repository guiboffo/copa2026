import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import AuthModal from "./AuthModal";
import GroupManager from "./GroupManager";
import PredictionsPanel from "./PredictionsPanel";
import BracketPicker from "./BracketPicker";
import Leaderboard from "./Leaderboard";

export default function LiveBolao({ isDesk }) {
  const { user, profile, signOut, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tab, setTab] = useState("palpites");

  if (loading) {
    return <div style={{ textAlign: "center", padding: 60, color: "var(--t3)" }}>Carregando...</div>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "48px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: "var(--t1)", marginBottom: 8 }}>Bolão Live</div>
        <div style={{ color: "var(--t3)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Crie ou entre em um grupo, faça seus palpites e compita com amigos em tempo real.
        </div>
        <button className="btn btn-primary" style={{ padding: "12px 32px", fontSize: 15 }} onClick={() => setShowAuth(true)}>
          Entrar / Cadastrar
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  return (
    <div>
      {/* Header do usuário */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "10px 16px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--blue))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 14, color: "#000",
          }}>
            {(profile?.display_name ?? user.email)[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>{profile?.display_name ?? user.email}</div>
            <div style={{ fontSize: 11, color: "var(--t3)" }}>Bolão Live</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {selectedGroup && (
            <button className="btn btn-outline" style={{ fontSize: 12, padding: "5px 12px" }}
              onClick={() => { setSelectedGroup(null); setTab("palpites"); }}>
              ← Grupos
            </button>
          )}
          <button className="btn btn-outline" style={{ fontSize: 12, padding: "5px 12px" }} onClick={signOut}>
            Sair
          </button>
        </div>
      </div>

      {!selectedGroup ? (
        <GroupManager onGroupSelect={g => { setSelectedGroup(g); setTab("palpites"); }} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {[["palpites", "Palpites"], ["bracket", "Bracket"], ["ranking", "Ranking"]].map(([val, label]) => (
              <button key={val} onClick={() => setTab(val)}
                className={`sub-tab${tab === val ? " active" : ""}`}
              >{label}</button>
            ))}
          </div>
          {tab === "palpites"  && <PredictionsPanel group={selectedGroup} />}
          {tab === "bracket"   && <BracketPicker group={selectedGroup} />}
          {tab === "ranking"   && <Leaderboard group={selectedGroup} />}
        </>
      )}
    </div>
  );
}
