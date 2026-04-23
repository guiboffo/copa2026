import { useState, useMemo, useEffect } from "react";
import Flag from "./Flag.jsx";
import RankBadge from "./RankBadge.jsx";
import { GM } from "../data/matches.js";
import { KO, ROUND_ORDER, RC } from "../data/knockout.js";
import { GROUP_TEAMS, GROUPS_LIST, FIFA_RANKING, teamName } from "../data/teams.js";
import { resolveTeam, labelToText, calcBolaoPoints } from "../utils/standings.js";
import { loadBolao, saveBolao, exportCode, importCode } from "../utils/storage.js";

const SCORING_INFO = [
  { label: "Placar Exato", points: 3, color: "#48bb78", icon: "⚽" },
  { label: "Resultado Certo", points: 1, color: "#ecc94b", icon: "✓" },
  { label: "Errado", points: 0, color: "#fc8181", icon: "✗" },
];

export default function BolaoMaker({ scores, koScores, allSt, qt, isDesk }) {
  const [view, setView] = useState("landing"); // landing | create | my-bolao | import
  const [bolaoName, setBolaoName] = useState("");
  const [bScores, setBScores] = useState({});
  const [bKoScores, setBKoScores] = useState({});
  const [createTab, setCreateTab] = useState("A"); // group letter or "ko"
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importedBolao, setImportedBolao] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = loadBolao();
    if (saved?.name) {
      setBolaoName(saved.name);
      setBScores(saved.g || {});
      setBKoScores(saved.k || {});
      setView("my-bolao");
    }
  }, []);

  const updPred = (idx, side, val) => {
    const v = val.replace(/[^0-9]/g, "").slice(0, 2);
    setBScores(p => ({ ...p, [idx]: { ...p[idx], h: side === "h" ? v : (p[idx]?.h ?? ""), a: side === "a" ? v : (p[idx]?.a ?? "") } }));
  };
  const updKoPred = (mn, side, val) => {
    const v = val.replace(/[^0-9]/g, "").slice(0, 2);
    setBKoScores(p => ({ ...p, [mn]: { ...p[mn], h: side === "h" ? v : (p[mn]?.h ?? ""), a: side === "a" ? v : (p[mn]?.a ?? "") } }));
  };

  const saveBolaoData = () => {
    saveBolao({ name: bolaoName.trim() || "Meu Bolão", g: bScores, k: bKoScores });
    setBolaoName(p => p.trim() || "Meu Bolão");
    setView("my-bolao");
  };

  const groupPoints = useMemo(() => calcBolaoPoints(bScores, scores), [bScores, scores]);
  const koPoints = useMemo(() => calcBolaoPoints(bKoScores, koScores), [bKoScores, koScores]);
  const totalEarned = groupPoints.earned + koPoints.earned;
  const totalPossible = groupPoints.possible + koPoints.possible;

  const handleExport = () => {
    const code = exportCode({ name: bolaoName, g: bScores, k: bKoScores });
    navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleImport = () => {
    const result = importCode(importText);
    if (!result.ok) { setImportError(result.error); return; }
    setImportedBolao(result.data);
    setImportError("");
  };

  const importedPoints = useMemo(() => {
    if (!importedBolao) return null;
    const gp = calcBolaoPoints(importedBolao.g || {}, scores);
    const kp = calcBolaoPoints(importedBolao.k || {}, koScores);
    return { earned: gp.earned + kp.earned, possible: gp.possible + kp.possible };
  }, [importedBolao, scores, koScores]);

  const predFilled = Object.keys(bScores).length;
  const totalMatches = GM.length + Object.keys(KO).length;

  const renderPredRow = (label, predH, predA, onH, onA, result, detail) => {
    const inSz = isDesk ? 30 : 26;
    const hasActual = result?.h !== "" && result?.h !== undefined;
    const typeColor = detail?.type === "exact" ? "#48bb78" : detail?.type === "result" ? "#ecc94b" : detail?.type === "wrong" ? "#fc8181" : "var(--border)";
    const typeLabel = detail?.type === "exact" ? "+3" : detail?.type === "result" ? "+1" : detail?.type === "wrong" ? "✗" : "";

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative" }}>
        {detail && (
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: typeColor, borderRadius: "3px 0 0 3px" }} />
        )}
        <div style={{ flex: 1, fontFamily: "var(--f-body)", fontSize: 12, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
          <input className="score-input" value={predH} onChange={e => onH(e.target.value)} style={{ width: inSz, height: inSz, fontSize: 12 }} placeholder="–" maxLength={2} inputMode="numeric" />
          <span style={{ color: "var(--t3)", fontSize: 10 }}>×</span>
          <input className="score-input" value={predA} onChange={e => onA(e.target.value)} style={{ width: inSz, height: inSz, fontSize: 12 }} placeholder="–" maxLength={2} inputMode="numeric" />
        </div>
        {hasActual && (
          <div style={{ flexShrink: 0, fontSize: 10, color: "var(--t3)", width: 40, textAlign: "right" }}>
            {result.h}×{result.a}
          </div>
        )}
        {typeLabel && (
          <div style={{ flexShrink: 0, fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 11, color: typeColor, width: 24, textAlign: "center" }}>
            {typeLabel}
          </div>
        )}
      </div>
    );
  };

  // ─── LANDING ──────────────────────────────────────────────────────────────
  if (view === "landing") {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: isDesk ? "32px 0" : "16px 0" }}>
        <div className="card" style={{ padding: isDesk ? "40px" : "24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>🎯</div>
          <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: isDesk ? 28 : 22, color: "var(--t1)", margin: "12px 0 8px" }}>Bolão Copa 2026</h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--t3)", lineHeight: 1.6, marginBottom: 24 }}>
            Faça seus palpites para todos os jogos, compartilhe com os amigos e veja quem acerta mais.
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {SCORING_INFO.map(s => (
              <div key={s.label} style={{ padding: "10px 16px", borderRadius: 10, background: s.color + "18", border: `1px solid ${s.color}44`, textAlign: "center", minWidth: 110 }}>
                <div style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: 22, color: s.color }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 20, color: s.color }}>{s.points}{s.points !== 0 ? " pt" + (s.points > 1 ? "s" : "") : ""}</div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setView("create")}
              style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "var(--gold)", color: "#070b15", fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 15, cursor: "pointer" }}
            >
              Criar Meu Bolão
            </button>
            <button
              onClick={() => setView("import")}
              style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--t2)", fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Importar Código
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CREATE BOLÃO ─────────────────────────────────────────────────────────
  if (view === "create") {
    const groupMatches = GM.filter(m => m.g === createTab);
    const isKoTab = createTab === "ko";

    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setView("landing")} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--t3)", cursor: "pointer", fontFamily: "var(--f-body)", fontSize: 13, flexShrink: 0 }}>← Voltar</button>
          <input
            value={bolaoName}
            onChange={e => setBolaoName(e.target.value)}
            placeholder="Seu nome / apelido..."
            style={{ flex: 1, minWidth: 100, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--t1)", fontFamily: "var(--f-body)", fontSize: 13, outline: "none" }}
          />
          <button
            onClick={saveBolaoData}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#070b15", fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 13, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Salvar ✓
          </button>
        </div>

        <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--t3)", marginBottom: 10 }}>
          Palpites: {predFilled}/{totalMatches} · <span style={{ color: "var(--green)" }}>Coluna direita mostra o resultado real (quando disponível)</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 12, paddingBottom: 4 }}>
          {GROUPS_LIST.map(g => (
            <button
              key={g}
              onClick={() => setCreateTab(g)}
              style={{ padding: "5px 12px", borderRadius: 8, border: createTab === g ? "1.5px solid var(--gold)" : "1px solid var(--border)", background: createTab === g ? "rgba(240,201,58,0.12)" : "transparent", color: createTab === g ? "var(--gold)" : "var(--t3)", fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => setCreateTab("ko")}
            style={{ padding: "5px 12px", borderRadius: 8, border: createTab === "ko" ? "1.5px solid var(--blue)" : "1px solid var(--border)", background: createTab === "ko" ? "rgba(79,142,247,0.12)" : "transparent", color: createTab === "ko" ? "var(--blue)" : "var(--t3)", fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}
          >
            Mata-mata
          </button>
        </div>

        <div className="card">
          {!isKoTab ? (
            <>
              <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: 20, color: "var(--gold)" }}>{createTab}</span>
                <span style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 13, color: "var(--t2)" }}>Grupo {createTab}</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: "var(--f-body)", fontSize: 10, color: "var(--t3)" }}>Seu palpite · Real</span>
              </div>
              {[1, 2, 3].map(round => (
                <div key={round}>
                  <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 9, color: "var(--t3)", letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 12px 3px", borderTop: "1px solid var(--border)" }}>
                    {round}ª Rodada
                  </div>
                  {groupMatches.filter(m => m.r === round).map(m => {
                    const idx = GM.indexOf(m);
                    const pred = bScores[idx] || { h: "", a: "" };
                    const actual = scores[idx] || { h: "", a: "" };
                    const detail = groupPoints.details[idx];
                    return renderPredRow(
                      `${teamName(m.h, isDesk)} × ${teamName(m.a, isDesk)}`,
                      pred.h, pred.a,
                      v => updPred(idx, "h", v),
                      v => updPred(idx, "a", v),
                      actual, detail
                    );
                  })}
                </div>
              ))}
            </>
          ) : (
            <>
              <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 13, color: "var(--t2)" }}>Mata-mata — insira placares previstos</span>
              </div>
              {ROUND_ORDER.map(rn => {
                const mns = Object.keys(KO).filter(k => KO[k].rn === rn).map(Number).sort((a, b) => a - b);
                return (
                  <div key={rn}>
                    <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 12px 3px", borderTop: "1px solid var(--border)", color: RC[rn] }}>
                      {rn}
                    </div>
                    {mns.map(mn => {
                      const ko = KO[mn];
                      const ht = resolveTeam(ko.hs, allSt, qt, koScores) || labelToText(ko.hs);
                      const at = resolveTeam(ko.as, allSt, qt, koScores) || labelToText(ko.as);
                      const pred = bKoScores[mn] || { h: "", a: "" };
                      const actual = koScores[mn] || { h: "", a: "" };
                      const detail = koPoints.details[mn];
                      return renderPredRow(
                        `${teamName(ht, isDesk) || ht} × ${teamName(at, isDesk) || at}`,
                        pred.h, pred.a,
                        v => updKoPred(mn, "h", v),
                        v => updKoPred(mn, "a", v),
                        actual, detail
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── MY BOLÃO ─────────────────────────────────────────────────────────────
  if (view === "my-bolao") {
    const accuracy = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    const exactCount = Object.values(groupPoints.details).filter(d => d.type === "exact").length + Object.values(koPoints.details).filter(d => d.type === "exact").length;
    const resultCount = Object.values(groupPoints.details).filter(d => d.type === "result").length + Object.values(koPoints.details).filter(d => d.type === "result").length;

    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: isDesk ? 22 : 18, color: "var(--t1)", flex: 1 }}>
            🎯 {bolaoName || "Meu Bolão"}
          </h2>
          <button onClick={() => setView("create")} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(240,201,58,0.4)", background: "rgba(240,201,58,0.1)", color: "var(--gold)", fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            Editar Palpites
          </button>
          <button onClick={handleExport} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: copied ? "var(--green)" : "var(--t2)", fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            {copied ? "✓ Copiado!" : "Exportar Código"}
          </button>
          <button onClick={() => setView("import")} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--t3)", fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            Importar Adversário
          </button>
        </div>

        {/* Score Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isDesk ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Pontos", value: totalEarned, sub: `/ ${totalPossible} possíveis`, color: "var(--gold)" },
            { label: "Aproveitamento", value: `${accuracy}%`, sub: `${totalPossible} jogos`, color: "var(--blue)" },
            { label: "Placares Exatos", value: exactCount, sub: "+3 pts cada", color: "var(--green)" },
            { label: "Resultados Certos", value: resultCount, sub: "+1 pt cada", color: "var(--orange)" },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: isDesk ? 28 : 22, color: c.color }}>{c.value}</div>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 11, color: "var(--t2)", marginTop: 2 }}>{c.label}</div>
              <div style={{ fontFamily: "var(--f-body)", fontSize: 10, color: "var(--t3)", marginTop: 1 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Imported bolão comparison */}
        {importedBolao && importedPoints && (
          <div className="card" style={{ marginBottom: 16, padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 14, color: "var(--t1)" }}>
                vs. {importedBolao.name || "Adversário"}
              </span>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--gold)" }}>
                  Você: <strong>{totalEarned} pts</strong>
                </span>
                <span style={{ fontFamily: "var(--f-body)", fontSize: 13, color: totalEarned >= importedPoints.earned ? "var(--green)" : "var(--red)" }}>
                  {importedBolao.name}: <strong>{importedPoints.earned} pts</strong>
                  {totalEarned > importedPoints.earned ? " — você está na frente! 🏆" : totalEarned < importedPoints.earned ? " — ele está na frente! 😅" : " — empate!"}
                </span>
              </div>
              <button onClick={() => setImportedBolao(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          </div>
        )}

        {/* Points by group */}
        <div style={{ display: isDesk ? "grid" : "flex", gridTemplateColumns: "1fr 1fr", flexDirection: "column", gap: 10 }}>
          {GROUPS_LIST.map(g => {
            const gm = GM.filter(m => m.g === g);
            const gEarned = gm.reduce((sum, m) => {
              const idx = GM.indexOf(m);
              return sum + (groupPoints.details[idx]?.points || 0);
            }, 0);
            const gPossible = gm.reduce((sum, m) => {
              const idx = GM.indexOf(m);
              const actual = scores[idx];
              return sum + (actual?.h !== "" && actual?.h !== undefined ? 3 : 0);
            }, 0);

            return (
              <div key={g} className="card" style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: 18, color: "var(--gold)" }}>{g}</span>
                  <span style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--t3)" }}>Grupo {g}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 14, color: gEarned > 0 ? "var(--green)" : "var(--t3)" }}>
                    {gEarned}/{gPossible} pts
                  </span>
                </div>
                {gm.map(m => {
                  const idx = GM.indexOf(m);
                  const pred = bScores[idx] || { h: "", a: "" };
                  const actual = scores[idx] || { h: "", a: "" };
                  const detail = groupPoints.details[idx];
                  const hasPred = pred.h !== "" && pred.a !== "";
                  const hasActual = actual.h !== "" && actual.a !== "";
                  const dotColor = detail ? (detail.type === "exact" ? "#48bb78" : detail.type === "result" ? "#ecc94b" : "#fc8181") : (hasPred ? "var(--t3)" : "var(--border)");

                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontFamily: "var(--f-body)", fontSize: 11, color: "var(--t2)" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {teamName(m.h, isDesk)} × {teamName(m.a, isDesk)}
                      </span>
                      {hasPred && <span style={{ color: "var(--gold)", fontWeight: 700, flexShrink: 0 }}>{pred.h}×{pred.a}</span>}
                      {hasActual && hasPred && <span style={{ color: "var(--t3)", flexShrink: 0, fontSize: 10 }}>({actual.h}×{actual.a})</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── IMPORT ───────────────────────────────────────────────────────────────
  if (view === "import") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: isDesk ? "24px 0" : "12px 0" }}>
        <div className="card" style={{ padding: isDesk ? "32px" : "20px" }}>
          <button onClick={() => setView(bolaoName ? "my-bolao" : "landing")} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--t3)", cursor: "pointer", fontFamily: "var(--f-body)", fontSize: 13, marginBottom: 20 }}>
            ← Voltar
          </button>
          <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, color: "var(--t1)", marginBottom: 8 }}>Importar Bolão de um Amigo</h3>
          <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--t3)", marginBottom: 16 }}>
            Cole o código do bolão do seu adversário para comparar pontuações.
          </p>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="Cole o código aqui..."
            style={{ width: "100%", minHeight: 100, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--t1)", fontFamily: "var(--f-body)", fontSize: 13, resize: "vertical", outline: "none", marginBottom: 8 }}
          />
          {importError && (
            <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--red)", marginBottom: 8 }}>{importError}</div>
          )}
          <button
            onClick={handleImport}
            style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "var(--gold)", color: "#070b15", fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
          >
            Importar
          </button>

          {importedBolao && (
            <div style={{ marginTop: 20, padding: "14px", background: "rgba(34,197,94,0.08)", borderRadius: 8, border: "1px solid var(--green)" }}>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 15, color: "var(--green)", marginBottom: 4 }}>
                ✓ Bolão importado: {importedBolao.name || "Sem nome"}
              </div>
              {importedPoints && (
                <div style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--t2)" }}>
                  Pontuação atual: <strong style={{ color: "var(--gold)" }}>{importedPoints.earned}</strong> pts de {importedPoints.possible} possíveis
                </div>
              )}
              <button
                onClick={() => setView("my-bolao")}
                style={{ marginTop: 12, padding: "8px 18px", borderRadius: 8, border: "none", background: "var(--green)", color: "#070b15", fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
              >
                Ver Comparação
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
