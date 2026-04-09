import { useState, useMemo, useEffect, useCallback } from "react";

/* ════════════════════════════════════════════════════════════════
   RESPONSIVE HOOK
   ════════════════════════════════════════════════════════════════ */
function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 400);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

/* ════════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════════ */
const GROUPS_LIST = ["A","B","C","D","E","F","G","H","I","J","K","L"];

const TEAMS = {
  "México":{code:"mx",emoji:"🇲🇽",short:"México"},"África do Sul":{code:"za",emoji:"🇿🇦",short:"Áfr. Sul"},
  "Coreia do Sul":{code:"kr",emoji:"🇰🇷",short:"Coreia S."},"Rep. Tcheca":{code:"cz",emoji:"🇨🇿",short:"R. Tcheca"},
  "Canadá":{code:"ca",emoji:"🇨🇦",short:"Canadá"},"Bósnia e Herz.":{code:"ba",emoji:"🇧🇦",short:"Bósnia"},
  "Catar":{code:"qa",emoji:"🇶🇦",short:"Catar"},"Suíça":{code:"ch",emoji:"🇨🇭",short:"Suíça"},
  "Brasil":{code:"br",emoji:"🇧🇷",short:"Brasil"},"Marrocos":{code:"ma",emoji:"🇲🇦",short:"Marrocos"},
  "Haiti":{code:"ht",emoji:"🇭🇹",short:"Haiti"},"Escócia":{code:"gb-sct",emoji:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",short:"Escócia"},
  "Estados Unidos":{code:"us",emoji:"🇺🇸",short:"EUA"},"Paraguai":{code:"py",emoji:"🇵🇾",short:"Paraguai"},
  "Austrália":{code:"au",emoji:"🇦🇺",short:"Austrália"},"Turquia":{code:"tr",emoji:"🇹🇷",short:"Turquia"},
  "Alemanha":{code:"de",emoji:"🇩🇪",short:"Alemanha"},"Curaçau":{code:"cw",emoji:"🇨🇼",short:"Curaçau"},
  "Costa do Marfim":{code:"ci",emoji:"🇨🇮",short:"C. Marfim"},"Equador":{code:"ec",emoji:"🇪🇨",short:"Equador"},
  "Holanda":{code:"nl",emoji:"🇳🇱",short:"Holanda"},"Japão":{code:"jp",emoji:"🇯🇵",short:"Japão"},
  "Suécia":{code:"se",emoji:"🇸🇪",short:"Suécia"},"Tunísia":{code:"tn",emoji:"🇹🇳",short:"Tunísia"},
  "Bélgica":{code:"be",emoji:"🇧🇪",short:"Bélgica"},"Egito":{code:"eg",emoji:"🇪🇬",short:"Egito"},
  "Irã":{code:"ir",emoji:"🇮🇷",short:"Irã"},"Nova Zelândia":{code:"nz",emoji:"🇳🇿",short:"N. Zelândia"},
  "Espanha":{code:"es",emoji:"🇪🇸",short:"Espanha"},"Cabo Verde":{code:"cv",emoji:"🇨🇻",short:"C. Verde"},
  "Arábia Saudita":{code:"sa",emoji:"🇸🇦",short:"A. Saudita"},"Uruguai":{code:"uy",emoji:"🇺🇾",short:"Uruguai"},
  "França":{code:"fr",emoji:"🇫🇷",short:"França"},"Senegal":{code:"sn",emoji:"🇸🇳",short:"Senegal"},
  "Iraque":{code:"iq",emoji:"🇮🇶",short:"Iraque"},"Noruega":{code:"no",emoji:"🇳🇴",short:"Noruega"},
  "Argentina":{code:"ar",emoji:"🇦🇷",short:"Argentina"},"Argélia":{code:"dz",emoji:"🇩🇿",short:"Argélia"},
  "Áustria":{code:"at",emoji:"🇦🇹",short:"Áustria"},"Jordânia":{code:"jo",emoji:"🇯🇴",short:"Jordânia"},
  "Portugal":{code:"pt",emoji:"🇵🇹",short:"Portugal"},"RD Congo":{code:"cd",emoji:"🇨🇩",short:"RD Congo"},
  "Uzbequistão":{code:"uz",emoji:"🇺🇿",short:"Uzbequist."},"Colômbia":{code:"co",emoji:"🇨🇴",short:"Colômbia"},
  "Inglaterra":{code:"gb-eng",emoji:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",short:"Inglaterra"},"Croácia":{code:"hr",emoji:"🇭🇷",short:"Croácia"},
  "Gana":{code:"gh",emoji:"🇬🇭",short:"Gana"},"Panamá":{code:"pa",emoji:"🇵🇦",short:"Panamá"},
};

const flagUrl = (name) => { const t=TEAMS[name]; return t?`https://flagcdn.com/w40/${t.code}.png`:null; };
const teamName = (name, desk) => { if(desk||!name) return name; const t=TEAMS[name]; return t?.short||name; };

const GROUP_TEAMS = {
  A:["México","África do Sul","Coreia do Sul","Rep. Tcheca"],
  B:["Canadá","Bósnia e Herz.","Catar","Suíça"],
  C:["Brasil","Marrocos","Haiti","Escócia"],
  D:["Estados Unidos","Paraguai","Austrália","Turquia"],
  E:["Alemanha","Curaçau","Costa do Marfim","Equador"],
  F:["Holanda","Japão","Suécia","Tunísia"],
  G:["Bélgica","Egito","Irã","Nova Zelândia"],
  H:["Espanha","Cabo Verde","Arábia Saudita","Uruguai"],
  I:["França","Senegal","Iraque","Noruega"],
  J:["Argentina","Argélia","Áustria","Jordânia"],
  K:["Portugal","RD Congo","Uzbequistão","Colômbia"],
  L:["Inglaterra","Croácia","Gana","Panamá"],
};

const GM = [
  {r:1,g:"A",h:"México",a:"África do Sul",d:"11/06",day:"Qui",c:"Cd. México",t:"16:00"},
  {r:1,g:"A",h:"Coreia do Sul",a:"Rep. Tcheca",d:"11/06",day:"Qui",c:"Guadalajara",t:"23:00"},
  {r:1,g:"B",h:"Canadá",a:"Bósnia e Herz.",d:"12/06",day:"Sex",c:"Toronto",t:"16:00"},
  {r:1,g:"D",h:"Estados Unidos",a:"Paraguai",d:"12/06",day:"Sex",c:"Los Angeles",t:"22:00"},
  {r:1,g:"B",h:"Catar",a:"Suíça",d:"13/06",day:"Sáb",c:"Santa Clara",t:"16:00"},
  {r:1,g:"C",h:"Brasil",a:"Marrocos",d:"13/06",day:"Sáb",c:"Nova York/NJ",t:"19:00"},
  {r:1,g:"C",h:"Haiti",a:"Escócia",d:"13/06",day:"Sáb",c:"Boston",t:"22:00"},
  {r:1,g:"D",h:"Austrália",a:"Turquia",d:"13/06",day:"Sáb",c:"Vancouver",t:"01:00"},
  {r:1,g:"E",h:"Alemanha",a:"Curaçau",d:"14/06",day:"Dom",c:"Houston",t:"14:00"},
  {r:1,g:"E",h:"Costa do Marfim",a:"Equador",d:"14/06",day:"Dom",c:"Filadélfia",t:"20:00"},
  {r:1,g:"F",h:"Holanda",a:"Japão",d:"14/06",day:"Dom",c:"Dallas",t:"17:00"},
  {r:1,g:"F",h:"Suécia",a:"Tunísia",d:"14/06",day:"Dom",c:"Monterrey",t:"22:00"},
  {r:1,g:"H",h:"Espanha",a:"Cabo Verde",d:"15/06",day:"Seg",c:"Atlanta",t:"13:00"},
  {r:1,g:"H",h:"Arábia Saudita",a:"Uruguai",d:"15/06",day:"Seg",c:"Miami",t:"19:00"},
  {r:1,g:"G",h:"Bélgica",a:"Egito",d:"15/06",day:"Seg",c:"Seattle",t:"16:00"},
  {r:1,g:"G",h:"Irã",a:"Nova Zelândia",d:"15/06",day:"Seg",c:"Los Angeles",t:"22:00"},
  {r:1,g:"J",h:"Áustria",a:"Jordânia",d:"16/06",day:"Ter",c:"Santa Clara",t:"01:00"},
  {r:1,g:"I",h:"França",a:"Senegal",d:"16/06",day:"Ter",c:"Nova York/NJ",t:"16:00"},
  {r:1,g:"I",h:"Iraque",a:"Noruega",d:"16/06",day:"Ter",c:"Boston",t:"19:00"},
  {r:1,g:"J",h:"Argentina",a:"Argélia",d:"16/06",day:"Ter",c:"Kansas City",t:"22:00"},
  {r:1,g:"K",h:"Portugal",a:"RD Congo",d:"17/06",day:"Qua",c:"Houston",t:"14:00"},
  {r:1,g:"L",h:"Inglaterra",a:"Croácia",d:"17/06",day:"Qua",c:"Dallas",t:"17:00"},
  {r:1,g:"L",h:"Gana",a:"Panamá",d:"17/06",day:"Qua",c:"Toronto",t:"20:00"},
  {r:1,g:"K",h:"Uzbequistão",a:"Colômbia",d:"17/06",day:"Qua",c:"Cd. México",t:"21:00"},
  {r:2,g:"A",h:"Rep. Tcheca",a:"África do Sul",d:"18/06",day:"Qui",c:"Atlanta",t:"13:00"},
  {r:2,g:"B",h:"Suíça",a:"Bósnia e Herz.",d:"18/06",day:"Qui",c:"Los Angeles",t:"16:00"},
  {r:2,g:"B",h:"Canadá",a:"Catar",d:"18/06",day:"Qui",c:"Vancouver",t:"19:00"},
  {r:2,g:"A",h:"México",a:"Coreia do Sul",d:"18/06",day:"Qui",c:"Guadalajara",t:"22:00"},
  {r:2,g:"D",h:"Turquia",a:"Paraguai",d:"19/06",day:"Sex",c:"Santa Clara",t:"00:00"},
  {r:2,g:"D",h:"Estados Unidos",a:"Austrália",d:"19/06",day:"Sex",c:"Seattle",t:"16:00"},
  {r:2,g:"C",h:"Escócia",a:"Marrocos",d:"19/06",day:"Sex",c:"Boston",t:"19:00"},
  {r:2,g:"C",h:"Brasil",a:"Haiti",d:"19/06",day:"Sex",c:"Filadélfia",t:"21:30"},
  {r:2,g:"F",h:"Tunísia",a:"Japão",d:"20/06",day:"Sáb",c:"Monterrey",t:"23:00"},
  {r:2,g:"F",h:"Holanda",a:"Suécia",d:"20/06",day:"Sáb",c:"Houston",t:"14:00"},
  {r:2,g:"E",h:"Alemanha",a:"Costa do Marfim",d:"20/06",day:"Sáb",c:"Toronto",t:"17:00"},
  {r:2,g:"E",h:"Equador",a:"Curaçau",d:"20/06",day:"Sáb",c:"Kansas City",t:"21:00"},
  {r:2,g:"H",h:"Espanha",a:"Arábia Saudita",d:"21/06",day:"Dom",c:"Atlanta",t:"13:00"},
  {r:2,g:"G",h:"Bélgica",a:"Irã",d:"21/06",day:"Dom",c:"Los Angeles",t:"16:00"},
  {r:2,g:"H",h:"Uruguai",a:"Cabo Verde",d:"21/06",day:"Dom",c:"Miami",t:"19:00"},
  {r:2,g:"G",h:"Nova Zelândia",a:"Egito",d:"21/06",day:"Dom",c:"Vancouver",t:"22:00"},
  {r:2,g:"J",h:"Argentina",a:"Áustria",d:"22/06",day:"Seg",c:"Dallas",t:"14:00"},
  {r:2,g:"I",h:"França",a:"Iraque",d:"22/06",day:"Seg",c:"Filadélfia",t:"18:00"},
  {r:2,g:"I",h:"Noruega",a:"Senegal",d:"22/06",day:"Seg",c:"Nova York/NJ",t:"21:00"},
  {r:2,g:"J",h:"Jordânia",a:"Argélia",d:"22/06",day:"Seg",c:"Santa Clara",t:"00:00"},
  {r:2,g:"K",h:"Portugal",a:"Uzbequistão",d:"23/06",day:"Ter",c:"Houston",t:"14:00"},
  {r:2,g:"L",h:"Inglaterra",a:"Gana",d:"23/06",day:"Ter",c:"Boston",t:"17:00"},
  {r:2,g:"L",h:"Panamá",a:"Croácia",d:"23/06",day:"Ter",c:"Toronto",t:"20:00"},
  {r:2,g:"K",h:"Colômbia",a:"RD Congo",d:"23/06",day:"Ter",c:"Guadalajara",t:"23:00"},
  {r:3,g:"B",h:"Suíça",a:"Canadá",d:"24/06",day:"Qua",c:"Vancouver",t:"16:00"},
  {r:3,g:"B",h:"Bósnia e Herz.",a:"Catar",d:"24/06",day:"Qua",c:"Seattle",t:"16:00"},
  {r:3,g:"C",h:"Escócia",a:"Brasil",d:"24/06",day:"Qua",c:"Miami",t:"19:00"},
  {r:3,g:"C",h:"Marrocos",a:"Haiti",d:"24/06",day:"Qua",c:"Atlanta",t:"19:00"},
  {r:3,g:"A",h:"Rep. Tcheca",a:"México",d:"24/06",day:"Qua",c:"Cd. México",t:"22:00"},
  {r:3,g:"A",h:"África do Sul",a:"Coreia do Sul",d:"24/06",day:"Qua",c:"Monterrey",t:"22:00"},
  {r:3,g:"E",h:"Equador",a:"Alemanha",d:"25/06",day:"Qui",c:"Nova York/NJ",t:"17:00"},
  {r:3,g:"E",h:"Curaçau",a:"Costa do Marfim",d:"25/06",day:"Qui",c:"Filadélfia",t:"17:00"},
  {r:3,g:"F",h:"Japão",a:"Suécia",d:"25/06",day:"Qui",c:"Dallas",t:"20:00"},
  {r:3,g:"F",h:"Tunísia",a:"Holanda",d:"25/06",day:"Qui",c:"Kansas City",t:"20:00"},
  {r:3,g:"D",h:"Turquia",a:"Estados Unidos",d:"25/06",day:"Qui",c:"Los Angeles",t:"23:00"},
  {r:3,g:"D",h:"Paraguai",a:"Austrália",d:"25/06",day:"Qui",c:"Santa Clara",t:"23:00"},
  {r:3,g:"I",h:"Noruega",a:"França",d:"26/06",day:"Sex",c:"Boston",t:"16:00"},
  {r:3,g:"I",h:"Senegal",a:"Iraque",d:"26/06",day:"Sex",c:"Toronto",t:"16:00"},
  {r:3,g:"H",h:"Cabo Verde",a:"Arábia Saudita",d:"26/06",day:"Sex",c:"Houston",t:"21:00"},
  {r:3,g:"H",h:"Uruguai",a:"Espanha",d:"26/06",day:"Sex",c:"Guadalajara",t:"21:00"},
  {r:3,g:"G",h:"Egito",a:"Irã",d:"26/06",day:"Sex",c:"Seattle",t:"00:00"},
  {r:3,g:"G",h:"Nova Zelândia",a:"Bélgica",d:"26/06",day:"Sex",c:"Vancouver",t:"00:00"},
  {r:3,g:"L",h:"Panamá",a:"Inglaterra",d:"27/06",day:"Sáb",c:"Nova York/NJ",t:"18:00"},
  {r:3,g:"L",h:"Croácia",a:"Gana",d:"27/06",day:"Sáb",c:"Filadélfia",t:"18:00"},
  {r:3,g:"K",h:"Colômbia",a:"Portugal",d:"27/06",day:"Sáb",c:"Miami",t:"20:30"},
  {r:3,g:"K",h:"RD Congo",a:"Uzbequistão",d:"27/06",day:"Sáb",c:"Atlanta",t:"20:30"},
  {r:3,g:"J",h:"Argélia",a:"Áustria",d:"27/06",day:"Sáb",c:"Kansas City",t:"23:00"},
  {r:3,g:"J",h:"Jordânia",a:"Argentina",d:"27/06",day:"Sáb",c:"Dallas",t:"23:00"},
];

const KO = {
  73:{hs:"2A",as:"2B",d:"28/06",c:"Los Angeles",rn:"32-avos",t:"—"},
  74:{hs:"1E",as:"3_ABCDF",d:"29/06",c:"Boston",rn:"32-avos",t:"17:30"},
  75:{hs:"1F",as:"2C",d:"29/06",c:"Monterrey",rn:"32-avos",t:"22:00"},
  76:{hs:"1C",as:"2F",d:"29/06",c:"Houston",rn:"32-avos",t:"14:00"},
  77:{hs:"1I",as:"3_CDFGH",d:"30/06",c:"Nova York/NJ",rn:"32-avos",t:"18:00"},
  78:{hs:"2E",as:"2I",d:"30/06",c:"Dallas",rn:"32-avos",t:"—"},
  79:{hs:"1A",as:"3_CEFHI",d:"30/06",c:"Cd. México",rn:"32-avos",t:"22:00"},
  80:{hs:"1L",as:"3_EHIJK",d:"01/07",c:"Atlanta",rn:"32-avos",t:"13:00"},
  81:{hs:"1D",as:"3_BEFIJ",d:"01/07",c:"Santa Clara",rn:"32-avos",t:"21:00"},
  82:{hs:"1G",as:"3_AEHIJ",d:"01/07",c:"Seattle",rn:"32-avos",t:"17:00"},
  83:{hs:"2K",as:"2L",d:"02/07",c:"Toronto",rn:"32-avos",t:"20:00"},
  84:{hs:"1H",as:"2J",d:"02/07",c:"Los Angeles",rn:"32-avos",t:"16:00"},
  85:{hs:"1B",as:"3_EFGIJ",d:"02/07",c:"Vancouver",rn:"32-avos",t:"—"},
  86:{hs:"1J",as:"2H",d:"03/07",c:"Miami",rn:"32-avos",t:"19:00"},
  87:{hs:"1K",as:"3_DEIJL",d:"03/07",c:"Kansas City",rn:"32-avos",t:"—"},
  88:{hs:"2D",as:"2G",d:"03/07",c:"Dallas",rn:"32-avos",t:"15:00"},
  89:{hs:"W74",as:"W77",d:"04/07",c:"Filadélfia",rn:"Oitavas",t:"18:00"},
  90:{hs:"W73",as:"W75",d:"04/07",c:"Houston",rn:"Oitavas",t:"14:00"},
  91:{hs:"W76",as:"W78",d:"05/07",c:"Nova York/NJ",rn:"Oitavas",t:"—"},
  92:{hs:"W79",as:"W80",d:"05/07",c:"Cd. México",rn:"Oitavas",t:"—"},
  93:{hs:"W83",as:"W84",d:"06/07",c:"Dallas",rn:"Oitavas",t:"16:00"},
  94:{hs:"W81",as:"W82",d:"06/07",c:"Seattle",rn:"Oitavas",t:"21:00"},
  95:{hs:"W86",as:"W88",d:"07/07",c:"Atlanta",rn:"Oitavas",t:"13:00"},
  96:{hs:"W85",as:"W87",d:"07/07",c:"Vancouver",rn:"Oitavas",t:"—"},
  97:{hs:"W89",as:"W90",d:"09/07",c:"Boston",rn:"Quartas",t:"17:00"},
  98:{hs:"W93",as:"W94",d:"10/07",c:"Los Angeles",rn:"Quartas",t:"16:00"},
  99:{hs:"W91",as:"W92",d:"12/07",c:"Miami",rn:"Quartas",t:"—"},
  100:{hs:"W95",as:"W96",d:"12/07",c:"Kansas City",rn:"Quartas",t:"11:00"},
  101:{hs:"W97",as:"W98",d:"14/07",c:"Dallas",rn:"Semifinal",t:"16:00"},
  102:{hs:"W99",as:"W100",d:"15/07",c:"Atlanta",rn:"Semifinal",t:"16:00"},
  103:{hs:"L101",as:"L102",d:"18/07",c:"Miami",rn:"3º Lugar",t:"18:00"},
  104:{hs:"W101",as:"W102",d:"19/07",c:"Nova York/NJ",rn:"Final",t:"16:00"},
};

const ROUND_ORDER = ["32-avos","Oitavas","Quartas","Semifinal","3º Lugar","Final"];
const RC = {"32-avos":"#5b9bd5","Oitavas":"#48bb78","Quartas":"#ed8936","Semifinal":"#ed64a6","3º Lugar":"#a78bfa","Final":"#ecc94b"};

/* FIFA Ranking — top 20 (mapped to our team names) */
const FIFA_RANKING = {
  "Espanha":1,"Argentina":2,"França":3,"Inglaterra":4,"Brasil":5,
  "Portugal":6,"Holanda":7,"Bélgica":8,"Alemanha":9,"Croácia":10,
  "Marrocos":11,"Colômbia":13,"Estados Unidos":14,"México":15,
  "Uruguai":16,"Suíça":17,"Japão":18,"Senegal":19,"Irã":20,
};
const isRanked = (team) => team && FIFA_RANKING[team] != null;
const isBigMatch = (h, a) => isRanked(h) && isRanked(a);
const isBrazilMatch = (h, a) => h === "Brasil" || a === "Brasil";

/* ════════════════════════════════════════════════════════════════
   SORT HELPER — "dd/MM" → "MM/dd" for proper chronological sort
   ════════════════════════════════════════════════════════════════ */
function makeSortKey(dateStr, timeStr) {
  const [dd, mm] = dateStr.split("/");
  return `${mm}/${dd}/${timeStr || "00:00"}`;
}

/* ════════════════════════════════════════════════════════════════
   LOGIC
   ════════════════════════════════════════════════════════════════ */
function computeStandings(group, scores) {
  const teams = GROUP_TEAMS[group];
  const st = {};
  teams.forEach(t => { st[t]={team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}; });
  GM.filter(m=>m.g===group).forEach(m=>{
    const k=GM.indexOf(m), s=scores[k];
    if(!s||s.h===""||s.a==="") return;
    const h=parseInt(s.h),a=parseInt(s.a);
    if(isNaN(h)||isNaN(a)) return;
    st[m.h].p++;st[m.a].p++;
    st[m.h].gf+=h;st[m.h].ga+=a;st[m.a].gf+=a;st[m.a].ga+=h;
    st[m.h].gd=st[m.h].gf-st[m.h].ga;st[m.a].gd=st[m.a].gf-st[m.a].ga;
    if(h>a){st[m.h].w++;st[m.h].pts+=3;st[m.a].l++;}
    else if(h<a){st[m.a].w++;st[m.a].pts+=3;st[m.h].l++;}
    else{st[m.h].d++;st[m.a].d++;st[m.h].pts++;st[m.a].pts++;}
  });
  return Object.values(st).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.team.localeCompare(b.team));
}

function getQualifiedThirds(all) {
  const thirds = [];
  GROUPS_LIST.forEach(g=>{const s=all[g];if(s&&s[2]&&s[2].p===3) thirds.push({...s[2],fromGroup:g});});
  thirds.sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
  return thirds.slice(0,8);
}

function resolveTeam(src, allSt, qt, koS) {
  if(!src) return null;
  if(/^[12][A-L]$/.test(src)){const pos=parseInt(src[0])-1,grp=src[1],s=allSt[grp];if(!s||!s[pos]||s[pos].p<3)return null;return s[pos].team;}
  if(src.startsWith("3_")){const pg=src.slice(2).split("");const m=qt.find(q=>pg.includes(q.fromGroup));return m?m.team:null;}
  const wm=src.match(/^([WL])(\d+)$/);
  if(wm){const isW=wm[1]==="W",mn=parseInt(wm[2]),s=koS[mn];if(!s||s.h===""||s.a==="")return null;const h=parseInt(s.h),a=parseInt(s.a);if(isNaN(h)||isNaN(a)||h===a)return null;const ko=KO[mn],ht=resolveTeam(ko.hs,allSt,qt,koS),at=resolveTeam(ko.as,allSt,qt,koS);if(!ht||!at)return null;return h>a?(isW?ht:at):(isW?at:ht);}
  return null;
}

function labelToText(l){
  if(/^[12][A-L]$/.test(l)) return `${l[0]}º ${l[1]}`;
  if(l.startsWith("3_")) return `3º ${l.slice(2).split("").join("/")}`;
  if(l.startsWith("W")) return `V #${l.slice(1)}`;
  if(l.startsWith("L")) return `P #${l.slice(1)}`;
  return l;
}

const STORAGE_KEY="copa2026v3";
function load(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY));}catch{return null;}}
function save(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));}catch{}}

