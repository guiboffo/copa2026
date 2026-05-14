import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else onClose();
    } else {
      if (!name.trim()) { setError("Digite seu nome."); setLoading(false); return; }
      const { error } = await signUp(email, password, name.trim());
      if (error) setError(error.message);
      else setDone(true);
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 400,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }} onClick={e => e.stopPropagation()}>

        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>Confirme seu e-mail</div>
            <div style={{ color: "var(--t3)", fontSize: 14 }}>Enviamos um link de confirmação para <b>{email}</b>. Clique no link e volte para entrar.</div>
            <button className="btn" style={{ marginTop: 20, width: "100%" }} onClick={onClose}>Fechar</button>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 800, fontSize: 20, color: "var(--t1)", marginBottom: 6 }}>
              {mode === "login" ? "Entrar" : "Criar conta"}
            </div>
            <div style={{ color: "var(--t3)", fontSize: 13, marginBottom: 24 }}>
              Bolão Live · Copa do Mundo 2026
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mode === "signup" && (
                <input
                  className="input" placeholder="Seu nome" value={name}
                  onChange={e => setName(e.target.value)} required
                />
              )}
              <input
                className="input" type="email" placeholder="E-mail" value={email}
                onChange={e => setEmail(e.target.value)} required
              />
              <input
                className="input" type="password" placeholder="Senha (mínimo 6 caracteres)" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6}
              />
              {error && <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--t3)" }}>
              {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
              <button
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontWeight: 700, padding: 0 }}
              >
                {mode === "login" ? "Cadastrar" : "Entrar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
