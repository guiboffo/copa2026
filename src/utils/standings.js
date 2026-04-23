import { GM } from "../data/matches.js";
import { GROUP_TEAMS, GROUPS_LIST } from "../data/teams.js";
import { KO } from "../data/knockout.js";

export function computeStandings(group, scores) {
  const teams = GROUP_TEAMS[group];
  const st = {};
  teams.forEach(t => {
    st[t] = { team:t, p:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0 };
  });
  GM.filter(m => m.g === group).forEach(m => {
    const k = GM.indexOf(m), s = scores[k];
    if (!s || s.h === "" || s.a === "") return;
    const h = parseInt(s.h), a = parseInt(s.a);
    if (isNaN(h) || isNaN(a)) return;
    st[m.h].p++; st[m.a].p++;
    st[m.h].gf += h; st[m.h].ga += a;
    st[m.a].gf += a; st[m.a].ga += h;
    st[m.h].gd = st[m.h].gf - st[m.h].ga;
    st[m.a].gd = st[m.a].gf - st[m.a].ga;
    if (h > a) { st[m.h].w++; st[m.h].pts += 3; st[m.a].l++; }
    else if (h < a) { st[m.a].w++; st[m.a].pts += 3; st[m.h].l++; }
    else { st[m.h].d++; st[m.a].d++; st[m.h].pts++; st[m.a].pts++; }
  });
  return Object.values(st).sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team)
  );
}

export function getQualifiedThirds(allSt) {
  const thirds = [];
  GROUPS_LIST.forEach(g => {
    const s = allSt[g];
    if (s && s[2] && s[2].p === 3) thirds.push({ ...s[2], fromGroup: g });
  });
  thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  return thirds.slice(0, 8);
}

export function resolveTeam(src, allSt, qt, koScores) {
  if (!src) return null;
  if (/^[12][A-L]$/.test(src)) {
    const pos = parseInt(src[0]) - 1, grp = src[1], s = allSt[grp];
    if (!s || !s[pos] || s[pos].p < 3) return null;
    return s[pos].team;
  }
  if (src.startsWith("3_")) {
    const pg = src.slice(2).split("");
    const m = qt.find(q => pg.includes(q.fromGroup));
    return m ? m.team : null;
  }
  const wm = src.match(/^([WL])(\d+)$/);
  if (wm) {
    const isW = wm[1] === "W", mn = parseInt(wm[2]), s = koScores[mn];
    if (!s || s.h === "" || s.a === "") return null;
    const h = parseInt(s.h), a = parseInt(s.a);
    if (isNaN(h) || isNaN(a) || h === a) return null;
    const ko = KO[mn];
    const ht = resolveTeam(ko.hs, allSt, qt, koScores);
    const at = resolveTeam(ko.as, allSt, qt, koScores);
    if (!ht || !at) return null;
    return h > a ? (isW ? ht : at) : (isW ? at : ht);
  }
  return null;
}

export function labelToText(l) {
  if (/^[12][A-L]$/.test(l)) return `${l[0]}º ${l[1]}`;
  if (l.startsWith("3_")) return `3º ${l.slice(2).split("").join("/")}`;
  if (l.startsWith("W")) return `V #${l.slice(1)}`;
  if (l.startsWith("L")) return `P #${l.slice(1)}`;
  return l;
}

export function makeSortKey(dateStr, timeStr) {
  const [dd, mm] = dateStr.split("/");
  return `${mm}/${dd}/${timeStr || "00:00"}`;
}

// Calculate bolão points: predictions vs actual results
// Returns { earned, possible, details: {[idx]: {points, type}} }
export function calcBolaoPoints(predScores, actualScores) {
  let earned = 0, possible = 0;
  const details = {};
  for (const [idxStr, actual] of Object.entries(actualScores)) {
    if (!actual || actual.h === "" || actual.a === "") continue;
    const ah = parseInt(actual.h), aa = parseInt(actual.a);
    if (isNaN(ah) || isNaN(aa)) continue;
    possible += 3;
    const pred = predScores[idxStr];
    if (!pred || pred.h === "" || pred.a === "") continue;
    const ph = parseInt(pred.h), pa = parseInt(pred.a);
    if (isNaN(ph) || isNaN(pa)) continue;
    const actualResult = ah > aa ? "H" : ah < aa ? "A" : "D";
    const predResult = ph > pa ? "H" : ph < pa ? "A" : "D";
    if (ph === ah && pa === aa) {
      earned += 3;
      details[idxStr] = { points: 3, type: "exact" };
    } else if (actualResult === predResult) {
      earned += 1;
      details[idxStr] = { points: 1, type: "result" };
    } else {
      details[idxStr] = { points: 0, type: "wrong" };
    }
  }
  return { earned, possible, details };
}