/* ════════════════════════════════════════════════════════════════
   FLAG COMPONENT
   ════════════════════════════════════════════════════════════════ */
function Flag({team, size=20}) {
  const url = flagUrl(team);
  if (!url) return <span style={{fontSize:size*0.8}}>{TEAMS[team]?.emoji||"🏳️"}</span>;
  return <img src={url} alt={team} style={{width:size,height:size*0.7,objectFit:"cover",borderRadius:2,border:"1px solid rgba(255,255,255,0.1)"}} onError={e=>{e.target.style.display='none';}}/>;
}

/* ════════════════════════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════════════════════════ */
export default function App() {
  const W = useWidth();
  const isDesk = W >= 768;
  const isWide = W >= 1100;

  const [mainTab, setMainTab] = useState("tabela");
  const [subTab, setSubTab] = useState("grupos");
  const [scores, setScores] = useState({});
  const [koScores, setKoScores] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [filter, setFilter] = useState("all"); // "all" | "brazil" | "big"

  useEffect(()=>{const d=load();if(d){if(d.g)setScores(d.g);if(d.k)setKoScores(d.k);}setLoaded(true);},[]);
  useEffect(()=>{if(loaded)save({g:scores,k:koScores});},[scores,koScores,loaded]);

  const allSt = useMemo(()=>{const s={};GROUPS_LIST.forEach(g=>{s[g]=computeStandings(g,scores);});return s;},[scores]);
  const qt = useMemo(()=>getQualifiedThirds(allSt),[allSt]);

  const updScore=(i,side,val)=>{const v=val.replace(/[^0-9]/g,"").slice(0,2);setScores(p=>({...p,[i]:{...p[i],h:side==="h"?v:(p[i]?.h??""),a:side==="a"?v:(p[i]?.a??"")}}));};
  const updKo=(mn,side,val)=>{const v=val.replace(/[^0-9]/g,"").slice(0,2);setKoScores(p=>({...p,[mn]:{...p[mn],h:side==="h"?v:(p[mn]?.h??""),a:side==="a"?v:(p[mn]?.a??"")}}));};
  const toggleRow=(key)=>setExpandedRows(p=>({...p,[key]:!p[key]}));
  const groupComplete=useCallback(g=>GM.filter(m=>m.g===g).every(m=>{const k=GM.indexOf(m),s=scores[k];return s&&s.h!==""&&s.a!==""&&!isNaN(parseInt(s.h))&&!isNaN(parseInt(s.a));}),[scores]);
  const gc = useMemo(()=>GROUPS_LIST.filter(g=>groupComplete(g)).length,[groupComplete]);
  const resetAll=()=>{if(window.confirm("Apagar todos os resultados?")){setScores({});setKoScores({});}};

  const pad = isDesk ? "20px 28px 50px" : "12px 10px 40px";
  const maxW = isWide ? 1200 : isDesk ? 900 : "100%";

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0f1319",minHeight:"100vh",color:"#e2e8f0",maxWidth:maxW,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Sora:wght@300;400;600;700;800&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <header style={{background:"linear-gradient(135deg,#141b2d,#0f1319)",borderBottom:"2px solid #ecc94b",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:isDesk?"16px 32px":"14px 16px",maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:isDesk?16:12}}>
            <span style={{fontFamily:"Sora",fontWeight:800,fontSize:isDesk?13:10,letterSpacing:2,color:"#0f1319",background:"#ecc94b",padding:isDesk?"6px 14px":"4px 8px",borderRadius:5}}>FIFA 26</span>
            <div>
              <h1 style={{fontFamily:"Sora",fontSize:isDesk?26:18,fontWeight:800,margin:0,color:"#fff"}}>Copa do Mundo</h1>
              <p style={{fontFamily:"DM Sans",fontSize:isDesk?12:10,color:"#718096",margin:0,marginTop:2}}>🇺🇸 🇲🇽 🇨🇦 · Simulador Interativo · Horários de Brasília</p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontFamily:"Sora",fontSize:isDesk?12:10,fontWeight:600,color:"#48bb78",background:"rgba(72,187,120,0.12)",padding:"4px 12px",borderRadius:20}}>{gc}/12 grupos</span>
            <button onClick={resetAll} style={{width:34,height:34,borderRadius:8,border:"1px solid #2d3748",background:"transparent",color:"#fc8181",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} title="Resetar tudo">↺</button>
          </div>
        </div>
      </header>

      {/* MAIN TABS */}
      <nav style={{display:"flex",borderBottom:"1px solid #1a202c",background:"#141b2d"}}>
        {[{id:"tabela",label:"📋 Tabela"},{id:"calendario",label:"📅 Calendário"}].map(t=>(
          <button key={t.id} onClick={()=>setMainTab(t.id)} style={{flex:1,padding:isDesk?"14px 0":"11px 0",border:"none",borderBottom:mainTab===t.id?"3px solid #ecc94b":"3px solid transparent",background:mainTab===t.id?"rgba(236,201,75,0.04)":"transparent",fontFamily:"Sora",fontWeight:600,fontSize:isDesk?15:13,color:mainTab===t.id?"#ecc94b":"#718096",cursor:"pointer",transition:"all .2s"}}>{t.label}</button>
        ))}
      </nav>

      {/* FILTER BAR */}
      <div style={{display:"flex",gap:6,padding:isDesk?"10px 28px":"8px 12px",background:"#111822",borderBottom:"1px solid #1a202c",overflowX:"auto",flexWrap:"nowrap"}}>
        {[
          {id:"all",label:"Todos",emoji:"",color:"#718096"},
          {id:"brazil",label:"Brasil",emoji:"🇧🇷",color:"#48bb78"},
          {id:"big",label:"Jogos Grandes",emoji:"🔥",color:"#ed8936"},
        ].map(f=>{
          const active=filter===f.id;
          return(
            <button key={f.id} onClick={()=>setFilter(filter===f.id&&f.id!=="all"?"all":f.id)} style={{
              display:"flex",alignItems:"center",gap:5,padding:isDesk?"7px 16px":"6px 12px",borderRadius:20,
              border:active?`1.5px solid ${f.color}`:"1.5px solid #2d3748",
              background:active?f.color+"18":"transparent",
              color:active?f.color:"#718096",
              fontFamily:"Sora",fontWeight:active?700:500,fontSize:isDesk?12:11,
              cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s",flexShrink:0,
            }}>
              {f.emoji&&<span>{f.emoji}</span>}{f.label}
            </button>
          );
        })}
        {filter==="big"&&<span style={{fontFamily:"DM Sans",fontSize:10,color:"#718096",alignSelf:"center",marginLeft:4,flexShrink:0}}>Top 20 FIFA vs Top 20 FIFA</span>}
      </div>

      {/* ═══ TABELA ═══ */}
      {mainTab==="tabela"&&(
        <>
          <div style={{display:"flex",background:"#0f1319",borderBottom:"1px solid #1a202c"}}>
            {["grupos","matamata"].map(s=>(
              <button key={s} onClick={()=>setSubTab(s)} style={{flex:1,padding:isDesk?"10px 0":"9px 0",border:"none",borderBottom:subTab===s?"2px solid #5b9bd5":"2px solid transparent",background:subTab===s?"rgba(91,155,213,0.06)":"transparent",fontFamily:"DM Sans",fontWeight:600,fontSize:isDesk?14:12,color:subTab===s?"#e2e8f0":"#718096",cursor:"pointer"}}>{s==="grupos"?"Fase de Grupos":"Mata-mata"}</button>
            ))}
          </div>

          {subTab==="grupos"&&(
            <div style={{padding:pad,display:isDesk?"grid":"block",gridTemplateColumns:isWide?"1fr 1fr":"1fr 1fr",gap:isDesk?18:0}}>
              {GROUPS_LIST.map(g=>{
                // If filter active, check if group has any matching match
                if(filter==="brazil"&&!GROUP_TEAMS[g].includes("Brasil")) return null;
                if(filter==="big"){
                  const hasAny=GM.filter(m=>m.g===g).some(m=>isBigMatch(m.h,m.a));
                  if(!hasAny) return null;
                }
                return <GroupCard key={g} group={g} standings={allSt[g]} scores={scores} onScore={updScore} expanded={expandedRows} onToggle={toggleRow} complete={groupComplete(g)} isDesk={isDesk} filter={filter}/>;
              })}
            </div>
          )}

          {subTab==="matamata"&&(
            <div style={{padding:pad}}>
              <BracketView allSt={allSt} qt={qt} koScores={koScores} onKoScore={updKo} isDesk={isDesk} isWide={isWide} filter={filter}/>
            </div>
          )}
        </>
      )}

      {/* ═══ CALENDÁRIO ═══ */}
      {mainTab==="calendario"&&(
        <div style={{padding:pad}}>
          <CalendarView scores={scores} koScores={koScores} allSt={allSt} qt={qt} isDesk={isDesk} isWide={isWide} filter={filter}/>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   RANK BADGE (FIFA ranking position)
   ════════════════════════════════════════════════════════════════ */
function RankBadge({rank}) {
  return (
    <span style={{fontFamily:"Sora",fontSize:8,fontWeight:800,color:"#ed8936",background:"rgba(237,137,54,0.15)",padding:"1px 4px",borderRadius:3,flexShrink:0,lineHeight:1.3}}>
      #{rank}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   GROUP CARD
   ════════════════════════════════════════════════════════════════ */
function GroupCard({group, standings, scores, onScore, expanded, onToggle, complete, isDesk, filter}) {
  const teams = GROUP_TEAMS[group];
  const matches = GM.filter(m=>m.g===group);
  const f = isDesk?1.08:1;

  return (
    <div style={{background:"#161d2a",borderRadius:14,overflow:"hidden",marginBottom:isDesk?0:16,border:"1px solid #1e2738"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:isDesk?"14px 16px 10px":"12px 14px 8px",borderBottom:"1px solid #1e2738"}}>
        <span style={{fontFamily:"Sora",fontWeight:900,fontSize:22*f,color:"#ecc94b"}}>{group}</span>
        <span style={{fontFamily:"Sora",fontWeight:700,fontSize:14*f,color:"#e2e8f0"}}>Grupo {group}</span>
        {complete&&<span style={{fontFamily:"Sora",fontSize:12,fontWeight:800,color:"#48bb78",background:"rgba(72,187,120,0.15)",padding:"2px 8px",borderRadius:20,marginLeft:"auto"}}>✓</span>}
      </div>

      <div style={{display:"flex",gap:5,padding:"10px 10px 8px",overflowX:"auto",flexWrap:"wrap"}}>
        {teams.map(t=>(
          <div key={t} style={{display:"flex",alignItems:"center",gap:5,padding:isDesk?"5px 10px":"4px 8px",background:"#1a2235",borderRadius:8,flexShrink:0}}>
            <Flag team={t} size={isDesk?26:22}/>
            <span style={{fontFamily:"DM Sans",fontSize:11*f,fontWeight:600,color:"#cbd5e0"}}>{teamName(t,isDesk)}</span>
          </div>
        ))}
      </div>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11*f,fontFamily:"DM Sans"}}>
          <thead>
            <tr style={{background:"#1a2235"}}>
              <th style={{padding:"6px 6px",color:"#718096",fontWeight:600,fontSize:9*f,textAlign:"left",paddingLeft:10,width:"38%",textTransform:"uppercase",letterSpacing:.5}}>#</th>
              {["J","V","E","D","GP","GC","SG"].map(h=><th key={h} style={{padding:"6px 4px",color:"#718096",fontWeight:600,fontSize:9*f,textAlign:"center",textTransform:"uppercase"}}>{h}</th>)}
              <th style={{padding:"6px 4px",color:"#ecc94b",fontWeight:800,fontSize:9*f,textAlign:"center"}}>P</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t,i)=>{const q=i<2,third=i===2;return(
              <tr key={t.team} style={{background:q?"rgba(72,187,120,0.08)":third?"rgba(236,201,75,0.05)":"transparent"}}>
                <td style={{padding:"6px 4px",textAlign:"left",paddingLeft:6,color:"#cbd5e0"}}>
                  <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:4,fontSize:10,fontWeight:900,marginRight:4,background:q?"#48bb78":third?"#ecc94b":"#4a5568",color:q||third?"#1a202c":"#a0aec0"}}>{i+1}</span>
                  <Flag team={t.team} size={16}/><span style={{fontWeight:700,fontSize:12*f,marginLeft:5}}>{teamName(t.team,isDesk)}</span>
                </td>
                {[t.p,t.w,t.d,t.l,t.gf,t.ga].map((v,vi)=><td key={vi} style={{padding:"6px 4px",textAlign:"center",color:"#cbd5e0"}}>{v}</td>)}
                <td style={{padding:"6px 4px",textAlign:"center",color:t.gd>0?"#48bb78":t.gd<0?"#fc8181":"#718096"}}>{t.gd>0?"+":""}{t.gd}</td>
                <td style={{padding:"6px 4px",textAlign:"center",fontWeight:900,color:"#ecc94b",fontSize:14*f}}>{t.pts}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      <div>
        {[1,2,3].map(round=>{const rm=matches.filter(m=>m.r===round);return(
          <div key={round}>
            <div style={{fontFamily:"Sora",fontWeight:700,fontSize:10*f,color:"#4a5568",letterSpacing:1.5,textTransform:"uppercase",padding:"8px 14px 4px",borderTop:"1px solid #1e2738"}}>{round}ª Rodada</div>
            {rm.map(m=>{
              const idx=GM.indexOf(m),s=scores[idx]||{h:"",a:""},key=`g-${idx}`,isExp=expanded[key];
              const hasScore=s.h!==""&&s.a!=="",hg=parseInt(s.h),ag=parseInt(s.a);
              const hWin=hasScore&&hg>ag,aWin=hasScore&&ag>hg,draw=hasScore&&hg===ag;
              const inSz=isDesk?32:28, fnSz=isDesk?14:13;
              const matchIsBrazil=isBrazilMatch(m.h,m.a);
              const matchIsBig=isBigMatch(m.h,m.a);
              const dimmed=(filter==="brazil"&&!matchIsBrazil)||(filter==="big"&&!matchIsBig);
              const highlighted=(filter==="brazil"&&matchIsBrazil)||(filter==="big"&&matchIsBig);
              const rankH=FIFA_RANKING[m.h], rankA=FIFA_RANKING[m.a];

              return(
                <div key={idx} style={{opacity:dimmed?0.3:1,transition:"opacity .2s"}}>
                  <div onClick={()=>onToggle(key)} style={{display:"flex",alignItems:"center",padding:isDesk?"10px 12px":"8px 10px",cursor:"pointer",borderBottom:"1px solid #1a2235",background:highlighted?(filter==="brazil"?"rgba(72,187,120,0.06)":"rgba(237,137,54,0.06)"):"transparent"}}>
                    {highlighted&&<div style={{width:3,height:28,borderRadius:2,background:filter==="brazil"?"#48bb78":"#ed8936",marginRight:6,flexShrink:0}}/>}
                    <div style={{width:isDesk?64:44,flexShrink:0,textAlign:"center"}}>
                      <span style={{display:"block",fontFamily:"Sora",fontSize:10*f,fontWeight:700,color:"#a0aec0"}}>{m.d}</span>
                      <span style={{display:"block",fontFamily:"DM Sans",fontSize:10*f,color:"#ecc94b",fontWeight:600}}>{m.t}</span>
                    </div>
                    <div style={{width:isDesk?110:60,flexShrink:0,fontFamily:"DM Sans",fontSize:isDesk?10*f:9,color:"#718096",textAlign:"center",padding:"0 2px"}}>{m.c}</div>
                    <div style={{flex:1,display:"flex",alignItems:"center"}}>
                      <div style={{flex:1,display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end",fontFamily:"DM Sans",fontSize:fnSz,fontWeight:hWin?800:500,color:hWin?"#48bb78":"#e2e8f0",overflow:"hidden"}}>
                        {rankH&&<RankBadge rank={rankH}/>}
                        <span style={{whiteSpace:"nowrap"}}>{teamName(m.h,isDesk)}</span><Flag team={m.h} size={isDesk?18:16}/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0,margin:"0 5px"}}>
                        <input value={s.h} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();onScore(idx,"h",e.target.value);}} style={{width:inSz,height:inSz,borderRadius:6,border:"1.5px solid #2d3748",background:"#0f1319",color:"#ecc94b",textAlign:"center",fontFamily:"Sora",fontWeight:800,fontSize:14*f,outline:"none"}} placeholder="–" maxLength={2} inputMode="numeric"/>
                        <span style={{color:"#4a5568",fontWeight:900,fontSize:10}}>×</span>
                        <input value={s.a} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();onScore(idx,"a",e.target.value);}} style={{width:inSz,height:inSz,borderRadius:6,border:"1.5px solid #2d3748",background:"#0f1319",color:"#ecc94b",textAlign:"center",fontFamily:"Sora",fontWeight:800,fontSize:14*f,outline:"none"}} placeholder="–" maxLength={2} inputMode="numeric"/>
                      </div>
                      <div style={{flex:1,display:"flex",alignItems:"center",gap:5,justifyContent:"flex-start",fontFamily:"DM Sans",fontSize:fnSz,fontWeight:aWin?800:500,color:aWin?"#48bb78":"#e2e8f0",overflow:"hidden"}}>
                        <Flag team={m.a} size={isDesk?18:16}/><span style={{whiteSpace:"nowrap"}}>{teamName(m.a,isDesk)}</span>
                        {rankA&&<RankBadge rank={rankA}/>}
                      </div>
                    </div>
                    <div style={{fontSize:9,color:"#4a5568",marginLeft:6,width:16,textAlign:"center"}}>{isExp?"▲":"▼"}</div>
                  </div>

                  {isExp&&(
                    <div style={{background:"#111822",padding:isDesk?"14px 22px":"10px 14px",borderBottom:"1px solid #1e2738",display:isDesk?"grid":"block",gridTemplateColumns:"1fr 1fr",gap:"2px 24px"}}>
                      {[["Fase",`Grupo ${m.g} — ${m.r}ª Rodada`],["Data",`${m.d}/2026 (${m.day})`],["Horário",`${m.t} (Brasília)`],["Cidade",m.c],
                        ...(hasScore?[["Resultado",`${m.h} ${s.h} × ${s.a} ${m.a} ${draw?"(Empate)":hWin?`(${m.h})`:`(${m.a})`}`]]:[]),
                        ["Transmissão","A definir"]
                      ].map(([label,val])=>(
                        <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontFamily:"DM Sans",fontSize:11*f,color:"#cbd5e0"}}>
                          <span style={{fontWeight:700,color:"#718096",fontSize:10,textTransform:"uppercase",letterSpacing:.5}}>{label}</span>
                          <span style={label==="Resultado"?{fontWeight:800}:label==="Transmissão"?{color:"#718096",fontStyle:"italic"}:{}}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );})}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   BRACKET VIEW
   ════════════════════════════════════════════════════════════════ */
function BracketView({allSt, qt, koScores, onKoScore, isDesk, isWide, filter}) {
  const champion = resolveTeam("W104",allSt,qt,koScores);
  const f=isDesk?1.1:1;

  const renderSlot=(mn)=>{
    const ko=KO[mn],ht=resolveTeam(ko.hs,allSt,qt,koScores),at=resolveTeam(ko.as,allSt,qt,koScores);
    const s=koScores[mn]||{h:"",a:""},hasTeams=ht&&at,hasScore=s.h!==""&&s.a!=="";
    const hg=parseInt(s.h),ag=parseInt(s.a),hWin=hasScore&&hg>ag,aWin=hasScore&&ag>hg;
    const color=RC[ko.rn]||"#5b9bd5";
    const inSz=isDesk?34:30;
    const matchBrazil=isBrazilMatch(ht,at);
    const matchBig=isBigMatch(ht,at);
    const dimmed=hasTeams&&((filter==="brazil"&&!matchBrazil)||(filter==="big"&&!matchBig));
    const highlighted=hasTeams&&((filter==="brazil"&&matchBrazil)||(filter==="big"&&matchBig));

    return(
      <div key={mn} style={{background:highlighted?(filter==="brazil"?"rgba(72,187,120,0.06)":"rgba(237,137,54,0.06)"):"#161d2a",borderRadius:10,overflow:"hidden",border:"1px solid #1e2738",borderLeft:`3px solid ${color}`,opacity:dimmed?0.3:1,transition:"opacity .2s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:isDesk?"9px 16px":"7px 10px",borderBottom:"1px solid #1e2738"}}>
          <span style={{fontFamily:"Sora",fontWeight:700,fontSize:10*f,padding:"2px 7px",borderRadius:4,border:`1px solid ${color}55`,background:color+"22",color}}>#{mn} {ko.rn}</span>
          <span style={{fontFamily:"DM Sans",fontSize:10*f,color:"#718096"}}>{ko.d} · {ko.t!=="—"?ko.t+" · ":""}{ko.c}</span>
        </div>
        {[{team:ht,label:ko.hs,win:hWin,side:"h"},{team:at,label:ko.as,win:aWin,side:"a"}].map((row,ri)=>(
          <div key={ri} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:isDesk?"9px 16px":"6px 10px",background:row.win?"rgba(72,187,120,0.08)":"transparent",borderTop:ri?"1px solid rgba(255,255,255,0.04)":"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"DM Sans",fontSize:13*f,color:"#e2e8f0"}}>
              {row.team?<><Flag team={row.team} size={isDesk?22:18}/><span style={{fontWeight:row.win?800:500}}>{teamName(row.team,isDesk)}</span></>:
                <span style={{color:"#4a5568",fontSize:11,fontStyle:"italic"}}>{labelToText(row.label)}</span>}
            </div>
            {hasTeams?
              <input value={s[row.side]} onChange={e=>onKoScore(mn,row.side,e.target.value)} style={{width:inSz,height:inSz-2,borderRadius:6,border:"1.5px solid #2d3748",background:"#0f1319",color:"#ecc94b",textAlign:"center",fontFamily:"Sora",fontWeight:800,fontSize:14*f,outline:"none"}} placeholder="–" maxLength={2} inputMode="numeric"/>:
              <div style={{width:inSz,height:inSz-2,display:"flex",alignItems:"center",justifyContent:"center",color:"#2d3748",fontFamily:"Sora",fontWeight:800,fontSize:14}}>–</div>}
          </div>
        ))}
      </div>
    );
  };

  return(
    <div>
      {champion&&(
        <div style={{textAlign:"center",padding:isDesk?"32px":"24px 20px",marginBottom:20,background:"linear-gradient(135deg,rgba(236,201,75,0.1),rgba(236,201,75,0.02))",borderRadius:16,border:"2px solid #ecc94b"}}>
          <div style={{fontSize:isDesk?52:40}}>🏆</div>
          <div style={{fontFamily:"Sora",fontSize:isDesk?14:11,letterSpacing:4,color:"#ecc94b",textTransform:"uppercase"}}>Campeão do Mundo</div>
          <div style={{fontFamily:"DM Sans",fontSize:isDesk?32:26,fontWeight:900,color:"#fff",display:"flex",alignItems:"center",gap:12,justifyContent:"center",marginTop:6}}>
            <Flag team={champion} size={isDesk?40:32}/>{champion}
          </div>
        </div>
      )}

      {ROUND_ORDER.map(rn=>{
        const mns=Object.keys(KO).filter(k=>KO[k].rn===rn).map(Number).sort((a,b)=>a-b);
        const cols = rn==="32-avos"?(isWide?"1fr 1fr 1fr":isDesk?"1fr 1fr":"1fr"):rn==="Oitavas"?(isDesk?"1fr 1fr":"1fr"):"1fr";
        return(
          <div key={rn} style={{marginBottom:22}}>
            <div style={{fontFamily:"Sora",fontWeight:800,fontSize:15*f,color:"#e2e8f0",padding:"16px 12px 8px",display:"flex",alignItems:"center",gap:8,borderLeft:`3px solid ${RC[rn]}`}}>
              <span style={{width:10,height:10,borderRadius:"50%",background:RC[rn]}}/>{rn}
            </div>
            <div style={{display:"grid",gridTemplateColumns:cols,gap:isDesk?10:8}}>
              {mns.map(mn=>renderSlot(mn))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CALENDAR VIEW — FIXED: month+day sort
   ════════════════════════════════════════════════════════════════ */
function CalendarView({scores, koScores, allSt, qt, isDesk, isWide, filter}) {
  const f=isDesk?1.1:1;

  const all = useMemo(()=>{
    const list = [];
    GM.forEach((m,i)=>{const s=scores[i]||{h:"",a:""};list.push({type:"group",d:m.d,t:m.t,day:m.day,c:m.c,h:m.h,a:m.a,g:m.g,r:m.r,sh:s.h,sa:s.a,sortKey:makeSortKey(m.d,m.t)});});
    Object.entries(KO).forEach(([mn,ko])=>{const num=parseInt(mn),ht=resolveTeam(ko.hs,allSt,qt,koScores),at=resolveTeam(ko.as,allSt,qt,koScores),s=koScores[num]||{h:"",a:""};
      list.push({type:"ko",d:ko.d,t:ko.t,day:null,c:ko.c,h:ht,a:at,hLabel:ko.hs,aLabel:ko.as,rn:ko.rn,mn:num,sh:s.h,sa:s.a,sortKey:makeSortKey(ko.d,ko.t)});});
    list.sort((a,b)=>a.sortKey.localeCompare(b.sortKey));
    return list;
  },[scores,koScores,allSt,qt]);

  const byDate = useMemo(()=>{const map=new Map();all.forEach(m=>{if(!map.has(m.d))map.set(m.d,[]);map.get(m.d).push(m);});return map;},[all]);
  const dayNames={"Qui":"Quinta-feira","Sex":"Sexta-feira","Sáb":"Sábado","Dom":"Domingo","Seg":"Segunda-feira","Ter":"Terça-feira","Qua":"Quarta-feira"};

  return(
    <div>
      {[...byDate.entries()].map(([date,matches])=>{
        const first=matches[0], monthLabel=date.split("/")[1]==="06"?"Junho":"Julho";
        return(
          <div key={date} style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 6px 8px"}}>
              <div style={{fontFamily:"Sora",fontWeight:900,fontSize:isDesk?36:28,color:"#ecc94b",lineHeight:1,width:isDesk?50:38,textAlign:"center"}}>{date.split("/")[0]}</div>
              <div>
                <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:isDesk?15:12,color:"#e2e8f0"}}>{monthLabel} 2026</div>
                <div style={{fontFamily:"DM Sans",fontSize:isDesk?12:10,color:"#718096"}}>{first.day?dayNames[first.day]||first.day:""}</div>
              </div>
            </div>
            <div style={{display:isDesk?"grid":"flex",gridTemplateColumns:isWide?"1fr 1fr 1fr":isDesk?"1fr 1fr":"1fr",flexDirection:"column",gap:isDesk?6:0}}>
              {matches.map((m,i)=>{
                const hasScore=m.sh!==""&&m.sa!=="",hg=parseInt(m.sh),ag=parseInt(m.sa);
                const hWin=hasScore&&hg>ag,aWin=hasScore&&ag>hg;
                const isKo=m.type==="ko",color=isKo?RC[m.rn]:"transparent";
                const mBrazil=isBrazilMatch(m.h,m.a);
                const mBig=isBigMatch(m.h,m.a);
                const dimmed=(filter==="brazil"&&!mBrazil)||(filter==="big"&&!mBig);
                const highlighted=(filter==="brazil"&&mBrazil)||(filter==="big"&&mBig);

                return(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:isDesk?12:8,padding:isDesk?"10px 14px":"7px 8px",borderBottom:isDesk?"none":"1px solid #1a2235",borderLeft:`3px solid ${highlighted?(filter==="brazil"?"#48bb78":"#ed8936"):color}`,background:isDesk?(highlighted?(filter==="brazil"?"rgba(72,187,120,0.06)":"rgba(237,137,54,0.06)"):"#161d2a"):"transparent",borderRadius:isDesk?8:0,opacity:dimmed?0.25:1,transition:"opacity .2s"}}>
                    <div style={{fontFamily:"Sora",fontSize:11*f,fontWeight:700,color:"#a0aec0",width:isDesk?50:40,flexShrink:0,textAlign:"center",paddingTop:2}}>{m.t||"—"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,fontFamily:"DM Sans",fontSize:13*f,flexWrap:"wrap"}}>
                        {mBig&&highlighted&&<span style={{fontSize:11,flexShrink:0}}>🔥</span>}
                        {m.h?<span style={{display:"flex",alignItems:"center",gap:4,fontWeight:hWin?800:500,color:hWin?"#48bb78":"#e2e8f0"}}><Flag team={m.h} size={isDesk?18:14}/>{teamName(m.h,isDesk)}{isRanked(m.h)&&<RankBadge rank={FIFA_RANKING[m.h]}/>}</span>:
                          <span style={{color:"#718096",fontSize:12,fontStyle:"italic"}}>{isKo?labelToText(m.hLabel):"?"}</span>}
                        <span style={{fontFamily:"Sora",fontSize:12*f,color:"#ecc94b",flexShrink:0}}>
                          {hasScore?<span style={{fontWeight:800}}>{m.sh} × {m.sa}</span>:<span style={{color:"#4a5568"}}>×</span>}
                        </span>
                        {m.a?<span style={{display:"flex",alignItems:"center",gap:4,fontWeight:aWin?800:500,color:aWin?"#48bb78":"#e2e8f0"}}><Flag team={m.a} size={isDesk?18:14}/>{teamName(m.a,isDesk)}{isRanked(m.a)&&<RankBadge rank={FIFA_RANKING[m.a]}/>}</span>:
                          <span style={{color:"#718096",fontSize:12,fontStyle:"italic"}}>{isKo?labelToText(m.aLabel):"?"}</span>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                        {isKo&&<span style={{fontFamily:"Sora",fontSize:9*f,fontWeight:700,padding:"1px 6px",borderRadius:3,background:(RC[m.rn]||"#5b9bd5")+"22",color:RC[m.rn]}}>{m.rn}</span>}
                        {!isKo&&<span style={{fontFamily:"DM Sans",fontSize:9*f,fontWeight:600,color:"#4a5568"}}>Grupo {m.g} · {m.r}ª</span>}
                        <span style={{color:"#718096",fontSize:10*f}}>{m.c}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
