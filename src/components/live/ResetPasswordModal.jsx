import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";

export default function ResetPasswordModal() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6)  { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    const { error } = await updatePassword(password);
    if (error) setError(error.message);
    else setDone(true);
    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
    }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 400,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--t1)", marginBottom: 8 }}>Senha atualizada!</div>
            <div style={{ color: "var(--t3)", fontSize: 14 }}>Sua nova senha foi salva com sucesso.</div>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 800, fontSize: 20, color: "var(--t1)", marginBottom: 4 }}>Nova senha</div>
            <div style={{ color: "var(--t3)", fontSize: 13, marginBottom: 24 }}>
              Escolha uma nova senha para sua conta.
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input" type="password" placeholder="Nova senha (mínimo 6 caracteres)"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              <input className="input" type="password" placeholder="Confirmar nova senha"
                value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} />
              {error && <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
